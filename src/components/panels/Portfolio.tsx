"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { usePortfolioStore } from "@/stores/portfolio";
import { useMultiQuote } from "@/hooks/useMarketData";
import { formatPercent, formatPrice } from "@/lib/utils";

export function Portfolio() {
  const { positions, addPosition, removePosition } = usePortfolioStore();
  const symbols = positions.map((p) => p.symbol);
  const { data, isLoading, error, refetch, dataUpdatedAt } = useMultiQuote(symbols);
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("10");
  const [avgCost, setAvgCost] = useState("100");

  const quoteMap = useMemo(
    () => new Map((data ?? []).map((q) => [q.symbol, q])),
    [data]
  );

  const snapshot = useMemo(() => {
    let marketValue = 0;
    let costBasis = 0;
    let dayPnL = 0;

    positions.forEach((p) => {
      const q = quoteMap.get(p.symbol);
      if (!q) return;
      const value = q.regularMarketPrice * p.shares;
      const cost = p.avgCost * p.shares;
      const previous = (q.regularMarketPrice - q.regularMarketChange) * p.shares;
      marketValue += value;
      costBasis += cost;
      dayPnL += value - previous;
    });

    const unrealizedPnL = marketValue - costBasis;
    return {
      marketValue,
      costBasis,
      unrealizedPnL,
      unrealizedPnLPercent: costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0,
      dayPnL,
      dayPnLPercent: marketValue > 0 ? (dayPnL / marketValue) * 100 : 0,
    };
  }, [positions, quoteMap]);

  return (
    <Panel
      title="Portfolio"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={45_000}
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-2 gap-2 p-3 border-b border-terminal-border text-xs">
          <Stat label="Market Value" value={`$${formatPrice(snapshot.marketValue)}`} />
          <Stat label="Cost Basis" value={`$${formatPrice(snapshot.costBasis)}`} />
          <Stat
            label="Unrealized P/L"
            value={`${snapshot.unrealizedPnL >= 0 ? "+" : ""}$${formatPrice(snapshot.unrealizedPnL)} (${formatPercent(snapshot.unrealizedPnLPercent)})`}
            color={snapshot.unrealizedPnL >= 0 ? "text-terminal-up" : "text-terminal-down"}
          />
          <Stat
            label="Day P/L"
            value={`${snapshot.dayPnL >= 0 ? "+" : ""}$${formatPrice(snapshot.dayPnL)} (${formatPercent(snapshot.dayPnLPercent)})`}
            color={snapshot.dayPnL >= 0 ? "text-terminal-up" : "text-terminal-down"}
          />
        </div>

        <div className="overflow-auto min-h-0 flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-terminal-border text-terminal-muted">
                <th className="text-left px-3 py-1.5">Symbol</th>
                <th className="text-right px-2 py-1.5">Shares</th>
                <th className="text-right px-2 py-1.5">Avg</th>
                <th className="text-right px-2 py-1.5">Last</th>
                <th className="text-right px-2 py-1.5">P/L</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const q = quoteMap.get(p.symbol);
                const last = q?.regularMarketPrice ?? 0;
                const pnl = (last - p.avgCost) * p.shares;
                return (
                  <tr key={p.symbol} className="border-b border-terminal-border/50">
                    <td className="px-3 py-1.5 font-mono text-terminal-accent">{p.symbol}</td>
                    <td className="text-right px-2 py-1.5 font-mono">{p.shares}</td>
                    <td className="text-right px-2 py-1.5 font-mono">${formatPrice(p.avgCost)}</td>
                    <td className="text-right px-2 py-1.5 font-mono">${formatPrice(last)}</td>
                    <td
                      className={`text-right px-2 py-1.5 font-mono ${
                        pnl >= 0 ? "text-terminal-up" : "text-terminal-down"
                      }`}
                    >
                      {pnl >= 0 ? "+" : ""}${formatPrice(pnl)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        onClick={() => removePosition(p.symbol)}
                        className="text-terminal-muted hover:text-terminal-down"
                      >
                        x
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form
          className="p-2 border-t border-terminal-border grid grid-cols-4 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const parsedShares = Number(shares);
            const parsedAvgCost = Number(avgCost);
            if (!symbol || !Number.isFinite(parsedShares) || !Number.isFinite(parsedAvgCost)) {
              return;
            }
            addPosition({
              symbol: symbol.toUpperCase(),
              shares: parsedShares,
              avgCost: parsedAvgCost,
            });
            setSymbol("");
          }}
        >
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol"
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono"
          />
          <input
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="Shares"
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono"
          />
          <input
            value={avgCost}
            onChange={(e) => setAvgCost(e.target.value)}
            placeholder="Avg Cost"
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono"
          />
          <button
            type="submit"
            className="bg-terminal-accent text-terminal-bg rounded px-2 py-1 text-xs font-semibold"
          >
            Add Position
          </button>
        </form>
      </div>
    </Panel>
  );
}

function Stat({
  label,
  value,
  color = "text-terminal-text",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-terminal-muted">{label}</div>
      <div className={`font-mono text-sm ${color}`}>{value}</div>
    </div>
  );
}
