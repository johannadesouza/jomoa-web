"use client";

import { Skeleton } from "./Skeleton";
import { SectionHeader } from "./SectionHeader";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  height?: string;
  showHeader?: boolean;
}

export function LoadingState({ 
  title, 
  subtitle, 
  height = "h-64",
  showHeader = false 
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-[#5A6B5D] pb-20 md:pb-0">
      <div className="max-w-[480px] mx-auto px-5 py-8 space-y-6">
        {showHeader && title && (
          <SectionHeader title={title} subtitle={subtitle} />
        )}
        <Skeleton className={height} />
      </div>
    </div>
  );
}

