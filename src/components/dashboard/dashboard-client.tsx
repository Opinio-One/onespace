"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Settings } from "lucide-react";
import type {
  DashboardData,
  DisciplineWidget,
  GeneralAdvice,
} from "@/types/dashboard";
// Lazy load widgets for better performance
const AlgemeneScanWidget = lazy(() =>
  import("./widgets/algemene-scan-widget").then((m) => ({
    default: m.AlgemeneScanWidget,
  }))
);
const WPWidget = lazy(() =>
  import("./widgets/wp-widget").then((m) => ({ default: m.WPWidget }))
);
const PVWidget = lazy(() =>
  import("./widgets/pv-widget").then((m) => ({ default: m.PVWidget }))
);
const BatteryWidget = lazy(() =>
  import("./widgets/battery-widget").then((m) => ({ default: m.BatteryWidget }))
);
const IsolatieWidget = lazy(() =>
  import("./widgets/isolatie-widget").then((m) => ({
    default: m.IsolatieWidget,
  }))
);
const ACWidget = lazy(() =>
  import("./widgets/ac-widget").then((m) => ({ default: m.ACWidget }))
);
const AfgifteWidget = lazy(() =>
  import("./widgets/afgifte-widget").then((m) => ({ default: m.AfgifteWidget }))
);

interface DashboardClientProps {
  initialData: DashboardData;
}

interface SortableWidgetProps {
  widget: DisciplineWidget;
  onRecalculate: (discipline: string) => void;
  onRefresh: (widgetId: string) => void;
  initialData: DashboardData;
}

function SortableWidget({
  widget,
  onRecalculate,
  onRefresh,
  initialData,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  // Ensure consistent style object to avoid hydration mismatches
  const transformString = CSS.Transform.toString(transform);
  const style: React.CSSProperties = transformString
    ? {
        transform: transformString,
        transition: transition || undefined,
      }
    : {};

  const renderWidget = (data: DashboardData) => {
    const widgetProps = {
      widget,
      onRecalculate,
      onRefresh,
      isDragging,
    };

    const widgetContent = (() => {
      switch (widget.id) {
        case "algemene_scan":
          return (
            <Suspense fallback={<WidgetSkeleton />}>
              <AlgemeneScanWidget
                advice={data.generalAdvice}
                onRecalculate={() => onRecalculate("algemene_scan")}
              />
            </Suspense>
          );
        case "wp":
          return (
            <Suspense fallback={<WidgetSkeleton />}>
              <WPWidget {...widgetProps} />
            </Suspense>
          );
        case "pv":
          return (
            <Suspense fallback={<WidgetSkeleton />}>
              <PVWidget {...widgetProps} />
            </Suspense>
          );
        case "battery":
          return (
            <Suspense fallback={<WidgetSkeleton />}>
              <BatteryWidget {...widgetProps} />
            </Suspense>
          );
        case "isolatie":
          return (
            <Suspense fallback={<WidgetSkeleton />}>
              <IsolatieWidget {...widgetProps} />
            </Suspense>
          );
        case "ac":
          return (
            <Suspense fallback={<WidgetSkeleton />}>
              <ACWidget {...widgetProps} />
            </Suspense>
          );
        case "afgifte":
          return (
            <Suspense fallback={<WidgetSkeleton />}>
              <AfgifteWidget {...widgetProps} />
            </Suspense>
          );
        default:
          return null;
      }
    })();

    // Wrap each widget in an ErrorBoundary to prevent one widget from breaking the entire dashboard
    return (
      <ErrorBoundary
        showHome={false}
        showRetry={true}
        onError={(error, errorInfo) => {
          console.error(`Error in widget ${widget.id}:`, error, errorInfo);
        }}
      >
        {widgetContent}
      </ErrorBoundary>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      {renderWidget(initialData)}
    </div>
  );
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debounced save function
  const saveLayout = useCallback(
    debounce(async (widgetOrder: string[], visibleWidgets: string[]) => {
      try {
        const response = await fetch("/api/dashboard/layout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            widgetOrder,
            visibleWidgets,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save layout");
        }
      } catch (error) {
        console.error("Error saving layout:", error);
      }
    }, 500),
    []
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = data.widgets.findIndex(
      (widget) => widget.id === active.id
    );
    const newIndex = data.widgets.findIndex((widget) => widget.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newWidgets = arrayMove(data.widgets, oldIndex, newIndex);
    const newOrder = newWidgets.map((widget) => widget.id);

    setData((prev) => ({
      ...prev,
      widgets: newWidgets,
      layout: {
        ...prev.layout,
        widgetOrder: newOrder,
      },
    }));

    // Save layout to server
    saveLayout(newOrder, data.layout.visibleWidgets);
  };

  const handleRecalculate = (discipline: string) => {
    if (discipline === "algemene_scan") {
      // Redirect to full intake quiz
      window.location.href = "/intake";
    } else {
      // Redirect to discipline-specific intake
      window.location.href = `/intake?discipline=${discipline}`;
    }
  };

  const handleRefresh = async (widgetId: string) => {
    if (!data.widgets.find((w) => w.id === widgetId)?.discipline) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/recommendations/${
          data.widgets.find((w) => w.id === widgetId)?.discipline
        }?refresh=true`
      );

      if (!response.ok) {
        throw new Error("Failed to refresh recommendations");
      }

      const result = await response.json();

      setData((prev) => ({
        ...prev,
        widgets: prev.widgets.map((widget) =>
          widget.id === widgetId
            ? {
                ...widget,
                recommendations: result.recommendations,
                lastCalculated: result.lastCalculated,
                error: undefined,
              }
            : widget
        ),
      }));
    } catch (error) {
      console.error("Error refreshing widget:", error);
      setError("Failed to refresh recommendations");

      setData((prev) => ({
        ...prev,
        widgets: prev.widgets.map((widget) =>
          widget.id === widgetId
            ? {
                ...widget,
                error: "Failed to refresh recommendations",
              }
            : widget
        ),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddWidget = (widgetId: string) => {
    const newVisibleWidgets = [...data.layout.visibleWidgets, widgetId];

    setData((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        visibleWidgets: newVisibleWidgets,
      },
    }));

    saveLayout(data.layout.widgetOrder, newVisibleWidgets);
  };

  const handleRemoveWidget = (widgetId: string) => {
    const newVisibleWidgets = data.layout.visibleWidgets.filter(
      (id) => id !== widgetId
    );

    setData((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        visibleWidgets: newVisibleWidgets,
      },
    }));

    saveLayout(data.layout.widgetOrder, newVisibleWidgets);
  };

  if (!data.hasIntakeProfile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Welkom bij OneSpace</h2>
              <p className="text-muted-foreground max-w-md">
                Om uw persoonlijke dashboard te zien, moet u eerst de intake
                quiz voltooien. Dit duurt minder dan een minuut en helpt ons de
                beste aanbevelingen voor u te maken.
              </p>
              <Button asChild size="lg">
                <a href="/intake">Start intake quiz</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Uw persoonlijke aanbevelingen voor duurzame energie
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={data.widgets.map((widget) => widget.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.widgets
              .filter((widget) => widget.isVisible)
              .map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  onRecalculate={handleRecalculate}
                  onRefresh={handleRefresh}
                  initialData={initialData}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>

      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Bezig met bijwerken...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Widget skeleton component
function WidgetSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
