import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote: any = await yahooFinance.quote(symbol.toUpperCase());
    return NextResponse.json({
      symbol: quote.symbol,
      shortName: quote.shortName ?? quote.symbol,
      regularMarketPrice: quote.regularMarketPrice ?? 0,
      regularMarketChange: quote.regularMarketChange ?? 0,
      regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
      regularMarketVolume: quote.regularMarketVolume ?? 0,
      marketCap: quote.marketCap,
      trailingPE: quote.trailingPE,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      dividendYield: quote.dividendYield,
      regularMarketOpen: quote.regularMarketOpen,
      regularMarketDayHigh: quote.regularMarketDayHigh,
      regularMarketDayLow: quote.regularMarketDayLow,
      regularMarketPreviousClose: quote.regularMarketPreviousClose,
      averageVolume: quote.averageDailyVolume3Month,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
