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
import { ArrowLeft, Save, X } from "lucide-react";

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

const BRANDS = ["Daikin", "Mitsubishi Heavy Industries", "Sinclair"];
const TYPES = ["Vloerunit", "Wandunit"];

export default function EditBinnenunitPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [binnenunit, setBinnenunit] = useState<Binnenunit | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBinnenunit();
    }
  }, [params.id]);

  const fetchBinnenunit = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Binnenunits")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching binnenunit:", error);
      } else {
        setBinnenunit(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!binnenunit) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("Binnenunits")
        .update(binnenunit)
        .eq("id", params.id);

      if (error) {
        console.error("Error updating binnenunit:", error);
        alert("Error updating binnenunit: " + error.message);
      } else {
        router.push("/admin/catalog/binnenunits");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating binnenunit");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof Binnenunit,
    value: string | number
  ) => {
    if (binnenunit) {
      setBinnenunit({ ...binnenunit, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading binnenunit...</div>
        </div>
      </div>
    );
  }

  if (!binnenunit) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Binnenunit not found</div>
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
            onClick={() => router.push("/admin/catalog/binnenunits")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Binnenunits
          </Button>
          <h1 className="text-3xl font-bold">Edit Binnenunit</h1>
        </div>
        <p className="text-gray-600">Edit indoor air conditioning unit data</p>
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
                value={binnenunit.Product}
                onChange={(e) => handleInputChange("Product", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="merk">Brand</Label>
              <Select
                value={binnenunit["Merk:"]}
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
              <Label htmlFor="type">Type</Label>
              <Select
                value={binnenunit["Type:"]}
                onValueChange={(value: string) =>
                  handleInputChange("Type:", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serie">Series</Label>
              <Input
                id="serie"
                value={binnenunit["Serie:"]}
                onChange={(e) => handleInputChange("Serie:", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="modelvariant">Model Variant</Label>
              <Input
                id="modelvariant"
                value={binnenunit["Modelvariant:"]}
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
                type="number"
                step="0.1"
                value={binnenunit["Vermogen (kW):"]}
                onChange={(e) =>
                  handleInputChange(
                    "Vermogen (kW):",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="seer">SEER</Label>
              <Input
                id="seer"
                value={binnenunit.SEER}
                onChange={(e) => handleInputChange("SEER", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="scop">SCOP</Label>
              <Input
                id="scop"
                value={binnenunit.SCOP}
                onChange={(e) => handleInputChange("SCOP", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="prijs">Price</Label>
              <Input
                id="prijs"
                value={binnenunit.prijs}
                onChange={(e) => handleInputChange("prijs", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="kleur">Color</Label>
              <Input
                id="kleur"
                value={binnenunit["Kleur:"]}
                onChange={(e) => handleInputChange("Kleur:", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="geluidsdruk">Sound Pressure (dB)</Label>
              <Input
                id="geluidsdruk"
                value={binnenunit["geluidsdruk (dB)"]}
                onChange={(e) =>
                  handleInputChange("geluidsdruk (dB)", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energy Labels & Features</CardTitle>
            <CardDescription>
              Energy efficiency and smart features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="energielabel-koelen">Cooling Energy Label</Label>
              <Input
                id="energielabel-koelen"
                value={binnenunit["Energielabel Koelen:"]}
                onChange={(e) =>
                  handleInputChange("Energielabel Koelen:", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="energielabel-verwarmen">
                Heating Energy Label
              </Label>
              <Input
                id="energielabel-verwarmen"
                value={binnenunit["Energielabel Verwarmen"]}
                onChange={(e) =>
                  handleInputChange("Energielabel Verwarmen", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="multisplit">Multisplit Compatible</Label>
              <Input
                id="multisplit"
                value={binnenunit["Multisplit compatibel"]}
                onChange={(e) =>
                  handleInputChange("Multisplit compatibel", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="smart-functies">Smart Functions</Label>
              <Textarea
                id="smart-functies"
                value={binnenunit["Smart-Functies"]}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("Smart-Functies", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="filters">Filters</Label>
              <Textarea
                id="filters"
                value={binnenunit["Filters:"]}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("Filters:", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images & Documents</CardTitle>
            <CardDescription>Product images and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="foto-unit">Unit Photo URL</Label>
              <Input
                id="foto-unit"
                value={binnenunit["Foto unit:"]}
                onChange={(e) =>
                  handleInputChange("Foto unit:", e.target.value)
                }
                placeholder="Enter image URL or JSON array"
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={binnenunit["Logo:"]}
                onChange={(e) => handleInputChange("Logo:", e.target.value)}
                placeholder="Enter logo URL"
              />
            </div>

            <div>
              <Label htmlFor="kleur-voorbeeld">Color Example URL</Label>
              <Input
                id="kleur-voorbeeld"
                value={binnenunit["Kleur voorbeeld:"]}
                onChange={(e) =>
                  handleInputChange("Kleur voorbeeld:", e.target.value)
                }
                placeholder="Enter color example URL"
              />
            </div>

            <div>
              <Label htmlFor="datasheet">Datasheet/Brochure</Label>
              <Textarea
                id="datasheet"
                value={
                  typeof binnenunit["Datasheet/Brochure"] === "string"
                    ? binnenunit["Datasheet/Brochure"]
                    : JSON.stringify(binnenunit["Datasheet/Brochure"])
                }
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("Datasheet/Brochure", e.target.value)
                }
                placeholder="Enter datasheet URL or JSON"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/catalog/binnenunits")}
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
