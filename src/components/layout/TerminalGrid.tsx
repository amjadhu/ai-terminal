"use client";

import { useMemo } from "react";
import { Responsive, useContainerWidth } from "react-grid-layout";
import { useLayoutStore } from "@/stores/layout";
import { MarketOverview } from "@/components/panels/MarketOverview";
import { Watchlist } from "@/components/panels/Watchlist";
import { StockChart } from "@/components/panels/StockChart";
import { TickerDetail } from "@/components/panels/TickerDetail";
import { NewsFeed } from "@/components/panels/NewsFeed";
import { Movers } from "@/components/panels/Movers";
import type { PanelLayout } from "@/types";

const PANEL_COMPONENTS: Record<string, React.ComponentType> = {
  market: MarketOverview,
  watchlist: Watchlist,
  chart: StockChart,
  detail: TickerDetail,
  news: NewsFeed,
  movers: Movers,
};

export function TerminalGrid() {
  const { layouts, setLayouts } = useLayoutStore();
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });

  const lgLayout = useMemo(() => layouts, [layouts]);
  const mdLayout = useMemo(
    () =>
      layouts.map((l) => ({
        ...l,
        w: l.i === "market" ? 10 : Math.min(l.w, 5),
        x: l.i === "market" ? 0 : l.x % 10,
      })),
    [layouts]
  );
  const smLayout = useMemo(
    () =>
      layouts.map((l, i) => ({
        ...l,
        x: 0,
        y: i * 6,
        w: 6,
        h: l.i === "market" ? 3 : 6,
      })),
    [layouts]
  );

  return (
    <div ref={containerRef}>
      {width > 0 && (
        <Responsive
          width={width}
          className="layout"
          layouts={{
            lg: lgLayout,
            md: mdLayout,
            sm: smLayout,
          }}
          breakpoints={{ lg: 1200, md: 800, sm: 0 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={40}
          margin={[8, 8] as [number, number]}
          containerPadding={[8, 8] as [number, number]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onLayoutChange={(_current: any, allLayouts: any) => {
            if (allLayouts?.lg) {
              setLayouts(allLayouts.lg as PanelLayout[]);
            }
          }}
        >
          {layouts.map((layout) => {
            const Component = PANEL_COMPONENTS[layout.i];
            if (!Component) return null;
            return (
              <div key={layout.i}>
                <Component />
              </div>
            );
          })}
        </Responsive>
      )}
    </div>
  );
}
