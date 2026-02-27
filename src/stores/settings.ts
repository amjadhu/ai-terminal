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
    { name: "settings-storage" }
  )
);
