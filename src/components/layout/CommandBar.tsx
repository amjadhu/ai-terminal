"use client";

import { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/stores/settings";
import { useWatchlistStore } from "@/stores/watchlist";
import { useSearch } from "@/hooks/useMarketData";
import { Search } from "lucide-react";
import type { SearchResult } from "@/types";

export function CommandBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const setSelectedTicker = useSettingsStore((s) => s.setSelectedTicker);
  const addTicker = useWatchlistStore((s) => s.addTicker);
  const { data: results } = useSearch(query);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectSymbol = (symbol: string) => {
    setSelectedTicker(symbol);
    addTicker(symbol);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (results && results.length > 0) {
        selectSymbol(results[selectedIndex]?.symbol ?? query.toUpperCase());
      } else if (query.trim()) {
        selectSymbol(query.trim().toUpperCase());
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, (results?.length ?? 1) - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
  };

  return (
    <div className="relative px-4 py-2 border-b border-terminal-border bg-terminal-panel">
      <div className="flex items-center gap-2 bg-terminal-bg border border-terminal-border rounded px-3 py-1.5">
        <Search className="w-4 h-4 text-terminal-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder='Search ticker... (press "/" to focus)'
          className="flex-1 bg-transparent text-sm font-mono text-terminal-text placeholder-terminal-muted focus:outline-none"
        />
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-terminal-muted border border-terminal-border rounded">
          /
        </kbd>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1 px-1">
        <JumpChip label="Macro" onClick={() => jumpTo("market-pulse")} />
        <JumpChip label="Watchlist" onClick={() => jumpTo("watchlist-focus")} />
        <JumpChip label="Workbench" onClick={() => jumpTo("symbol-workbench")} />
        <JumpChip label="Tools" onClick={() => jumpTo("tools-lab")} />
      </div>

      {isOpen && results && results.length > 0 && (
        <div className="absolute left-4 right-4 mt-1 bg-terminal-panel border border-terminal-border rounded-lg shadow-xl z-50 max-h-64 overflow-auto">
          {results.map((result: SearchResult, i: number) => (
            <button
              key={result.symbol}
              onMouseDown={() => selectSymbol(result.symbol)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-terminal-hover transition-colors ${
                i === selectedIndex ? "bg-terminal-hover" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-terminal-accent">
                  {result.symbol}
                </span>
                <span className="text-terminal-text truncate max-w-[200px]">
                  {result.shortname}
                </span>
              </div>
              <span className="text-terminal-muted">{result.exchDisp}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function JumpChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-0.5 rounded border border-terminal-border text-[10px] font-mono text-terminal-muted hover:text-terminal-text hover:bg-terminal-hover transition-colors"
    >
      {label}
    </button>
  );
}
