import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET() {
  try {
    const trending = await yahooFinance.trendingSymbols("US", { count: 10 });
    const symbols = trending.quotes.map((q: { symbol: string }) => q.symbol);

    // Fetch quotes for each trending symbol
    const quotes = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const q: any = await yahooFinance.quote(symbol);
          return {
            symbol: q.symbol,
            shortName: q.shortName ?? q.symbol,
            regularMarketPrice: q.regularMarketPrice ?? 0,
            regularMarketChange: q.regularMarketChange ?? 0,
            regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
          };
        } catch {
          return null;
        }
      })
    );

    const valid = quotes.filter(Boolean);
    const gainers = valid
      .filter((q) => q!.regularMarketChangePercent >= 0)
      .sort((a, b) => b!.regularMarketChangePercent - a!.regularMarketChangePercent);
    const losers = valid
      .filter((q) => q!.regularMarketChangePercent < 0)
      .sort((a, b) => a!.regularMarketChangePercent - b!.regularMarketChangePercent);

    return NextResponse.json({ gainers, losers });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch trending data" },
      { status: 500 }
    );
  }
}
