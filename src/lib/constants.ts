export const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

export const MARKET_INDICES = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^DJI", name: "DOW" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^RUT", name: "Russell 2000" },
  { symbol: "^VIX", name: "VIX" },
];

export const REFETCH_INTERVALS = {
  quote: 30_000,
  market: 60_000,
  news: 300_000,
  chart: 0, // manual refetch
} as const;

export const TIME_RANGE_CONFIG: Record<
  string,
  { interval: string; range: string }
> = {
  "1D": { interval: "5m", range: "1d" },
  "1W": { interval: "15m", range: "5d" },
  "1M": { interval: "1d", range: "1mo" },
  "3M": { interval: "1d", range: "3mo" },
  "1Y": { interval: "1wk", range: "1y" },
  "5Y": { interval: "1mo", range: "5y" },
};
