"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useSettingsStore } from "@/stores/settings";
import { useChartData } from "@/hooks/useMarketData";
import { REFETCH_INTERVALS } from "@/lib/constants";
import type { TimeRange } from "@/types";

const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

const ChartInner = dynamic(() => import("./StockChartInner"), { ssr: false });

export function StockChart() {
  const { selectedTicker, timeRange, setTimeRange } = useSettingsStore();
  const [compareSymbol, setCompareSymbol] = useState("");
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(false);

  const { data, isLoading, error, refetch, dataUpdatedAt } = useChartData(
    selectedTicker,
    timeRange
  );
  const {
    data: compareData,
    dataUpdatedAt: compareUpdatedAt,
  } = useChartData(compareSymbol.trim(), timeRange);

  return (
    <Panel
      title={`Chart - ${selectedTicker}`}
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={Math.max(dataUpdatedAt || 0, compareUpdatedAt || 0)}
      staleAfterMs={REFETCH_INTERVALS.quote}
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-terminal-border shrink-0">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-0.5 text-xs rounded font-mono transition-colors ${
                timeRange === range
                  ? "bg-terminal-accent text-terminal-bg font-semibold"
                  : "text-terminal-muted hover:text-terminal-text hover:bg-terminal-hover"
              }`}
            >
              {range}
            </button>
          ))}
          <label className="ml-2 text-[10px] text-terminal-muted flex items-center gap-1">
            <input
              type="checkbox"
              checked={showSma20}
              onChange={(e) => setShowSma20(e.target.checked)}
            />
            SMA20
          </label>
          <label className="text-[10px] text-terminal-muted flex items-center gap-1">
            <input
              type="checkbox"
              checked={showSma50}
              onChange={(e) => setShowSma50(e.target.checked)}
            />
            SMA50
          </label>
          <input
            value={compareSymbol}
            onChange={(e) => setCompareSymbol(e.target.value.toUpperCase())}
            placeholder="Compare (e.g. QQQ)"
            className="ml-auto bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono w-36"
          />
        </div>
        <div style={{ flex: 1, minHeight: 200 }}>
          <ChartInner
            data={data ?? []}
            compareData={compareData ?? []}
            showSma20={showSma20}
            showSma50={showSma50}
          />
        </div>
      </div>
    </Panel>
  );
}
