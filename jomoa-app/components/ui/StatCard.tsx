"use client";

import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  description, 
  trend, 
  onClick,
  className = "" 
}: StatCardProps) {
  return (
    <Card onClick={onClick} className={className}>
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#5A6B5D]/70 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-the-seasons font-bold text-[#5A6B5D]">
          {value}
        </p>
        {description && (
          <p className="text-xs text-[#5A6B5D]/60">
            {description}
          </p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend.isPositive ? "text-green-600" : "text-red-600"
          }`}>
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
}


