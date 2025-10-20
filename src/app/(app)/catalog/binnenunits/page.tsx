"use client";

import { useEffect, useState } from "react";
import type { Binnenunit, PaginatedResponse } from "@/types/catalog";
import { CatalogGrid } from "@/components/catalog-grid";
import { ProductImage } from "@/components/catalog-product-image";
import { Wind } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

    return (
      <Card
        key={unit.id}
        className="hover:shadow-lg transition-shadow flex flex-col h-full"
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
            <ProductImage
              imageUrl={imageUrl}
              productName={unit.Product}
              fallbackIcon={
                <Wind className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              }
            />
          </div>
          <CardTitle className="text-lg line-clamp-2">{unit.Product}</CardTitle>
          <CardDescription className="text-sm">
            {unit.Merk} • {unit.Type}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 flex-grow flex flex-col">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cooling Label:</span>
              <Badge className={getEnergyLabelColor(unit.Energielabel_Koelen)}>
                {unit.Energielabel_Koelen}
              </Badge>
            </div>

            {unit.Prijs_EUR && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="font-semibold text-green-600">
                  €
                  {unit.Prijs_EUR.toLocaleString("nl-NL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Power:</span>
              <span className="font-medium">{unit.Vermogen_kW} kW</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SEER:</span>
              <span className="font-medium">{unit.SEER}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SCOP:</span>
              <span className="font-medium">{unit.SCOP}</span>
            </div>

            {unit.Kleur && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Color:</span>
                <Badge variant="outline">{unit.Kleur}</Badge>
              </div>
            )}

            {unit["Smart-Functies"] && (
              <div className="pt-2">
                <span className="text-sm text-gray-600">Features:</span>
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    {unit["Smart-Functies"]}
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
