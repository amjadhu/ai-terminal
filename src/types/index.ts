export interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap?: number;
  trailingPE?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  dividendYield?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketPreviousClose?: number;
  averageVolume?: number;
}

export interface MarketIndex {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

export interface MacroGroup {
  label: string;
  items: MarketIndex[];
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  title: string;
  link: string;
  publisher: string;
  providerPublishTime: number;
  thumbnail?: string;
  catalystTags: CatalystTag[];
  impactScore: number;
}

export type CatalystTag =
  | "earnings"
  | "m&a"
  | "analyst"
  | "macro"
  | "product"
  | "regulatory"
  | "other";

export interface SearchResult {
  symbol: string;
  shortname: string;
  exchDisp: string;
  typeDisp: string;
}

export type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";

export interface PanelLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

// ─── Fundamentals ────────────────────────────────────────────────────────────

export interface IncomeStatement {
  date: string;
  totalRevenue?: number;
  grossProfit?: number;
  operatingIncome?: number;
  netIncome?: number;
}

export interface BalanceSheet {
  date: string;
  totalAssets?: number;
  totalLiabilities?: number;
  stockholderEquity?: number;
  cash?: number;
  totalDebt?: number;
}

export interface CashFlowStatement {
  date: string;
  operatingCashFlow?: number;
  investingCashFlow?: number;
  financingCashFlow?: number;
  capitalExpenditures?: number;
  freeCashFlow?: number;
}

export interface FundamentalsData {
  // TTM / financial health
  totalRevenue?: number;
  revenueGrowth?: number;
  grossMargins?: number;
  operatingMargins?: number;
  profitMargins?: number;
  ebitda?: number;
  netIncome?: number;
  freeCashflow?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  // Valuation
  enterpriseValue?: number;
  priceToBook?: number;
  enterpriseToRevenue?: number;
  enterpriseToEbitda?: number;
  beta?: number;
  trailingEps?: number;
  forwardEps?: number;
  pegRatio?: number;
  // Historical
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlows: CashFlowStatement[];
}

// ─── Earnings ────────────────────────────────────────────────────────────────

export interface EarningsItem {
  symbol: string;
  companyName: string;
  earningsDate?: string;
  epsEstimate?: number;
  epsActual?: number;
  epsSurprise?: number;
  epsSurprisePercent?: number;
  revenueEstimate?: number;
}

// ─── Analysts ────────────────────────────────────────────────────────────────

export interface AnalystTrendItem {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface AnalystData {
  symbol: string;
  recommendationKey?: string;
  recommendationMean?: number;
  numberOfAnalysts?: number;
  targetHighPrice?: number;
  targetLowPrice?: number;
  targetMeanPrice?: number;
  targetMedianPrice?: number;
  currentPrice?: number;
  trend: AnalystTrendItem[];
}

// ─── Sectors ─────────────────────────────────────────────────────────────────

export interface SectorData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface PortfolioSnapshot {
  marketValue: number;
  costBasis: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertMetric = "price" | "changePercent" | "volume";
export type AlertOperator = "gte" | "lte";

export interface AlertRule {
  id: string;
  symbol: string;
  metric: AlertMetric;
  operator: AlertOperator;
  threshold: number;
  enabled: boolean;
  lastTriggeredAt?: number;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  symbol: string;
  message: string;
  triggeredAt: number;
}

// ─── Screener ────────────────────────────────────────────────────────────────

export interface ScreenerRow {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap?: number;
  trailingPE?: number;
  revenueGrowth?: number;
  grossMargins?: number;
}

// ─── Insights ────────────────────────────────────────────────────────────────

export type WatchlistSignal = "HOT" | "WATCH" | "CALM";

export interface WatchlistPriorityInsight {
  score: number;
  signal: WatchlistSignal;
  reasons: string[];
}

export interface MarketRegime {
  score: number;
  label: "RISK-ON" | "MIXED" | "RISK-OFF";
  confidence: number;
  breadthPercent: number;
  vix?: number;
  spxChangePercent?: number;
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export type CalendarCategory = "macro" | "earnings" | "custom";
export type EventImpact = "high" | "medium" | "low";

export interface CalendarEvent {
  id: string;
  title: string;
  category: CalendarCategory;
  impact: EventImpact;
  timestamp: number;
  symbol?: string;
  estimated?: boolean;
  source: "system" | "user";
}

// ─── Deep Dive ───────────────────────────────────────────────────────────────

export interface DeepDiveNewsItem {
  title: string;
  link: string;
  publisher: string;
  providerPublishTime: number;
  impactScore: number;
  catalystTags: CatalystTag[];
}

export interface DeepDiveTrend {
  label: string;
  value: string;
  tone: "up" | "down" | "neutral";
}

export interface DeepDiveCompanyData {
  type: "company";
  query: string;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap?: number;
  trailingPE?: number;
  volume?: number;
  avgVolume?: number;
  trends: DeepDiveTrend[];
  relatedSymbols: string[];
  news: DeepDiveNewsItem[];
}

export interface DeepDiveSectorData {
  type: "sector";
  query: string;
  sector: string;
  breadthPercent: number;
  avgChangePercent: number;
  leaders: Array<{ symbol: string; changePercent: number }>;
  laggards: Array<{ symbol: string; changePercent: number }>;
  symbols: string[];
  trends: DeepDiveTrend[];
  news: DeepDiveNewsItem[];
}

export type DeepDiveData = DeepDiveCompanyData | DeepDiveSectorData;
