"use client";

import { WidgetContainer } from "./widget-container";
import type { DisciplineWidget } from "@/types/dashboard";

interface BatteryWidgetProps {
  widget: DisciplineWidget;
  onRecalculate: (discipline: string) => void;
  onRefresh: (widgetId: string) => void;
  isDragging?: boolean;
}

export function BatteryWidget({
  widget,
  onRecalculate,
  onRefresh,
  isDragging,
}: BatteryWidgetProps) {
  return (
    <WidgetContainer
      widget={widget}
      onRecalculate={onRecalculate}
      onRefresh={onRefresh}
      isDragging={isDragging}
    />
  );
}

