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
import { Search, Filter, Download } from "lucide-react";

interface Binnenunit {
  id: number;
  Product: string;
  "Logo:": string;
  "Foto unit:": string;
  "Kleur:": string;
  "Kleur voorbeeld:": string;
  "Merk:": string;
  "Serie:": string;
  "Type:": string;
  "Modelvariant:": string;
  prijs: string;
  "Vermogen categorie": string;
  "geluidsdruk (dB)": string;
  SEER: string;
  SCOP: string;
  "Energielabel Koelen:": string;
  "Energielabel Verwarmen": string;
  "Multisplit compatibel": string;
  "Smart-Functies": string;
  "Filters:": string;
  "Datasheet/Brochure": any;
  "Airconditioning Buitenunit": string;
  "Vermogen (kW):": number;
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

export default function CatalogPage() {
  const [binnenunits, setBinnenunits] = useState<Binnenunit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Binnenunit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const supabase = createClient();

  useEffect(() => {
    fetchBinnenunits();
  }, []);

  useEffect(() => {
    filterUnits();
    setCurrentPage(1); // Reset to first page when filters change
  }, [binnenunits, searchTerm, selectedBrand, selectedType]);

  const fetchBinnenunits = async () => {
    try {
      const { data, error } = await supabase
        .from("Binnenunits")
        .select("*")
        .order("id");

      if (error) {
        console.error("Error fetching binnenunits:", error);
        return;
      }

      setBinnenunits(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUnits = () => {
    let filtered = binnenunits;

    if (searchTerm) {
      filtered = filtered.filter(
        (unit) =>
          unit.Product.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit["Merk:"].toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit["Serie:"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter((unit) => unit["Merk:"] === selectedBrand);
    }

    if (selectedType) {
      filtered = filtered.filter((unit) => unit["Type:"] === selectedType);
    }

    setFilteredUnits(filtered);
  };

  const getUniqueBrands = () => {
    return [...new Set(binnenunits.map((unit) => unit["Merk:"]))].filter(
      Boolean
    );
  };

  const getUniqueTypes = () => {
    return [...new Set(binnenunits.map((unit) => unit["Type:"]))].filter(
      Boolean
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

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

  const getEnergyLabelColor = (label: string) => {
    switch (label) {
      case "A+++":
        return "bg-green-100 text-green-800";
      case "A++":
        return "bg-blue-100 text-blue-800";
      case "A+":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const extractImageUrl = (imageField: string) => {
    if (!imageField) return null;

    try {
      // First, try to parse as JSON array (Supabase Storage format)
      const parsed = JSON.parse(imageField);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const url = parsed[0];
        // Validate that it's a proper URL
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
      // First, try to parse as JSON array (Supabase Storage format)
      const parsed = JSON.parse(imageField);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const url = parsed[0];
        if (typeof url === "string") {
          // Extract filename from the URL
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
      // If JSON parsing fails, fall back to regex for legacy data
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
            <div className="text-4xl mb-2">📷</div>
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
              <div className="text-4xl mb-2">⏰</div>
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
          <p className="mt-4 text-gray-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Binnenunits Catalog</h1>
        <p className="text-gray-600">
          Browse and filter air conditioning indoor units
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
                placeholder="Search products, brands, or series..."
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
              {Math.min(endIndex, filteredUnits.length)} of{" "}
              {filteredUnits.length} products
              {filteredUnits.length !== binnenunits.length &&
                ` (${binnenunits.length} total)`}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (binnenunits.length > 0) {
                  const firstImage = extractImageUrl(
                    binnenunits[0]["Foto unit:"]
                  );
                  console.log("🧪 Testing image URL:", firstImage);
                  if (firstImage) {
                    window.open(firstImage, "_blank");
                  }
                }
              }}
            >
              Test URL
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedUnits.map((unit) => {
          const imageUrl = extractImageUrl(unit["Foto unit:"]);
          const imageAlt = getImageAlt(unit["Foto unit:"], unit.Product);

          // Debug: Log first few image URLs
          if (unit.id <= 2) {
            console.log(`🖼️ Unit ${unit.id}:`, {
              original: unit["Foto unit:"],
              extracted: imageUrl,
              alt: imageAlt,
            });
          }

          return (
            <Card
              key={unit.id}
              className="hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
                  <ProductImage
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    productName={unit.Product}
                  />
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {unit.Product}
                </CardTitle>
                <CardDescription className="text-sm">
                  {unit["Merk:"]} • {unit["Serie:"]}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 flex-grow flex flex-col">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge variant="secondary">{unit["Type:"]}</Badge>
                  </div>

                  {unit.prijs && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold text-green-600">
                        {unit.prijs}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Power:</span>
                    <span className="font-medium">
                      {unit["Vermogen (kW):"]} kW
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cooling:</span>
                    <Badge
                      className={getEnergyLabelColor(
                        unit["Energielabel Koelen:"]
                      )}
                    >
                      {unit["Energielabel Koelen:"]}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Heating:</span>
                    <Badge
                      className={getEnergyLabelColor(
                        unit["Energielabel Verwarmen"]
                      )}
                    >
                      {unit["Energielabel Verwarmen"]}
                    </Badge>
                  </div>

                  {unit["Smart-Functies"] && (
                    <div className="pt-2">
                      <span className="text-sm text-gray-600">
                        Smart Features:
                      </span>
                      <div className="mt-1">
                        {unit["Smart-Functies"]
                          .split(",")
                          .map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="mr-1 mb-1 text-xs"
                            >
                              {feature.trim()}
                            </Badge>
                          ))}
                      </div>
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

      {filteredUnits.length === 0 && (
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
