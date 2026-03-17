"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = "Unable to load content. Please try again.",
  onRetry,
  className = ""
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={32} />
      </div>
      <h3 className="mb-2 text-xl font-bold text-ink">Something went wrong</h3>
      <p className="mb-8 max-w-sm text-ink/60">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="gap-2">
          <RotateCcw size={16} />
          Try again
        </Button>
      )}
    </div>
  );
}
