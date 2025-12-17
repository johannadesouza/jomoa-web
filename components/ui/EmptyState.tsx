"use client";

import { Card } from "./Card";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className = "" 
}: EmptyStateProps) {
  return (
    <Card className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4 text-[#5A6B5D]/70">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-the-seasons font-semibold text-[#5A6B5D] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#5A6B5D]/70 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-[#8B6F47] hover:text-[#7A5F3D] underline"
        >
          {action.label}
        </button>
      )}
    </Card>
  );
}


