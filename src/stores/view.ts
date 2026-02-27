import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppMode = "dashboard" | "deep-dive";

interface ViewStore {
  mode: AppMode;
  deepDiveQuery: string;
  setMode: (mode: AppMode) => void;
  setDeepDiveQuery: (query: string) => void;
}

export const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      mode: "dashboard",
      deepDiveQuery: "AAPL",
      setMode: (mode) => set({ mode }),
      setDeepDiveQuery: (deepDiveQuery) => set({ deepDiveQuery }),
    }),
    { name: "view-storage-v1" }
  )
);
