"use client";

import { WidgetContainer } from "./widget-container";
import type { DisciplineWidget } from "@/types/dashboard";

interface AfgifteWidgetProps {
  widget: DisciplineWidget;
  onRecalculate: (discipline: string) => void;
  onRefresh: (widgetId: string) => void;
  isDragging?: boolean;
}

export function AfgifteWidget({
  widget,
  onRecalculate,
  onRefresh,
  isDragging,
}: AfgifteWidgetProps) {
  return (
    <WidgetContainer
      widget={widget}
      onRecalculate={onRecalculate}
      onRefresh={onRefresh}
      isDragging={isDragging}
    />
  );
}

