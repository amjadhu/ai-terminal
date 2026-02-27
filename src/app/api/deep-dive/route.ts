import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { enrichNewsItem } from "@/lib/news";
import {
  buildCompanyTrends,
  buildSectorTrends,
  detectTheme,
} from "@/lib/deep-dive";
import type { DeepDiveData } from "@/types";

function asNumber(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "raw" in (v as Record<string, unknown>)) {
    const raw = (v as { raw?: unknown }).raw;
    return typeof raw === "number" ? raw : undefined;
  }
  return undefined;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") ?? "").trim();
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const theme = detectTheme(query);
    const data = theme
      ? await buildSectorDeepDive(query, theme.label, theme.symbols)
      : await buildCompanyDeepDive(query);

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Failed to build deep dive" },
      { status: 500 }
    );
  }
}

async function buildCompanyDeepDive(query: string): Promise<DeepDiveData> {
  const search = await yahooFinance.search(query, { quotesCount: 6, newsCount: 12 });
  const firstQuote = (search.quotes ?? [])[0];
  const symbol = (firstQuote?.symbol ?? query).toUpperCase();

  const [quote, chart, summary, newsSearch] = await Promise.all([
    yahooFinance.quote(symbol),
    yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      interval: "1d",
    }),
    yahooFinance.quoteSummary(symbol, {
      modules: ["financialData", "defaultKeyStatistics"],
    }),
    yahooFinance.search(symbol, { quotesCount: 0, newsCount: 15 }),
  ]);

  const quotes = (chart as { quotes?: Array<{ close?: number }> }).quotes ?? [];
  const latestClose = quotes[quotes.length - 1]?.close ?? quote.regularMarketPrice ?? 0;
  const weekAgoClose = quotes[Math.max(0, quotes.length - 6)]?.close ?? latestClose;
  const monthAgoClose = quotes[Math.max(0, quotes.length - 21)]?.close ?? latestClose;
  const weekChangePercent =
    weekAgoClose > 0 ? ((latestClose - weekAgoClose) / weekAgoClose) * 100 : 0;
  const monthChangePercent =
    monthAgoClose > 0 ? ((latestClose - monthAgoClose) / monthAgoClose) * 100 : 0;

  const relatedSymbols = ((search.quotes ?? []) as Array<{ symbol?: string }>)
    .map((q) => q.symbol)
    .filter((s, i, arr): s is string => typeof s === "string" && arr.indexOf(s) === i)
    .slice(0, 8);

  const news = ((newsSearch.news ?? []) as Array<{
    title: string;
    link: string;
    publisher: string;
    providerPublishTime: string | number | Date;
  }>)
    .map((n) =>
      enrichNewsItem({
        title: n.title,
        link: n.link,
        publisher: n.publisher,
        providerPublishTime: new Date(n.providerPublishTime).getTime(),
      })
    )
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 12);

  const keyStats = (summary as { defaultKeyStatistics?: Record<string, unknown> }).defaultKeyStatistics ?? {};

  return {
    type: "company",
    query,
    symbol,
    name: (quote.shortName as string | undefined) ?? symbol,
    price: quote.regularMarketPrice ?? 0,
    changePercent: quote.regularMarketChangePercent ?? 0,
    marketCap: asNumber(quote.marketCap) ?? asNumber(keyStats.marketCap),
    trailingPE: asNumber(quote.trailingPE) ?? asNumber(keyStats.trailingPE),
    volume: quote.regularMarketVolume,
    avgVolume: asNumber(quote.averageDailyVolume3Month),
    trends: buildCompanyTrends({
      weekChangePercent,
      monthChangePercent,
      volume: quote.regularMarketVolume,
      avgVolume: asNumber(quote.averageDailyVolume3Month),
    }),
    relatedSymbols,
    news,
  };
}

async function buildSectorDeepDive(
  query: string,
  label: string,
  symbols: string[]
): Promise<DeepDiveData> {
  const quoteResults = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const q = await yahooFinance.quote(symbol);
      return {
        symbol,
        changePercent: q.regularMarketChangePercent ?? 0,
      };
    })
  );
  const quotes = quoteResults
    .flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));

  const sorted = quotes.slice().sort((a, b) => b.changePercent - a.changePercent);
  const leaders = sorted.slice(0, 5);
  const laggards = sorted.slice(-5).reverse();
  const breadthPercent =
    quotes.length > 0
      ? (quotes.filter((q) => q.changePercent >= 0).length / quotes.length) * 100
      : 0;
  const avgChangePercent =
    quotes.length > 0
      ? quotes.reduce((sum, q) => sum + q.changePercent, 0) / quotes.length
      : 0;

  let news: ReturnType<typeof enrichNewsItem>[] = [];
  try {
    const newsSearch = await yahooFinance.search(query, {
      quotesCount: 0,
      newsCount: 18,
    });
    news = ((newsSearch.news ?? []) as Array<{
      title: string;
      link: string;
      publisher: string;
      providerPublishTime: string | number | Date;
    }>)
      .map((n) =>
        enrichNewsItem({
          title: n.title,
          link: n.link,
          publisher: n.publisher,
          providerPublishTime: new Date(n.providerPublishTime).getTime(),
        })
      )
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 12);
  } catch {
    news = [];
  }

  return {
    type: "sector",
    query,
    sector: label,
    breadthPercent,
    avgChangePercent,
    leaders,
    laggards,
    symbols: quotes.length > 0 ? quotes.map((q) => q.symbol) : symbols,
    trends: buildSectorTrends({ breadthPercent, avgChangePercent }),
    news,
  };
}
