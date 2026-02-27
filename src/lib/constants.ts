export const DEFAULT_WATCHLIST = [
  // Indices
  "^DJI",
  "^GSPC",
  "^IXIC",
  "^NYA",
  // Tech & Software
  "AAPL",
  "AMZN",
  "ARM",
  "BILL",
  "BKNG",
  "CRM",
  "CRWD",
  "DDOG",
  "DOCU",
  "ESTC",
  "GOOG",
  "GTLB",
  "IBM",
  "INTC",
  "INTU",
  "META",
  "MSFT",
  "NFLX",
  "NVDA",
  "OKTA",
  "ORCL",
  "PANW",
  "PLTR",
  "RBLX",
  "SHOP",
  "SNOW",
  "TDOC",
  "TMUS",
  // Finance & Payments
  "BAH",
  "COIN",
  "PYPL",
  // Other
  "EA",
  "EBAY",
  "LYFT",
  "RIVN",
  "SBUX",
  "TSLA",
  "UBER",
  "WMT",
  // Crypto
  "BTC-USD",
  "ETH-USD",
];

export const MARKET_INDICES = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^DJI", name: "DOW" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^RUT", name: "Russell 2K" },
  { symbol: "^VIX", name: "VIX" },
];

export const MACRO_GROUPS = [
  {
    label: "INDICES",
    symbols: [
      { symbol: "^GSPC", name: "S&P 500" },
      { symbol: "^DJI", name: "DOW" },
      { symbol: "^IXIC", name: "NASDAQ" },
      { symbol: "^RUT", name: "Russell 2K" },
      { symbol: "^VIX", name: "VIX" },
    ],
  },
  {
    label: "FUTURES",
    symbols: [
      { symbol: "ES=F", name: "S&P Fut" },
      { symbol: "NQ=F", name: "NQ Fut" },
      { symbol: "YM=F", name: "DOW Fut" },
    ],
  },
  {
    label: "BONDS",
    symbols: [
      { symbol: "^TNX", name: "10Y Yield" },
      { symbol: "^TYX", name: "30Y Yield" },
      { symbol: "^FVX", name: "5Y Yield" },
    ],
  },
  {
    label: "COMMODITIES",
    symbols: [
      { symbol: "GC=F", name: "Gold" },
      { symbol: "CL=F", name: "Crude Oil" },
      { symbol: "NG=F", name: "Nat Gas" },
    ],
  },
  {
    label: "FX",
    symbols: [
      { symbol: "EURUSD=X", name: "EUR/USD" },
      { symbol: "GBPUSD=X", name: "GBP/USD" },
      { symbol: "JPY=X", name: "USD/JPY" },
      { symbol: "DX-Y.NYB", name: "DXY" },
    ],
  },
  {
    label: "CRYPTO",
    symbols: [
      { symbol: "BTC-USD", name: "Bitcoin" },
      { symbol: "ETH-USD", name: "Ethereum" },
    ],
  },
];

export const SECTOR_ETFS = [
  { symbol: "XLK", name: "Technology" },
  { symbol: "XLF", name: "Financials" },
  { symbol: "XLV", name: "Health Care" },
  { symbol: "XLY", name: "Cons. Discr." },
  { symbol: "XLC", name: "Comm. Svcs." },
  { symbol: "XLI", name: "Industrials" },
  { symbol: "XLE", name: "Energy" },
  { symbol: "XLP", name: "Cons. Staples" },
  { symbol: "XLRE", name: "Real Estate" },
  { symbol: "XLB", name: "Materials" },
  { symbol: "XLU", name: "Utilities" },
];

export const REFETCH_INTERVALS = {
  quote: 30_000,
  market: 60_000,
  news: 300_000,
  chart: 0, // manual refetch
  fundamentals: 300_000,
  earnings: 300_000,
  analysts: 300_000,
  sectors: 60_000,
  screener: 180_000,
} as const;

export const SCREENER_DEFAULTS = {
  minMarketCap: 10_000_000_000,
  maxPE: 60,
  minRevenueGrowth: 0,
  minVolume: 500_000,
};

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
