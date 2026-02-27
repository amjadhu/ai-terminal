import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols") ?? "";
    const symbols = symbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const summary: any = await yahooFinance.quoteSummary(symbol, {
          modules: ["calendarEvents", "earningsTrend", "price"],
        });

        const num = (v: any): number | undefined => {
          if (v === null || v === undefined) return undefined;
          if (typeof v === "number") return v;
          if (typeof v === "object" && "raw" in v) return v.raw;
          return undefined;
        };

        const cal = summary.calendarEvents ?? {};
        const price = summary.price ?? {};
        const trend = summary.earningsTrend ?? {};

        // Next upcoming earnings date
        const rawDates: unknown[] = cal.earnings?.earningsDate ?? [];
        const earningsDates = rawDates
          .map((d) => new Date(d as string | number | Date))
          .filter((d) => !Number.isNaN(d.getTime()))
          .sort((a, b) => a.getTime() - b.getTime());
        const nextDate = earningsDates.find((d) => d >= todayStart);

        // EPS estimate from calendarEvents
        const epsEstimate = num(cal.earnings?.earningsAverage);
        const revenueEstimate = num(cal.earnings?.revenueAverage);

        // Most recent actual EPS from earningsTrend (0q = current quarter, +1q = next)
        const trends: any[] = trend.trend ?? [];
        const currentQTrend = trends.find((t: any) => t.period === "0q");
        const epsActual = num(currentQTrend?.earningsEstimate?.avg);

        return {
          symbol,
          companyName: price.shortName ?? price.longName ?? symbol,
          earningsDate: nextDate ? toIsoDateLocal(nextDate) : undefined,
          epsEstimate,
          revenueEstimate,
          epsActual,
        };
      })
    );

    const all: any[] = results.map((r, i) =>
      r.status === "fulfilled"
        ? r.value
        : { symbol: symbols[i], companyName: symbols[i] }
    );
    const data = all.filter((d) => d.earningsDate); // only include stocks with a known upcoming date

    // Sort by upcoming date ascending
    data.sort((a, b) => {
      if (!a.earningsDate) return 1;
      if (!b.earningsDate) return -1;
      return a.earningsDate.localeCompare(b.earningsDate);
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch earnings data" },
      { status: 500 }
    );
  }
}

function toIsoDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
