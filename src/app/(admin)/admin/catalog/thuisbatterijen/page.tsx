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
import { Pagination } from "@/components/ui/pagination";

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

export default function AdminThuisbatterijenTable() {
  const [thuisbatterijen, setThuisbatterijen] = useState<Thuisbatterij[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Thuisbatterij[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchThuisbatterijen = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("Thuisbatterijen")
          .select("*")
          .order("Id", { ascending: true });

        if (error) {
          console.error("Error fetching thuisbatterijen:", error);
        } else {
          setThuisbatterijen(data || []);
          setFilteredData(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThuisbatterijen();
  }, []);

  useEffect(() => {
    const filtered = thuisbatterijen.filter(
      (item) =>
        item.Product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item["Product code"].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, thuisbatterijen]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading thuisbatterijen...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Thuisbatterijen Table</h1>
        <p className="text-gray-600">
          Manage home battery storage systems data
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Thuisbatterijen Data</CardTitle>
              <CardDescription>
                {filteredData.length} of {thuisbatterijen.length} records
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
                placeholder="Search thuisbatterijen..."
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
                  <th className="text-left p-3 font-medium">Capacity (kWh)</th>
                  <th className="text-left p-3 font-medium">Power (kW)</th>
                  <th className="text-left p-3 font-medium">Voltage</th>
                  <th className="text-left p-3 font-medium">Cycles</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Product Code</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr
                    key={item.Id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/admin/catalog/thuisbatterijen/edit/${item.Id}`)
                    }
                  >
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
                        className="w-12 h-12 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.png";
                        }}
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">
                        {item.Product}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.Merk}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {item["Soort batterij"]}
                      </span>
                    </td>
                    <td className="p-3">{item["Batterij Capaciteit (kWh)"]}</td>
                    <td className="p-3">{item["Ontladingsvermogen (kW)"]}</td>
                    <td className="p-3">
                      {item["Batterij Voltage (Vdc/Vac)"]}
                    </td>
                    <td className="p-3">{item["Cyclus levensduur bij 25℃"]}</td>
                    <td className="p-3">
                      <span className="font-medium text-green-600">
                        {item.Prijs}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sm">
                      {item["Product code"]}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/admin/catalog/thuisbatterijen/edit/${item.Id}`;
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => e.stopPropagation()}
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
              No thuisbatterijen found matching your search.
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </CardContent>
      </Card>
    </div>
  );
}
