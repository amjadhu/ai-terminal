import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalendarEvent, EventImpact } from "@/types";

interface CalendarStore {
  customEvents: CalendarEvent[];
  addCustomEvent: (input: {
    title: string;
    timestamp: number;
    impact: EventImpact;
  }) => void;
  removeCustomEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      customEvents: [],
      addCustomEvent: ({ title, timestamp, impact }) =>
        set((state) => ({
          customEvents: [
            ...state.customEvents,
            {
              id: crypto.randomUUID(),
              title,
              category: "custom",
              impact,
              timestamp,
              source: "user",
            },
          ],
        })),
      removeCustomEvent: (id) =>
        set((state) => ({
          customEvents: state.customEvents.filter((e) => e.id !== id),
        })),
    }),
    { name: "calendar-storage-v1" }
  )
);
