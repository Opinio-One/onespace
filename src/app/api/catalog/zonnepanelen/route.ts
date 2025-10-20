import { NextResponse } from "next/server";
import { getCatalogItems } from "@/lib/services/catalog.service";
import type { Zonnepaneel } from "@/types/catalog";

// Configuration for Zonnepanelen table
const SEARCHABLE_FIELDS = ["Product", "Merk", "Product code"];
const FILTERABLE_FIELDS = [
  "Merk",
  "Cell type",
  "Celtechnologie type",
  "Bi-Facial",
  "Glas type",
  "Glas-glas",
  "Celmateriaal",
];
const RANGE_FILTER_FIELDS = [
  "Prijs_EUR",
  "Vermogen_Wp",
  "Productgarantie (jaren)",
];

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
    FILTERABLE_FIELDS.forEach((field) => {
      const value = searchParams.get(field);
      if (value) {
        // Check if it's a comma-separated list (for multi-select)
        filters[field] = value.includes(",") ? value.split(",") : value;
      }
    });

    // Extract range filters (min/max)
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
    const result = await getCatalogItems<Zonnepaneel>({
      tableName: "Zonnepanelen",
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in zonnepanelen API route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch zonnepanelen",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
