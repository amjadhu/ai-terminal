import { useQuery } from "@tanstack/react-query";
import { REFETCH_INTERVALS } from "@/lib/constants";
import type { MarketIndex, StockQuote, NewsItem, ChartDataPoint } from "@/types";

export function useMarketOverview() {
  return useQuery<MarketIndex[]>({
    queryKey: ["market"],
    queryFn: async () => {
      const res = await fetch("/api/market");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: REFETCH_INTERVALS.market,
  });
}

export function useStockQuote(symbol: string) {
  return useQuery<StockQuote>({
    queryKey: ["quote", symbol],
    queryFn: async () => {
      const res = await fetch(`/api/quote/${encodeURIComponent(symbol)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    enabled: !!symbol,
    refetchInterval: REFETCH_INTERVALS.quote,
  });
}

export function useMultiQuote(symbols: string[]) {
  return useQuery<StockQuote[]>({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        symbols.map(async (s) => {
          const res = await fetch(`/api/quote/${encodeURIComponent(s)}`);
          return res.json();
        })
      );
      return results.filter((r) => !r.error);
    },
    enabled: symbols.length > 0,
    refetchInterval: REFETCH_INTERVALS.quote,
  });
}

export function useChartData(symbol: string, range: string) {
  return useQuery<ChartDataPoint[]>({
    queryKey: ["chart", symbol, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/chart/${encodeURIComponent(symbol)}?range=${range}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: !!symbol,
  });
}

export function useNews(symbol?: string) {
  return useQuery<NewsItem[]>({
    queryKey: ["news", symbol ?? "general"],
    queryFn: async () => {
      const url = symbol
        ? `/api/news?symbol=${encodeURIComponent(symbol)}`
        : "/api/news";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: REFETCH_INTERVALS.news,
  });
}

export function useTrending() {
  return useQuery<{ gainers: MarketIndex[]; losers: MarketIndex[] }>({
    queryKey: ["trending"],
    queryFn: async () => {
      const res = await fetch("/api/trending");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    refetchInterval: REFETCH_INTERVALS.market,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.results;
    },
    enabled: query.length >= 1,
  });
}
