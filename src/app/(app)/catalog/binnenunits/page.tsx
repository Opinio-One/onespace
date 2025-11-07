"use client";

import { useEffect, useState } from "react";
import type { Binnenunit, PaginatedResponse } from "@/types/catalog";
import { CatalogGrid } from "@/components/catalog-grid";
import { ProductImage } from "@/components/catalog-product-image";
import { Wind } from "lucide-react";
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

const SEARCHABLE_FIELDS = ["Product", "Merk", "Type"];
const FILTERABLE_FIELDS = [
  "Merk",
  "Type",
  "Energielabel_Koelen",
  "Energielabel_Verwarmen",
  "Multisplit compatibel",
  "Kleur",
  "Smart-Functies",
];

const FILTER_CONFIG = [
  { field: "Merk", label: "Brand", type: "multiselect" as const },
  { field: "Type", label: "Type", type: "multiselect" as const },
  {
    field: "Energielabel_Koelen",
    label: "Cooling Energy Label",
    type: "multiselect" as const,
  },
  {
    field: "Energielabel_Verwarmen",
    label: "Heating Energy Label",
    type: "multiselect" as const,
  },
  {
    field: "Multisplit compatibel",
    label: "Multisplit Compatible",
    type: "multiselect" as const,
  },
  { field: "Kleur", label: "Color", type: "multiselect" as const },
  {
    field: "Smart-Functies",
    label: "Smart Features",
    type: "multiselect" as const,
  },
  { field: "Prijs_EUR", label: "Price (EUR)", type: "range" as const },
  { field: "SEER", label: "SEER", type: "range" as const },
  { field: "SCOP", label: "SCOP", type: "range" as const },
];

export default function BinnenunitsPage() {
  const [initialData, setInitialData] =
    useState<PaginatedResponse<Binnenunit> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          "/api/catalog/binnenunits?page=1&limit=12"
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

  const getEnergyLabelColor = (label: string) => {
    switch (label?.toUpperCase()) {
      case "A+++":
      case "A++":
        return "bg-green-100 text-green-800";
      case "A+":
      case "A":
        return "bg-lime-100 text-lime-800";
      case "B":
        return "bg-yellow-100 text-yellow-800";
      case "C":
        return "bg-orange-100 text-orange-800";
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

  const renderProductCard = (unit: Binnenunit) => {
    const imageUrl = extractImageUrl(unit["Foto unit"]);
    const isHighEfficiency = unit.SEER && parseFloat(unit.SEER) >= 6;
    const isSmart = unit["Smart-Functies"] && unit["Smart-Functies"].length > 0;

    return (
      <EnhancedCard
        key={unit.id}
        variant={isHighEfficiency ? "featured" : "default"}
        featured={isHighEfficiency}
        className="h-full"
      >
        <EnhancedCardHeader
          badge={
            isHighEfficiency ? "High Efficiency" : isSmart ? "Smart" : undefined
          }
          badgeVariant={isHighEfficiency ? "default" : "secondary"}
        >
          <EnhancedCardImage
            aspectRatio="square"
            overlay={
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="opacity-90">
                  <Wind className="h-4 w-4 mr-1" />
                  Quick View
                </Button>
              </div>
            }
          >
            <ProductImage
              imageUrl={imageUrl}
              productName={unit.Product}
              fallbackIcon={
                <Wind className="h-16 w-16 mx-auto mb-2 text-gray-400" />
              }
            />
          </EnhancedCardImage>

          <EnhancedCardTitle>{unit.Product}</EnhancedCardTitle>
          <EnhancedCardDescription>
            {unit.Merk} • {unit.Type}
          </EnhancedCardDescription>
        </EnhancedCardHeader>

        <EnhancedCardContent
          onViewDetails={() => console.log("View details for", unit.Product)}
          onAddToCart={() => console.log("Add to cart", unit.Product)}
          onToggleFavorite={() => console.log("Toggle favorite", unit.Product)}
        >
          <ProductSpec
            label="Cooling Label"
            value={unit.Energielabel_Koelen}
            badge
            badgeColor={getEnergyLabelColor(unit.Energielabel_Koelen)}
          />

          {unit.Prijs_EUR && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price:</span>
              <PriceDisplay price={unit.Prijs_EUR} className="text-lg" />
            </div>
          )}

          <ProductSpec
            label="Power"
            value={`${unit.Vermogen_kW} kW`}
            icon={<Wind className="h-4 w-4" />}
          />

          <ProductSpec
            label="SEER"
            value={unit.SEER}
            badge
            badgeColor={
              isHighEfficiency
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }
          />

          <ProductSpec
            label="SCOP"
            value={unit.SCOP}
            badge
            badgeColor="bg-blue-100 text-blue-800"
          />

          {unit.Kleur && (
            <ProductSpec
              label="Color"
              value={unit.Kleur}
              badge
              badgeColor="bg-gray-100 text-gray-800"
            />
          )}

          {unit["Smart-Functies"] && (
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">Features:</span>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {unit["Smart-Functies"]}
                </Badge>
                {isSmart && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Smart Features
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
    <CatalogGrid<Binnenunit>
      initialData={initialData}
      apiEndpoint="/api/catalog/binnenunits"
      displayName="Binnenunits"
      filterConfig={FILTER_CONFIG}
      renderCard={renderProductCard}
      icon={<Wind className="h-8 w-8 text-cyan-600" />}
    />
  );
}
