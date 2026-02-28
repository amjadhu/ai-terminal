import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PanelLayout } from "@/types";
import { stabilizeLayouts } from "@/lib/layout";

export const DEFAULT_LAYOUT: PanelLayout[] = [
  // Row 1 — macro pulse
  { i: "market",       x: 0, y: 0,  w: 12, h: 4,  minW: 8, minH: 3 },
  // Row 2 — regime + breadth + catalysts
  { i: "intel",        x: 0, y: 4,  w: 12, h: 6,  minW: 8, minH: 4 },
  // Row 3 — rotation + movers
  { i: "sector",       x: 0, y: 10, w: 8,  h: 7,  minW: 6, minH: 5 },
  { i: "movers",       x: 8, y: 10, w: 4,  h: 7,  minW: 3, minH: 4 },
  // Row 4 — watchlist + earnings
  { i: "watchlist",    x: 0, y: 17, w: 7,  h: 10, minW: 4, minH: 5 },
  { i: "earnings",     x: 7, y: 17, w: 5,  h: 10, minW: 3, minH: 4 },
  // Row 5 — symbol chart + event clock
  { i: "chart",        x: 0, y: 27, w: 8,  h: 10, minW: 5, minH: 6 },
  { i: "calendar",     x: 8, y: 27, w: 4,  h: 10, minW: 3, minH: 5 },
  // Row 6 — ticker detail + fundamentals + analyst ratings
  { i: "detail",       x: 0, y: 37, w: 3,  h: 8,  minW: 3, minH: 5 },
  { i: "fundamentals", x: 3, y: 37, w: 6,  h: 8,  minW: 4, minH: 5 },
  { i: "analysts",     x: 9, y: 37, w: 3,  h: 8,  minW: 3, minH: 5 },
  // Row 7 — comparison + symbol news
  { i: "compare",      x: 0, y: 45, w: 6,  h: 8,  minW: 5, minH: 6 },
  { i: "news",         x: 6, y: 45, w: 6,  h: 8,  minW: 3, minH: 4 },
  // Row 8 — portfolio + alerts + screener
  { i: "portfolio",    x: 0, y: 53, w: 5,  h: 8,  minW: 4, minH: 6 },
  { i: "alerts",       x: 5, y: 53, w: 3,  h: 8,  minW: 3, minH: 6 },
  { i: "screener",     x: 8, y: 53, w: 4,  h: 8,  minW: 4, minH: 6 },
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
      // v8: reorders dashboard around macro -> watchlist -> symbol -> tools flow.
      name: "layout-storage-v8",
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
