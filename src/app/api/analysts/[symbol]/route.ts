import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upper = symbol.toUpperCase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary: any = await yahooFinance.quoteSummary(upper, {
      modules: ["financialData", "recommendationTrend"],
    });

    const fd = summary.financialData ?? {};
    const rt = summary.recommendationTrend ?? {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const num = (v: any): number | undefined => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === "number") return v;
      if (typeof v === "object" && "raw" in v) return v.raw;
      return undefined;
    };

    const trend = (rt.trend ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => ({
        period: t.period ?? "",
        strongBuy: t.strongBuy ?? 0,
        buy: t.buy ?? 0,
        hold: t.hold ?? 0,
        sell: t.sell ?? 0,
        strongSell: t.strongSell ?? 0,
      })
    );

    return NextResponse.json({
      symbol: upper,
      recommendationKey: fd.recommendationKey,
      recommendationMean: num(fd.recommendationMean),
      numberOfAnalysts: num(fd.numberOfAnalystOpinions),
      targetHighPrice: num(fd.targetHighPrice),
      targetLowPrice: num(fd.targetLowPrice),
      targetMeanPrice: num(fd.targetMeanPrice),
      targetMedianPrice: num(fd.targetMedianPrice),
      currentPrice: num(fd.currentPrice),
      trend,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analyst data" },
      { status: 500 }
    );
  }
}
