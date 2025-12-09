"use client";

import { WidgetContainer } from "./widget-container";
import type { DisciplineWidget } from "@/types/dashboard";

interface WPWidgetProps {
  widget: DisciplineWidget;
  onRecalculate: (discipline: string) => void;
  onRefresh: (widgetId: string) => void;
  isDragging?: boolean;
}

export function WPWidget({
  widget,
  onRecalculate,
  onRefresh,
  isDragging,
}: WPWidgetProps) {
  return (
    <WidgetContainer
      widget={widget}
      onRecalculate={onRecalculate}
      onRefresh={onRefresh}
      isDragging={isDragging}
    />
  );
}

