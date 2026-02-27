"use client";

import { Panel } from "@/components/ui/panel";
import { useTrending } from "@/hooks/useMarketData";
import { useSettingsStore } from "@/stores/settings";
import { formatPrice, formatPercent, getChangeColor } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export function Movers() {
  const { data, isLoading, error, refetch } = useTrending();
  const setSelectedTicker = useSettingsStore((s) => s.setSelectedTicker);

  return (
    <Panel
      title="Top Movers"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
    >
      <div className="p-2 space-y-3">
        <div>
          <div className="flex items-center gap-1 px-1 mb-1">
            <TrendingUp className="w-3 h-3 text-terminal-up" />
            <span className="text-[10px] font-semibold uppercase text-terminal-up tracking-wider">
              Gainers
            </span>
          </div>
          <div className="space-y-0.5">
            {data?.gainers?.slice(0, 5).map((item) => (
              <button
                key={item.symbol}
                onClick={() => setSelectedTicker(item.symbol)}
                className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-terminal-hover transition-colors text-xs"
              >
                <span className="font-mono font-semibold text-terminal-accent">
                  {item.symbol}
                </span>
                <span className="font-mono">
                  {formatPrice(item.regularMarketPrice)}
                </span>
                <span
                  className={`font-mono ${getChangeColor(
                    item.regularMarketChangePercent
                  )}`}
                >
                  {formatPercent(item.regularMarketChangePercent)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {data?.losers && data.losers.length > 0 && (
          <div>
            <div className="flex items-center gap-1 px-1 mb-1">
              <TrendingDown className="w-3 h-3 text-terminal-down" />
              <span className="text-[10px] font-semibold uppercase text-terminal-down tracking-wider">
                Losers
              </span>
            </div>
            <div className="space-y-0.5">
              {data.losers.slice(0, 5).map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => setSelectedTicker(item.symbol)}
                  className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-terminal-hover transition-colors text-xs"
                >
                  <span className="font-mono font-semibold text-terminal-accent">
                    {item.symbol}
                  </span>
                  <span className="font-mono">
                    {formatPrice(item.regularMarketPrice)}
                  </span>
                  <span
                    className={`font-mono ${getChangeColor(
                      item.regularMarketChangePercent
                    )}`}
                  >
                    {formatPercent(item.regularMarketChangePercent)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
