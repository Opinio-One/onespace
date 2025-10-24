"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RangeSlider } from "@/components/ui/range-slider";
import {
  Search,
  Filter,
  Download,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  PaginatedResponse,
  CatalogFilters,
  FilterMetadata,
  FilterFieldConfig,
} from "@/types/catalog";

interface CatalogGridProps<T> {
  initialData: PaginatedResponse<T>;
  apiEndpoint: string;
  displayName: string;
  filterConfig?: FilterFieldConfig[];
  renderCard: (item: T) => React.ReactNode;
  icon?: React.ReactNode;
}

export function CatalogGrid<T>({
  initialData,
  apiEndpoint,
  displayName,
  filterConfig = [],
  renderCard,
  icon,
}: CatalogGridProps<T>) {
  const [data, setData] = useState<PaginatedResponse<T>>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [activeFilters, setActiveFilters] = useState<CatalogFilters>({});
  const [showFilters, setShowFilters] = useState(true);
  const [rangeValues, setRangeValues] = useState<
    Record<string, [number, number]>
  >({});

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      // Add active filters to params
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            params.append(key, value.join(","));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${apiEndpoint}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result: PaginatedResponse<T> = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearch, activeFilters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (field: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
    setCurrentPage(1);
  };

  const handleRangeFilterChange = (field: string, value: [number, number]) => {
    setRangeValues((prev) => ({ ...prev, [field]: value }));
    setActiveFilters((prev) => ({
      ...prev,
      [`${field}_min`]: value[0],
      [`${field}_max`]: value[1],
    }));
    setCurrentPage(1);
  };

  const clearSingleFilter = (field: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[field];
    delete newFilters[`${field}_min`];
    delete newFilters[`${field}_max`];
    setActiveFilters(newFilters);

    const newRangeValues = { ...rangeValues };
    delete newRangeValues[field];
    setRangeValues(newRangeValues);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
    setRangeValues({});
    setCurrentPage(1);
  };

  const isFilterActive = (field: string): boolean => {
    return (
      activeFilters[field] !== undefined ||
      activeFilters[`${field}_min`] !== undefined ||
      activeFilters[`${field}_max`] !== undefined
    );
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => !key.endsWith("_min") && !key.endsWith("_max")
  ).length;

  const hasAnyFilters = Object.keys(activeFilters).length > 0;

  const filterOptions = data.filterOptions || {};

  // Pagination
  const totalPages = data.pagination.totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, data.pagination.total);

  const goToPage = (page: number) => {
    handlePageChange(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h1 className="text-3xl font-bold">{displayName} Catalog</h1>
        </div>
        <p className="text-gray-600">
          Browse and filter our collection of {displayName.toLowerCase()}
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {filterConfig.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && filterConfig.length > 0 && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">
                Filter Options
                {loading && (
                  <span className="text-sm text-gray-500 ml-2">
                    Updating...
                  </span>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!hasAnyFilters}
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterConfig.map(({ field, label, type }) => {
                const metadata = data.filterMetadata?.[field];
                const filterType = type || metadata?.type || "select";
                const isActive = isFilterActive(field);

                return (
                  <div key={field} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">
                        {label}
                        {metadata?.optionsWithCounts && (
                          <span className="text-xs text-gray-500 ml-1">
                            (
                            {metadata.optionsWithCounts.reduce(
                              (sum, opt) => sum + opt.count,
                              0
                            )}
                            )
                          </span>
                        )}
                      </label>
                      {isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearSingleFilter(field)}
                          className="h-6 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {filterType === "range" &&
                    metadata?.min !== undefined &&
                    metadata?.max !== undefined ? (
                      <div className="pt-2">
                        <RangeSlider
                          min={metadata.min}
                          max={metadata.max}
                          step={metadata.step || 1}
                          value={
                            rangeValues[field] || [metadata.min, metadata.max]
                          }
                          onChange={(value) =>
                            handleRangeFilterChange(field, value)
                          }
                          disabled={loading}
                          formatValue={
                            field.toLowerCase().includes("prijs") ||
                            field.toLowerCase().includes("price") ||
                            field === "Prijs_EUR"
                              ? (v) =>
                                  `€${v.toLocaleString("nl-NL", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                  })}`
                              : undefined
                          }
                        />
                      </div>
                    ) : (
                      <select
                        className="w-full p-2 border rounded-md bg-white disabled:opacity-50"
                        value={(activeFilters[field] as string) || ""}
                        onChange={(e) =>
                          handleFilterChange(field, e.target.value)
                        }
                        disabled={loading}
                      >
                        <option value="">All</option>
                        {metadata?.optionsWithCounts
                          ? metadata.optionsWithCounts.map(
                              ({ value, count }) => (
                                <option key={value} value={value}>
                                  {value} ({count})
                                </option>
                              )
                            )
                          : filterOptions?.[field]?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active filters summary */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {data.pagination.total} result
                  {data.pagination.total !== 1 ? "s" : ""} match your{" "}
                  {activeFilterCount} active filter
                  {activeFilterCount !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex}-{endIndex} of {data.pagination.total}{" "}
              products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((item) => renderCard(item))}
          </div>

          {/* No Results */}
          {data.data.length === 0 && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
              {hasAnyFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <span>←</span>
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant={currentPage === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(1)}
                    className="w-8 h-8 p-0"
                  >
                    1
                  </Button>
                  {currentPage > 4 && (
                    <span className="text-gray-400">...</span>
                  )}
                </>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="text-gray-400">...</span>
                  )}
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <span>→</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
