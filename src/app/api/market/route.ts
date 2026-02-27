import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { MARKET_INDICES } from "@/lib/constants";

export async function GET() {
  try {
    const results = await Promise.all(
      MARKET_INDICES.map(async (idx) => {
        const q: any = await yahooFinance.quote(idx.symbol);
        return {
          symbol: q.symbol,
          shortName: idx.name,
          regularMarketPrice: q.regularMarketPrice ?? 0,
          regularMarketChange: q.regularMarketChange ?? 0,
          regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
        };
      })
    );

    return NextResponse.json({ data: results });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
