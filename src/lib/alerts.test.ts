import { alertRuleLabel, evaluateAlert } from "@/lib/alerts";
import type { AlertRule, StockQuote } from "@/types";

const quote: StockQuote = {
  symbol: "AAPL",
  shortName: "Apple",
  regularMarketPrice: 210,
  regularMarketChange: 3,
  regularMarketChangePercent: 1.45,
  regularMarketVolume: 22_000_000,
};

describe("evaluateAlert", () => {
  it("evaluates price threshold rules", () => {
    const rule: AlertRule = {
      id: "1",
      symbol: "AAPL",
      metric: "price",
      operator: "gte",
      threshold: 200,
      enabled: true,
    };
    expect(evaluateAlert(rule, quote)).toBe(true);
  });

  it("returns false when symbol mismatch or disabled", () => {
    const rule: AlertRule = {
      id: "1",
      symbol: "MSFT",
      metric: "price",
      operator: "gte",
      threshold: 200,
      enabled: true,
    };
    expect(evaluateAlert(rule, quote)).toBe(false);
    expect(evaluateAlert({ ...rule, symbol: "AAPL", enabled: false }, quote)).toBe(false);
  });
});

describe("alertRuleLabel", () => {
  it("builds readable labels", () => {
    const rule: AlertRule = {
      id: "1",
      symbol: "AAPL",
      metric: "changePercent",
      operator: "lte",
      threshold: -3,
      enabled: true,
    };
    expect(alertRuleLabel(rule)).toContain("AAPL");
    expect(alertRuleLabel(rule)).toContain("<=");
  });
});
