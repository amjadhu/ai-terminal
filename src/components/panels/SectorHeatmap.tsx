"use client";

import { Panel } from "@/components/ui/panel";
import { useSectors } from "@/hooks/useMarketData";
import { useSettingsStore } from "@/stores/settings";
import { REFETCH_INTERVALS } from "@/lib/constants";
import type { SectorData } from "@/types";

export function SectorHeatmap() {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useSectors();
  const setSelectedTicker = useSettingsStore((s) => s.setSelectedTicker);

  return (
    <Panel
      title="Sector Performance"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={REFETCH_INTERVALS.sectors}
    >
      <div className="p-2 grid grid-cols-3 gap-1.5 h-full content-start">
        {data?.map((sector) => (
          <SectorTile
            key={sector.symbol}
            sector={sector}
            onClick={() => setSelectedTicker(sector.symbol)}
          />
        ))}
      </div>
    </Panel>
  );
}

function SectorTile({
  sector,
  onClick,
}: {
  sector: SectorData;
  onClick: () => void;
}) {
  const pct = sector.changePercent;
  const isUp = pct >= 0;

  // Color intensity scales with magnitude, capped at ±3%
  const intensity = Math.min(Math.abs(pct) / 3, 1);
  const bgColor = isUp
    ? `rgba(0, 220, 130, ${0.08 + intensity * 0.22})`
    : `rgba(255, 71, 87, ${0.08 + intensity * 0.22})`;
  const textColor = isUp ? "#00dc82" : "#ff4757";
  const borderColor = isUp
    ? `rgba(0, 220, 130, ${0.15 + intensity * 0.3})`
    : `rgba(255, 71, 87, ${0.15 + intensity * 0.3})`;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-2 rounded cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        minHeight: "64px",
      }}
    >
      <span
        className="text-[11px] font-semibold leading-tight"
        style={{ color: textColor }}
      >
        {sector.name}
      </span>
      <span className="text-xs font-mono font-bold mt-1" style={{ color: textColor }}>
        {pct >= 0 ? "+" : ""}
        {pct.toFixed(2)}%
      </span>
      <span className="text-[9px] text-terminal-muted mt-0.5 font-mono">
        {sector.symbol}
      </span>
    </button>
  );
}
