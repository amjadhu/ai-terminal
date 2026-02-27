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
import { useSettingsStore } from "@/stores/settings";
import type { PanelLayout } from "@/types";
import { DEFAULT_LAYOUT } from "@/stores/layout";
import { stabilizeLayouts } from "@/lib/layout";

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

const MARKET_PANEL_IDS = new Set([
  "market",
  "intel",
  "watchlist",
  "movers",
  "earnings",
  "sector",
  "screener",
  "portfolio",
  "alerts",
]);

const SYMBOL_PANEL_IDS = new Set([
  "calendar",
  "chart",
  "detail",
  "fundamentals",
  "analysts",
  "compare",
  "news",
]);

const FULL_WIDTH_MARKET = new Set(["market", "intel", "watchlist", "sector"]);

export function TerminalGrid() {
  const { layouts, setLayouts } = useLayoutStore();
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });

  const stableLayouts = useMemo(() => {
    const valid = layouts.filter((l) => !!PANEL_COMPONENTS[l.i]);
    return stabilizeLayouts(valid, DEFAULT_LAYOUT);
  }, [layouts]);

  const marketLayouts = useMemo(
    () => normalizeSectionRows(stableLayouts.filter((l) => MARKET_PANEL_IDS.has(l.i))),
    [stableLayouts]
  );
  const symbolLayouts = useMemo(
    () => normalizeSectionRows(stableLayouts.filter((l) => SYMBOL_PANEL_IDS.has(l.i))),
    [stableLayouts]
  );

  const marketLg = useMemo(() => compactRowsHorizontally(marketLayouts, FULL_WIDTH_MARKET), [marketLayouts]);
  const marketMd = useMemo(
    () =>
      compactRowsHorizontally(
        marketLayouts.map((l) => ({
          ...l,
          w: FULL_WIDTH_MARKET.has(l.i) ? 10 : Math.min(l.w, 5),
          x: FULL_WIDTH_MARKET.has(l.i) ? 0 : l.x % 10,
        })),
        FULL_WIDTH_MARKET
      ),
    [marketLayouts]
  );
  const marketSm = useMemo(
    () =>
      marketLayouts.map((l, i) => ({
        ...l,
        x: 0,
        y: i * 6,
        w: 6,
        h: l.i === "market" ? 4 : l.i === "sector" ? 8 : 6,
      })),
    [marketLayouts]
  );

  const symbolLg = useMemo(() => compactRowsHorizontally(symbolLayouts, new Set()), [symbolLayouts]);
  const symbolMd = useMemo(
    () =>
      compactRowsHorizontally(
        symbolLayouts.map((l) => ({
          ...l,
          w: Math.min(l.w, 5),
          x: l.x % 10,
        })),
        new Set()
      ),
    [symbolLayouts]
  );
  const symbolSm = useMemo(
    () =>
      symbolLayouts.map((l, i) => ({
        ...l,
        x: 0,
        y: i * 6,
        w: 6,
        h: 6,
      })),
    [symbolLayouts]
  );

  const persistSection = (sectionIds: Set<string>, sectionLayouts: PanelLayout[]) => {
    const byId = new Map(sectionLayouts.map((l) => [l.i, l]));
    const merged = stableLayouts.map((l) => {
      if (!sectionIds.has(l.i)) return l;
      const next = byId.get(l.i);
      return next ? { ...l, ...next } : l;
    });
    setLayouts(stabilizeLayouts(merged, DEFAULT_LAYOUT));
  };

  return (
    <div ref={containerRef} className="space-y-3">
      <section>
        <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-[0.18em] text-terminal-muted">
          Market Context & Discovery
        </div>
        {width > 0 && (
          <Responsive
            width={width}
            className="layout"
            layouts={{ lg: marketLg, md: marketMd, sm: marketSm }}
            breakpoints={{ lg: 1200, md: 800, sm: 0 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={40}
            margin={[8, 8] as [number, number]}
            containerPadding={[8, 8] as [number, number]}
            onLayoutChange={(_current: unknown, allLayouts: unknown) => {
              const typed = allLayouts as { lg?: PanelLayout[] } | undefined;
              if (typed?.lg) persistSection(MARKET_PANEL_IDS, typed.lg);
            }}
          >
            {marketLayouts.map((layout) => {
              const Component = PANEL_COMPONENTS[layout.i];
              return (
                <div key={layout.i}>
                  <Component />
                </div>
              );
            })}
          </Responsive>
        )}
      </section>

      <section id="symbol-workbench">
        <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-[0.18em] text-terminal-muted">
          Symbol Workbench | {selectedTicker}
        </div>
        {width > 0 && (
          <Responsive
            width={width}
            className="layout"
            layouts={{ lg: symbolLg, md: symbolMd, sm: symbolSm }}
            breakpoints={{ lg: 1200, md: 800, sm: 0 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={40}
            margin={[8, 8] as [number, number]}
            containerPadding={[8, 8] as [number, number]}
            onLayoutChange={(_current: unknown, allLayouts: unknown) => {
              const typed = allLayouts as { lg?: PanelLayout[] } | undefined;
              if (typed?.lg) persistSection(SYMBOL_PANEL_IDS, typed.lg);
            }}
          >
            {symbolLayouts.map((layout) => {
              const Component = PANEL_COMPONENTS[layout.i];
              return (
                <div key={layout.i}>
                  <Component />
                </div>
              );
            })}
          </Responsive>
        )}
      </section>
    </div>
  );
}

function normalizeSectionRows(layouts: PanelLayout[]): PanelLayout[] {
  const rows = new Map<number, PanelLayout[]>();
  for (const item of layouts) {
    const y = item.y;
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y)?.push({ ...item });
  }

  const orderedRows = Array.from(rows.entries()).sort((a, b) => a[0] - b[0]);
  let runningY = 0;
  const out: PanelLayout[] = [];
  for (const [, row] of orderedRows) {
    const rowHeight = Math.max(...row.map((r) => r.h));
    row.forEach((item) => {
      item.y = runningY;
      out.push(item);
    });
    runningY += rowHeight;
  }
  return out;
}

function compactRowsHorizontally(
  layouts: PanelLayout[],
  fullWidthPanels: Set<string>
): PanelLayout[] {
  const rows = new Map<number, PanelLayout[]>();
  for (const item of layouts) {
    const key = item.y;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key)?.push({ ...item });
  }

  const compacted: PanelLayout[] = [];
  Array.from(rows.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([, row]) => {
      row.sort((a, b) => a.x - b.x);
      let nextX = 0;
      row.forEach((item) => {
        if (fullWidthPanels.has(item.i)) {
          item.x = 0;
          nextX = item.w;
        } else {
          item.x = nextX;
          nextX += item.w;
        }
        compacted.push(item);
      });
    });

  return compacted;
}
