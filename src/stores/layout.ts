import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PanelLayout } from "@/types";

const DEFAULT_LAYOUT: PanelLayout[] = [
  // Row 1 — full-width macro bar
  { i: "market",       x: 0, y: 0,  w: 12, h: 4,  minW: 8, minH: 3 },
  // Row 2 — watchlist + chart
  { i: "watchlist",    x: 0, y: 4,  w: 3,  h: 9,  minW: 2, minH: 4 },
  { i: "chart",        x: 3, y: 4,  w: 9,  h: 9,  minW: 4, minH: 5 },
  // Row 3 — ticker detail + fundamentals + analyst ratings
  { i: "detail",       x: 0, y: 13, w: 3,  h: 8,  minW: 2, minH: 4 },
  { i: "fundamentals", x: 3, y: 13, w: 5,  h: 8,  minW: 3, minH: 5 },
  { i: "analysts",     x: 8, y: 13, w: 4,  h: 8,  minW: 3, minH: 5 },
  // Row 4 — news + earnings calendar + top movers
  { i: "news",         x: 0, y: 21, w: 4,  h: 8,  minW: 3, minH: 4 },
  { i: "earnings",     x: 4, y: 21, w: 4,  h: 8,  minW: 3, minH: 4 },
  { i: "movers",       x: 8, y: 21, w: 4,  h: 8,  minW: 3, minH: 4 },
  // Row 5 — sector heatmap (full width)
  { i: "sector",       x: 0, y: 29, w: 12, h: 8,  minW: 6, minH: 5 },
  // Row 6 — portfolio + compare
  { i: "portfolio",    x: 0, y: 37, w: 6,  h: 9,  minW: 4, minH: 6 },
  { i: "compare",      x: 6, y: 37, w: 6,  h: 9,  minW: 4, minH: 6 },
  // Row 7 — alerts + screener
  { i: "alerts",       x: 0, y: 46, w: 5,  h: 9,  minW: 4, minH: 6 },
  { i: "screener",     x: 5, y: 46, w: 7,  h: 9,  minW: 5, minH: 6 },
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
      setLayouts: (layouts) => set({ layouts }),
      resetLayouts: () => set({ layouts: DEFAULT_LAYOUT }),
    }),
    // v3: includes research, portfolio, and alerts panels
    { name: "layout-storage-v3" }
  )
);
