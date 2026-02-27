"use client";

import { useMemo } from "react";
import { useWatchlistStore } from "@/stores/watchlist";
import { useMultiQuote } from "@/hooks/useMarketData";
import { formatPercent, formatPrice } from "@/lib/utils";

export function RollingTicker() {
  const tickers = useWatchlistStore((s) => s.tickers);
  const symbols = useMemo(() => tickers.slice(0, 40), [tickers]);
  const { data } = useMultiQuote(symbols);

  if (!data || data.length === 0) return null;

  const items = data.map((quote) => ({
    symbol: quote.symbol,
    price: formatPrice(quote.regularMarketPrice),
    change: quote.regularMarketChangePercent,
  }));

  return (
    <div className="hidden lg:block flex-1 min-w-0">
      <div className="ticker-marquee overflow-hidden border border-terminal-border rounded bg-terminal-bg/60">
        <div className="ticker-marquee-track">
          {[...items, ...items].map((item, i) => (
            <span
              key={`${item.symbol}-${i}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono"
            >
              <span className="text-terminal-accent">{item.symbol}</span>
              <span className="text-terminal-text">{item.price}</span>
              <span
                className={
                  item.change >= 0 ? "text-terminal-up" : "text-terminal-down"
                }
              >
                {formatPercent(item.change)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
