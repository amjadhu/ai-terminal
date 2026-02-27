import type { DeepDiveTrend } from "@/types";

export const SECTOR_THEMES: Record<
  string,
  { label: string; symbols: string[] }
> = {
  technology: {
    label: "Technology",
    symbols: ["MSFT", "AAPL", "NVDA", "ORCL", "CRM", "ADBE", "INTU", "IBM"],
  },
  cybersecurity: {
    label: "Cybersecurity",
    symbols: ["CRWD", "PANW", "ZS", "OKTA", "FTNT", "S", "CYBR", "CHKP"],
  },
  semiconductors: {
    label: "Semiconductors",
    symbols: ["NVDA", "AMD", "INTC", "TSM", "AVGO", "ASML", "QCOM", "AMAT"],
  },
  fintech: {
    label: "Fintech",
    symbols: ["PYPL", "SQ", "COIN", "SOFI", "AFRM", "INTU", "MA", "V"],
  },
  ai: {
    label: "Artificial Intelligence",
    symbols: ["NVDA", "MSFT", "GOOG", "AMZN", "META", "PLTR", "AMD", "TSM"],
  },
};

export function detectTheme(query: string) {
  const normalized = query.trim().toLowerCase();
  const direct = SECTOR_THEMES[normalized];
  if (direct) return direct;

  const match = Object.entries(SECTOR_THEMES).find(([key]) =>
    normalized.includes(key)
  );
  return match ? match[1] : null;
}

export function buildCompanyTrends(input: {
  weekChangePercent?: number;
  monthChangePercent?: number;
  volume?: number;
  avgVolume?: number;
}): DeepDiveTrend[] {
  const trends: DeepDiveTrend[] = [];
  if (input.weekChangePercent !== undefined) {
    trends.push({
      label: "1W Momentum",
      value: formatPct(input.weekChangePercent),
      tone: toneFromNumber(input.weekChangePercent),
    });
  }
  if (input.monthChangePercent !== undefined) {
    trends.push({
      label: "1M Momentum",
      value: formatPct(input.monthChangePercent),
      tone: toneFromNumber(input.monthChangePercent),
    });
  }
  if (input.volume !== undefined && input.avgVolume !== undefined && input.avgVolume > 0) {
    const ratio = input.volume / input.avgVolume;
    trends.push({
      label: "Volume vs 3M Avg",
      value: `${ratio.toFixed(2)}x`,
      tone: ratio >= 1.2 ? "up" : ratio <= 0.8 ? "down" : "neutral",
    });
  }
  return trends;
}

export function buildSectorTrends(input: {
  breadthPercent: number;
  avgChangePercent: number;
}): DeepDiveTrend[] {
  return [
    {
      label: "Breadth",
      value: `${input.breadthPercent.toFixed(0)}% advancing`,
      tone: input.breadthPercent >= 55 ? "up" : input.breadthPercent <= 45 ? "down" : "neutral",
    },
    {
      label: "Average Move",
      value: formatPct(input.avgChangePercent),
      tone: toneFromNumber(input.avgChangePercent),
    },
  ];
}

function formatPct(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function toneFromNumber(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}
