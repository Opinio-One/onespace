"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  label?: string;
  disabled?: boolean;
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value = [min, max],
  onChange,
  label,
  disabled = false,
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(parseFloat(e.target.value), localValue[1]);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(parseFloat(e.target.value), localValue[0]);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}

      <div className="relative h-2 bg-gray-200 rounded-full mb-4">
        {/* Active range */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          disabled={disabled}
          className={cn(
            "absolute w-full h-2 opacity-0 cursor-pointer",
            disabled && "cursor-not-allowed"
          )}
          style={{ pointerEvents: "auto" }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          disabled={disabled}
          className={cn(
            "absolute w-full h-2 opacity-0 cursor-pointer",
            disabled && "cursor-not-allowed"
          )}
          style={{ pointerEvents: "auto" }}
        />

        {/* Visual thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md pointer-events-none"
          style={{ left: `calc(${minPercent}% - 8px)` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md pointer-events-none"
          style={{ left: `calc(${maxPercent}% - 8px)` }}
        />
      </div>

      {/* Value display */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>{localValue[0].toFixed(step < 1 ? 1 : 0)}</span>
        <span>{localValue[1].toFixed(step < 1 ? 1 : 0)}</span>
      </div>
    </div>
  );
}
