import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    if (!query) {
      return NextResponse.json({ results: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = await yahooFinance.search(query, { newsCount: 0 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = (results.quotes ?? []).slice(0, 8).map((q: any) => ({
      symbol: q.symbol,
      shortname: q.shortname ?? q.symbol,
      exchDisp: q.exchDisp ?? "",
      typeDisp: q.typeDisp ?? "",
    }));
    return NextResponse.json({ results: quotes });
  } catch {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
