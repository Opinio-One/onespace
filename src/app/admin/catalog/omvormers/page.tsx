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

interface Omvormer {
  Id: number;
  Name: string;
  Afbeelding: string;
  Logo: string;
  Merk: string;
  "Type omvormer": string;
  Vermogen: number;
  "Aantal fases": string;
  MPPTs: number;
  "Strings per MPPT": number;
  "PV WP": string;
  Strings: number;
  Price: string;
  Cost: string;
  Currency: string;
  "Garantie (jaren)": number;
  SKU: string;
  Datasheet: any;
}

export default function AdminOmvormersTable() {
  const [omvormers, setOmvormers] = useState<Omvormer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Omvormer[]>([]);

  useEffect(() => {
    const fetchOmvormers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("Omvormers")
          .select("*")
          .order("Id", { ascending: true });

        if (error) {
          console.error("Error fetching omvormers:", error);
        } else {
          setOmvormers(data || []);
          setFilteredData(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOmvormers();
  }, []);

  useEffect(() => {
    const filtered = omvormers.filter(
      (item) =>
        item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.SKU.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, omvormers]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading omvormers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Omvormers Table</h1>
        <p className="text-gray-600">Manage solar inverter systems data</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Omvormers Data</CardTitle>
              <CardDescription>
                {filteredData.length} of {omvormers.length} records
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
                placeholder="Search omvormers..."
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
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Brand</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Power (kW)</th>
                  <th className="text-left p-3 font-medium">Phases</th>
                  <th className="text-left p-3 font-medium">MPPTs</th>
                  <th className="text-left p-3 font-medium">Strings</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">SKU</th>
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
                        alt={item.Name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.png";
                        }}
                      />
                    </td>
                    <td className="p-3 font-medium">{item.Name}</td>
                    <td className="p-3">{item.Merk}</td>
                    <td className="p-3">{item["Type omvormer"]}</td>
                    <td className="p-3">{item.Vermogen}</td>
                    <td className="p-3">{item["Aantal fases"]}</td>
                    <td className="p-3">{item.MPPTs}</td>
                    <td className="p-3">{item.Strings}</td>
                    <td className="p-3">{item.Price}</td>
                    <td className="p-3 font-mono text-sm">{item.SKU}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/admin/catalog/omvormers/edit/${item.Id}`)
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
              No omvormers found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
