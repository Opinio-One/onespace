"use client";

import { useEffect, useState } from "react";
import type { Buitenunit, PaginatedResponse } from "@/types/catalog";
import { CatalogTable } from "@/components/admin/catalog-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

const FILTER_CONFIG = [
  { field: "Merk", label: "Brand", type: "multiselect" as const },
  { field: "split_type", label: "Type", type: "multiselect" as const },
  {
    field: "Energielabel_koelen",
    label: "Cooling Energy Label",
    type: "multiselect" as const,
  },
  { field: "SEER", label: "SEER", type: "range" as const },
  { field: "SCOP", label: "SCOP", type: "range" as const },
];

export default function AdminBuitenunitsPage() {
  const [initialData, setInitialData] =
    useState<PaginatedResponse<Buitenunit> | null>(null);

  useEffect(() => {
    // Fetch initial data from API route
    fetch("/api/catalog/buitenunits?page=1&limit=10")
      .then((res) => res.json())
      .then(setInitialData)
      .catch((error) => {
        console.error("Error fetching initial data:", error);
      });
  }, []);

  if (!initialData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <CatalogTable<Buitenunit>
      initialData={initialData}
      tableName="buitenunits"
      displayName="Buitenunits"
      extractId={(item) => item.Id}
      filterConfig={FILTER_CONFIG}
      renderHeader={() => (
        <>
          <th className="text-left p-3 font-medium">ID</th>
          <th className="text-left p-3 font-medium">Image</th>
          <th className="text-left p-3 font-medium">Name</th>
          <th className="text-left p-3 font-medium">Brand</th>
          <th className="text-left p-3 font-medium">Type</th>
          <th className="text-left p-3 font-medium">Power (kW)</th>
          <th className="text-left p-3 font-medium">SEER</th>
          <th className="text-left p-3 font-medium">SCOP</th>
          <th className="text-left p-3 font-medium">Price</th>
          <th className="text-left p-3 font-medium">Series</th>
          <th className="text-left p-3 font-medium">Actions</th>
        </>
      )}
      renderRow={(item, onEdit, onDelete) => (
        <>
          <td className="p-3">{item.Id}</td>
          <td className="p-3">
            <img
              src={(() => {
                try {
                  const images = JSON.parse(item.Foto_buitenunit || "[]");
                  return images[0] || "/placeholder-image.png";
                } catch {
                  return "/placeholder-image.png";
                }
              })()}
              alt={item.Name}
              className="w-12 h-12 object-cover rounded-md border"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.png";
              }}
            />
          </td>
          <td className="p-3">
            <div className="font-semibold text-gray-900">{item.Name}</div>
          </td>
          <td className="p-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item.Merk}
            </span>
          </td>
          <td className="p-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {item["Single/Multi-Split"]}
            </span>
          </td>
          <td className="p-3">{item.Vermogen_kW}</td>
          <td className="p-3">{item.SEER}</td>
          <td className="p-3">{item.SCOP}</td>
          <td className="p-3">
            <span className="font-medium text-green-600">{item.Prijs_EUR}</span>
          </td>
          <td className="p-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {item.Serie}
            </span>
          </td>
          <td className="p-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item.Id);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.Id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </>
      )}
    />
  );
}
