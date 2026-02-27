"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useScreener } from "@/hooks/useMarketData";
import { useSettingsStore } from "@/stores/settings";
import { useWatchlistStore } from "@/stores/watchlist";
import { SCREENER_DEFAULTS } from "@/lib/constants";
import { formatNumber, formatPercent, formatPrice } from "@/lib/utils";

export function ScreenerPanel() {
  const [minMarketCap, setMinMarketCap] = useState(SCREENER_DEFAULTS.minMarketCap);
  const [maxPE, setMaxPE] = useState(SCREENER_DEFAULTS.maxPE);
  const [minRevenueGrowth, setMinRevenueGrowth] = useState(
    SCREENER_DEFAULTS.minRevenueGrowth
  );
  const [minVolume, setMinVolume] = useState(SCREENER_DEFAULTS.minVolume);
  const setSelectedTicker = useSettingsStore((s) => s.setSelectedTicker);
  const addTicker = useWatchlistStore((s) => s.addTicker);

  const { data, isLoading, error, refetch, dataUpdatedAt } = useScreener({
    minMarketCap,
    maxPE,
    minRevenueGrowth,
    minVolume,
  });

  return (
    <Panel
      title="Screener"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={240_000}
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-4 gap-1 p-2 border-b border-terminal-border">
          <FilterInput
            label="Min Cap"
            value={String(minMarketCap)}
            onChange={(v) => setMinMarketCap(Number(v))}
          />
          <FilterInput label="Max P/E" value={String(maxPE)} onChange={(v) => setMaxPE(Number(v))} />
          <FilterInput
            label="Min Rev Gr"
            value={String(minRevenueGrowth)}
            onChange={(v) => setMinRevenueGrowth(Number(v))}
          />
          <FilterInput
            label="Min Vol"
            value={String(minVolume)}
            onChange={(v) => setMinVolume(Number(v))}
          />
        </div>
        <div className="overflow-auto min-h-0 flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-terminal-border text-terminal-muted">
                <th className="text-left px-2 py-1.5">Symbol</th>
                <th className="text-right px-2 py-1.5">Price</th>
                <th className="text-right px-2 py-1.5">%Chg</th>
                <th className="text-right px-2 py-1.5">MCap</th>
                <th className="text-right px-2 py-1.5">P/E</th>
                <th className="text-right px-2 py-1.5">Rev Gr</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((row) => (
                <tr
                  key={row.symbol}
                  className="border-b border-terminal-border/50 cursor-pointer hover:bg-terminal-hover"
                  onClick={() => {
                    setSelectedTicker(row.symbol);
                    addTicker(row.symbol);
                  }}
                >
                  <td className="px-2 py-1.5 font-mono text-terminal-accent">{row.symbol}</td>
                  <td className="text-right px-2 py-1.5 font-mono">${formatPrice(row.regularMarketPrice)}</td>
                  <td
                    className={`text-right px-2 py-1.5 font-mono ${
                      row.regularMarketChangePercent >= 0 ? "text-terminal-up" : "text-terminal-down"
                    }`}
                  >
                    {formatPercent(row.regularMarketChangePercent)}
                  </td>
                  <td className="text-right px-2 py-1.5 font-mono">
                    {row.marketCap ? formatNumber(row.marketCap) : "—"}
                  </td>
                  <td className="text-right px-2 py-1.5 font-mono">
                    {row.trailingPE ? row.trailingPE.toFixed(1) : "—"}
                  </td>
                  <td className="text-right px-2 py-1.5 font-mono">
                    {row.revenueGrowth !== undefined
                      ? formatPercent(row.revenueGrowth * 100)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

function FilterInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[10px] text-terminal-muted flex flex-col gap-1">
      {label}
      <input
        className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
