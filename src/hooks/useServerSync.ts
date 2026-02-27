"use client";

import { useEffect, useRef } from "react";
import { useWatchlistStore } from "@/stores/watchlist";
import { useSettingsStore } from "@/stores/settings";
import { useLayoutStore } from "@/stores/layout";

export function useServerSync() {
  const skipCount = useRef(1); // skip first effect run (mount) + hydration run
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
        let didUpdate = false;
        if (server.tickers?.length) {
          useWatchlistStore.setState({ tickers: server.tickers });
          didUpdate = true;
        }
        if (server.selectedTicker) {
          useSettingsStore.setState({ selectedTicker: server.selectedTicker });
          didUpdate = true;
        }
        if (server.timeRange) {
          useSettingsStore.setState({ timeRange: server.timeRange });
          didUpdate = true;
        }
        if (server.layouts?.length) {
          useLayoutStore.setState({ layouts: server.layouts });
          didUpdate = true;
        }
        if (didUpdate) skipCount.current++;
      })
      .catch(console.error);
  }, []);

  // Debounce-write on any state change, skipping mount and hydration runs
  useEffect(() => {
    if (skipCount.current > 0) {
      skipCount.current--;
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers, selectedTicker, timeRange, layouts }),
      }).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer.current);
  }, [tickers, selectedTicker, timeRange, layouts]);
}
