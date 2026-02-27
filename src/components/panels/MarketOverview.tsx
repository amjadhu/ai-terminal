"use client";

import { Panel } from "@/components/ui/panel";
import { useMacroData } from "@/hooks/useMarketData";
import { formatPrice, formatChange, formatPercent, getChangeColor } from "@/lib/utils";
import { REFETCH_INTERVALS } from "@/lib/constants";
import type { MarketIndex } from "@/types";

export function MarketOverview() {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useMacroData();

  return (
    <Panel
      title="Market Overview"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={REFETCH_INTERVALS.market}
    >
      <div className="flex items-stretch h-full overflow-x-auto px-2 py-1 gap-0">
        {data?.map((group, gi) => (
          <div key={group.label} className="flex items-stretch gap-0 shrink-0">
            {gi > 0 && (
              <div className="flex items-center mx-2">
                <div className="w-px h-8 bg-terminal-border" />
              </div>
            )}
            <div className="flex items-center gap-0">
              <span className="text-[9px] font-semibold tracking-widest text-terminal-muted mr-2 shrink-0 uppercase opacity-60">
                {group.label}
              </span>
              <div className="flex items-center gap-4">
                {group.items.map((item: MarketIndex) => (
                  <MacroItem key={item.symbol} item={item} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MacroItem({ item }: { item: MarketIndex }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <span className="text-[10px] font-semibold text-terminal-accent truncate">
        {item.shortName}
      </span>
      <span className="text-xs font-mono font-medium">
        {formatPrice(item.regularMarketPrice)}
      </span>
      <div className="flex gap-1.5 text-[10px] font-mono">
        <span className={getChangeColor(item.regularMarketChange)}>
          {formatChange(item.regularMarketChange)}
        </span>
        <span className={getChangeColor(item.regularMarketChangePercent)}>
          {formatPercent(item.regularMarketChangePercent)}
        </span>
      </div>
    </div>
  );
}
