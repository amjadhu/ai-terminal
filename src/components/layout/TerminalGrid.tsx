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
import { Fundamentals } from "@/components/panels/Fundamentals";
import { EarningsCalendar } from "@/components/panels/EarningsCalendar";
import { SectorHeatmap } from "@/components/panels/SectorHeatmap";
import { AnalystRatings } from "@/components/panels/AnalystRatings";
import { Portfolio } from "@/components/panels/Portfolio";
import { AlertsPanel } from "@/components/panels/Alerts";
import { ComparePanel } from "@/components/panels/Compare";
import { ScreenerPanel } from "@/components/panels/Screener";
import { MarketIntelligence } from "@/components/panels/MarketIntelligence";
import { EventClock } from "@/components/panels/EventClock";
import type { PanelLayout } from "@/types";

const FULL_WIDTH_PANELS = new Set(["market", "intel", "sector"]);

const PANEL_COMPONENTS: Record<string, React.ComponentType> = {
  market: MarketOverview,
  intel: MarketIntelligence,
  watchlist: Watchlist,
  calendar: EventClock,
  chart: StockChart,
  detail: TickerDetail,
  news: NewsFeed,
  movers: Movers,
  fundamentals: Fundamentals,
  earnings: EarningsCalendar,
  sector: SectorHeatmap,
  analysts: AnalystRatings,
  portfolio: Portfolio,
  alerts: AlertsPanel,
  compare: ComparePanel,
  screener: ScreenerPanel,
};

export function TerminalGrid() {
  const { layouts, setLayouts } = useLayoutStore();
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });

  const lgLayout = useMemo(() => layouts, [layouts]);
  const mdLayout = useMemo(
    () =>
      layouts.map((l) => ({
        ...l,
        w: FULL_WIDTH_PANELS.has(l.i) ? 10 : Math.min(l.w, 5),
        x: FULL_WIDTH_PANELS.has(l.i) ? 0 : l.x % 10,
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
        h: l.i === "market" ? 4 : l.i === "sector" ? 10 : 6,
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
