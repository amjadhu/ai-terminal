import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_WATCHLIST } from "@/lib/constants";
import { mergeWatchlists } from "@/lib/watchlist";

interface WatchlistStore {
  tickers: string[];
  addTicker: (symbol: string) => void;
  removeTicker: (symbol: string) => void;
  moveTicker: (fromIndex: number, toIndex: number) => void;
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
      moveTicker: (fromIndex, toIndex) =>
        set((state) => {
          if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= state.tickers.length ||
            toIndex >= state.tickers.length ||
            fromIndex === toIndex
          ) {
            return state;
          }

          const next = [...state.tickers];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return { tickers: next };
        }),
    }),
    {
      name: "watchlist-storage",
      merge: (persistedState, currentState) => {
        const persistedTickers = Array.isArray(
          (persistedState as Partial<WatchlistStore> | undefined)?.tickers
        )
          ? (persistedState as Partial<WatchlistStore>).tickers ?? []
          : [];

        const mergedTickers = mergeWatchlists(persistedTickers, DEFAULT_WATCHLIST);

        return {
          ...currentState,
          ...(persistedState as object),
          tickers: mergedTickers,
        };
      },
    }
  )
);
