"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#8B6F47] text-[#FEFCF8] hover:bg-[#7A5F3D] shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
      outline: "border border-[rgba(232,229,224,0.4)] bg-[#FEFCF8] text-[#5A6B5D] hover:bg-[#FEFCF8]/80",
      ghost: "text-[#5A6B5D] hover:bg-[#FEFCF8]/50",
      link: "text-[#8B6F47] hover:text-[#7A5F3D] underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        className={cn(
      "inline-flex items-center justify-center rounded-[20px] font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };


