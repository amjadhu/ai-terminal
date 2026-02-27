import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { DEFAULT_WATCHLIST } from "@/lib/constants";
import type { ScreenerRow } from "@/types";

function parseNumber(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minMarketCap = parseNumber(searchParams.get("minMarketCap"), 0);
    const maxPE = parseNumber(searchParams.get("maxPE"), Number.POSITIVE_INFINITY);
    const minRevenueGrowth = parseNumber(searchParams.get("minRevenueGrowth"), -1);
    const minVolume = parseNumber(searchParams.get("minVolume"), 0);
    const limit = parseNumber(searchParams.get("limit"), 30);

    const universe = DEFAULT_WATCHLIST.filter(
      (s) => !s.startsWith("^") && !s.endsWith("-USD")
    ).slice(0, 60);

    const rows = await Promise.allSettled(
      universe.map(async (symbol) => {
        const [quote, summary]: any = await Promise.all([
          yahooFinance.quote(symbol),
          yahooFinance.quoteSummary(symbol, {
            modules: ["financialData", "defaultKeyStatistics"],
          }),
        ]);

        const fd = summary.financialData ?? {};
        const ks = summary.defaultKeyStatistics ?? {};
        const row: ScreenerRow = {
          symbol,
          shortName: quote.shortName ?? symbol,
          regularMarketPrice: quote.regularMarketPrice ?? 0,
          regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
          regularMarketVolume: quote.regularMarketVolume ?? 0,
          marketCap: quote.marketCap,
          trailingPE: quote.trailingPE ?? ks.trailingPE?.raw,
          revenueGrowth: fd.revenueGrowth?.raw ?? fd.revenueGrowth,
          grossMargins: fd.grossMargins?.raw ?? fd.grossMargins,
        };
        return row;
      })
    );

    const data = rows
      .flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
      .filter(
        (row) =>
          (row.marketCap ?? 0) >= minMarketCap &&
          (row.trailingPE ?? Number.POSITIVE_INFINITY) <= maxPE &&
          (row.revenueGrowth ?? -1) >= minRevenueGrowth &&
          row.regularMarketVolume >= minVolume
      )
      .sort((a, b) => {
        const growthA = a.revenueGrowth ?? -1;
        const growthB = b.revenueGrowth ?? -1;
        if (growthA !== growthB) return growthB - growthA;
        return b.regularMarketVolume - a.regularMarketVolume;
      })
      .slice(0, Math.max(1, Math.min(100, limit)));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Failed to run screener" },
      { status: 500 }
    );
  }
}
