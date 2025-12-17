"use client";

import { Card, CardContent } from "./Card";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Ett fel uppstod", 
  message, 
  onRetry,
  className = "" 
}: ErrorStateProps) {
  return (
    <Card className={`bg-red-50/50 border-red-200 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-1">{title}</p>
            <p className="text-sm text-red-600">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 text-sm text-red-700 hover:text-red-900 underline"
              >
                Försök igen
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

