"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = "" }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all",
                    isCompleted
                      ? "bg-[#8B6F47] text-[#FEFCF8]"
                      : isCurrent
                      ? "bg-[#8B6F47] text-[#FEFCF8] ring-4 ring-[#8B6F47]/20"
                      : "bg-[#E8E5E0] text-[#5A6B5D]/60"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isCurrent
                        ? "text-[#5A6B5D]"
                        : isCompleted
                        ? "text-[#5A6B5D]/70"
                        : "text-[#5A6B5D]/50"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-[#5A6B5D]/60 mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-all",
                    isCompleted ? "bg-[#8B6F47]" : "bg-[#E8E5E0]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

