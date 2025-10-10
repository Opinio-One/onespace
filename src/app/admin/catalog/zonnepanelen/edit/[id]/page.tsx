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

const BRANDS = [
  "AIKO Solar",
  "DMEGC",
  "JA Solar",
  "Jinko Solar",
  "REC Solar",
  "TW Solar",
];
const CELL_TYPES = ["Half-cell"];

export default function EditZonnepaneelPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zonnepaneel, setZonnepaneel] = useState<Zonnepaneel | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchZonnepaneel();
    }
  }, [params.id]);

  const fetchZonnepaneel = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("Zonnepanelen")
        .select("*")
        .eq("Id", params.id)
        .single();

      if (error) {
        console.error("Error fetching zonnepaneel:", error);
      } else {
        setZonnepaneel(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!zonnepaneel) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("Zonnepanelen")
        .update(zonnepaneel)
        .eq("Id", params.id);

      if (error) {
        console.error("Error updating zonnepaneel:", error);
        alert("Error updating zonnepaneel: " + error.message);
      } else {
        router.push("/admin/catalog/zonnepanelen");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating zonnepaneel");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof Zonnepaneel,
    value: string | number
  ) => {
    if (zonnepaneel) {
      setZonnepaneel({ ...zonnepaneel, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading zonnepaneel...</div>
        </div>
      </div>
    );
  }

  if (!zonnepaneel) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Zonnepaneel not found</div>
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
            onClick={() => router.push("/admin/catalog/zonnepanelen")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Zonnepanelen
          </Button>
          <h1 className="text-3xl font-bold">Edit Zonnepaneel</h1>
        </div>
        <p className="text-gray-600">Edit solar panel system data</p>
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
                value={zonnepaneel.Product}
                onChange={(e) => handleInputChange("Product", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="merk">Brand</Label>
              <Select
                value={zonnepaneel.Merk}
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
              <Label htmlFor="product-code">Product Code</Label>
              <Input
                id="product-code"
                value={zonnepaneel["Product code"]}
                onChange={(e) =>
                  handleInputChange("Product code", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="vermogen">Power (Wp)</Label>
              <Input
                id="vermogen"
                type="number"
                value={zonnepaneel["Vermogen (Wp)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Vermogen (Wp)",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="cell-type">Cell Type</Label>
              <Select
                value={zonnepaneel["Cell type"]}
                onValueChange={(value) => handleInputChange("Cell type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cell type" />
                </SelectTrigger>
                <SelectContent>
                  {CELL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
            <CardDescription>Physical dimensions and weight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lengte">Length (mm)</Label>
              <Input
                id="lengte"
                type="number"
                value={zonnepaneel["Lengte (mm)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Lengte (mm)",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="breedte">Width (mm)</Label>
              <Input
                id="breedte"
                type="number"
                value={zonnepaneel["Breedte (mm)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Breedte (mm)",
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
                value={zonnepaneel["Hoogte (mm)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Hoogte (mm)",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="gewicht">Weight (kg)</Label>
              <Input
                id="gewicht"
                value={zonnepaneel["Gewicht (kg)"]}
                onChange={(e) =>
                  handleInputChange("Gewicht (kg)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="garantie">Warranty (years)</Label>
              <Input
                id="garantie"
                type="number"
                value={zonnepaneel["Productgarantie (jaren)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Productgarantie (jaren)",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cell Technology</CardTitle>
            <CardDescription>
              Cell technology and material specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="celtechnologie">Cell Technology Type</Label>
              <Input
                id="celtechnologie"
                value={zonnepaneel["Celtechnologie type"]}
                onChange={(e) =>
                  handleInputChange("Celtechnologie type", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="bi-facial">Bi-Facial</Label>
              <Input
                id="bi-facial"
                value={zonnepaneel["Bi-Facial"]}
                onChange={(e) => handleInputChange("Bi-Facial", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="glas-type">Glass Type</Label>
              <Input
                id="glas-type"
                value={zonnepaneel["Glas type"]}
                onChange={(e) => handleInputChange("Glas type", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="glas-glas">Glass-Glass</Label>
              <Input
                id="glas-glas"
                value={zonnepaneel["Glas-glas"]}
                onChange={(e) => handleInputChange("Glas-glas", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="celmateriaal">Cell Material</Label>
              <Input
                id="celmateriaal"
                value={zonnepaneel.Celmateriaal}
                onChange={(e) =>
                  handleInputChange("Celmateriaal", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance & Pricing</CardTitle>
            <CardDescription>
              Performance data and pricing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nmot">NMOT</Label>
              <Input
                id="nmot"
                value={zonnepaneel.NMOT}
                onChange={(e) => handleInputChange("NMOT", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="nmot-factor">NMOT Factor 1.15</Label>
              <Input
                id="nmot-factor"
                value={zonnepaneel["NMOT factor 1.15"]}
                onChange={(e) =>
                  handleInputChange("NMOT factor 1.15", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="verkoopprijs">Sale Price</Label>
              <Input
                id="verkoopprijs"
                value={zonnepaneel["Verkoopprijs paneel"]}
                onChange={(e) =>
                  handleInputChange("Verkoopprijs paneel", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="prijs-online">Online Average Price</Label>
              <Input
                id="prijs-online"
                value={zonnepaneel["Prijs online gemiddeld"]}
                onChange={(e) =>
                  handleInputChange("Prijs online gemiddeld", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="jaaropbrengst">Annual Yield (kWh)</Label>
              <Input
                id="jaaropbrengst"
                value={zonnepaneel["Jaaropbrengst (kWh)"]}
                onChange={(e) =>
                  handleInputChange("Jaaropbrengst (kWh)", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Long-term Performance</CardTitle>
            <CardDescription>
              Long-term performance and yield data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="opbrengst-10">Total Yield 10 years</Label>
              <Input
                id="opbrengst-10"
                value={zonnepaneel["Totale opbrengst na 10 jaar"]}
                onChange={(e) =>
                  handleInputChange(
                    "Totale opbrengst na 10 jaar",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="opbrengst-20">Total Yield 20 years</Label>
              <Input
                id="opbrengst-20"
                value={zonnepaneel["Totale opbrengst na 20 jaar"]}
                onChange={(e) =>
                  handleInputChange(
                    "Totale opbrengst na 20 jaar",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="opbrengst-30">Total Yield 30 years</Label>
              <Input
                id="opbrengst-30"
                value={zonnepaneel["Totale opbrengst na 30 jaar"]}
                onChange={(e) =>
                  handleInputChange(
                    "Totale opbrengst na 30 jaar",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="opbrengst-garantie">
                Yield in Warranty Period
              </Label>
              <Input
                id="opbrengst-garantie"
                value={zonnepaneel["Opbrengst (in garantietermijn)"]}
                onChange={(e) =>
                  handleInputChange(
                    "Opbrengst (in garantietermijn)",
                    e.target.value
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scores & Documentation</CardTitle>
            <CardDescription>
              Performance scores and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="os-score">Output Score (OS)</Label>
              <Input
                id="os-score"
                value={zonnepaneel["OS (opbrengstscore)"]}
                onChange={(e) =>
                  handleInputChange("OS (opbrengstscore)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="ds-score">Durability Score (DS)</Label>
              <Input
                id="ds-score"
                value={zonnepaneel["DS (duurzaamheidscore)"]}
                onChange={(e) =>
                  handleInputChange("DS (duurzaamheidscore)", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="lcoe-10">LCOE Score 10 years</Label>
              <Input
                id="lcoe-10"
                value={zonnepaneel["LCOE score 10 jaar"]}
                onChange={(e) =>
                  handleInputChange("LCOE score 10 jaar", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="lcoe-20">LCOE Score 20 years</Label>
              <Input
                id="lcoe-20"
                value={zonnepaneel["LCOE score 20 jaar"]}
                onChange={(e) =>
                  handleInputChange("LCOE score 20 jaar", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="lcoe-30">LCOE Score 30 years</Label>
              <Input
                id="lcoe-30"
                value={zonnepaneel["LCOE score 30 jaar"]}
                onChange={(e) =>
                  handleInputChange("LCOE score 30 jaar", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="afbeelding">Image URL</Label>
              <Input
                id="afbeelding"
                value={zonnepaneel.Afbeelding}
                onChange={(e) =>
                  handleInputChange("Afbeelding", e.target.value)
                }
                placeholder="Enter image URL or JSON array"
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={zonnepaneel.Logo}
                onChange={(e) => handleInputChange("Logo", e.target.value)}
                placeholder="Enter logo URL"
              />
            </div>

            <div>
              <Label htmlFor="datasheet">Datasheet</Label>
              <Textarea
                id="datasheet"
                value={zonnepaneel.Datasheet}
                onChange={(e) => handleInputChange("Datasheet", e.target.value)}
                placeholder="Enter datasheet URL"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/catalog/zonnepanelen")}
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
