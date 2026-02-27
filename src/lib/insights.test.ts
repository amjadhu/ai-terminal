import { computeMarketRegime, computeWatchlistPriority } from "@/lib/insights";
import type { MacroGroup, SectorData, StockQuote } from "@/types";

describe("computeWatchlistPriority", () => {
  it("marks high-anomaly setups as HOT", () => {
    const quote: StockQuote = {
      symbol: "AAPL",
      shortName: "Apple",
      regularMarketPrice: 198,
      regularMarketChange: 6.5,
      regularMarketChangePercent: 3.9,
      regularMarketVolume: 90_000_000,
      averageVolume: 35_000_000,
      fiftyTwoWeekHigh: 200,
      fiftyTwoWeekLow: 130,
    };

    const insight = computeWatchlistPriority(quote);
    expect(insight.signal).toBe("HOT");
    expect(insight.score).toBeGreaterThanOrEqual(65);
  });
});

describe("computeMarketRegime", () => {
  it("returns risk-on for strong breadth, positive SPX, low VIX", () => {
    const macro: MacroGroup[] = [
      {
        label: "INDICES",
        items: [
          {
            symbol: "^GSPC",
            shortName: "S&P 500",
            regularMarketPrice: 5300,
            regularMarketChange: 65,
            regularMarketChangePercent: 1.24,
          },
          {
            symbol: "^VIX",
            shortName: "VIX",
            regularMarketPrice: 14.2,
            regularMarketChange: -0.3,
            regularMarketChangePercent: -2,
          },
        ],
      },
      {
        label: "BONDS",
        items: [
          {
            symbol: "^TNX",
            shortName: "10Y Yield",
            regularMarketPrice: 4.1,
            regularMarketChange: -0.04,
            regularMarketChangePercent: -0.97,
          },
        ],
      },
    ];
    const sectors: SectorData[] = [
      { symbol: "XLK", name: "Tech", price: 200, change: 1, changePercent: 1 },
      { symbol: "XLF", name: "Fin", price: 200, change: 1, changePercent: 1 },
      { symbol: "XLE", name: "Energy", price: 200, change: 1, changePercent: 1 },
    ];

    const regime = computeMarketRegime(macro, sectors);
    expect(regime.label).toBe("RISK-ON");
  });
});
