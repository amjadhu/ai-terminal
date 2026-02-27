"use client";

import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function Panel({
  title,
  children,
  className,
  isLoading,
  error,
  onRetry,
}: PanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-terminal-panel border border-terminal-border rounded-lg overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-terminal-border shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-terminal-muted">
          {title}
        </h2>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-terminal-muted hover:text-terminal-text transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <PanelSkeleton />
        ) : error ? (
          <PanelError message={error} onRetry={onRetry} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="p-3 space-y-2 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-4 bg-terminal-border rounded w-16" />
          <div className="h-4 bg-terminal-border rounded flex-1" />
          <div className="h-4 bg-terminal-border rounded w-12" />
        </div>
      ))}
    </div>
  );
}

function PanelError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
      <p className="text-sm text-terminal-down">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs bg-terminal-border hover:bg-terminal-hover rounded transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
