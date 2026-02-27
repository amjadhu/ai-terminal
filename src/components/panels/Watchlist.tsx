"use client";

import { useState } from "react";
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
import { Plus, X } from "lucide-react";

export function Watchlist() {
  const { tickers, addTicker, removeTicker } = useWatchlistStore();
  const setSelectedTicker = useSettingsStore((s) => s.setSelectedTicker);
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const { data, isLoading, error, refetch } = useMultiQuote(tickers);
  const [addInput, setAddInput] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (addInput.trim()) {
      addTicker(addInput.trim());
      setAddInput("");
      setShowAdd(false);
    }
  };

  return (
    <Panel
      title="Watchlist"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
    >
      <div className="flex flex-col h-full">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-terminal-muted border-b border-terminal-border">
              <th className="text-left px-3 py-1.5 font-medium">Symbol</th>
              <th className="text-right px-2 py-1.5 font-medium">Price</th>
              <th className="text-right px-2 py-1.5 font-medium">Chg</th>
              <th className="text-right px-2 py-1.5 font-medium">%</th>
              <th className="text-right px-2 py-1.5 font-medium">Vol</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((quote) => (
              <tr
                key={quote.symbol}
                onClick={() => setSelectedTicker(quote.symbol)}
                className={`cursor-pointer hover:bg-terminal-hover transition-colors ${
                  selectedTicker === quote.symbol ? "bg-terminal-hover" : ""
                }`}
              >
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
            ))}
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
