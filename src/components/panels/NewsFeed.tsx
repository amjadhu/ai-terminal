"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useNews } from "@/hooks/useMarketData";
import { useSettingsStore } from "@/stores/settings";
import { ExternalLink } from "lucide-react";
import { REFETCH_INTERVALS } from "@/lib/constants";

type NewsTab = "market" | "ticker";

export function NewsFeed() {
  const [tab, setTab] = useState<NewsTab>("market");
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);

  const isTickerTab = tab === "ticker";
  const { data, isLoading, error, refetch, dataUpdatedAt } = useNews(
    isTickerTab ? selectedTicker : undefined
  );

  return (
    <Panel
      title="News"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={REFETCH_INTERVALS.news}
    >
      <div className="flex flex-col h-full">
        {/* Tab bar */}
        <div className="flex border-b border-terminal-border shrink-0">
          <button
            onClick={() => setTab("market")}
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === "market"
                ? "text-terminal-accent border-b-2 border-terminal-accent -mb-px"
                : "text-terminal-muted hover:text-terminal-text"
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setTab("ticker")}
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === "ticker"
                ? "text-terminal-accent border-b-2 border-terminal-accent -mb-px"
                : "text-terminal-muted hover:text-terminal-text"
            }`}
          >
            {selectedTicker}
          </button>
        </div>

        {/* News list */}
        <div className="flex-1 overflow-auto min-h-0 divide-y divide-terminal-border">
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
                    <span className="text-terminal-accent">impact {item.impactScore}</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {(item.catalystTags ?? []).slice(0, 3).map((tag) => (
                      <span
                        key={`${item.link}-${tag}`}
                        className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider border border-terminal-border rounded text-terminal-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-terminal-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </div>
            </a>
          ))}
        </div>
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
