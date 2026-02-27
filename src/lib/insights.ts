import type {
  MacroGroup,
  MarketRegime,
  SectorData,
  StockQuote,
  WatchlistPriorityInsight,
} from "@/types";

export function computeWatchlistPriority(
  quote: StockQuote
): WatchlistPriorityInsight {
  const reasons: string[] = [];
  const absMove = Math.abs(quote.regularMarketChangePercent);
  const movementScore = clamp(absMove * 8, 0, 40);
  if (absMove >= 2) reasons.push(`Large move (${absMove.toFixed(2)}%)`);

  const volumeRatio =
    quote.averageVolume && quote.averageVolume > 0
      ? quote.regularMarketVolume / quote.averageVolume
      : 1;
  const volumeScore = clamp((volumeRatio - 1) * 20, 0, 30);
  if (volumeRatio >= 1.5) reasons.push(`Unusual volume (${volumeRatio.toFixed(1)}x)`);

  let edgeScore = 0;
  if (
    quote.fiftyTwoWeekHigh &&
    quote.fiftyTwoWeekLow &&
    quote.fiftyTwoWeekHigh > quote.fiftyTwoWeekLow
  ) {
    const range = quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow;
    const fromHigh = (quote.fiftyTwoWeekHigh - quote.regularMarketPrice) / range;
    const fromLow = (quote.regularMarketPrice - quote.fiftyTwoWeekLow) / range;
    const edgeDistance = Math.min(fromHigh, fromLow);
    if (edgeDistance < 0.15) {
      edgeScore = clamp((0.15 - edgeDistance) * 130, 0, 20);
      reasons.push("Near 52W edge");
    }
  }

  const score = Math.round(clamp(movementScore + volumeScore + edgeScore, 0, 100));
  const signal = score >= 65 ? "HOT" : score >= 35 ? "WATCH" : "CALM";
  if (reasons.length === 0) reasons.push("No major anomaly");

  return { score, signal, reasons };
}

export function computeMarketRegime(
  macro: MacroGroup[] = [],
  sectors: SectorData[] = []
): MarketRegime {
  const allMacroItems = macro.flatMap((g) => g.items);
  const vix = allMacroItems.find((i) => i.symbol === "^VIX")?.regularMarketPrice;
  const spxChangePercent = allMacroItems.find(
    (i) => i.symbol === "^GSPC"
  )?.regularMarketChangePercent;
  const tnxChangePercent = allMacroItems.find(
    (i) => i.symbol === "^TNX"
  )?.regularMarketChangePercent;

  const upSectors = sectors.filter((s) => s.changePercent >= 0).length;
  const breadthPercent = sectors.length > 0 ? (upSectors / sectors.length) * 100 : 50;

  let score = 50;
  if (spxChangePercent !== undefined) score += spxChangePercent * 4.5;
  score += (breadthPercent - 50) * 0.45;
  if (vix !== undefined) score -= Math.max(0, vix - 18) * 2.2;
  if (tnxChangePercent !== undefined) score += tnxChangePercent < 0 ? 6 : -4;
  score = clamp(score, 0, 100);

  const label = score >= 65 ? "RISK-ON" : score <= 35 ? "RISK-OFF" : "MIXED";

  const evidenceCount =
    Number(vix !== undefined) +
    Number(spxChangePercent !== undefined) +
    Number(tnxChangePercent !== undefined) +
    Number(sectors.length > 0);
  const confidence = clamp(Math.round((evidenceCount / 4) * 100), 30, 100);

  return {
    score: Math.round(score),
    label,
    confidence,
    breadthPercent: Math.round(breadthPercent),
    vix,
    spxChangePercent,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
