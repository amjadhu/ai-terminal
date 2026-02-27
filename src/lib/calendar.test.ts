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
});
