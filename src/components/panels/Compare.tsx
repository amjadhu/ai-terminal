"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useSettingsStore } from "@/stores/settings";
import { useAnalysts, useFundamentals, useStockQuote } from "@/hooks/useMarketData";
import { formatPercent } from "@/lib/utils";

type Direction = "higher" | "lower";
type CompareMetric = {
  group: "Valuation" | "Growth" | "Quality" | "Risk";
  label: string;
  tooltip: string;
  direction: Direction;
  left?: number;
  right?: number;
  format: "percent" | "ratio" | "multiple" | "score";
};

export function ComparePanel() {
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const [peer, setPeer] = useState("MSFT");
  const [peerInput, setPeerInput] = useState("MSFT");

  const left = useStockQuote(selectedTicker);
  const right = useStockQuote(peer);
  const leftFund = useFundamentals(selectedTicker);
  const rightFund = useFundamentals(peer);
  const leftAnalyst = useAnalysts(selectedTicker);
  const rightAnalyst = useAnalysts(peer);
  const compareError =
    right.error?.message ??
    rightFund.error?.message ??
    rightAnalyst.error?.message ??
    null;

  const applyPeer = () => {
    const next = peerInput.trim().toUpperCase();
    if (!next) return;
    setPeer(next);
  };

  const metrics = useMemo<CompareMetric[]>(() => {
    const lq = left.data;
    const rq = right.data;
    const lf = leftFund.data;
    const rf = rightFund.data;
    const la = leftAnalyst.data;
    const ra = rightAnalyst.data;

    const fcfMargin = (freeCashflow?: number, revenue?: number) =>
      freeCashflow !== undefined && revenue !== undefined && revenue !== 0
        ? (freeCashflow / revenue) * 100
        : undefined;

    const targetUpside = (target?: number, price?: number) =>
      target !== undefined && price !== undefined && price > 0
        ? ((target - price) / price) * 100
        : undefined;

    return [
      {
        group: "Valuation",
        label: "P/E (TTM)",
        tooltip: "Price divided by trailing 12-month earnings",
        direction: "lower",
        left: lq?.trailingPE,
        right: rq?.trailingPE,
        format: "multiple",
      },
      {
        group: "Valuation",
        label: "EV / Revenue",
        tooltip: "Enterprise value divided by annual revenue",
        direction: "lower",
        left: lf?.enterpriseToRevenue,
        right: rf?.enterpriseToRevenue,
        format: "multiple",
      },
      {
        group: "Valuation",
        label: "EV / EBITDA",
        tooltip: "Enterprise value divided by EBITDA",
        direction: "lower",
        left: lf?.enterpriseToEbitda,
        right: rf?.enterpriseToEbitda,
        format: "multiple",
      },
      {
        group: "Valuation",
        label: "PEG",
        tooltip: "P/E adjusted for growth (lower can imply better value vs growth)",
        direction: "lower",
        left: lf?.pegRatio,
        right: rf?.pegRatio,
        format: "ratio",
      },
      {
        group: "Growth",
        label: "Revenue Growth (YoY)",
        tooltip: "Year-over-year revenue growth",
        direction: "higher",
        left: lf?.revenueGrowth !== undefined ? lf.revenueGrowth * 100 : undefined,
        right: rf?.revenueGrowth !== undefined ? rf.revenueGrowth * 100 : undefined,
        format: "percent",
      },
      {
        group: "Growth",
        label: "Target Upside",
        tooltip: "Analyst mean price target versus current price",
        direction: "higher",
        left: targetUpside(la?.targetMeanPrice, lq?.regularMarketPrice),
        right: targetUpside(ra?.targetMeanPrice, rq?.regularMarketPrice),
        format: "percent",
      },
      {
        group: "Quality",
        label: "Gross Margin",
        tooltip: "Revenue retained after direct costs",
        direction: "higher",
        left: lf?.grossMargins !== undefined ? lf.grossMargins * 100 : undefined,
        right: rf?.grossMargins !== undefined ? rf.grossMargins * 100 : undefined,
        format: "percent",
      },
      {
        group: "Quality",
        label: "Operating Margin",
        tooltip: "Operating profit as a percent of revenue",
        direction: "higher",
        left: lf?.operatingMargins !== undefined ? lf.operatingMargins * 100 : undefined,
        right: rf?.operatingMargins !== undefined ? rf.operatingMargins * 100 : undefined,
        format: "percent",
      },
      {
        group: "Quality",
        label: "ROE",
        tooltip: "Return on equity: profit generated from shareholder capital",
        direction: "higher",
        left: lf?.returnOnEquity !== undefined ? lf.returnOnEquity * 100 : undefined,
        right: rf?.returnOnEquity !== undefined ? rf.returnOnEquity * 100 : undefined,
        format: "percent",
      },
      {
        group: "Quality",
        label: "FCF Margin",
        tooltip: "Free cash flow as a percent of revenue",
        direction: "higher",
        left: fcfMargin(lf?.freeCashflow, lf?.totalRevenue),
        right: fcfMargin(rf?.freeCashflow, rf?.totalRevenue),
        format: "percent",
      },
      {
        group: "Risk",
        label: "Debt / Equity",
        tooltip: "Leverage relative to shareholder equity",
        direction: "lower",
        left: lf?.debtToEquity,
        right: rf?.debtToEquity,
        format: "ratio",
      },
      {
        group: "Risk",
        label: "Beta",
        tooltip: "Volatility vs the broader market (~1.0 = market-like risk)",
        direction: "lower",
        left: lf?.beta,
        right: rf?.beta,
        format: "ratio",
      },
      {
        group: "Risk",
        label: "Analyst Risk Score",
        tooltip: "Analyst recommendation mean where 1.0 is best and 5.0 is worst",
        direction: "lower",
        left: la?.recommendationMean,
        right: ra?.recommendationMean,
        format: "score",
      },
    ];
  }, [
    left.data,
    right.data,
    leftFund.data,
    rightFund.data,
    leftAnalyst.data,
    rightAnalyst.data,
  ]);

  const groupOrder: CompareMetric["group"][] = [
    "Valuation",
    "Growth",
    "Quality",
    "Risk",
  ];
  const groupedRows = groupOrder.map((group) => ({
    group,
    rows: metrics.filter((m) => m.group === group),
  }));

  const summary = useMemo(() => {
    const groups: Record<CompareMetric["group"], { left: number; right: number }> = {
      Valuation: { left: 0, right: 0 },
      Growth: { left: 0, right: 0 },
      Quality: { left: 0, right: 0 },
      Risk: { left: 0, right: 0 },
    };

    for (const metric of metrics) {
      const winner = pickWinner(metric.left, metric.right, metric.direction);
      if (winner === "left") groups[metric.group].left += 1;
      if (winner === "right") groups[metric.group].right += 1;
    }
    return groups;
  }, [metrics]);

  return (
    <Panel
      title={`Compare ${selectedTicker} vs ${peer}`}
      isLoading={
        left.isLoading ||
        leftFund.isLoading ||
        leftAnalyst.isLoading ||
        right.isLoading ||
        rightFund.isLoading ||
        rightAnalyst.isLoading
      }
      error={
        left.error?.message ??
        leftFund.error?.message ??
        leftAnalyst.error?.message
      }
      onRetry={() => {
        left.refetch();
        right.refetch();
        leftFund.refetch();
        rightFund.refetch();
        leftAnalyst.refetch();
        rightAnalyst.refetch();
      }}
      lastUpdatedAt={Math.max(
        left.dataUpdatedAt || 0,
        right.dataUpdatedAt || 0,
        leftFund.dataUpdatedAt || 0,
        rightFund.dataUpdatedAt || 0,
        leftAnalyst.dataUpdatedAt || 0,
        rightAnalyst.dataUpdatedAt || 0
      )}
      staleAfterMs={180_000}
    >
      <div className="flex flex-col h-full">
        <div className="border-b border-terminal-border p-2 flex items-center gap-2">
          <span className="text-xs text-terminal-muted">Peer:</span>
          <input
            value={peerInput}
            onChange={(e) => setPeerInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyPeer();
              } else if (e.key === "Escape") {
                setPeerInput(peer);
              }
            }}
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono"
            placeholder="Ticker (press Enter)"
          />
          <button
            onClick={applyPeer}
            className="px-2 py-1 text-xs rounded bg-terminal-accent text-terminal-bg font-semibold"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setPeer("MSFT");
              setPeerInput("MSFT");
            }}
            className="px-2 py-1 text-xs rounded border border-terminal-border text-terminal-muted hover:text-terminal-text hover:bg-terminal-hover"
          >
            Reset
          </button>
        </div>
        {compareError && (
          <div className="px-3 py-2 border-b border-terminal-border text-xs text-terminal-down">
            Compare symbol <span className="font-mono">{peer}</span> not found.
            Update the ticker and click Apply.
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 px-2 py-2 border-b border-terminal-border">
          {groupOrder.map((group) => {
            const leftWins = summary[group].left;
            const rightWins = summary[group].right;
            const winner =
              leftWins === rightWins
                ? "Tie"
                : leftWins > rightWins
                ? selectedTicker
                : peer;
            return (
              <div key={group} className="border border-terminal-border rounded px-2 py-1">
                <div className="text-[10px] uppercase tracking-wider text-terminal-muted">
                  {group}
                </div>
                <div className="text-xs font-mono mt-0.5">
                  {selectedTicker} {leftWins} : {rightWins} {peer}
                </div>
                <div className="text-[10px] text-terminal-accent mt-0.5">
                  {winner === "Tie" ? "Tie" : `${winner} leads`}
                </div>
              </div>
            );
          })}
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-terminal-border text-terminal-muted">
                <th className="text-left px-3 py-2">Metric</th>
                <th className="text-right px-3 py-2">{selectedTicker}</th>
                <th className="text-right px-3 py-2">{peer}</th>
                <th className="text-right px-3 py-2">Edge</th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.map(({ group, rows }) => (
                rows.map((row, idx) => {
                  const winner = pickWinner(row.left, row.right, row.direction);
                  return (
                    <tr key={`${group}-${row.label}`} className="border-b border-terminal-border/50">
                      <td
                        className={`px-3 py-1.5 text-terminal-muted terminal-tooltip ${
                          idx === 0 ? "border-t border-terminal-border/30" : ""
                        }`}
                        data-tooltip={row.tooltip}
                      >
                        <span className="text-[10px] text-terminal-accent mr-2">{idx === 0 ? group : ""}</span>
                        {row.label}
                      </td>
                      <td className={`px-3 py-1.5 text-right font-mono ${winner === "left" ? "text-terminal-up" : ""}`}>
                        {formatMetricValue(row.left, row.format)}
                      </td>
                      <td className={`px-3 py-1.5 text-right font-mono ${winner === "right" ? "text-terminal-up" : ""}`}>
                        {formatMetricValue(row.right, row.format)}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-terminal-muted">
                        {winner === "left"
                          ? selectedTicker
                          : winner === "right"
                          ? peer
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

function pickWinner(
  left: number | undefined,
  right: number | undefined,
  direction: Direction
) {
  if (left === undefined || right === undefined) return "none" as const;
  if (Math.abs(left - right) < 1e-9) return "none" as const;
  if (direction === "higher") return left > right ? "left" : "right";
  return left < right ? "left" : "right";
}

function formatMetricValue(
  value: number | undefined,
  format: CompareMetric["format"]
) {
  if (value === undefined || Number.isNaN(value)) return "—";
  if (format === "percent") return formatPercent(value);
  if (format === "multiple") return `${value.toFixed(2)}x`;
  if (format === "score") return `${value.toFixed(1)} / 5`;
  return value.toFixed(2);
}
