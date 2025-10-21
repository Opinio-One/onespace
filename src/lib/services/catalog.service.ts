// Catalog service layer for server-side data access
import { createClient } from "@/lib/supabase/server";
import type {
  PaginatedResponse,
  CatalogFilters,
  CatalogQueryParams,
} from "@/types/catalog";

interface GetCatalogItemsOptions extends CatalogQueryParams {
  tableName: string;
  searchableFields?: string[];
  filterableFields?: string[];
  rangeFilterFields?: string[];
}

/**
 * Fetch paginated catalog items with filters and search
 */
export async function getCatalogItems<T>(
  options: GetCatalogItemsOptions
): Promise<PaginatedResponse<T>> {
  const {
    tableName,
    page = 1,
    limit = 10,
    search = "",
    filters = {},
    sortBy = "Id",
    sortOrder = "asc",
    searchableFields = [],
    filterableFields = [],
    rangeFilterFields = [],
  } = options;

  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Build query
  let query = supabase.from(tableName).select("*", { count: "exact" });

  // Helper function to quote column names with special characters
  const quoteColumnName = (columnName: string): string => {
    // If column name contains special characters like /, wrap in double quotes
    if (
      columnName.includes("/") ||
      columnName.includes(" ") ||
      columnName.includes("-")
    ) {
      return `"${columnName}"`;
    }
    return columnName;
  };

  // Apply search across multiple fields
  if (search && searchableFields.length > 0) {
    const searchConditions = searchableFields
      .map((field) => `${quoteColumnName(field)}.ilike.%${search}%`)
      .join(",");
    query = query.or(searchConditions);
  }

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Handle range filters (min/max)
      if (key.endsWith("_min")) {
        const field = key.replace("_min", "");
        const quotedField = quoteColumnName(field);
        query = query.gte(quotedField, value);
      } else if (key.endsWith("_max")) {
        const field = key.replace("_max", "");
        const quotedField = quoteColumnName(field);
        query = query.lte(quotedField, value);
      } else if (Array.isArray(value) && value.length > 0) {
        // Multiple values - use 'in' operator
        const quotedKey = quoteColumnName(key);
        query = query.in(quotedKey, value);
      } else if (!Array.isArray(value)) {
        // Single value - use 'eq' operator
        const quotedKey = quoteColumnName(key);
        query = query.eq(quotedKey, value);
      }
    }
  });

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Apply pagination (all filtering is server-side now)
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  // Get filter options and metadata
  const { filterOptions, filterMetadata } = await getFilterOptionsWithMetadata(
    tableName,
    filterableFields,
    rangeFilterFields,
    search,
    searchableFields,
    filters
  );

  return {
    data: (data || []) as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    filterOptions,
    filterMetadata,
  };
}

/**
 * Calculate available filter options with metadata based on current dataset
 */
