"use client";

import { Panel } from "@/components/ui/panel";
import { useNews } from "@/hooks/useMarketData";
import { ExternalLink } from "lucide-react";

export function NewsFeed() {
  const { data, isLoading, error, refetch } = useNews();

  return (
    <Panel
      title="News"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
    >
      <div className="divide-y divide-terminal-border">
        {data?.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 hover:bg-terminal-hover transition-colors group"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed text-terminal-text group-hover:text-terminal-accent transition-colors line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-terminal-muted">
                  <span>{item.publisher}</span>
                  <span>{formatTimeAgo(item.providerPublishTime)}</span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-terminal-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
            </div>
          </a>
        ))}
      </div>
    </Panel>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
