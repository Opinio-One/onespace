"use client";

import { useEffect, useState } from "react";
import type { Zonnepaneel, PaginatedResponse } from "@/types/catalog";
import { CatalogGrid } from "@/components/catalog-grid";
import { ProductImage } from "@/components/catalog-product-image";
import { Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const FILTER_CONFIG = [
  { field: "Merk", label: "Brand", type: "multiselect" as const },
  { field: "Cell type", label: "Cell Type", type: "multiselect" as const },
  {
    field: "Celtechnologie type",
    label: "Cell Technology",
    type: "multiselect" as const,
  },
  { field: "Bi-Facial", label: "Bi-Facial", type: "multiselect" as const },
  { field: "Glas type", label: "Glass Type", type: "multiselect" as const },
  { field: "Glas-glas", label: "Glass-Glass", type: "multiselect" as const },
  {
    field: "Celmateriaal",
    label: "Cell Material",
    type: "multiselect" as const,
  },
  {
    field: "Prijs_EUR",
    label: "Price (EUR)",
    type: "range" as const,
  },
];

// Badge component
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

export default function ZonnepanelenPage() {
  const [initialData, setInitialData] =
    useState<PaginatedResponse<Zonnepaneel> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          "/api/catalog/zonnepanelen?page=1&limit=12"
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

  // Helper functions
  const getCellTypeColor = (cellType: string) => {
    switch (cellType?.toLowerCase()) {
      case "mono":
      case "monocrystalline":
        return "bg-blue-100 text-blue-800";
      case "poly":
      case "polycrystalline":
        return "bg-green-100 text-green-800";
      case "thin-film":
        return "bg-purple-100 text-purple-800";
      case "bifacial":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return "bg-gray-100 text-gray-800";

    if (numScore >= 8) return "bg-green-100 text-green-800";
    if (numScore >= 6) return "bg-yellow-100 text-yellow-800";
    if (numScore >= 4) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
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

  // Product card renderer
  const renderProductCard = (panel: Zonnepaneel) => {
    const imageUrl = extractImageUrl(panel.Afbeelding);

    return (
      <Card
        key={panel.Id}
        className="hover:shadow-lg transition-shadow flex flex-col h-full"
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
            <ProductImage
              imageUrl={imageUrl}
              productName={panel.Product}
              fallbackIcon={
                <Sun className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              }
            />
          </div>
          <CardTitle className="text-lg line-clamp-2">
            {panel.Product}
          </CardTitle>
          <CardDescription className="text-sm">
            {panel.Merk} • {panel["Product code"]}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 flex-grow flex flex-col">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cell Type:</span>
              <Badge className={getCellTypeColor(panel["Celtechnologie type"])}>
                {panel["Celtechnologie type"]}
              </Badge>
            </div>

            {panel.Prijs_EUR && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="font-semibold text-green-600">
                  €
                  {panel.Prijs_EUR.toLocaleString("nl-NL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Power:</span>
              <span className="font-medium">{panel.Vermogen_Wp} Wp</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dimensions:</span>
              <span className="text-sm">
                {panel["Lengte (mm)"]} × {panel["Breedte (mm)"]} mm
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weight:</span>
              <span className="text-sm">{panel.Gewicht_kg} kg</span>
            </div>

            {panel["Productgarantie (jaren)"] && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warranty:</span>
                <span className="text-sm">
                  {panel["Productgarantie (jaren)"]} years
                </span>
              </div>
            )}

            {panel["OS (opbrengstscore)"] && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Yield Score:</span>
                <Badge className={getScoreColor(panel["OS (opbrengstscore)"])}>
                  {panel["OS (opbrengstscore)"]}
                </Badge>
              </div>
            )}

            {panel["DS (duurzaamheidscore)"] && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Durability:</span>
                <Badge
                  className={getScoreColor(panel["DS (duurzaamheidscore)"])}
                >
                  {panel["DS (duurzaamheidscore)"]}
                </Badge>
              </div>
            )}

            {panel["Bi-Facial"] && (
              <div className="pt-2">
                <span className="text-sm text-gray-600">Features:</span>
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    {panel["Bi-Facial"]}
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
    <CatalogGrid<Zonnepaneel>
      initialData={initialData}
      apiEndpoint="/api/catalog/zonnepanelen"
      displayName="Zonnepanelen"
      filterConfig={FILTER_CONFIG}
      renderCard={renderProductCard}
      icon={<Sun className="h-8 w-8 text-yellow-500" />}
    />
  );
}
