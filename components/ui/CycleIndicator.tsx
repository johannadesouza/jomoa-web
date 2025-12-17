"use client";

import { getCycleColorClasses, CyclePhase } from "@/lib/utils/cycleColors";
import { cn } from "@/lib/utils";

interface CycleIndicatorProps {
  phase: CyclePhase;
  showLabel?: boolean;
  showDot?: boolean;
  showBorder?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CycleIndicator({
  phase,
  showLabel = true,
  showDot = true,
  showBorder = false,
  className = "",
  size = "md",
}: CycleIndicatorProps) {
  const colors = getCycleColorClasses(phase);

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showDot && (
        <div
          className={cn(
            "rounded-full",
            colors.dot,
            dotSizes[size]
          )}
        />
      )}
      {showLabel && (
        <span className={cn(
          "text-xs font-medium",
          phase ? "text-[#5A6B5D]" : "text-[#5A6B5D]/60"
        )}>
          {colors.label}
        </span>
      )}
      {showBorder && phase && (
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-card", colors.border)} />
      )}
    </div>
  );
}

