import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimeRange } from "@/types";

interface SettingsStore {
  selectedTicker: string;
  timeRange: TimeRange;
  setSelectedTicker: (ticker: string) => void;
  setTimeRange: (range: TimeRange) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      selectedTicker: "AAPL",
      timeRange: "1M",
      setSelectedTicker: (ticker) =>
        set({ selectedTicker: ticker.toUpperCase() }),
      setTimeRange: (range) => set({ timeRange: range }),
    }),
    { name: "settings-storage" }
  )
);
