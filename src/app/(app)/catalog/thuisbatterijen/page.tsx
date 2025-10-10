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
import { Search, Filter, Download, Battery } from "lucide-react";

interface Thuisbatterij {
  Id: number;
  Product: string;
  Afbeelding: string;
  "Product code": string;
  "Soort batterij": string;
  "Aantal fases": string;
  Merk: string;
  Logo: string;
  "Vermogen categorie": string;
  Categorie: string;
  Samenstelling: string;
  "Batterij Capaciteit (kWh)": string;
  "Batterij Voltage (Vdc/Vac)": string;
  "Batterij Capaciteit (Ah)": string;
  "Ontladingsvermogen (kW)": string;
  "Ontladingsstroom (A)": string;
  "Vermogen per kWh": number;
  "Volledig opgeladen nominale draaitijd": number;
  "Breedte (mm)": number;
  "Diepte (mm)": number;
  "Hoogte (mm)": number;
  Gewicht: string;
  "Ontladingsdiepte (%)": string;
  "Cyclus levensduur bij 25℃": number;
  "Design levensduur": string;
  "Levensduur intensief gebruik": number;
  Prijs: string;
  Datasheet: string[];
  "Compatibility list": string;
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

export default function ThuisbatterijenPage() {
  const [thuisbatterijen, setThuisbatterijen] = useState<Thuisbatterij[]>([]);
  const [filteredBatteries, setFilteredBatteries] = useState<Thuisbatterij[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const supabase = createClient();

  useEffect(() => {
    fetchThuisbatterijen();
  }, []);

  useEffect(() => {
    filterBatteries();
    setCurrentPage(1); // Reset to first page when filters change
  }, [thuisbatterijen, searchTerm, selectedBrand, selectedCategory]);

  const fetchThuisbatterijen = async () => {
    try {
      const { data, error } = await supabase
        .from("Thuisbatterijen")
        .select("*")
        .order("Id");

      if (error) {
        console.error("Error fetching thuisbatterijen:", error);
        return;
      }

      setThuisbatterijen(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBatteries = () => {
    let filtered = thuisbatterijen;

    if (searchTerm) {
      filtered = filtered.filter(
        (battery) =>
          battery.Product.toLowerCase().includes(searchTerm.toLowerCase()) ||
          battery.Merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
          battery.Samenstelling.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter((battery) => battery.Merk === selectedBrand);
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (battery) => battery.Categorie === selectedCategory
      );
    }

    setFilteredBatteries(filtered);
  };

  const getUniqueBrands = () => {
    return [...new Set(thuisbatterijen.map((battery) => battery.Merk))].filter(
      Boolean
    );
  };

  const getUniqueCategories = () => {
    return [
      ...new Set(thuisbatterijen.map((battery) => battery.Categorie)),
    ].filter(Boolean);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredBatteries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBatteries = filteredBatteries.slice(startIndex, endIndex);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Premium":
        return "bg-purple-100 text-purple-800";
      case "Budget":
        return "bg-green-100 text-green-800";
      case "Standard":
        return "bg-blue-100 text-blue-800";
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
      // If JSON parsing fails, return null
      console.log("Failed to parse image field:", imageField);
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
            <Battery className="h-12 w-12 mx-auto mb-2 text-gray-400" />
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
              <Battery className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <div className="text-sm">Image unavailable</div>
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
          <p className="mt-4 text-gray-600">
            Loading thuisbatterijen catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Thuisbatterijen Catalog</h1>
        <p className="text-gray-600">
          Browse and filter home battery storage solutions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, brands, or battery types..."
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {getUniqueCategories().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredBatteries.length)} of{" "}
              {filteredBatteries.length} products
              {filteredBatteries.length !== thuisbatterijen.length &&
                ` (${thuisbatterijen.length} total)`}
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
        {paginatedBatteries.map((battery) => {
          const imageUrl = extractImageUrl(battery.Afbeelding);
          const imageAlt = getImageAlt(battery.Afbeelding, battery.Product);

          return (
            <Card
              key={battery.Id}
              className="hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
                  <ProductImage
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    productName={battery.Product}
                  />
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {battery.Product}
                </CardTitle>
                <CardDescription className="text-sm">
                  {battery.Merk} • {battery["Soort batterij"]}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 flex-grow flex flex-col">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <Badge className={getCategoryColor(battery.Categorie)}>
                      {battery.Categorie}
                    </Badge>
                  </div>

                  {battery.Prijs && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold text-green-600">
                        {battery.Prijs}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="font-medium">
                      {battery["Batterij Capaciteit (kWh)"]} kWh
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Power:</span>
                    <span className="font-medium">
                      {battery["Ontladingsvermogen (kW)"]} kW
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Battery Type:</span>
                    <Badge variant="outline">{battery.Samenstelling}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Lifespan:</span>
                    <span className="text-sm">
                      {battery["Cyclus levensduur bij 25℃"]} cycles
                    </span>
                  </div>

                  {battery["Aantal fases"] && (
                    <div className="pt-2">
                      <span className="text-sm text-gray-600">Phases:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {battery["Aantal fases"]}
                        </Badge>
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

      {filteredBatteries.length === 0 && (
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

