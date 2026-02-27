import type { AlertRule, StockQuote } from "@/types";

export function evaluateAlert(rule: AlertRule, quote: StockQuote): boolean {
  if (!rule.enabled || rule.symbol !== quote.symbol) return false;

  const value = getMetricValue(rule.metric, quote);
  if (value === undefined) return false;

  return rule.operator === "gte" ? value >= rule.threshold : value <= rule.threshold;
}

function getMetricValue(
  metric: AlertRule["metric"],
  quote: StockQuote
): number | undefined {
  switch (metric) {
    case "price":
      return quote.regularMarketPrice;
    case "changePercent":
      return quote.regularMarketChangePercent;
    case "volume":
      return quote.regularMarketVolume;
    default:
      return undefined;
  }
}

export function alertRuleLabel(rule: AlertRule): string {
  const metric =
    rule.metric === "price"
      ? "Price"
      : rule.metric === "changePercent"
      ? "% Change"
      : "Volume";
  const op = rule.operator === "gte" ? ">=" : "<=";
  return `${rule.symbol} ${metric} ${op} ${rule.threshold}`;
}
