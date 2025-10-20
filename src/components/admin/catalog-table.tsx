"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Plus, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { RangeSlider } from "@/components/ui/range-slider";
import type {
  PaginatedResponse,
  CatalogFilters,
  FilterMetadata,
} from "@/types/catalog";

interface CatalogTableProps<T> {
  initialData: PaginatedResponse<T>;
  tableName: string;
  displayName: string;
  renderRow: (
    item: T,
    onEdit: (id: number) => void,
    onDelete: (id: number) => void
  ) => React.ReactNode;
  renderHeader: () => React.ReactNode;
  filterConfig?: {
    field: string;
    label: string;
    type?: "select" | "multiselect" | "range";
  }[];
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  extractId: (item: T) => number;
}

export function CatalogTable<T>({
  initialData,
  tableName,
  displayName,
  renderRow,
  renderHeader,
  filterConfig = [],
  onAdd,
  onEdit,
  onDelete,
  extractId,
}: CatalogTableProps<T>) {
  const [data, setData] = useState<PaginatedResponse<T>>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState<CatalogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [rangeValues, setRangeValues] = useState<
    Record<string, [number, number]>
  >({});

  // Fetch data from API
  const fetchData = useCallback(
    async (page: number, search: string, filters: CatalogFilters) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        // Add filters to params
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              params.append(key, value.join(","));
            } else {
              params.append(key, value.toString());
            }
          }
        });

        const response = await fetch(
          `/api/catalog/${tableName}?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const result: PaginatedResponse<T> = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [tableName, itemsPerPage]
  );

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "" || Object.keys(activeFilters).length > 0) {
        setCurrentPage(1);
        fetchData(1, searchTerm, activeFilters);
      } else if (searchTerm === "" && Object.keys(activeFilters).length === 0) {
        // Reset to initial data when search and filters are cleared
        setData(initialData);
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, activeFilters, fetchData, initialData]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchData(page, searchTerm, activeFilters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (field: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleRangeFilterChange = (field: string, value: [number, number]) => {
    setRangeValues((prev) => ({ ...prev, [field]: value }));
    setActiveFilters((prev) => ({
      ...prev,
      [`${field}_min`]: value[0],
      [`${field}_max`]: value[1],
    }));
  };

  const clearSingleFilter = (field: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[field];
    // Also clear range filters if this is a range field
    delete newFilters[`${field}_min`];
    delete newFilters[`${field}_max`];
    setActiveFilters(newFilters);

    const newRangeValues = { ...rangeValues };
    delete newRangeValues[field];
    setRangeValues(newRangeValues);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
    setRangeValues({});
  };

  const getFilterCount = (field: string): number => {
    const metadata = data.filterMetadata?.[field];
    if (!metadata) return 0;

    if (metadata.optionsWithCounts) {
      return metadata.optionsWithCounts.reduce(
        (sum, opt) => sum + opt.count,
        0
      );
    }
    return metadata.options?.length || 0;
  };

  const getOptionCount = (field: string, value: string | number): number => {
    const metadata = data.filterMetadata?.[field];
    if (metadata?.optionsWithCounts) {
      const option = metadata.optionsWithCounts.find(
        (opt) => opt.value === value
      );
      return option?.count || 0;
    }
    return 0;
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

  const handleEditClick = (id: number) => {
    if (onEdit) {
      onEdit(id);
    } else {
      window.location.href = `/admin/catalog/${tableName}/edit/${id}`;
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (onDelete) {
      onDelete(id);
    } else {
      // Default delete behavior
      if (confirm("Are you sure you want to delete this item?")) {
        // TODO: Implement delete API call
        console.log("Delete item:", id);
      }
    }
  };

  const { pagination, filterOptions } = data;
  const totalPages = pagination.totalPages;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
        <p className="text-gray-600">Manage {displayName.toLowerCase()} data</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{displayName} Data</CardTitle>
              <CardDescription>
                Showing {data.data.length} of {pagination.total} records
                {pagination.total > 0 &&
                  ` (Page ${pagination.page} of ${pagination.totalPages})`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {onAdd && (
                <Button size="sm" onClick={onAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={`Search ${displayName.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            {filterConfig.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && ` (${activeFilterCount})`}
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && filterConfig.length > 0 && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
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
                  disabled={activeFilterCount === 0}
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
                          {getFilterCount(field) > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({getFilterCount(field)})
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
                            : filterOptions?.[field]?.map((option) => {
                                const count = getOptionCount(field, option);
                                return (
                                  <option key={option} value={option}>
                                    {option}
                                    {count > 0 && ` (${count})`}
                                  </option>
                                );
                              })}
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

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">{renderHeader()}</tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={100} className="text-center py-8">
                      <div className="text-lg">Loading...</div>
                    </td>
                  </tr>
                ) : data.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={100}
                      className="text-center py-8 text-gray-500"
                    >
                      No items found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  data.data.map((item) => (
                    <tr
                      key={extractId(item)}
                      className="border-b hover:bg-gray-50"
                    >
                      {renderRow(item, handleEditClick, handleDeleteClick)}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && data.data.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              startIndex={(currentPage - 1) * itemsPerPage}
              endIndex={Math.min(currentPage * itemsPerPage, pagination.total)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
