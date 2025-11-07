"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  className?: string;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  completedSteps,
  className,
}: ProgressBarProps) {
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Stap {completedSteps} van {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {progressPercentage}% voltooid
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Quiz voortgang: ${progressPercentage}% voltooid`}
        />
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Huidige stap: {currentStep}
      </div>
    </div>
  );
}



