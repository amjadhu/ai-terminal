"use client";

import dynamic from "next/dynamic";
import { Panel } from "@/components/ui/panel";
import { useSettingsStore } from "@/stores/settings";
import { useChartData } from "@/hooks/useMarketData";
import type { TimeRange } from "@/types";

const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

const ChartInner = dynamic(() => import("./StockChartInner"), { ssr: false });

export function StockChart() {
  const { selectedTicker, timeRange, setTimeRange } = useSettingsStore();
  const { data, isLoading, error, refetch } = useChartData(
    selectedTicker,
    timeRange
  );

  return (
    <Panel
      title={`Chart - ${selectedTicker}`}
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
    >
      <div className="flex flex-col h-full">
        <div className="flex gap-1 px-3 py-2 border-b border-terminal-border shrink-0">
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
        </div>
        <div style={{ flex: 1, minHeight: 200 }}>
          <ChartInner data={data ?? []} />
        </div>
      </div>
    </Panel>
  );
}
