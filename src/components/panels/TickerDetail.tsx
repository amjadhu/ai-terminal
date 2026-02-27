"use client";

import { Panel } from "@/components/ui/panel";
import { useSettingsStore } from "@/stores/settings";
import { useStockQuote } from "@/hooks/useMarketData";
import {
  formatPrice,
  formatChange,
  formatPercent,
  formatNumber,
  getChangeColor,
} from "@/lib/utils";

export function TickerDetail() {
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const { data, isLoading, error, refetch } = useStockQuote(selectedTicker);

  return (
    <Panel
      title={`Detail - ${selectedTicker}`}
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
    >
      {data && (
        <div className="p-3 space-y-3">
          <div>
            <div className="text-sm font-medium text-terminal-text mb-1">
              {data.shortName}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold">
                {formatPrice(data.regularMarketPrice)}
              </span>
              <span
                className={`text-sm font-mono ${getChangeColor(
                  data.regularMarketChange
                )}`}
              >
                {formatChange(data.regularMarketChange)}{" "}
                ({formatPercent(data.regularMarketChangePercent)})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <StatRow label="Open" value={formatPrice(data.regularMarketOpen ?? 0)} />
            <StatRow label="Prev Close" value={formatPrice(data.regularMarketPreviousClose ?? 0)} />
            <StatRow label="Day High" value={formatPrice(data.regularMarketDayHigh ?? 0)} />
            <StatRow label="Day Low" value={formatPrice(data.regularMarketDayLow ?? 0)} />
            <StatRow label="52W High" value={formatPrice(data.fiftyTwoWeekHigh ?? 0)} />
            <StatRow label="52W Low" value={formatPrice(data.fiftyTwoWeekLow ?? 0)} />
            <StatRow label="Market Cap" value={data.marketCap ? formatNumber(data.marketCap) : "N/A"} />
            <StatRow label="P/E Ratio" value={data.trailingPE?.toFixed(2) ?? "N/A"} />
            <StatRow label="Volume" value={formatNumber(data.regularMarketVolume)} />
            <StatRow label="Avg Volume" value={data.averageVolume ? formatNumber(data.averageVolume) : "N/A"} />
            <StatRow label="Div Yield" value={data.dividendYield ? `${(data.dividendYield * 100).toFixed(2)}%` : "N/A"} />
          </div>
        </div>
      )}
    </Panel>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-terminal-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
