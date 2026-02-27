import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AlertEvent, AlertRule } from "@/types";

interface AlertsStore {
  rules: AlertRule[];
  events: AlertEvent[];
  addRule: (rule: Omit<AlertRule, "id" | "enabled">) => void;
  toggleRule: (id: string) => void;
  removeRule: (id: string) => void;
  pushEvent: (event: Omit<AlertEvent, "id">) => void;
  recordTriggered: (id: string, triggeredAt: number) => void;
  clearEvents: () => void;
}

export const useAlertsStore = create<AlertsStore>()(
  persist(
    (set) => ({
      rules: [],
      events: [],
      addRule: (rule) =>
        set((state) => ({
          rules: [
            ...state.rules,
            {
              ...rule,
              symbol: rule.symbol.toUpperCase(),
              id: crypto.randomUUID(),
              enabled: true,
            },
          ],
        })),
      toggleRule: (id) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),
      removeRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
          events: state.events.filter((e) => e.ruleId !== id),
        })),
      pushEvent: (event) =>
        set((state) => ({
          events: [
            { ...event, id: crypto.randomUUID() },
            ...state.events.slice(0, 49),
          ],
        })),
      recordTriggered: (id, triggeredAt) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, lastTriggeredAt: triggeredAt } : r
          ),
        })),
      clearEvents: () => set({ events: [] }),
    }),
    { name: "alerts-storage-v1" }
  )
);
