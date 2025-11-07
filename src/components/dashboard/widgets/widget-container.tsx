"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Clock,
  GripVertical,
} from "lucide-react";
import type { DisciplineWidget } from "@/types/dashboard";

interface WidgetContainerProps {
  widget: DisciplineWidget;
  onRecalculate: (discipline: string) => void;
  onRefresh: (widgetId: string) => void;
  isDragging?: boolean;
}

export function WidgetContainer({
  widget,
  onRecalculate,
  onRefresh,
  isDragging = false,
}: WidgetContainerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh(widget.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRecalculate = () => {
    if (widget.discipline) {
      onRecalculate(widget.discipline);
    }
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Zojuist";
    if (diffInMinutes < 60) return `${diffInMinutes} min geleden`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} uur geleden`;
    return date.toLocaleDateString("nl-NL");
  };

  const getDisciplineIcon = (discipline: string) => {
    const icons: Record<string, string> = {
      wp: "🔥",
      pv: "☀️",
      battery: "🔋",
      isolatie: "🏠",
      ac: "❄️",
      afgifte: "🌡️",
      algemene_scan: "📊",
    };
    return icons[discipline] || "📦";
  };

  if (!widget.isVisible) {
    return null;
  }

  return (
    <Card
      className={`relative ${isDragging ? "opacity-50" : ""} ${
        widget.type === "general" ? "col-span-2" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {getDisciplineIcon(widget.discipline || widget.id)}
            </span>
            <CardTitle className="text-lg">{widget.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isDragging && <GripVertical className="h-4 w-4 text-gray-400" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{widget.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Laatst berekend: {formatLastUpdated(widget.lastCalculated)}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {widget.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : widget.error ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{widget.error}</span>
          </div>
        ) : widget.recommendations.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Geen aanbevelingen beschikbaar
            </p>
            <Button variant="outline" size="sm" onClick={handleRecalculate}>
              Herbereken
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {widget.recommendations.slice(0, 3).map((recommendation) => (
              <div
                key={recommendation.id}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {recommendation.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {recommendation.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    €{recommendation.price.toLocaleString()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {Object.entries(recommendation.specs)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 px-2"
                  >
                    <a
                      href={recommendation.catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {recommendation.reason}
                </p>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculate}
                className="flex-1"
              >
                Herbereken
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a
                  href={`/catalog/${widget.discipline || "algemeen"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bekijk alle
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


