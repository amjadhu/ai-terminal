import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PortfolioPosition } from "@/types";

interface PortfolioStore {
  positions: PortfolioPosition[];
  addPosition: (position: PortfolioPosition) => void;
  removePosition: (symbol: string) => void;
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      positions: [
        { symbol: "AAPL", shares: 25, avgCost: 198 },
        { symbol: "MSFT", shares: 12, avgCost: 374 },
        { symbol: "NVDA", shares: 8, avgCost: 621 },
      ],
      addPosition: (position) =>
        set((state) => {
          const symbol = position.symbol.toUpperCase();
          const existing = state.positions.find((p) => p.symbol === symbol);
          if (!existing) {
            return {
              positions: [...state.positions, { ...position, symbol }],
            };
          }

          const totalShares = existing.shares + position.shares;
          const weightedAvg =
            totalShares > 0
              ? (existing.avgCost * existing.shares + position.avgCost * position.shares) /
                totalShares
              : existing.avgCost;

          return {
            positions: state.positions.map((p) =>
              p.symbol === symbol
                ? {
                    symbol,
                    shares: totalShares,
                    avgCost: weightedAvg,
                  }
                : p
            ),
          };
        }),
      removePosition: (symbol) =>
        set((state) => ({
          positions: state.positions.filter((p) => p.symbol !== symbol.toUpperCase()),
        })),
    }),
    { name: "portfolio-storage-v1" }
  )
);