export async function getFilterOptionsWithMetadata(
  tableName: string,
  filterableFields: string[],
  rangeFilterFields: string[],
  search?: string,
  searchableFields?: string[],
  currentFilters?: CatalogFilters
): Promise<{
  filterOptions: Record<string, (string | number)[]>;
  filterMetadata: Record<string, import("@/types/catalog").FilterMetadata>;
}> {
  if (filterableFields.length === 0 && rangeFilterFields.length === 0) {
    return { filterOptions: {}, filterMetadata: {} };
  }

  const supabase = await createClient();
  const filterOptions: Record<string, (string | number)[]> = {};
  const filterMetadata: Record<
    string,
    import("@/types/catalog").FilterMetadata
  > = {};

  // Build base query for filtering
  let baseQuery = supabase.from(tableName).select("*");

  // Apply search if provided
  if (search && searchableFields && searchableFields.length > 0) {
    const searchConditions = searchableFields
      .map((field) => `${field}.ilike.%${search}%`)
      .join(",");
    baseQuery = baseQuery.or(searchConditions);
  }

  // Don't apply any filters - we need the full dataset to calculate proper min/max ranges
  // This prevents the glitchy behavior where the slider range changes as you adjust it

  const { data, error } = await baseQuery;

  if (error) {
    console.error(`Error fetching filter options for ${tableName}:`, error);
    return { filterOptions: {}, filterMetadata: {} };
  }

  const unfilteredData = data || [];

  // Calculate distinct values for categorical filterable fields
  filterableFields.forEach((field) => {
    const valueCounts = new Map<string | number, number>();
    unfilteredData.forEach((item: any) => {
      const value = item[field];
      if (value !== null && value !== undefined && value !== "") {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      }
    });

    // Sort by frequency (most common first)
    const sortedValues = Array.from(valueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value]) => value);

    filterOptions[field] = sortedValues;
    filterMetadata[field] = {
      type: "multiselect",
      options: sortedValues,
      optionsWithCounts: Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, count })),
    };
  });

  // Helper function to parse currency strings
  const parseCurrencyValue = (value: any): number | null => {
    if (value === null || value === undefined || value === "") return null;

    // If already a number, return it
    if (typeof value === "number") return value;

    // If string, try to parse it
    if (typeof value === "string") {
      // Remove currency symbols, spaces, and convert to number
      // Handles formats like: "€1.234,56", "€ 1,234.56", "1234.56", etc.
      const cleanValue = value
        .replace(/[€$£¥]/g, "") // Remove currency symbols
        .replace(/\s/g, "") // Remove spaces
        .trim();

      // Detect decimal separator (comma or period)
      // If comma appears after period, comma is decimal separator (European format)
      // If period appears after comma, period is decimal separator (US format)
      const lastComma = cleanValue.lastIndexOf(",");
      const lastPeriod = cleanValue.lastIndexOf(".");

      let normalizedValue = cleanValue;
      if (lastComma > lastPeriod) {
        // European format: 1.234,56
        normalizedValue = cleanValue.replace(/\./g, "").replace(",", ".");
      } else {
        // US format: 1,234.56
        normalizedValue = cleanValue.replace(/,/g, "");
      }

      const parsed = parseFloat(normalizedValue);
      return isNaN(parsed) ? null : parsed;
    }

    return null;
  };

  // Calculate min/max for range filterable fields
  rangeFilterFields.forEach((field) => {
    const values: number[] = [];
    unfilteredData.forEach((item: any) => {
      const parsed = parseCurrencyValue(item[field]);
      if (parsed !== null) {
        values.push(parsed);
      }
    });

    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;

      // Determine appropriate step size
      let step = 1;
      if (range > 1000) step = 50;
      else if (range > 100) step = 10;
      else if (range > 10) step = 1;
      else step = 0.1;

      filterMetadata[field] = {
        type: "range",
        min,
        max,
        step,
      };
    }
  });

  return { filterOptions, filterMetadata };
}

/**
 * Calculate available filter options based on current dataset (deprecated - use getFilterOptionsWithMetadata)
 */
export async function getFilterOptions(
  tableName: string,
  filterableFields: string[],
  search?: string,
  searchableFields?: string[]
): Promise<Record<string, (string | number)[]>> {
  const { filterOptions } = await getFilterOptionsWithMetadata(
    tableName,
    filterableFields,
    [],
    search,
    searchableFields
  );
  return filterOptions;
}

/**
 * Fetch a single catalog item by ID
 */
export async function getCatalogItemById<T>(
  tableName: string,
  id: number
): Promise<T | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("Id", id)
    .single();

  if (error) {
    console.error(`Error fetching ${tableName} item ${id}:`, error);
    throw new Error(`Failed to fetch ${tableName} item: ${error.message}`);
  }

  return data as T;
}

/**
 * Update a catalog item
 */
export async function updateCatalogItem<T>(
  tableName: string,
  id: number,
  updates: Partial<T>
): Promise<T | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq("Id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${tableName} item ${id}:`, error);
    throw new Error(`Failed to update ${tableName} item: ${error.message}`);
  }

  return data as T;
}

/**
 * Create a new catalog item
 */
export async function createCatalogItem<T>(
  tableName: string,
  item: Omit<T, "Id">
): Promise<T | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(tableName)
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error(`Error creating ${tableName} item:`, error);
    throw new Error(`Failed to create ${tableName} item: ${error.message}`);
  }

  return data as T;
}

/**
 * Delete a catalog item
 */
export async function deleteCatalogItem(
  tableName: string,
  id: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from(tableName).delete().eq("Id", id);

  if (error) {
    console.error(`Error deleting ${tableName} item ${id}:`, error);
    throw new Error(`Failed to delete ${tableName} item: ${error.message}`);
  }
}
