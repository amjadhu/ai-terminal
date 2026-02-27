"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useSettingsStore } from "@/stores/settings";
import { useFundamentals, useStockQuote } from "@/hooks/useMarketData";
import { formatPercent, formatPrice } from "@/lib/utils";

export function ComparePanel() {
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const [peer, setPeer] = useState("MSFT");

  const left = useStockQuote(selectedTicker);
  const right = useStockQuote(peer);
  const leftFund = useFundamentals(selectedTicker);
  const rightFund = useFundamentals(peer);

  const rows = useMemo(
    () => [
      {
        label: "Price",
        left: left.data ? `$${formatPrice(left.data.regularMarketPrice)}` : "—",
        right: right.data ? `$${formatPrice(right.data.regularMarketPrice)}` : "—",
      },
      {
        label: "1D %",
        left: left.data ? formatPercent(left.data.regularMarketChangePercent) : "—",
        right: right.data ? formatPercent(right.data.regularMarketChangePercent) : "—",
      },
      {
        label: "P/E",
        left: left.data?.trailingPE?.toFixed(2) ?? "—",
        right: right.data?.trailingPE?.toFixed(2) ?? "—",
      },
      {
        label: "Rev Growth",
        left:
          leftFund.data?.revenueGrowth !== undefined
            ? formatPercent(leftFund.data.revenueGrowth * 100)
            : "—",
        right:
          rightFund.data?.revenueGrowth !== undefined
            ? formatPercent(rightFund.data.revenueGrowth * 100)
            : "—",
      },
      {
        label: "Gross Margin",
        left:
          leftFund.data?.grossMargins !== undefined
            ? formatPercent(leftFund.data.grossMargins * 100)
            : "—",
        right:
          rightFund.data?.grossMargins !== undefined
            ? formatPercent(rightFund.data.grossMargins * 100)
            : "—",
      },
      {
        label: "ROE",
        left:
          leftFund.data?.returnOnEquity !== undefined
            ? formatPercent(leftFund.data.returnOnEquity * 100)
            : "—",
        right:
          rightFund.data?.returnOnEquity !== undefined
            ? formatPercent(rightFund.data.returnOnEquity * 100)
            : "—",
      },
    ],
    [left.data, leftFund.data, right.data, rightFund.data]
  );

  return (
    <Panel
      title={`Compare ${selectedTicker} vs ${peer}`}
      isLoading={left.isLoading || right.isLoading || leftFund.isLoading || rightFund.isLoading}
      error={left.error?.message ?? right.error?.message ?? leftFund.error?.message ?? rightFund.error?.message}
      onRetry={() => {
        left.refetch();
        right.refetch();
        leftFund.refetch();
        rightFund.refetch();
      }}
      lastUpdatedAt={Math.max(
        left.dataUpdatedAt || 0,
        right.dataUpdatedAt || 0,
        leftFund.dataUpdatedAt || 0,
        rightFund.dataUpdatedAt || 0
      )}
      staleAfterMs={180_000}
    >
      <div className="flex flex-col h-full">
        <div className="border-b border-terminal-border p-2 flex items-center gap-2">
          <span className="text-xs text-terminal-muted">Peer:</span>
          <input
            value={peer}
            onChange={(e) => setPeer(e.target.value.toUpperCase())}
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono"
            placeholder="Ticker"
          />
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-terminal-border text-terminal-muted">
              <th className="text-left px-3 py-2">Metric</th>
              <th className="text-right px-3 py-2">{selectedTicker}</th>
              <th className="text-right px-3 py-2">{peer}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-terminal-border/50">
                <td
                  className="px-3 py-1.5 text-terminal-muted terminal-tooltip"
                  data-tooltip={metricTooltipByLabel[r.label]}
                >
                  {r.label}
                </td>
                <td className="px-3 py-1.5 text-right font-mono">{r.left}</td>
                <td className="px-3 py-1.5 text-right font-mono">{r.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

const metricTooltipByLabel: Record<string, string> = {
  "1D %": "Percent move over the current trading day",
  "P/E": "Price-to-earnings ratio based on trailing earnings",
  "Rev Growth": "Year-over-year revenue growth rate",
  "Gross Margin": "Share of revenue left after direct costs",
  "ROE": "Return on equity: profit generated from shareholder equity",
};
