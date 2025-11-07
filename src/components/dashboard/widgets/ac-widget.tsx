"use client";

import { WidgetContainer } from "./widget-container";
import type { DisciplineWidget } from "@/types/dashboard";

interface ACWidgetProps {
  widget: DisciplineWidget;
  onRecalculate: (discipline: string) => void;
  onRefresh: (widgetId: string) => void;
  isDragging?: boolean;
}

export function ACWidget({
  widget,
  onRecalculate,
  onRefresh,
  isDragging,
}: ACWidgetProps) {
  return (
    <WidgetContainer
      widget={widget}
      onRecalculate={onRecalculate}
      onRefresh={onRefresh}
      isDragging={isDragging}
    />
  );
}


