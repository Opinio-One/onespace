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

interface Buitenunit {
  Id: number;
  Name: string;
  "Logo:": string;
  "Foto buitenunit:": string;
  "Merk:": string;
  "Serie:": string;
  "Single/Multi-Split": string;
  "Modelvariant:": string;
  prijs: string;
  "Vermogen (kW)": string;
  "Vermogen categorie": string;
  "Aantal poorten Min-Max:": string;
  "Electrische aansluiting:": string;
  "COP Cooling/Heating": string;
  SEER: string;
  SCOP: string;
  "Gewicht: (kg)": string;
  "Air flow (m3/Min):": string;
  "Geluidsdruk (dB)": number;
  "Afmeting (H/B/D):": string;
  "Maximum som binnenunit": string;
  "Airconditioning binnenunit": string;
  "Modelvariant: (from Airconditioning binnenunit)": string;
  "Energielabel koelen:": string;
  "Datasheet:": any;
}

const BRANDS = ["Daikin", "Mitsubishi Heavy Industries", "Sinclair"];
const SPLIT_TYPES = ["Single-Split", "Multi-Split"];
const SERIES = [
  "ASH-09BIS2",
  "FDC-VNP-W",
  "MV-E-BI2",
  "MXM-N",
  "RXA-(A/B)",
  "RXJ-A",
  "RXM-R",
  "RXP-M",
  "RXP-N",
  "SCM-ZS-W",
  "SOH-BIK",
  "SOH-BIM",
  "SOH-BIT",
  "SRC-ZR-W",
  "SRC-ZS-W",
  "SRC-ZSX-W",
];
const POWER_CATEGORIES = [
  "11000-13000",
  "1500-2200",
  "2200-2700",
  "2700-3400",
  "3400-4200",
  "4200-4700",
  "4200-4700,4700-5500",
  "4700-5500",
  "5500-6400",
  "6400-7400",
  "7400-8600",
  "8600-11000",
];
const PORT_RANGES = [
  "1",
  "1 - 2",
  "1 - 3",
  "1 - 4",
  "1 - 5",
  "2",
  "2-3",
  "2-4",
  "2-5",
];
const ELECTRICAL_CONNECTIONS = ["1 Fase"];
const ENERGY_LABELS = ["A++", "A+++"];

