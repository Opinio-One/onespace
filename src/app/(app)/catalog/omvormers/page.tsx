"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Zap } from "lucide-react";

interface Omvormer {
  Id: number;
  Name: string;
  Afbeelding: string;
  Logo: string;
  Merk: string;
  "Type omvormer": string;
  Vermogen: number;
  "Aantal fases": string;
  MPPTs: number;
  "Strings per MPPT": number;
  "PV WP": string;
  Strings: number;
  Price: string;
  Cost: string;
  Currency: string;
  "Garantie (jaren)": number;
  SKU: string;
  Datasheet: any;
}

// Simple Badge component
const Badge = ({
  children,
  variant = "default",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  [key: string]: any;
}) => {
  const baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClasses = {
    default:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default function OmvormersPage() {
  const [omvormers, setOmvormers] = useState<Omvormer[]>([]);
  const [filteredOmvormers, setFilteredOmvormers] = useState<Omvormer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const supabase = createClient();

  useEffect(() => {
    fetchOmvormers();
  }, []);

  useEffect(() => {
    filterOmvormers();
    setCurrentPage(1); // Reset to first page when filters change
  }, [omvormers, searchTerm, selectedBrand, selectedType]);

  const fetchOmvormers = async () => {
    try {
      const { data, error } = await supabase
        .from("Omvormers")
        .select("*")
        .order("Id");

      if (error) {
        console.error("Error fetching omvormers:", error);
        return;
      }

      setOmvormers(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOmvormers = () => {
    let filtered = omvormers;

    if (searchTerm) {
      filtered = filtered.filter(
        (omvormer) =>
          omvormer.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          omvormer.Merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
          omvormer["Type omvormer"]
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter((omvormer) => omvormer.Merk === selectedBrand);
    }

    if (selectedType) {
      filtered = filtered.filter(
        (omvormer) => omvormer["Type omvormer"] === selectedType
      );
    }

    setFilteredOmvormers(filtered);
  };

  const getUniqueBrands = () => {
    return [...new Set(omvormers.map((omvormer) => omvormer.Merk))].filter(
      Boolean
    );
  };

  const getUniqueTypes = () => {
    return [
      ...new Set(omvormers.map((omvormer) => omvormer["Type omvormer"])),
    ].filter(Boolean);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOmvormers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOmvormers = filteredOmvormers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "string":
        return "bg-blue-100 text-blue-800";
      case "micro":
        return "bg-green-100 text-green-800";
      case "central":
        return "bg-purple-100 text-purple-800";
      case "hybrid":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const extractImageUrl = (imageField: string) => {
    if (!imageField) return null;

    try {
      // Parse as JSON array (Supabase Storage format)
      const parsed = JSON.parse(imageField);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const url = parsed[0];
        if (typeof url === "string" && url.startsWith("http")) {
          return url;
        }
      }
    } catch (error) {
      // If JSON parsing fails, fall back to regex patterns for legacy data
      const patterns = [
        // Pattern 1: Standard HTTPS URL
        /https:\/\/[^\s)]+/,
        // Pattern 2: Airtable URL format (legacy)
        /https:\/\/v5\.airtableusercontent\.com\/[^\s)]+/,
        // Pattern 3: Any URL with image extensions
        /https:\/\/[^\s)]*\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s)]*)?/i,
      ];

      for (const pattern of patterns) {
        const match = imageField.match(pattern);
        if (match) {
          const url = match[0];
          // Check if it's an Airtable URL (likely expired)
          if (url.includes("airtableusercontent.com")) {
            console.log("⚠️ Airtable URL detected (likely expired):", url);
          }
          return url;
        }
      }
    }

    return null;
  };

  const getImageAlt = (imageField: string, productName: string) => {
    if (!imageField) return productName;

    try {
      const parsed = JSON.parse(imageField);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const url = parsed[0];
        if (typeof url === "string") {
          const filenameMatch = url.match(
            /([^\/\s]+\.(jpg|jpeg|png|gif|webp|svg))/i
          );
          if (filenameMatch) {
            return filenameMatch[1];
          }
          return productName;
        }
      }
    } catch (error) {
      const filenameMatch = imageField.match(
        /([^\/\s]+\.(jpg|jpeg|png|gif|webp|svg))/i
      );
      if (filenameMatch) {
        return filenameMatch[1];
      }
    }

    return productName;
  };

  // Simple image component with fallback
  const ProductImage = ({
    imageUrl,
    imageAlt,
    productName,
  }: {
    imageUrl: string | null;
    imageAlt: string;
    productName: string;
  }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    if (!imageUrl) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          <div className="text-center">
            <Zap className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <div className="text-sm">No Image</div>
          </div>
        </div>
      );
    }

    return (
      <>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
            <div className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <div className="text-sm">Image expired</div>
              <div className="text-xs mt-1 text-gray-400">
                URL no longer valid
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading omvormers catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Omvormers Catalog</h1>
        <p className="text-gray-600">
          Browse and filter solar inverters and power conversion systems
        </p>
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Note:</span> Some product images may
            not display due to expired URLs from the original data source.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, brands, or types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            {getUniqueBrands().map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {getUniqueTypes().map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredOmvormers.length)} of{" "}
              {filteredOmvormers.length} products
              {filteredOmvormers.length !== omvormers.length &&
                ` (${omvormers.length} total)`}
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
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedOmvormers.map((omvormer) => {
          const imageUrl = extractImageUrl(omvormer.Afbeelding);
          const imageAlt = getImageAlt(omvormer.Afbeelding, omvormer.Name);

          return (
            <Card
              key={omvormer.Id}
              className="hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
                  <ProductImage
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    productName={omvormer.Name}
                  />
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {omvormer.Name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {omvormer.Merk} • {omvormer["Type omvormer"]}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 flex-grow flex flex-col">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge className={getTypeColor(omvormer["Type omvormer"])}>
                      {omvormer["Type omvormer"]}
                    </Badge>
                  </div>

                  {omvormer.Price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold text-green-600">
                        {omvormer.Price}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Power:</span>
                    <span className="font-medium">{omvormer.Vermogen} W</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phases:</span>
                    <span className="font-medium">
                      {omvormer["Aantal fases"]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">MPPTs:</span>
                    <span className="font-medium">{omvormer.MPPTs}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Strings:</span>
                    <span className="font-medium">{omvormer.Strings}</span>
                  </div>

                  {omvormer["Garantie (jaren)"] && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Warranty:</span>
                      <span className="text-sm">
                        {omvormer["Garantie (jaren)"]} years
                      </span>
                    </div>
                  )}

                  {omvormer.SKU && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">SKU:</span>
                      <span className="text-xs font-mono text-gray-500">
                        {omvormer.SKU}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t mt-auto">
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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

      {filteredOmvormers.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
