import type { CatalystTag, NewsItem } from "@/types";

const CATALYST_KEYWORDS: Array<{ tag: CatalystTag; patterns: RegExp[] }> = [
  { tag: "earnings", patterns: [/\bearnings?\b/i, /\bEPS\b/i, /\bguidance\b/i] },
  { tag: "m&a", patterns: [/\bacqui(sition|re|res)\b/i, /\bmerger\b/i, /\btakeover\b/i] },
  { tag: "analyst", patterns: [/\bupgrad(e|ed|es)\b/i, /\bdowngrad(e|ed|es)\b/i, /\bprice target\b/i] },
  { tag: "macro", patterns: [/\binflation\b/i, /\bjobs report\b/i, /\brate cut\b/i, /\bfed\b/i] },
  { tag: "product", patterns: [/\blaunch\b/i, /\bproduct\b/i, /\bpartnership\b/i] },
  { tag: "regulatory", patterns: [/\blawsuit\b/i, /\bprobe\b/i, /\bregulator(y)?\b/i] },
];

const IMPACT_WEIGHTS: Record<CatalystTag, number> = {
  earnings: 35,
  "m&a": 30,
  analyst: 20,
  macro: 18,
  product: 12,
  regulatory: 22,
  other: 8,
};

export function classifyNewsCatalysts(title: string): CatalystTag[] {
  const matched = CATALYST_KEYWORDS.filter((group) =>
    group.patterns.some((pattern) => pattern.test(title))
  ).map((group) => group.tag);
  return matched.length > 0 ? matched : ["other"];
}

export function computeNewsImpactScore(
  title: string,
  providerPublishTime: number
): number {
  const tags = classifyNewsCatalysts(title);
  const base = tags.reduce((sum, tag) => sum + IMPACT_WEIGHTS[tag], 0);
  const ageMinutes = Math.max(0, (Date.now() - providerPublishTime) / 60_000);
  const recencyPenalty = Math.min(40, ageMinutes / 30);
  return Math.max(1, Math.round(base - recencyPenalty));
}

export function enrichNewsItem(
  item: Omit<NewsItem, "catalystTags" | "impactScore">
): NewsItem {
  return {
    ...item,
    catalystTags: classifyNewsCatalysts(item.title),
    impactScore: computeNewsImpactScore(item.title, item.providerPublishTime),
  };
}
