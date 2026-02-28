import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimeRange } from "@/types";

export type ThemeMode = "dark" | "light";
export type DashboardMode = "full" | "pro";

interface SettingsStore {
  selectedTicker: string;
  selectedTickerSelectionSeq: number;
  timeRange: TimeRange;
  theme: ThemeMode;
  dashboardMode: DashboardMode;
  proOptionalPanels: string[];
  setSelectedTicker: (ticker: string) => void;
  setTimeRange: (range: TimeRange) => void;
  toggleTheme: () => void;
  setDashboardMode: (mode: DashboardMode) => void;
  toggleProOptionalPanel: (panelId: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      selectedTicker: "AAPL",
      selectedTickerSelectionSeq: 0,
      timeRange: "1M",
      theme: "dark",
      dashboardMode: "full",
      proOptionalPanels: [],
      setSelectedTicker: (ticker) =>
        set((state) => ({
          selectedTicker: ticker.toUpperCase(),
          selectedTickerSelectionSeq: state.selectedTickerSelectionSeq + 1,
        })),
      setTimeRange: (range) => set({ timeRange: range }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setDashboardMode: (mode) => set({ dashboardMode: mode }),
      toggleProOptionalPanel: (panelId) =>
        set((state) => {
          const exists = state.proOptionalPanels.includes(panelId);
          return {
            proOptionalPanels: exists
              ? state.proOptionalPanels.filter((id) => id !== panelId)
              : [...state.proOptionalPanels, panelId],
          };
        }),
    }),
    {
      // v3: persists dashboard mode + pro optional panels, keeps selection sequence ephemeral.
      name: "settings-storage",
      version: 3,
      partialize: (state) => ({
        selectedTicker: state.selectedTicker,
        timeRange: state.timeRange,
        theme: state.theme,
        dashboardMode: state.dashboardMode,
        proOptionalPanels: state.proOptionalPanels,
      }),
      migrate: (persistedState) => {
        const data = (persistedState as Partial<SettingsStore> | undefined) ?? {};
        return {
          selectedTicker: data.selectedTicker ?? "AAPL",
          selectedTickerSelectionSeq: 0,
          timeRange: data.timeRange ?? "1M",
          theme: data.theme ?? "dark",
          dashboardMode: data.dashboardMode ?? "full",
          proOptionalPanels: data.proOptionalPanels ?? [],
        } as SettingsStore;
      },
    }
  )
);
