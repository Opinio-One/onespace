"use client";

import { WidgetContainer } from "./widget-container";
import type { DisciplineWidget } from "@/types/dashboard";

interface PVWidgetProps {
  widget: DisciplineWidget;
  onRecalculate: (discipline: string) => void;
  onRefresh: (widgetId: string) => void;
  isDragging?: boolean;
}

export function PVWidget({
  widget,
  onRecalculate,
  onRefresh,
  isDragging,
}: PVWidgetProps) {
  return (
    <WidgetContainer
      widget={widget}
      onRecalculate={onRecalculate}
      onRefresh={onRefresh}
      isDragging={isDragging}
    />
  );
}


