"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import type { GeneralAdvice } from "@/types/dashboard";

interface AlgemeneScanWidgetProps {
  advice: GeneralAdvice;
  onRecalculate: () => void;
}

export function AlgemeneScanWidget({
  advice,
  onRecalculate,
}: AlgemeneScanWidgetProps) {
  // Safety check for missing advice data
  if (!advice) {
    return (
      <Card className="col-span-2">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Algemene scan wordt geladen...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <CardTitle className="text-xl">Algemene Scan</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Gecombineerd advies voor uw duurzame energietransitie
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm leading-relaxed">
            {advice.summary || "Algemene scan wordt berekend..."}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Jaarlijkse besparing</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(advice.totalSavings || 0)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Terugverdientijd</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {advice.paybackPeriod || 0} jaar
            </p>
          </div>
        </div>

        {/* Priority Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <h4 className="font-medium">Prioriteitsacties</h4>
          </div>
          <div className="space-y-2">
            {(advice.priorityActions || []).map((action, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Combined Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium">Aanbevolen oplossingen</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(advice.combinedRecommendations || []).map((rec, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-sm">{rec.title}</h5>
                    <p className="text-xs text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getImpactColor(rec.impact)}`}
                  >
                    {rec.impact === "high"
                      ? "Hoog"
                      : rec.impact === "medium"
                      ? "Gemiddeld"
                      : "Laag"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onRecalculate}
            className="flex-1"
          >
            Volledige scan opnieuw uitvoeren
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href="/intake" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Intake aanpassen
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
