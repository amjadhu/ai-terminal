import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PanelLayout } from "@/types";
import { stabilizeLayouts } from "@/lib/layout";

export const DEFAULT_LAYOUT: PanelLayout[] = [
  // Row 1 — full-width macro bar
  { i: "market",       x: 0, y: 0,  w: 12, h: 4,  minW: 8, minH: 3 },
  // Row 2 — full-width market intelligence
  { i: "intel",        x: 0, y: 4,  w: 12, h: 6,  minW: 8, minH: 4 },
  // Row 3 — watchlist (market context)
  { i: "watchlist",    x: 0, y: 10, w: 12, h: 10, minW: 4, minH: 5 },
  // Row 4 — symbol chart + event clock
  { i: "chart",        x: 0, y: 20, w: 8,  h: 10, minW: 5, minH: 6 },
  { i: "calendar",     x: 8, y: 20, w: 4,  h: 10, minW: 3, minH: 5 },
  // Row 5 — ticker detail + fundamentals + analyst ratings
  { i: "detail",       x: 0, y: 30, w: 4,  h: 8,  minW: 3, minH: 5 },
  { i: "fundamentals", x: 4, y: 30, w: 5,  h: 8,  minW: 4, minH: 5 },
  { i: "analysts",     x: 9, y: 30, w: 3,  h: 8,  minW: 3, minH: 5 },
  // Row 6 — news + earnings + top movers
  { i: "news",         x: 0, y: 38, w: 5,  h: 8,  minW: 3, minH: 4 },
  { i: "earnings",     x: 5, y: 38, w: 3,  h: 8,  minW: 3, minH: 4 },
  { i: "movers",       x: 8, y: 38, w: 4,  h: 8,  minW: 3, minH: 4 },
  // Row 7 — sector heatmap (full width)
  { i: "sector",       x: 0, y: 46, w: 12, h: 7,  minW: 6, minH: 5 },
  // Row 8 — portfolio + compare
  { i: "portfolio",    x: 0, y: 53, w: 5,  h: 9,  minW: 4, minH: 6 },
  { i: "compare",      x: 5, y: 53, w: 7,  h: 9,  minW: 5, minH: 6 },
  // Row 9 — alerts + screener
  { i: "alerts",       x: 0, y: 62, w: 4,  h: 9,  minW: 3, minH: 6 },
  { i: "screener",     x: 4, y: 62, w: 8,  h: 9,  minW: 6, minH: 6 },
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
        set({ layouts: stabilizeLayouts(layouts, DEFAULT_LAYOUT) }),
      resetLayouts: () => set({ layouts: DEFAULT_LAYOUT }),
    }),
    {
      // v7: separates market context vs symbol workbench and re-anchors event clock
      name: "layout-storage-v7",
      merge: (persistedState, currentState) => {
        const persistedLayouts = Array.isArray(
          (persistedState as Partial<LayoutStore> | undefined)?.layouts
        )
          ? (persistedState as Partial<LayoutStore>).layouts ?? []
          : [];

        return {
          ...currentState,
          ...(persistedState as object),
          layouts: stabilizeLayouts(persistedLayouts, DEFAULT_LAYOUT),
        };
      },
    }
  )
);
