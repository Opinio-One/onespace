"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowLeft, Save, X } from "lucide-react";

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

const BRANDS = [
  "BYD",
  "Dyness",
  "Enphase",
  "GoodWe",
  "Huawei",
  "Pylontech",
  "Renon",
  "Sessy",
  "Sigen",
];
const BATTERY_TYPES = ["AC", "DC-HV"];

export default function EditThuisbatterijPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thuisbatterij, setThuisbatterij] = useState<Thuisbatterij | null>(
    null
  );

  useEffect(() => {
    if (params.id) {
      fetchThuisbatterij();
    }
  }, [params.id]);

  const fetchThuisbatterij = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Thuisbatterijen")
        .select("*")
        .eq("Id", params.id)
        .single();

      if (error) {
        console.error("Error fetching thuisbatterij:", error);
      } else {
        setThuisbatterij(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!thuisbatterij) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("Thuisbatterijen")
        .update(thuisbatterij)
        .eq("Id", params.id);

      if (error) {
        console.error("Error updating thuisbatterij:", error);
        alert("Error updating thuisbatterij: " + error.message);
      } else {
        router.push("/admin/catalog/thuisbatterijen");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating thuisbatterij");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof Thuisbatterij,
    value: string | number
  ) => {
    if (thuisbatterij) {
      setThuisbatterij({ ...thuisbatterij, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading thuisbatterij...</div>
        </div>
      </div>
    );
  }

  if (!thuisbatterij) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Thuisbatterij not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/catalog/thuisbatterijen")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Thuisbatterijen
          </Button>
          <h1 className="text-3xl font-bold">Edit Thuisbatterij</h1>
        </div>
        <p className="text-gray-600">Edit home battery storage system data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Basic product information and specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="product">Product Name</Label>
              <Input
                id="product"
                value={thuisbatterij.Product}
                onChange={(e) => handleInputChange("Product", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="merk">Brand</Label>
              <Select
                value={thuisbatterij.Merk}
                onValueChange={(value) => handleInputChange("Merk", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="soort-batterij">Battery Type</Label>
              <Select
                value={thuisbatterij["Soort batterij"]}
                onValueChange={(value) =>
                  handleInputChange("Soort batterij", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select battery type" />
                </SelectTrigger>
                <SelectContent>
                  {BATTERY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="product-code">Product Code</Label>
              <Input
                id="product-code"
                value={thuisbatterij["Product code"]}
                onChange={(e) =>
                  handleInputChange("Product code", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="aantal-fases">Number of Phases</Label>
              <Input
                id="aantal-fases"
                value={thuisbatterij["Aantal fases"]}
                onChange={(e) =>
                  handleInputChange("Aantal fases", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Battery Specifications</CardTitle>
            <CardDescription>
              Battery capacity and electrical specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="capaciteit-kwh">Battery Capacity (kWh)</Label>
              <Input
                id="capaciteit-kwh"
                value={thuisbatterij["Batterij Capaciteit (kWh)"]}
                onChange={(e) =>
                  handleInputChange("Batterij Capaciteit (kWh)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="voltage">Battery Voltage (Vdc/Vac)</Label>
              <Input
                id="voltage"
                value={thuisbatterij["Batterij Voltage (Vdc/Vac)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Batterij Voltage (Vdc/Vac)",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="capaciteit-ah">Battery Capacity (Ah)</Label>
              <Input
                id="capaciteit-ah"
                value={thuisbatterij["Batterij Capaciteit (Ah)"]}
                onChange={(e) =>
                  handleInputChange("Batterij Capaciteit (Ah)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="ontladingsvermogen">Discharge Power (kW)</Label>
              <Input
                id="ontladingsvermogen"
                value={thuisbatterij["Ontladingsvermogen (kW)"]}
                onChange={(e) =>
                  handleInputChange("Ontladingsvermogen (kW)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="ontladingsstroom">Discharge Current (A)</Label>
              <Input
                id="ontladingsstroom"
                value={thuisbatterij["Ontladingsstroom (A)"]}
                onChange={(e) =>
                  handleInputChange("Ontladingsstroom (A)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="vermogen-per-kwh">Power per kWh</Label>
              <Input
                id="vermogen-per-kwh"
                type="number"
                step="0.1"
                value={thuisbatterij["Vermogen per kWh"]}
                onChange={(e) =>
                  handleInputChange(
                    "Vermogen per kWh",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Physical Specifications</CardTitle>
            <CardDescription>Physical dimensions and weight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="breedte">Width (mm)</Label>
              <Input
                id="breedte"
                type="number"
                value={thuisbatterij["Breedte (mm)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Breedte (mm)",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="diepte">Depth (mm)</Label>
              <Input
                id="diepte"
                type="number"
                value={thuisbatterij["Diepte (mm)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Diepte (mm)",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="hoogte">Height (mm)</Label>
              <Input
                id="hoogte"
                type="number"
                value={thuisbatterij["Hoogte (mm)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Hoogte (mm)",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="gewicht">Weight</Label>
              <Input
                id="gewicht"
                value={thuisbatterij.Gewicht}
                onChange={(e) => handleInputChange("Gewicht", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ontladingsdiepte">Discharge Depth (%)</Label>
              <Input
                id="ontladingsdiepte"
                value={thuisbatterij["Ontladingsdiepte (%)"]}
                onChange={(e) =>
                  handleInputChange("Ontladingsdiepte (%)", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle & Performance</CardTitle>
            <CardDescription>
              Battery lifecycle and performance characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cyclus-levensduur">Cycle Life at 25°C</Label>
              <Input
                id="cyclus-levensduur"
                type="number"
                value={thuisbatterij["Cyclus levensduur bij 25℃"]}
                onChange={(e) =>
                  handleInputChange(
                    "Cyclus levensduur bij 25℃",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="design-levensduur">Design Life</Label>
              <Input
                id="design-levensduur"
                value={thuisbatterij["Design levensduur"]}
                onChange={(e) =>
                  handleInputChange("Design levensduur", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="intensief-gebruik">Intensive Use Life</Label>
              <Input
                id="intensief-gebruik"
                type="number"
                value={thuisbatterij["Levensduur intensief gebruik"]}
                onChange={(e) =>
                  handleInputChange(
                    "Levensduur intensief gebruik",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="draaitijd">Full Charge Runtime</Label>
              <Input
                id="draaitijd"
                type="number"
                value={thuisbatterij["Volledig opgeladen nominale draaitijd"]}
                onChange={(e) =>
                  handleInputChange(
                    "Volledig opgeladen nominale draaitijd",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="prijs">Price</Label>
              <Input
                id="prijs"
                value={thuisbatterij.Prijs}
                onChange={(e) => handleInputChange("Prijs", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Compatibility and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="categorie">Category</Label>
              <Input
                id="categorie"
                value={thuisbatterij.Categorie}
                onChange={(e) => handleInputChange("Categorie", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="samenstelling">Composition</Label>
              <Input
                id="samenstelling"
                value={thuisbatterij.Samenstelling}
                onChange={(e) =>
                  handleInputChange("Samenstelling", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="vermogen-categorie">Power Category</Label>
              <Input
                id="vermogen-categorie"
                value={thuisbatterij["Vermogen categorie"]}
                onChange={(e) =>
                  handleInputChange("Vermogen categorie", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="compatibility">Compatibility List</Label>
              <Textarea
                id="compatibility"
                value={thuisbatterij["Compatibility list"]}
                onChange={(e) =>
                  handleInputChange("Compatibility list", e.target.value)
                }
              />
            </div>

            <div>
              <FileUpload
                label="Product Image"
                currentFile={(() => {
                  try {
                    const images = JSON.parse(thuisbatterij.Afbeelding || "[]");
                    const result = images[0];
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = thuisbatterij.Afbeelding;
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Afbeelding", newValue);
                }}
                fileType="afbeelding"
                productId={thuisbatterij.Id.toString()}
                tableName="thuisbatterijen"
                accept="image/*"
                maxSize={5}
              />
            </div>

            <div>
              <FileUpload
                label="Logo"
                currentFile={(() => {
                  try {
                    const logo = JSON.parse(thuisbatterij.Logo || "[]");
                    const result = Array.isArray(logo) ? logo[0] : logo;
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = thuisbatterij.Logo;
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Logo", newValue);
                }}
                fileType="logo"
                productId={thuisbatterij.Id.toString()}
                tableName="thuisbatterijen"
                accept="image/*"
                maxSize={2}
              />
            </div>

            <div>
              <FileUpload
                label="Datasheet"
                currentFile={(() => {
                  try {
                    const datasheet = JSON.parse(
                      thuisbatterij.Datasheet || "[]"
                    );
                    const result = Array.isArray(datasheet)
                      ? datasheet[0]
                      : datasheet;
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = thuisbatterij.Datasheet;
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Datasheet", newValue);
                }}
                fileType="datasheet"
                productId={thuisbatterij.Id.toString()}
                tableName="thuisbatterijen"
                accept=".pdf,.doc,.docx"
                maxSize={10}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/catalog/thuisbatterijen")}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
