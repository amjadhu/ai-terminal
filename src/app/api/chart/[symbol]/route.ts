import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { TIME_RANGE_CONFIG } from "@/lib/constants";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "1M";
    const config = TIME_RANGE_CONFIG[range] ?? TIME_RANGE_CONFIG["1M"];

    const result: any = await yahooFinance.chart(symbol.toUpperCase(), {
      period1: getStartDate(config.range),
      interval: config.interval as "1d" | "1wk" | "1mo" | "5m" | "15m",
    });

    const quotes = result.quotes ?? result.indicators?.quote?.[0] ?? [];
    const timestamps = result.timestamp ?? [];

    let data;
    if (Array.isArray(quotes) && quotes.length > 0 && quotes[0]?.date) {
      // Format: array of {date, open, high, low, close, volume}
      data = quotes.map((q: { date: string | Date; open?: number; high?: number; low?: number; close?: number; volume?: number }) => ({
        time: new Date(q.date).toISOString().split("T")[0],
        open: q.open ?? 0,
        high: q.high ?? 0,
        low: q.low ?? 0,
        close: q.close ?? 0,
        volume: q.volume ?? 0,
      }));
    } else if (timestamps.length > 0) {
      // Format: separate arrays
      const opens = quotes.open ?? [];
      const highs = quotes.high ?? [];
      const lows = quotes.low ?? [];
      const closes = quotes.close ?? [];
      const volumes = quotes.volume ?? [];
      data = timestamps.map((t: number, i: number) => ({
        time: new Date(t * 1000).toISOString().split("T")[0],
        open: opens[i] ?? 0,
        high: highs[i] ?? 0,
        low: lows[i] ?? 0,
        close: closes[i] ?? 0,
        volume: volumes[i] ?? 0,
      }));
    } else {
      data = [];
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}

function getStartDate(range: string): Date {
  const now = new Date();
  switch (range) {
    case "1d":
      return new Date(now.setDate(now.getDate() - 1));
    case "5d":
      return new Date(now.setDate(now.getDate() - 7));
    case "1mo":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "3mo":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "5y":
      return new Date(now.setFullYear(now.getFullYear() - 5));
    default:
      return new Date(now.setMonth(now.getMonth() - 1));
  }
}
