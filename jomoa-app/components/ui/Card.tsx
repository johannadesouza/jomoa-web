"use client";

import { CardHeader } from "./CardHeader";
import { CardTitle } from "./CardTitle";
import { CardDescription } from "./CardDescription";
import { CardContent } from "./CardContent";
import { CardFooter } from "./CardFooter";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "hero" | "large";
}

export function Card({ 
  children, 
  className = "", 
  onClick,
  variant = "default"
}: CardProps) {
  const radiusClasses = {
    default: "rounded-[20px]",
    hero: "rounded-[24px]",
    large: "rounded-[28px]",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#FEFCF8] ${radiusClasses[variant]} border border-[rgba(232,229,224,0.4)] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] ${
        onClick ? "cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface ChipProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "outline";
  className?: string;
}

export function Chip({ children, variant = "default", className = "" }: ChipProps) {
  const variants = {
    default: "bg-[rgba(232,229,224,0.3)] text-[#5A6B5D]",
    success: "bg-green-100/50 text-green-800",
    warning: "bg-yellow-100/50 text-yellow-800",
    info: "bg-blue-100/50 text-blue-800",
    outline: "border border-[rgba(232,229,224,0.4)] bg-transparent text-[#5A6B5D]",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

