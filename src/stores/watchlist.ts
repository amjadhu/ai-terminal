import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_WATCHLIST } from "@/lib/constants";

interface WatchlistStore {
  tickers: string[];
  addTicker: (symbol: string) => void;
  removeTicker: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set) => ({
      tickers: DEFAULT_WATCHLIST,
      addTicker: (symbol) =>
        set((state) => {
          const upper = symbol.toUpperCase();
          if (state.tickers.includes(upper)) return state;
          return { tickers: [...state.tickers, upper] };
        }),
      removeTicker: (symbol) =>
        set((state) => ({
          tickers: state.tickers.filter((t) => t !== symbol.toUpperCase()),
        })),
    }),
    {
      name: "watchlist-storage",
      merge: (persistedState, currentState) => {
        const persistedTickers = Array.isArray(
          (persistedState as Partial<WatchlistStore> | undefined)?.tickers
        )
          ? (persistedState as Partial<WatchlistStore>).tickers ?? []
          : [];

        const mergedTickers = [
          ...new Set([
            ...DEFAULT_WATCHLIST,
            ...persistedTickers.map((t) => t.toUpperCase()),
          ]),
        ];

        return {
          ...currentState,
          ...(persistedState as object),
          tickers: mergedTickers,
        };
      },
    }
  )
);
