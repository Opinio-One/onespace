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
import { Search, Filter, Download, Plus, Edit, Trash2 } from "lucide-react";

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

export default function AdminBinnenunitsTable() {
  const [binnenunits, setBinnenunits] = useState<Binnenunit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Binnenunit[]>([]);

  useEffect(() => {
    const fetchBinnenunits = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("Binnenunits")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching binnenunits:", error);
        } else {
          setBinnenunits(data || []);
          setFilteredData(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBinnenunits();
  }, []);

  useEffect(() => {
    const filtered = binnenunits.filter(
      (item) =>
        item.Product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item["Merk:"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        item["Serie:"].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, binnenunits]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading binnenunits...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Binnenunits Table</h1>
        <p className="text-gray-600">
          Manage indoor air conditioning units data
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Binnenunits Data</CardTitle>
              <CardDescription>
                {filteredData.length} of {binnenunits.length} records
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search binnenunits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">ID</th>
                  <th className="text-left p-3 font-medium">Image</th>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">Brand</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Power (kW)</th>
                  <th className="text-left p-3 font-medium">SEER</th>
                  <th className="text-left p-3 font-medium">SCOP</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Series</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.id}</td>
                    <td className="p-3">
                      <img
                        src={(() => {
                          try {
                            const images = JSON.parse(
                              item["Foto unit:"] || "[]"
                            );
                            return images[0] || "/placeholder-image.png";
                          } catch {
                            return "/placeholder-image.png";
                          }
                        })()}
                        alt={item.Product}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.png";
                        }}
                      />
                    </td>
                    <td className="p-3 font-medium">{item.Product}</td>
                    <td className="p-3">{item["Merk:"]}</td>
                    <td className="p-3">{item["Type:"]}</td>
                    <td className="p-3">{item["Vermogen (kW):"]}</td>
                    <td className="p-3">{item.SEER}</td>
                    <td className="p-3">{item.SCOP}</td>
                    <td className="p-3">{item.prijs}</td>
                    <td className="p-3 font-mono text-sm">{item["Serie:"]}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/admin/catalog/binnenunits/edit/${item.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No binnenunits found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
