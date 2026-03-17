"use client";

import { LucideIcon, Plus } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  title,
  message,
  icon: Icon,
  actionLabel,
  onAction,
  actionHref,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      {Icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ink/5 text-ink/40">
          <Icon size={40} />
        </div>
      )}
      <h3 className="mb-2 text-2xl font-bold text-ink">{title}</h3>
      <p className="mb-8 max-w-sm text-ink/60">{message}</p>
      {(onAction || actionHref) && (
        <Button
          onClick={onAction}
          href={actionHref}
          className="gap-2"
        >
          {actionLabel || "Get started"}
        </Button>
      )}
    </div>
  );
}
