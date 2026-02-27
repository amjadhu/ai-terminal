import { useQuery } from "@tanstack/react-query";
import { REFETCH_INTERVALS } from "@/lib/constants";
import type {
  MarketIndex,
  MacroGroup,
  StockQuote,
  NewsItem,
  ChartDataPoint,
  FundamentalsData,
  EarningsItem,
  AnalystData,
  SectorData,
  ScreenerRow,
  DeepDiveData,
} from "@/types";

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

export function useMacroData() {
  return useQuery<MacroGroup[]>({
    queryKey: ["macro"],
    queryFn: async () => {
      const res = await fetch("/api/macro");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.groups;
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

export function useFundamentals(symbol: string) {
  return useQuery<FundamentalsData>({
    queryKey: ["fundamentals", symbol],
    queryFn: async () => {
      const res = await fetch(
        `/api/fundamentals/${encodeURIComponent(symbol)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    enabled: !!symbol,
    refetchInterval: REFETCH_INTERVALS.fundamentals,
  });
}

export function useEarnings(symbols: string[]) {
  return useQuery<EarningsItem[]>({
    queryKey: ["earnings", symbols.join(",")],
    queryFn: async () => {
      const res = await fetch(
        `/api/earnings?symbols=${encodeURIComponent(symbols.join(","))}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: symbols.length > 0,
    refetchInterval: REFETCH_INTERVALS.earnings,
  });
}

export function useAnalysts(symbol: string) {
  return useQuery<AnalystData>({
    queryKey: ["analysts", symbol],
    queryFn: async () => {
      const res = await fetch(
        `/api/analysts/${encodeURIComponent(symbol)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    enabled: !!symbol,
    refetchInterval: REFETCH_INTERVALS.analysts,
  });
}

export function useSectors() {
  return useQuery<SectorData[]>({
    queryKey: ["sectors"],
    queryFn: async () => {
      const res = await fetch("/api/sectors");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: REFETCH_INTERVALS.sectors,
  });
}

export function useScreener(params: {
  minMarketCap?: number;
  maxPE?: number;
  minRevenueGrowth?: number;
  minVolume?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 0) {
      search.set(key, String(value));
    }
  });

  return useQuery<ScreenerRow[]>({
    queryKey: ["screener", search.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/screener?${search.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: REFETCH_INTERVALS.screener,
  });
}

export function useDeepDive(query: string) {
  return useQuery<DeepDiveData>({
    queryKey: ["deep-dive", query],
    queryFn: async () => {
      const res = await fetch(`/api/deep-dive?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: query.trim().length > 0,
    refetchInterval: REFETCH_INTERVALS.news,
  });
}
