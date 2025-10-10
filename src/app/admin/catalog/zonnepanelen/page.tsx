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

interface Zonnepaneel {
  Id: number;
  Product: string;
  Afbeelding: string;
  "Product code": string;
  Merk: string;
  Logo: string;
  "Vermogen (Wp)": number;
  "Lengte (mm)": number;
  "Breedte (mm)": number;
  "Hoogte (mm)": number;
  "Gewicht (kg)": string;
  "Celtechnologie type": string;
  "Bi-Facial": string;
  "Glas type": string;
  "Glas-glas": string;
  "Cell type": string;
  Celmateriaal: string;
  "Productgarantie (jaren)": number;
  NMOT: string;
  "NMOT factor 1.15": string;
  "Verkoopprijs paneel": string;
  "Prijs online gemiddeld": string;
  "Jaaropbrengst (kWh)": string;
  "Totale opbrengst na 10 jaar": string;
  "Totale opbrengst na 20 jaar": string;
  "Totale opbrengst na 30 jaar": string;
  "Opbrengst (in garantietermijn)": string;
  "OS (opbrengstscore)": string;
  "DS (duurzaamheidscore)": string;
  "LCOE score 10 jaar": string;
  "LCOE score 20 jaar": string;
  "LCOE score 30 jaar": string;
  Datasheet: string;
}

export default function AdminZonnepanelenTable() {
  const [zonnepanelen, setZonnepanelen] = useState<Zonnepaneel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Zonnepaneel[]>([]);

  useEffect(() => {
    const fetchZonnepanelen = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("Zonnepanelen")
          .select("*")
          .order("Id", { ascending: true });

        if (error) {
          console.error("Error fetching zonnepanelen:", error);
        } else {
          setZonnepanelen(data || []);
          setFilteredData(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchZonnepanelen();
  }, []);

  useEffect(() => {
    const filtered = zonnepanelen.filter(
      (item) =>
        item.Product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item["Product code"].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, zonnepanelen]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading zonnepanelen...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Zonnepanelen Table</h1>
        <p className="text-gray-600">Manage solar panel systems data</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Zonnepanelen Data</CardTitle>
              <CardDescription>
                {filteredData.length} of {zonnepanelen.length} records
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
                placeholder="Search zonnepanelen..."
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
                  <th className="text-left p-3 font-medium">Cell Type</th>
                  <th className="text-left p-3 font-medium">Power (Wp)</th>
                  <th className="text-left p-3 font-medium">Dimensions</th>
                  <th className="text-left p-3 font-medium">Weight (kg)</th>
                  <th className="text-left p-3 font-medium">
                    Warranty (years)
                  </th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Product Code</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.Id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.Id}</td>
                    <td className="p-3">
                      <img
                        src={(() => {
                          try {
                            const images = JSON.parse(item.Afbeelding || "[]");
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
                    <td className="p-3">{item.Merk}</td>
                    <td className="p-3">{item["Cell type"]}</td>
                    <td className="p-3">{item["Vermogen (Wp)"]}</td>
                    <td className="p-3">
                      {item["Lengte (mm)"]}x{item["Breedte (mm)"]}x
                      {item["Hoogte (mm)"]}
                    </td>
                    <td className="p-3">{item["Gewicht (kg)"]}</td>
                    <td className="p-3">{item["Productgarantie (jaren)"]}</td>
                    <td className="p-3">{item["Verkoopprijs paneel"]}</td>
                    <td className="p-3 font-mono text-sm">
                      {item["Product code"]}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
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
              No zonnepanelen found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
