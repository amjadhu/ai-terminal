"use client";

import { Panel } from "@/components/ui/panel";
import { useEarnings } from "@/hooks/useMarketData";
import { useWatchlistStore } from "@/stores/watchlist";
import { REFETCH_INTERVALS } from "@/lib/constants";
import type { EarningsItem } from "@/types";

export function EarningsCalendar() {
  const watchlist = useWatchlistStore((s) => s.tickers);
  const { data, isLoading, error, refetch, dataUpdatedAt } = useEarnings(watchlist);

  return (
    <Panel
      title="Earnings Calendar"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={REFETCH_INTERVALS.earnings}
    >
      {data && data.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-xs text-terminal-muted">
          No upcoming earnings found for watchlist
        </div>
      ) : (
        <div className="divide-y divide-terminal-border">
          {data?.map((item) => (
            <EarningsRow key={item.symbol} item={item} />
          ))}
        </div>
      )}
    </Panel>
  );
}

function EarningsRow({ item }: { item: EarningsItem }) {
  const daysUntil = item.earningsDate
    ? getDaysUntil(item.earningsDate)
    : null;

  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-terminal-hover transition-colors">
      {/* Left: symbol + company */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-xs font-semibold text-terminal-accent">
          {item.symbol}
        </span>
        <span className="text-[10px] text-terminal-muted truncate">
          {item.companyName}
        </span>
      </div>

      {/* Middle: EPS estimate */}
      <div className="flex flex-col items-center gap-0.5 px-3">
        <span
          className="text-[9px] text-terminal-muted uppercase tracking-wider"
          title="Wall Street's expected earnings per share"
        >
          EPS Est
        </span>
        <span className="text-xs font-mono text-terminal-text">
          {item.epsEstimate !== undefined
            ? `$${item.epsEstimate.toFixed(2)}`
            : "—"}
        </span>
      </div>

      {/* Right: date + countdown */}
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs font-mono text-terminal-text">
          {item.earningsDate ? formatDate(item.earningsDate) : "—"}
        </span>
        {daysUntil !== null && (
          <span
            className={`text-[10px] font-semibold ${
              daysUntil === 0
                ? "text-terminal-accent"
                : daysUntil > 0 && daysUntil <= 7
                ? "text-yellow-400"
                : daysUntil < 0
                ? "text-terminal-down"
                : "text-terminal-muted"
            }`}
          >
            {daysUntil < 0
              ? `${Math.abs(daysUntil)}d ago`
              : daysUntil === 0
              ? "TODAY"
              : daysUntil === 1
              ? "TOMORROW"
              : `${daysUntil}d`}
          </span>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysUntil(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}
