"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { QuizStep, IntakeResponses } from "@/types/intake";

interface QuestionStepProps {
  question: QuizStep;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  canGoBack: boolean;
  canSkip: boolean;
  error?: string;
  className?: string;
}

export function QuestionStep({
  question,
  value,
  onChange,
  onNext,
  onBack,
  onSkip,
  canGoBack,
  canSkip,
  error,
  className,
}: QuestionStepProps) {
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const validateInput = (inputValue: any): string => {
    if (
      question.validation?.required &&
      (!inputValue || (Array.isArray(inputValue) && inputValue.length === 0))
    ) {
      return "Dit veld is verplicht";
    }

    if (
      question.validation?.min &&
      typeof inputValue === "number" &&
      inputValue < question.validation.min
    ) {
      return `Minimum waarde is ${question.validation.min}`;
    }

    if (
      question.validation?.max &&
      typeof inputValue === "number" &&
      inputValue > question.validation.max
    ) {
      return `Maximum waarde is ${question.validation.max}`;
    }

    if (
      question.validation?.pattern &&
      typeof inputValue === "string" &&
      !new RegExp(question.validation.pattern).test(inputValue)
    ) {
      return "Ongeldig formaat";
    }

    return "";
  };

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    const error = validateInput(newValue);
    setValidationError(error);
    onChange(newValue);
  };

  const handleNext = () => {
    const error = validateInput(localValue);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    onNext();
  };

  const renderInput = () => {
    switch (question.inputType) {
      case "radio":
        return (
          <RadioGroup
            value={localValue}
            onValueChange={handleChange}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${question.id}-${option.value}`}
                  className="peer"
                />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="flex-1 cursor-pointer peer-data-[state=checked]:font-medium"
                >
                  {option.label}
                  {option.description && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {option.description}
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <Checkbox
                  id={`${question.id}-${option.value}`}
                  checked={
                    Array.isArray(localValue)
                      ? localValue.includes(option.value)
                      : false
                  }
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(localValue)
                      ? localValue
                      : [];
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v) => v !== option.value);
                    handleChange(newValues);
                  }}
                  className="mt-1"
                />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="flex-1 cursor-pointer"
                >
                  {option.label}
                  {option.description && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {option.description}
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        );

      case "range":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {question.validation?.min || 0}
              </span>
              <span className="text-lg font-medium">
                {localValue || question.validation?.min || 0}
              </span>
              <span className="text-sm text-gray-600">
                {question.validation?.max || 100}
              </span>
            </div>
            <Slider
              value={[localValue || question.validation?.min || 0]}
              onValueChange={([value]) => handleChange(value)}
              min={question.validation?.min || 0}
              max={question.validation?.max || 100}
              step={1}
              className="w-full"
            />
          </div>
        );

      case "select":
        return (
          <select
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-describedby={error ? `${question.id}-error` : undefined}
          >
            <option value="">Selecteer een optie</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "text":
        return (
          <Textarea
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Typ uw antwoord hier..."
            className="min-h-[100px]"
            aria-describedby={error ? `${question.id}-error` : undefined}
          />
        );

      default:
        return null;
    }
  };

  const displayError = error || validationError;

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-gray-600 mb-4">{question.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {renderInput()}

        {displayError && (
          <div
            id={`${question.id}-error`}
            className="text-red-600 text-sm"
            role="alert"
            aria-live="polite"
          >
            {displayError}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex space-x-2">
          {canGoBack && (
            <Button variant="outline" onClick={onBack} type="button">
              ← Terug
            </Button>
          )}
          {canSkip && onSkip && (
            <Button variant="ghost" onClick={onSkip} type="button">
              Overslaan
            </Button>
          )}
        </div>

        <Button onClick={handleNext} disabled={!!displayError} type="button">
          Volgende →
        </Button>
      </div>
    </div>
  );
}

