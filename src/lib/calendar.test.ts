import { buildEventCalendar, buildMacroEstimates } from "@/lib/calendar";
import type { CalendarEvent, EarningsItem } from "@/types";

describe("buildMacroEstimates", () => {
  it("builds three upcoming macro estimates", () => {
    const now = new Date("2026-02-27T12:00:00Z").getTime();
    const events = buildMacroEstimates(now);
    expect(events).toHaveLength(3);
    expect(events.every((e) => e.category === "macro")).toBe(true);
    expect(events.every((e) => e.estimated)).toBe(true);
  });
});

describe("buildEventCalendar", () => {
  it("merges, sorts, and deduplicates event streams", () => {
    const now = new Date("2026-02-27T12:00:00Z").getTime();
    const earnings: EarningsItem[] = [
      { symbol: "AAPL", companyName: "Apple", earningsDate: "2026-03-01" },
    ];
    const custom: CalendarEvent[] = [
      {
        id: "custom-1",
        title: "Investor Day",
        category: "custom",
        impact: "medium",
        timestamp: new Date("2026-02-28T18:00:00Z").getTime(),
        source: "user",
      },
      {
        id: "custom-1",
        title: "Duplicate",
        category: "custom",
        impact: "medium",
        timestamp: new Date("2026-02-28T18:00:00Z").getTime(),
        source: "user",
      },
    ];

    const out = buildEventCalendar(earnings, custom, now);
    expect(out.length).toBeGreaterThanOrEqual(5);
    expect(out[0].timestamp).toBeLessThanOrEqual(out[out.length - 1].timestamp);
    expect(out.filter((e) => e.id === "custom-1")).toHaveLength(1);
    expect(out.some((e) => e.id.startsWith("earnings-AAPL"))).toBe(true);
  });

  it("supports ticker-scoped timelines without macro events", () => {
    const now = new Date("2026-02-27T12:00:00Z").getTime();
    const earnings: EarningsItem[] = [
      { symbol: "AAPL", companyName: "Apple", earningsDate: "2026-03-01" },
      { symbol: "MSFT", companyName: "Microsoft", earningsDate: "2026-03-02" },
    ];
    const custom: CalendarEvent[] = [
      {
        id: "custom-aapl",
        title: "AAPL Product Event",
        category: "custom",
        impact: "medium",
        timestamp: new Date("2026-02-28T18:00:00Z").getTime(),
        source: "user",
        symbol: "AAPL",
      },
      {
        id: "custom-msft",
        title: "MSFT Partner Event",
        category: "custom",
        impact: "medium",
        timestamp: new Date("2026-02-28T20:00:00Z").getTime(),
        source: "user",
        symbol: "MSFT",
      },
    ];

    const out = buildEventCalendar(earnings, custom, now, {
      includeMacro: false,
      symbol: "AAPL",
    });

    expect(out.every((e) => e.category !== "macro")).toBe(true);
    expect(out.every((e) => e.symbol === "AAPL")).toBe(true);
    expect(out.some((e) => e.id.startsWith("earnings-AAPL"))).toBe(true);
    expect(out.some((e) => e.id.startsWith("earnings-MSFT"))).toBe(false);
  });
});
