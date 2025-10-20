"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  label?: string;
  disabled?: boolean;
  formatValue?: (value: number) => string;
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value = [min, max],
  onChange,
  label,
  disabled = false,
  formatValue = (v) => v.toString(),
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: [number, number]) => {
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(
      parseFloat(e.target.value) || min,
      localValue[1] - step
    );
    handleChange([Math.max(min, newMin), localValue[1]]);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(
      parseFloat(e.target.value) || max,
      localValue[0] + step
    );
    handleChange([localValue[0], Math.min(max, newMax)]);
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const rawValue = min + percent * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    // Determine which thumb is closer
    const distToMin = Math.abs(clampedValue - localValue[0]);
    const distToMax = Math.abs(clampedValue - localValue[1]);

    if (distToMin < distToMax) {
      handleChange([
        Math.min(clampedValue, localValue[1] - step),
        localValue[1],
      ]);
    } else {
      handleChange([
        localValue[0],
        Math.max(clampedValue, localValue[0] + step),
      ]);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    const rawValue = min + percent * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    if (isDragging === "min") {
      handleChange([
        Math.min(clampedValue, localValue[1] - step),
        localValue[1],
      ]);
    } else {
      handleChange([
        localValue[0],
        Math.max(clampedValue, localValue[0] + step),
      ]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, localValue]);

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}

      <div
        ref={sliderRef}
        className={cn(
          "relative h-2 bg-gray-200 rounded-full mb-4 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleSliderClick}
      >
        {/* Active range */}
        <div
          className="absolute h-full bg-blue-500 rounded-full pointer-events-none"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-lg cursor-grab active:cursor-grabbing z-10",
            disabled && "cursor-not-allowed",
            isDragging === "min" && "ring-2 ring-blue-400 ring-offset-1"
          )}
          style={{ left: `calc(${minPercent}% - 10px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (!disabled) setIsDragging("min");
          }}
        />

        {/* Max thumb */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-lg cursor-grab active:cursor-grabbing z-10",
            disabled && "cursor-not-allowed",
            isDragging === "max" && "ring-2 ring-blue-400 ring-offset-1"
          )}
          style={{ left: `calc(${maxPercent}% - 10px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (!disabled) setIsDragging("max");
          }}
        />
      </div>

      {/* Value inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Min</label>
          <input
            type="number"
            value={localValue[0]}
            onChange={handleMinInputChange}
            min={min}
            max={localValue[1]}
            step={step}
            disabled={disabled}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
        <div className="pt-6 text-gray-400">—</div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Max</label>
          <input
            type="number"
            value={localValue[1]}
            onChange={handleMaxInputChange}
            min={localValue[0]}
            max={max}
            step={step}
            disabled={disabled}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Formatted value display */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{formatValue(localValue[0])}</span>
        <span>{formatValue(localValue[1])}</span>
      </div>
    </div>
  );
}
