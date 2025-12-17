"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
        "flex h-10 w-full rounded-[20px] border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] px-3 py-2 text-sm text-[#5A6B5D]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50 focus-visible:border-[#8B6F47]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };


