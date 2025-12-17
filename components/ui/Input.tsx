"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
        "flex h-10 w-full rounded-[20px] border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] px-3 py-2 text-sm text-[#5A6B5D]",
        "placeholder:text-[#5A6B5D]/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50 focus-visible:border-[#8B6F47]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };


