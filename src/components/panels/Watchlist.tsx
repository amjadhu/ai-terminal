"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useWatchlistStore } from "@/stores/watchlist";
import { useSettingsStore } from "@/stores/settings";
import { useMultiQuote } from "@/hooks/useMarketData";
import {
  formatPrice,
  formatChange,
  formatPercent,
  formatVolume,
  getChangeColor,
} from "@/lib/utils";
import { REFETCH_INTERVALS } from "@/lib/constants";
import { computeWatchlistPriority } from "@/lib/insights";
import { GripVertical, Plus, X } from "lucide-react";

export function Watchlist() {
  const { tickers, addTicker, removeTicker, moveTicker } = useWatchlistStore();
  const setSelectedTicker = useSettingsStore((s) => s.setSelectedTicker);
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const { data, isLoading, error, refetch, dataUpdatedAt } = useMultiQuote(tickers);
  const [addInput, setAddInput] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [draggedSymbol, setDraggedSymbol] = useState<string | null>(null);
  const priorityBySymbol = useMemo(
    () =>
      new Map(
        (data ?? []).map((q) => [q.symbol, computeWatchlistPriority(q)])
      ),
    [data]
  );

  const handleAdd = () => {
    if (addInput.trim()) {
      addTicker(addInput.trim());
      setAddInput("");
      setShowAdd(false);
    }
  };

  const moveBySymbol = (fromSymbol: string, toSymbol: string) => {
    const fromIndex = tickers.indexOf(fromSymbol);
    const toIndex = tickers.indexOf(toSymbol);
    if (fromIndex === -1 || toIndex === -1) return;
    moveTicker(fromIndex, toIndex);
  };

  return (
    <Panel
      title="Watchlist"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={REFETCH_INTERVALS.quote}
    >
      <div className="flex flex-col h-full">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-terminal-muted border-b border-terminal-border">
              <th className="w-6"></th>
              <th className="text-left px-3 py-1.5 font-medium">Symbol</th>
              <th className="text-right px-2 py-1.5 font-medium">Price</th>
              <th className="text-right px-2 py-1.5 font-medium">Chg</th>
              <th className="text-right px-2 py-1.5 font-medium">%</th>
              <th
                className="text-right px-2 py-1.5 font-medium"
                title="Signal score for urgency: CALM, WATCH, or HOT"
              >
                Sig
              </th>
              <th className="text-right px-2 py-1.5 font-medium">Vol</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((quote) => {
              const priority = priorityBySymbol.get(quote.symbol);
              return (
                <tr
                  key={quote.symbol}
                  onClick={() => setSelectedTicker(quote.symbol)}
                  draggable
                  onDragStart={(e) => {
                    setDraggedSymbol(quote.symbol);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!draggedSymbol) return;
                    moveBySymbol(draggedSymbol, quote.symbol);
                    setDraggedSymbol(null);
                  }}
                  onDragEnd={() => setDraggedSymbol(null)}
                  className={`cursor-pointer hover:bg-terminal-hover transition-colors ${
                    selectedTicker === quote.symbol ? "bg-terminal-hover" : ""
                  } ${draggedSymbol === quote.symbol ? "opacity-60" : ""}`}
                  title={priority?.reasons.join(" | ")}
                >
                  <td className="px-1 py-1.5 text-terminal-muted">
                    <GripVertical className="w-3 h-3" />
                  </td>
                  <td className="px-3 py-1.5 font-mono font-semibold text-terminal-accent">
                    {quote.symbol}
                  </td>
                  <td className="text-right px-2 py-1.5 font-mono">
                    {formatPrice(quote.regularMarketPrice)}
                  </td>
                  <td
                    className={`text-right px-2 py-1.5 font-mono ${getChangeColor(
                      quote.regularMarketChange
                    )}`}
                  >
                    {formatChange(quote.regularMarketChange)}
                  </td>
                  <td
                    className={`text-right px-2 py-1.5 font-mono ${getChangeColor(
                      quote.regularMarketChangePercent
                    )}`}
                  >
                    {formatPercent(quote.regularMarketChangePercent)}
                  </td>
                  <td className="text-right px-2 py-1.5">
                    <span
                      className={`inline-flex items-center justify-end min-w-[54px] px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        priority?.signal === "HOT"
                          ? "bg-terminal-down/20 text-terminal-down"
                          : priority?.signal === "WATCH"
                          ? "bg-yellow-500/15 text-yellow-400"
                          : "bg-terminal-border text-terminal-muted"
                      }`}
                    >
                      {priority?.signal ?? "CALM"} {priority?.score ?? 0}
                    </span>
                  </td>
                  <td className="text-right px-2 py-1.5 font-mono text-terminal-muted">
                    {formatVolume(quote.regularMarketVolume)}
                  </td>
                  <td className="px-1 py-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTicker(quote.symbol);
                      }}
                      className="text-terminal-muted hover:text-terminal-down transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-auto border-t border-terminal-border p-2">
          {showAdd ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              className="flex gap-1"
            >
              <input
                value={addInput}
                onChange={(e) => setAddInput(e.target.value.toUpperCase())}
                placeholder="TICKER"
                className="flex-1 bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-terminal-accent"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs bg-terminal-accent text-terminal-bg rounded font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-2 py-1 text-xs text-terminal-muted hover:text-terminal-text"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-xs text-terminal-muted hover:text-terminal-accent transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add ticker
            </button>
          )}
        </div>
      </div>
    </Panel>
  );
}
