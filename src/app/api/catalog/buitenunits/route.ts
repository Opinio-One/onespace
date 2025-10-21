import { NextResponse } from "next/server";
import { getCatalogItems } from "@/lib/services/catalog.service";
import type { Buitenunit } from "@/types/catalog";

// Configuration for Buitenunits table
const SEARCHABLE_FIELDS = ["Name", "Merk", "Serie"];
const FILTERABLE_FIELDS = ["Merk", "Single/Multi-Split", "Energielabel_koelen"];
const RANGE_FILTER_FIELDS = ["Prijs_EUR", "SEER", "SCOP"];

// Field mapping for URL-safe parameter names to database column names
const FIELD_MAPPING: Record<string, string> = {
  split_type: "Single/Multi-Split",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "Id";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as
      | "asc"
      | "desc";

    // Extract filters from query params
    const filters: Record<string, string | string[] | number> = {};

    // Handle mapped fields
    Object.entries(FIELD_MAPPING).forEach(([urlKey, dbColumn]) => {
      const value = searchParams.get(urlKey);
      if (value) {
        filters[dbColumn] = value.includes(",") ? value.split(",") : value;
      }
    });

    // Handle regular filterable fields
    FILTERABLE_FIELDS.forEach((field) => {
      // Skip if already handled by mapping
      if (Object.values(FIELD_MAPPING).includes(field)) return;

      const value = searchParams.get(field);
      if (value) {
        filters[field] = value.includes(",") ? value.split(",") : value;
      }
    });

    // Extract range filters
    RANGE_FILTER_FIELDS.forEach((field) => {
      const minValue = searchParams.get(`${field}_min`);
      const maxValue = searchParams.get(`${field}_max`);
      if (minValue) {
        filters[`${field}_min`] = parseFloat(minValue);
      }
      if (maxValue) {
        filters[`${field}_max`] = parseFloat(maxValue);
      }
    });

    // Fetch data using service layer
    const result = await getCatalogItems<Buitenunit>({
      tableName: "Buitenunits",
      page,
      limit,
      search,
      filters,
      sortBy,
      sortOrder,
      searchableFields: SEARCHABLE_FIELDS,
      filterableFields: FILTERABLE_FIELDS,
      rangeFilterFields: RANGE_FILTER_FIELDS,
    });

    // Map filter metadata keys back to URL-safe names
    if (result.filterMetadata) {
      const mappedMetadata: Record<string, any> = {};
      Object.entries(result.filterMetadata).forEach(([key, value]) => {
        // Find if this key needs to be mapped back
        const urlKey = Object.entries(FIELD_MAPPING).find(
          ([_, dbCol]) => dbCol === key
        )?.[0];
        mappedMetadata[urlKey || key] = value;
      });
      result.filterMetadata = mappedMetadata;
    }

    if (result.filterOptions) {
      const mappedOptions: Record<string, any> = {};
      Object.entries(result.filterOptions).forEach(([key, value]) => {
        const urlKey = Object.entries(FIELD_MAPPING).find(
          ([_, dbCol]) => dbCol === key
        )?.[0];
        mappedOptions[urlKey || key] = value;
      });
      result.filterOptions = mappedOptions;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in buitenunits API route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch buitenunits",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
