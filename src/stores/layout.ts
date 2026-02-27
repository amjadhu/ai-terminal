import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PanelLayout } from "@/types";

const DEFAULT_LAYOUT: PanelLayout[] = [
  { i: "market", x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
  { i: "watchlist", x: 0, y: 3, w: 4, h: 8, minW: 3, minH: 4 },
  { i: "chart", x: 4, y: 3, w: 8, h: 8, minW: 4, minH: 5 },
  { i: "detail", x: 0, y: 11, w: 4, h: 7, minW: 3, minH: 4 },
  { i: "news", x: 4, y: 11, w: 4, h: 7, minW: 3, minH: 4 },
  { i: "movers", x: 8, y: 11, w: 4, h: 7, minW: 3, minH: 4 },
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
    { name: "layout-storage" }
  )
);
