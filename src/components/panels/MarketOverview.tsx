"use client";

import { Panel } from "@/components/ui/panel";
import { useMarketOverview } from "@/hooks/useMarketData";
import { formatPrice, formatChange, formatPercent, getChangeColor } from "@/lib/utils";

export function MarketOverview() {
  const { data, isLoading, error, refetch } = useMarketOverview();

  return (
    <Panel
      title="Market Overview"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
    >
      <div className="flex items-center gap-6 px-4 py-3 overflow-x-auto h-full">
        {data?.map((index) => (
          <div key={index.symbol} className="flex flex-col gap-0.5 min-w-[120px]">
            <span className="text-xs font-semibold text-terminal-accent">
              {index.shortName}
            </span>
            <span className="text-sm font-mono font-medium">
              {formatPrice(index.regularMarketPrice)}
            </span>
            <div className="flex gap-2 text-xs font-mono">
              <span className={getChangeColor(index.regularMarketChange)}>
                {formatChange(index.regularMarketChange)}
              </span>
              <span className={getChangeColor(index.regularMarketChangePercent)}>
                {formatPercent(index.regularMarketChangePercent)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
