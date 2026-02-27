import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimeRange } from "@/types";

export type ThemeMode = "dark" | "light";

interface SettingsStore {
  selectedTicker: string;
  selectedTickerSelectionSeq: number;
  timeRange: TimeRange;
  theme: ThemeMode;
  setSelectedTicker: (ticker: string) => void;
  setTimeRange: (range: TimeRange) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      selectedTicker: "AAPL",
      selectedTickerSelectionSeq: 0,
      timeRange: "1M",
      theme: "dark",
      setSelectedTicker: (ticker) =>
        set((state) => ({
          selectedTicker: ticker.toUpperCase(),
          selectedTickerSelectionSeq: state.selectedTickerSelectionSeq + 1,
        })),
      setTimeRange: (range) => set({ timeRange: range }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      // v2: do not persist ephemeral selection sequence; prevents scroll-jump on refresh.
      name: "settings-storage",
      version: 2,
      partialize: (state) => ({
        selectedTicker: state.selectedTicker,
        timeRange: state.timeRange,
        theme: state.theme,
      }),
      migrate: (persistedState) => {
        const data = (persistedState as Partial<SettingsStore> | undefined) ?? {};
        return {
          selectedTicker: data.selectedTicker ?? "AAPL",
          selectedTickerSelectionSeq: 0,
          timeRange: data.timeRange ?? "1M",
          theme: data.theme ?? "dark",
        } as SettingsStore;
      },
    }
  )
);
