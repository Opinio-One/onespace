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
                onValueChange={(value) => handleInputChange("Merk:", value)}
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
                onValueChange={(value) =>
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
              <Input
                id="serie"
                value={buitenunit["Serie:"]}
                onChange={(e) => handleInputChange("Serie:", e.target.value)}
              />
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
              <Input
                id="aantal-poorten"
                value={buitenunit["Aantal poorten Min-Max:"]}
                onChange={(e) =>
                  handleInputChange("Aantal poorten Min-Max:", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="electrische-aansluiting">
                Electrical Connection
              </Label>
              <Input
                id="electrische-aansluiting"
                value={buitenunit["Electrische aansluiting:"]}
                onChange={(e) =>
                  handleInputChange("Electrische aansluiting:", e.target.value)
                }
              />
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
              <Input
                id="energielabel"
                value={buitenunit["Energielabel koelen:"]}
                onChange={(e) =>
                  handleInputChange("Energielabel koelen:", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="foto-buitenunit">Outdoor Unit Photo URL</Label>
              <Input
                id="foto-buitenunit"
                value={buitenunit["Foto buitenunit:"]}
                onChange={(e) =>
                  handleInputChange("Foto buitenunit:", e.target.value)
                }
                placeholder="Enter image URL or JSON array"
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={buitenunit["Logo:"]}
                onChange={(e) => handleInputChange("Logo:", e.target.value)}
                placeholder="Enter logo URL"
              />
            </div>

            <div>
              <Label htmlFor="datasheet">Datasheet</Label>
              <Textarea
                id="datasheet"
                value={
                  typeof buitenunit["Datasheet:"] === "string"
                    ? buitenunit["Datasheet:"]
                    : JSON.stringify(buitenunit["Datasheet:"])
                }
                onChange={(e) =>
                  handleInputChange("Datasheet:", e.target.value)
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
