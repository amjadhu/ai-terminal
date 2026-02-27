import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { SECTOR_ETFS } from "@/lib/constants";

export async function GET() {
  try {
    const results = await Promise.allSettled(
      SECTOR_ETFS.map(async (etf) => {
        const q: any = await yahooFinance.quote(etf.symbol);
        return {
          symbol: etf.symbol,
          name: etf.name,
          price: q.regularMarketPrice ?? 0,
          change: q.regularMarketChange ?? 0,
          changePercent: q.regularMarketChangePercent ?? 0,
        };
      })
    );

    const data = results
      .map((r, i) =>
        r.status === "fulfilled"
          ? r.value
          : {
              symbol: SECTOR_ETFS[i].symbol,
              name: SECTOR_ETFS[i].name,
              price: 0,
              change: 0,
              changePercent: 0,
            }
      );

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch sector data" },
      { status: 500 }
    );
  }
}
