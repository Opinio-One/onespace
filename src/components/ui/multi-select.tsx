"use client";

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleRemove = (option: string) => {
    onChange(value.filter((item) => item !== option));
  };

  const displayValue =
    value.length > 0 ? `${value.length} selected` : placeholder;

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between text-left font-normal",
          !value.length && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayValue}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option}
                className="relative flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
                onClick={() => handleToggle(option)}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={cn(
                      "flex items-center justify-center w-4 h-4 border rounded",
                      value.includes(option)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    )}
                  >
                    {value.includes(option) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.map((option) => (
            <div
              key={option}
              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {option}
              <button
                type="button"
                onClick={() => handleRemove(option)}
                className="ml-1 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