export default function EditBuitenunitPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buitenunit, setBuitenunit] = useState<Buitenunit | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBuitenunit();
    }
  }, [params.id]);

  const fetchBuitenunit = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Buitenunits")
        .select("*")
        .eq("Id", params.id)
        .single();

      if (error) {
        console.error("Error fetching buitenunit:", error);
      } else {
        setBuitenunit(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!buitenunit) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("Buitenunits")
        .update(buitenunit)
        .eq("Id", params.id);

      if (error) {
        console.error("Error updating buitenunit:", error);
        alert("Error updating buitenunit: " + error.message);
      } else {
        router.push("/admin/catalog/buitenunits");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating buitenunit");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof Buitenunit,
    value: string | number
  ) => {
    if (buitenunit) {
      setBuitenunit({ ...buitenunit, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading buitenunit...</div>
        </div>
      </div>
    );
  }

  if (!buitenunit) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Buitenunit not found</div>
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
            onClick={() => router.push("/admin/catalog/buitenunits")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Buitenunits
          </Button>
          <h1 className="text-3xl font-bold">Edit Buitenunit</h1>
        </div>
        <p className="text-gray-600">Edit outdoor air conditioning unit data</p>
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
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={buitenunit.Name}
                onChange={(e) => handleInputChange("Name", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="merk">Brand</Label>
              <Select
                value={buitenunit["Merk:"]}
                onValueChange={(value: string) =>
                  handleInputChange("Merk:", value)
                }
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
              <Label htmlFor="split-type">Single/Multi-Split</Label>
              <Select
                value={buitenunit["Single/Multi-Split"]}
                onValueChange={(value: string) =>
                  handleInputChange("Single/Multi-Split", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select split type" />
                </SelectTrigger>
                <SelectContent>
                  {SPLIT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serie">Series</Label>
              <Select
                value={buitenunit["Serie:"]}
                onValueChange={(value: string) =>
                  handleInputChange("Serie:", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select series" />
                </SelectTrigger>
                <SelectContent>
                  {SERIES.map((series, index) => (
                    <SelectItem key={series} value={series}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index % 6 === 0
                              ? "bg-blue-500"
                              : index % 6 === 1
                              ? "bg-green-500"
                              : index % 6 === 2
                              ? "bg-purple-500"
                              : index % 6 === 3
                              ? "bg-orange-500"
                              : index % 6 === 4
                              ? "bg-pink-500"
                              : "bg-cyan-500"
                          }`}
                        />
                        {series}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modelvariant">Model Variant</Label>
              <Input
                id="modelvariant"
                value={buitenunit["Modelvariant:"]}
                onChange={(e) =>
                  handleInputChange("Modelvariant:", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Specifications</CardTitle>
            <CardDescription>
              Technical specifications and performance data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vermogen">Power (kW)</Label>
              <Input
                id="vermogen"
                value={buitenunit["Vermogen (kW)"]}
                onChange={(e) =>
                  handleInputChange("Vermogen (kW)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="seer">SEER</Label>
              <Input
                id="seer"
                value={buitenunit.SEER}
                onChange={(e) => handleInputChange("SEER", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="scop">SCOP</Label>
              <Input
                id="scop"
                value={buitenunit.SCOP}
                onChange={(e) => handleInputChange("SCOP", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="prijs">Price</Label>
              <Input
                id="prijs"
                value={buitenunit.prijs}
                onChange={(e) => handleInputChange("prijs", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="geluidsdruk">Sound Pressure (dB)</Label>
              <Input
                id="geluidsdruk"
                type="number"
                value={buitenunit["Geluidsdruk (dB)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Geluidsdruk (dB)",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="gewicht">Weight (kg)</Label>
              <Input
                id="gewicht"
                value={buitenunit["Gewicht: (kg)"]}
                onChange={(e) =>
                  handleInputChange("Gewicht: (kg)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="vermogen-categorie">Power Category</Label>
              <Select
                value={buitenunit["Vermogen categorie"]}
                onValueChange={(value: string) =>
                  handleInputChange("Vermogen categorie", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select power category" />
                </SelectTrigger>
                <SelectContent>
                  {POWER_CATEGORIES.map((category, index) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index % 6 === 0
                              ? "bg-red-500"
                              : index % 6 === 1
                              ? "bg-yellow-500"
                              : index % 6 === 2
                              ? "bg-indigo-500"
                              : index % 6 === 3
                              ? "bg-teal-500"
                              : index % 6 === 4
                              ? "bg-rose-500"
                              : "bg-lime-500"
                          }`}
                        />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Physical Specifications</CardTitle>
            <CardDescription>
              Physical dimensions and installation details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="afmeting">Dimensions (H/B/D)</Label>
              <Input
                id="afmeting"
                value={buitenunit["Afmeting (H/B/D):"]}
                onChange={(e) =>
                  handleInputChange("Afmeting (H/B/D):", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="aantal-poorten">Number of Ports (Min-Max)</Label>
              <Select
                value={buitenunit["Aantal poorten Min-Max:"]}
                onValueChange={(value: string) =>
                  handleInputChange("Aantal poorten Min-Max:", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select port range" />
                </SelectTrigger>
                <SelectContent>
                  {PORT_RANGES.map((range, index) => (
                    <SelectItem key={range} value={range}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index % 5 === 0
                              ? "bg-emerald-500"
                              : index % 5 === 1
                              ? "bg-violet-500"
                              : index % 5 === 2
                              ? "bg-amber-500"
                              : index % 5 === 3
                              ? "bg-sky-500"
                              : "bg-fuchsia-500"
                          }`}
                        />
                        {range}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="electrische-aansluiting">
                Electrical Connection
              </Label>
              <Select
                value={buitenunit["Electrische aansluiting:"]}
                onValueChange={(value: string) =>
                  handleInputChange("Electrische aansluiting:", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select electrical connection" />
                </SelectTrigger>
                <SelectContent>
                  {ELECTRICAL_CONNECTIONS.map((connection, index) => (
                    <SelectItem key={connection} value={connection}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-500" />
                        {connection}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="air-flow">Air Flow (m³/Min)</Label>
              <Input
                id="air-flow"
                value={buitenunit["Air flow (m3/Min):"]}
                onChange={(e) =>
                  handleInputChange("Air flow (m3/Min):", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="cop">COP Cooling/Heating</Label>
              <Input
                id="cop"
                value={buitenunit["COP Cooling/Heating"]}
                onChange={(e) =>
                  handleInputChange("COP Cooling/Heating", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compatibility & Documentation</CardTitle>
            <CardDescription>
              Compatibility information and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="max-binnenunit">Maximum Indoor Units</Label>
              <Input
                id="max-binnenunit"
                value={buitenunit["Maximum som binnenunit"]}
                onChange={(e) =>
                  handleInputChange("Maximum som binnenunit", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="compatible-binnenunit">
                Compatible Indoor Units
              </Label>
              <Input
                id="compatible-binnenunit"
                value={buitenunit["Airconditioning binnenunit"]}
                onChange={(e) =>
                  handleInputChange(
                    "Airconditioning binnenunit",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="energielabel">Cooling Energy Label</Label>
              <Select
                value={buitenunit["Energielabel koelen:"]}
                onValueChange={(value: string) =>
                  handleInputChange("Energielabel koelen:", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select energy label" />
                </SelectTrigger>
                <SelectContent>
                  {ENERGY_LABELS.map((label, index) => (
                    <SelectItem key={label} value={label}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0 ? "bg-green-500" : "bg-blue-500"
                          }`}
                        />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FileUpload
                label="Outdoor Unit Photo"
                currentFile={(() => {
                  try {
                    const images = JSON.parse(
                      buitenunit["Foto buitenunit:"] || "[]"
                    );
                    const result = images[0];
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = buitenunit["Foto buitenunit:"];
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Foto buitenunit:", newValue);
                }}
                fileType="foto_buitenunit"
                productId={buitenunit.Id.toString()}
                tableName="buitenunits"
                accept="image/*"
                maxSize={5}
              />
            </div>

            <div>
              <FileUpload
                label="Logo"
                currentFile={(() => {
                  try {
                    const logo = JSON.parse(buitenunit["Logo:"] || "[]");
                    const result = Array.isArray(logo) ? logo[0] : logo;
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = buitenunit["Logo:"];
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Logo:", newValue);
                }}
                fileType="logo"
                productId={buitenunit.Id.toString()}
                tableName="buitenunits"
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
                      buitenunit["Datasheet:"] || "[]"
                    );
                    const result = Array.isArray(datasheet)
                      ? datasheet[0]
                      : datasheet;
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = buitenunit["Datasheet:"];
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Datasheet:", newValue);
                }}
                fileType="datasheet"
                productId={buitenunit.Id.toString()}
                tableName="buitenunits"
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
          onClick={() => router.push("/admin/catalog/buitenunits")}
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
