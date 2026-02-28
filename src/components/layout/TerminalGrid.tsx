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
  "movers",
  "sector",
]);

const WATCHLIST_PANEL_IDS = new Set([
  "watchlist",
  "earnings",
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

const TOOL_PANEL_IDS = new Set([
  "portfolio",
  "alerts",
  "screener",
]);

const FULL_WIDTH_MARKET = new Set(["market", "intel"]);

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
  const watchlistLayouts = useMemo(
    () => normalizeSectionRows(stableLayouts.filter((l) => WATCHLIST_PANEL_IDS.has(l.i))),
    [stableLayouts]
  );
  const toolLayouts = useMemo(
    () => normalizeSectionRows(stableLayouts.filter((l) => TOOL_PANEL_IDS.has(l.i))),
    [stableLayouts]
  );

  const marketLg = useMemo(
    () => compactRowsHorizontally(marketLayouts, FULL_WIDTH_MARKET, 12),
    [marketLayouts]
  );
  const marketMd = useMemo(
    () =>
      compactRowsHorizontally(
        marketLayouts.map((l) => ({
          ...l,
          w: FULL_WIDTH_MARKET.has(l.i) ? 10 : Math.min(l.w, 5),
          x: FULL_WIDTH_MARKET.has(l.i) ? 0 : l.x % 10,
        })),
        FULL_WIDTH_MARKET,
        10
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
  const watchlistLg = useMemo(
    () => compactRowsHorizontally(watchlistLayouts, new Set(), 12),
    [watchlistLayouts]
  );
  const watchlistMd = useMemo(
    () =>
      compactRowsHorizontally(
        watchlistLayouts.map((l) => ({
          ...l,
          w: Math.min(l.w, 6),
          x: l.x % 10,
        })),
        new Set(),
        10
      ),
    [watchlistLayouts]
  );
  const watchlistSm = useMemo(
    () =>
      watchlistLayouts.map((l, i) => ({
        ...l,
        x: 0,
        y: i * 6,
        w: 6,
        h: 8,
      })),
    [watchlistLayouts]
  );

  const symbolLg = useMemo(
    () => compactRowsHorizontally(symbolLayouts, new Set(), 12),
    [symbolLayouts]
  );
  const symbolMd = useMemo(
    () =>
      compactRowsHorizontally(
        symbolLayouts.map((l) => ({
          ...l,
          w: Math.min(l.w, 5),
          x: l.x % 10,
        })),
        new Set(),
        10
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
  const toolLg = useMemo(
    () => compactRowsHorizontally(toolLayouts, new Set(), 12),
    [toolLayouts]
  );
  const toolMd = useMemo(
    () =>
      compactRowsHorizontally(
        toolLayouts.map((l) => ({
          ...l,
          w: Math.min(l.w, 5),
          x: l.x % 10,
        })),
        new Set(),
        10
      ),
    [toolLayouts]
  );
  const toolSm = useMemo(
    () =>
      toolLayouts.map((l, i) => ({
        ...l,
        x: 0,
        y: i * 6,
        w: 6,
        h: 7,
      })),
    [toolLayouts]
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
      <section id="market-pulse">
        <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-[0.18em] text-terminal-muted">
          Market Pulse
        </div>
        <div className="px-2 pb-1 text-[10px] text-terminal-muted">
          Regime, breadth, rotation, and leadership across the tape.
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

      <section id="watchlist-focus">
        <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-[0.18em] text-terminal-muted">
          Watchlist & Catalysts
        </div>
        <div className="px-2 pb-1 text-[10px] text-terminal-muted">
          Your names and their near-term earnings or event risk.
        </div>
        {width > 0 && (
          <Responsive
            width={width}
            className="layout"
            layouts={{ lg: watchlistLg, md: watchlistMd, sm: watchlistSm }}
            breakpoints={{ lg: 1200, md: 800, sm: 0 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={40}
            margin={[8, 8] as [number, number]}
            containerPadding={[8, 8] as [number, number]}
            onLayoutChange={(_current: unknown, allLayouts: unknown) => {
              const typed = allLayouts as { lg?: PanelLayout[] } | undefined;
              if (typed?.lg) persistSection(WATCHLIST_PANEL_IDS, typed.lg);
            }}
          >
            {watchlistLayouts.map((layout) => {
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
        <div className="px-2 pb-1 text-[10px] text-terminal-muted">
          Price action, quality, valuation, analysts, and ticker-specific catalysts.
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

      <section id="tools-lab">
        <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-[0.18em] text-terminal-muted">
          Portfolio & Tools
        </div>
        <div className="px-2 pb-1 text-[10px] text-terminal-muted">
          Position tracking, alerting, and screening workflows.
        </div>
        {width > 0 && (
          <Responsive
            width={width}
            className="layout"
            layouts={{ lg: toolLg, md: toolMd, sm: toolSm }}
            breakpoints={{ lg: 1200, md: 800, sm: 0 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={40}
            margin={[8, 8] as [number, number]}
            containerPadding={[8, 8] as [number, number]}
            onLayoutChange={(_current: unknown, allLayouts: unknown) => {
              const typed = allLayouts as { lg?: PanelLayout[] } | undefined;
              if (typed?.lg) persistSection(TOOL_PANEL_IDS, typed.lg);
            }}
          >
            {toolLayouts.map((layout) => {
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
  fullWidthPanels: Set<string>,
  totalCols: number
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
      const hasFullWidth = row.some((item) => fullWidthPanels.has(item.i));
      if (hasFullWidth && row.length === 1) {
        row.forEach((item) => {
          if (!fullWidthPanels.has(item.i)) return;
          item.x = 0;
          item.w = totalCols;
          compacted.push(item);
        });
        return;
      }

      const sumWidth = row.reduce((sum, item) => sum + item.w, 0);
      const deficit = Math.max(0, totalCols - sumWidth);
      if (deficit > 0 && row.length > 0) {
        row[row.length - 1].w += deficit;
      }

      let nextX = 0;
      row.forEach((item) => {
        item.x = nextX;
        nextX += item.w;
        compacted.push(item);
      });
    });

  return compacted;
}
