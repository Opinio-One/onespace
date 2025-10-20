"use client";

import { useEffect, useState } from "react";
import type { Thuisbatterij, PaginatedResponse } from "@/types/catalog";
import { CatalogGrid } from "@/components/catalog-grid";
import { ProductImage } from "@/components/catalog-product-image";
import { Battery } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SEARCHABLE_FIELDS = ["Product", "Merk", "Samenstelling"];
const FILTERABLE_FIELDS = [
  "Merk",
  "Soort batterij",
  "Aantal fases",
  "Categorie",
  "Samenstelling",
];

const FILTER_CONFIG = [
  { field: "Merk", label: "Brand", type: "multiselect" as const },
  {
    field: "Soort batterij",
    label: "Battery Type",
    type: "multiselect" as const,
  },
  { field: "Aantal fases", label: "Phases", type: "multiselect" as const },
  { field: "Categorie", label: "Category", type: "multiselect" as const },
  {
    field: "Samenstelling",
    label: "Composition",
    type: "multiselect" as const,
  },
  { field: "Prijs (EUR)", label: "Price (EUR)", type: "range" as const },
  {
    field: "Batterij Capaciteit (kWh)",
    label: "Capacity (kWh)",
    type: "range" as const,
  },
  {
    field: "Ontladingsvermogen (kW)",
    label: "Power (kW)",
    type: "range" as const,
  },
];

const Badge = ({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
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
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default function ThuisbatterijenPage() {
  const [initialData, setInitialData] =
    useState<PaginatedResponse<Thuisbatterij> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          "/api/catalog/thuisbatterijen?page=1&limit=12"
        );
        const data = await response.json();
        setInitialData(data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

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

  const extractImageUrl = (imageField: string | null | undefined) => {
    if (!imageField) return null;

    try {
      const parsed = JSON.parse(imageField);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const url = parsed[0];
        if (typeof url === "string" && url.startsWith("http")) {
          return url;
        }
      }
    } catch (error) {
      // Return null if parsing fails
    }

    return null;
  };

  const renderProductCard = (battery: Thuisbatterij) => {
    const imageUrl = extractImageUrl(battery.Afbeelding);

    return (
      <Card
        key={battery.Id}
        className="hover:shadow-lg transition-shadow flex flex-col h-full"
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
            <ProductImage
              imageUrl={imageUrl}
              productName={battery.Product}
              fallbackIcon={
                <Battery className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              }
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

            {battery["Prijs (EUR)"] && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="font-semibold text-green-600">
                  €
                  {battery["Prijs (EUR)"].toLocaleString("nl-NL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load catalog data.</p>
        </div>
      </div>
    );
  }

  return (
    <CatalogGrid<Thuisbatterij>
      initialData={initialData}
      apiEndpoint="/api/catalog/thuisbatterijen"
      displayName="Thuisbatterijen"
      filterConfig={FILTER_CONFIG}
      renderCard={renderProductCard}
      icon={<Battery className="h-8 w-8 text-green-600" />}
    />
  );
}
