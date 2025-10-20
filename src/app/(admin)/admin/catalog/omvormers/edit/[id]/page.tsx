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
import { MultiSelect } from "@/components/ui/multi-select";
import { ArrowLeft, Save, X } from "lucide-react";

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
  "PV WP": string | string[];
  Strings: number;
  Price: string;
  Cost: string;
  Currency: string;
  "Garantie (jaren)": number;
  SKU: string;
  Datasheet: any;
}

const BRANDS = ["Enphase", "GoodWe"];
const INVERTER_TYPES = [
  "AC-gekoppelde omvormer",
  "Hybride omvormer",
  "Micro-omvormer",
  "String omvormer",
];
const PHASES = ["1-fase", "3-fase", "Beiden mogelijk"];
const PV_WP_RANGES = [
  "1000-1800",
  "11000-13000",
  "13000-16000",
  "16000-18500",
  "1800-2500",
  "18500-21000",
  "21000-24000",
  "24000-27000",
  "2500-2800",
  "27000-30000",
  "2800-3200",
  "33000-36000",
  "3700-4300",
  "4300-4800",
  "4800-5200",
  "5600-6400",
  "6400-7400",
  "7400-8400",
  "8400-11000",
  "NVT",
];

export default function EditOmvormerPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [omvormer, setOmvormer] = useState<Omvormer | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchOmvormer();
    }
  }, [params.id]);

  const fetchOmvormer = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Omvormers")
        .select("*")
        .eq("Id", params.id)
        .single();

      if (error) {
        console.error("Error fetching omvormer:", error);
      } else {
        // Parse PV WP from comma-separated string to array
        const parsedData = {
          ...data,
          "PV WP": data["PV WP"]
            ? data["PV WP"].split(",").map((item) => item.trim())
            : [],
        };
        setOmvormer(parsedData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!omvormer) return;

    setSaving(true);
    try {
      const supabase = createClient();

      // Convert PV WP array back to comma-separated string
      const dataToSave = {
        ...omvormer,
        "PV WP": Array.isArray(omvormer["PV WP"])
          ? omvormer["PV WP"].join(", ")
          : omvormer["PV WP"],
      };

      const { error } = await supabase
        .from("Omvormers")
        .update(dataToSave)
        .eq("Id", params.id);

      if (error) {
        console.error("Error updating omvormer:", error);
        alert("Error updating omvormer: " + error.message);
      } else {
        router.push("/admin/catalog/omvormers");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating omvormer");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof Omvormer,
    value: string | number | string[]
  ) => {
    if (omvormer) {
      setOmvormer({ ...omvormer, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading omvormer...</div>
        </div>
      </div>
    );
  }

  if (!omvormer) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Omvormer not found</div>
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
            onClick={() => router.push("/admin/catalog/omvormers")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Omvormers
          </Button>
          <h1 className="text-3xl font-bold">Edit Omvormer</h1>
        </div>
        <p className="text-gray-600">Edit solar inverter system data</p>
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
                value={omvormer.Name}
                onChange={(e) => handleInputChange("Name", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="merk">Brand</Label>
              <Select
                value={omvormer.Merk}
                onValueChange={(value: string) =>
                  handleInputChange("Merk", value)
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
              <Label htmlFor="type">Inverter Type</Label>
              <Select
                value={omvormer["Type omvormer"]}
                onValueChange={(value: string) =>
                  handleInputChange("Type omvormer", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select inverter type" />
                </SelectTrigger>
                <SelectContent>
                  {INVERTER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={omvormer.SKU}
                onChange={(e) => handleInputChange("SKU", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="aantal-fases">Number of Phases</Label>
              <Select
                value={omvormer["Aantal fases"]}
                onValueChange={(value: string) =>
                  handleInputChange("Aantal fases", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of phases" />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((phase, index) => (
                    <SelectItem key={phase} value={phase}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? "bg-blue-500"
                              : index === 1
                              ? "bg-green-500"
                              : "bg-purple-500"
                          }`}
                        />
                        {phase}
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
            <CardTitle>Technical Specifications</CardTitle>
            <CardDescription>
              Power and electrical specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vermogen">Power (kW)</Label>
              <Input
                id="vermogen"
                type="number"
                step="0.1"
                value={omvormer.Vermogen}
                onChange={(e) =>
                  handleInputChange("Vermogen", parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <Label htmlFor="mppts">Number of MPPTs</Label>
              <Input
                id="mppts"
                type="number"
                value={omvormer.MPPTs}
                onChange={(e) =>
                  handleInputChange("MPPTs", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <Label htmlFor="strings-per-mppt">Strings per MPPT</Label>
              <Input
                id="strings-per-mppt"
                type="number"
                value={omvormer["Strings per MPPT"]}
                onChange={(e) =>
                  handleInputChange(
                    "Strings per MPPT",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="strings">Total Strings</Label>
              <Input
                id="strings"
                type="number"
                value={omvormer.Strings}
                onChange={(e) =>
                  handleInputChange("Strings", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <Label htmlFor="pv-wp">PV WP</Label>
              <MultiSelect
                options={PV_WP_RANGES}
                value={
                  Array.isArray(omvormer["PV WP"]) ? omvormer["PV WP"] : []
                }
                onChange={(value: string[]) =>
                  handleInputChange("PV WP", value)
                }
                placeholder="Select PV WP ranges"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Warranty</CardTitle>
            <CardDescription>
              Pricing information and warranty details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={omvormer.Price}
                onChange={(e) => handleInputChange("Price", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                value={omvormer.Cost}
                onChange={(e) => handleInputChange("Cost", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={omvormer.Currency}
                onChange={(e) => handleInputChange("Currency", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="garantie">Warranty (years)</Label>
              <Input
                id="garantie"
                type="number"
                value={omvormer["Garantie (jaren)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Garantie (jaren)",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images & Documentation</CardTitle>
            <CardDescription>Product images and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FileUpload
                label="Product Image"
                currentFile={(() => {
                  try {
                    const images = JSON.parse(omvormer.Afbeelding || "[]");
                    const result = images[0];
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = omvormer.Afbeelding;
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Afbeelding", newValue);
                }}
                fileType="afbeelding"
                productId={omvormer.Id.toString()}
                tableName="omvormers"
                accept="image/*"
                maxSize={5}
              />
            </div>

            <div>
              <FileUpload
                label="Logo"
                currentFile={(() => {
                  try {
                    const logo = JSON.parse(omvormer.Logo || "[]");
                    const result = Array.isArray(logo) ? logo[0] : logo;
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = omvormer.Logo;
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Logo", newValue);
                }}
                fileType="logo"
                productId={omvormer.Id.toString()}
                tableName="omvormers"
                accept="image/*"
                maxSize={2}
              />
            </div>

            <div>
              <FileUpload
                label="Datasheet"
                currentFile={(() => {
                  try {
                    const datasheet = JSON.parse(omvormer.Datasheet || "[]");
                    const result = Array.isArray(datasheet)
                      ? datasheet[0]
                      : datasheet;
                    return typeof result === "string" ? result : undefined;
                  } catch {
                    const result = omvormer.Datasheet;
                    return typeof result === "string" ? result : undefined;
                  }
                })()}
                onFileChange={(url) => {
                  const newValue = url ? JSON.stringify([url]) : "";
                  handleInputChange("Datasheet", newValue);
                }}
                fileType="datasheet"
                productId={omvormer.Id.toString()}
                tableName="omvormers"
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
          onClick={() => router.push("/admin/catalog/omvormers")}
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
