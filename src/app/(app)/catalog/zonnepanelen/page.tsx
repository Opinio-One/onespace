"use client";

import { useEffect, useState } from "react";
import type { Zonnepaneel, PaginatedResponse } from "@/types/catalog";
import { CatalogGrid } from "@/components/catalog-grid";
import { ProductImage } from "@/components/catalog-product-image";
import { Sun } from "lucide-react";
import {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardImage,
  EnhancedCardContent,
  EnhancedCardTitle,
  EnhancedCardDescription,
  ProductSpec,
  PriceDisplay,
} from "@/components/ui/enhanced-card";
import { Badge } from "@/components/ui/badge";
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
    const isHighPerformance = panel.Vermogen_Wp && panel.Vermogen_Wp >= 400;
    const hasHighScore =
      panel["OS (opbrengstscore)"] &&
      parseFloat(panel["OS (opbrengstscore)"]) >= 8;

    return (
      <EnhancedCard
        key={panel.Id}
        variant={isHighPerformance ? "featured" : "default"}
        featured={isHighPerformance}
        className="h-full"
      >
        <EnhancedCardHeader
          badge={isHighPerformance ? "High Performance" : undefined}
          badgeVariant={isHighPerformance ? "default" : "secondary"}
        >
          <EnhancedCardImage
            aspectRatio="square"
            overlay={
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="opacity-90">
                  <Sun className="h-4 w-4 mr-1" />
                  Quick View
                </Button>
              </div>
            }
          >
            <ProductImage
              imageUrl={imageUrl}
              productName={panel.Product}
              fallbackIcon={
                <Sun className="h-16 w-16 mx-auto mb-2 text-gray-400" />
              }
            />
          </EnhancedCardImage>

          <EnhancedCardTitle>{panel.Product}</EnhancedCardTitle>
          <EnhancedCardDescription>
            {panel.Merk} • {panel["Product code"]}
          </EnhancedCardDescription>
        </EnhancedCardHeader>

        <EnhancedCardContent
          onViewDetails={() => console.log("View details for", panel.Product)}
          onAddToCart={() => console.log("Add to cart", panel.Product)}
          onToggleFavorite={() => console.log("Toggle favorite", panel.Product)}
        >
          <ProductSpec
            label="Cell Technology"
            value={panel["Celtechnologie type"]}
            badge
            badgeColor={getCellTypeColor(panel["Celtechnologie type"])}
          />

          {panel.Prijs_EUR && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price:</span>
              <PriceDisplay price={panel.Prijs_EUR} className="text-lg" />
            </div>
          )}

          <ProductSpec
            label="Power Output"
            value={`${panel.Vermogen_Wp} Wp`}
            icon={<Sun className="h-4 w-4" />}
          />

          <ProductSpec
            label="Dimensions"
            value={`${panel["Lengte (mm)"]} × ${panel["Breedte (mm)"]} mm`}
          />

          <ProductSpec label="Weight" value={`${panel.Gewicht_kg} kg`} />

          {panel["Productgarantie (jaren)"] && (
            <ProductSpec
              label="Warranty"
              value={`${panel["Productgarantie (jaren)"]} years`}
            />
          )}

          {panel["OS (opbrengstscore)"] && (
            <ProductSpec
              label="Yield Score"
              value={panel["OS (opbrengstscore)"]}
              badge
              badgeColor={getScoreColor(panel["OS (opbrengstscore)"])}
            />
          )}

          {panel["DS (duurzaamheidscore)"] && (
            <ProductSpec
              label="Durability Score"
              value={panel["DS (duurzaamheidscore)"]}
              badge
              badgeColor={getScoreColor(panel["DS (duurzaamheidscore)"])}
            />
          )}

          {panel["Bi-Facial"] && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">Features:</span>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {panel["Bi-Facial"]}
                </Badge>
                {hasHighScore && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    High Efficiency
                  </Badge>
                )}
              </div>
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>
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
