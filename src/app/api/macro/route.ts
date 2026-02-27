import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { MACRO_GROUPS } from "@/lib/constants";

export async function GET() {
  try {
    // Flatten all symbols across all groups
    const allSymbols = MACRO_GROUPS.flatMap((g) => g.symbols);

    const results = await Promise.allSettled(
      allSymbols.map(async (item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const q: any = await yahooFinance.quote(item.symbol);
        return {
          symbol: item.symbol,
          shortName: item.name,
          regularMarketPrice: q.regularMarketPrice ?? 0,
          regularMarketChange: q.regularMarketChange ?? 0,
          regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
        };
      })
    );

    // Build grouped response, skipping failed fetches
    let idx = 0;
    const groups = MACRO_GROUPS.map((group) => {
      const items = group.symbols.map(() => {
        const result = results[idx++];
        return result.status === "fulfilled" ? result.value : null;
      }).filter(Boolean);
      return { label: group.label, items };
    });

    return NextResponse.json({ groups });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch macro data" },
      { status: 500 }
    );
  }
}
