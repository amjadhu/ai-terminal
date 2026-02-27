"use client";

import { useEffect, useRef } from "react";
import { useWatchlistStore } from "@/stores/watchlist";
import { useSettingsStore } from "@/stores/settings";
import { useLayoutStore } from "@/stores/layout";

export function useServerSync() {
  const hydrated = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const tickers = useWatchlistStore((s) => s.tickers);
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const timeRange = useSettingsStore((s) => s.timeRange);
  const layouts = useLayoutStore((s) => s.layouts);

  // On mount: hydrate all stores from server (server wins over localStorage)
  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((server) => {
        if (server.tickers?.length)
          useWatchlistStore.setState({ tickers: server.tickers });
        if (server.selectedTicker)
          useSettingsStore.setState({ selectedTicker: server.selectedTicker });
        if (server.timeRange)
          useSettingsStore.setState({ timeRange: server.timeRange });
        if (server.layouts?.length)
          useLayoutStore.setState({ layouts: server.layouts });
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  // After hydration: debounce-write to server on any state change
  useEffect(() => {
    if (!hydrated.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers, selectedTicker, timeRange, layouts }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer.current);
  }, [tickers, selectedTicker, timeRange, layouts]);
}
