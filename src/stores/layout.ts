import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PanelLayout } from "@/types";
import { mergePanelLayouts } from "@/lib/layout";

export const DEFAULT_LAYOUT: PanelLayout[] = [
  // Row 1 — full-width macro bar
  { i: "market",       x: 0, y: 0,  w: 12, h: 4,  minW: 8, minH: 3 },
  // Row 2 — full-width market intelligence
  { i: "intel",        x: 0, y: 4,  w: 12, h: 6,  minW: 8, minH: 4 },
  // Row 3 — watchlist + chart + event clock
  { i: "watchlist",    x: 0, y: 10, w: 3,  h: 10, minW: 3, minH: 5 },
  { i: "chart",        x: 3, y: 10, w: 6,  h: 10, minW: 5, minH: 6 },
  { i: "calendar",     x: 9, y: 10, w: 3,  h: 10, minW: 3, minH: 5 },
  // Row 4 — ticker detail + fundamentals + analyst ratings
  { i: "detail",       x: 0, y: 20, w: 4,  h: 8,  minW: 3, minH: 5 },
  { i: "fundamentals", x: 4, y: 20, w: 5,  h: 8,  minW: 4, minH: 5 },
  { i: "analysts",     x: 9, y: 20, w: 3,  h: 8,  minW: 3, minH: 5 },
  // Row 5 — news + earnings + top movers
  { i: "news",         x: 0, y: 28, w: 5,  h: 8,  minW: 3, minH: 4 },
  { i: "earnings",     x: 5, y: 28, w: 3,  h: 8,  minW: 3, minH: 4 },
  { i: "movers",       x: 8, y: 28, w: 4,  h: 8,  minW: 3, minH: 4 },
  // Row 6 — sector heatmap (full width)
  { i: "sector",       x: 0, y: 36, w: 12, h: 7,  minW: 6, minH: 5 },
  // Row 7 — portfolio + compare
  { i: "portfolio",    x: 0, y: 43, w: 5,  h: 9,  minW: 4, minH: 6 },
  { i: "compare",      x: 5, y: 43, w: 7,  h: 9,  minW: 5, minH: 6 },
  // Row 8 — alerts + screener
  { i: "alerts",       x: 0, y: 52, w: 4,  h: 9,  minW: 3, minH: 6 },
  { i: "screener",     x: 4, y: 52, w: 8,  h: 9,  minW: 6, minH: 6 },
];

interface LayoutStore {
  layouts: PanelLayout[];
  setLayouts: (layouts: PanelLayout[]) => void;
  resetLayouts: () => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      layouts: DEFAULT_LAYOUT,
      setLayouts: (layouts) =>
        set({ layouts: mergePanelLayouts(layouts, DEFAULT_LAYOUT) }),
      resetLayouts: () => set({ layouts: DEFAULT_LAYOUT }),
    }),
    {
      // v6: adds event clock panel to the core workflow
      name: "layout-storage-v6",
      merge: (persistedState, currentState) => {
        const persistedLayouts = Array.isArray(
          (persistedState as Partial<LayoutStore> | undefined)?.layouts
        )
          ? (persistedState as Partial<LayoutStore>).layouts ?? []
          : [];

        return {
          ...currentState,
          ...(persistedState as object),
          layouts: mergePanelLayouts(persistedLayouts, DEFAULT_LAYOUT),
        };
      },
    }
  )
);
