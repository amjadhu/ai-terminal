"use client";

import { Panel } from "@/components/ui/panel";
import {
  useMacroData,
  useNews,
  useSectors,
  useTrending,
} from "@/hooks/useMarketData";
import { computeMarketRegime } from "@/lib/insights";
import { formatPercent } from "@/lib/utils";
import { REFETCH_INTERVALS } from "@/lib/constants";

export function MarketIntelligence() {
  const macro = useMacroData();
  const sectors = useSectors();
  const movers = useTrending();
  const news = useNews();

  const regime = computeMarketRegime(macro.data, sectors.data);
  const topGainer = movers.data?.gainers?.[0];
  const topLoser = movers.data?.losers?.[0];
  const catalysts = (news.data ?? []).slice(0, 4);
  const updatedAt = Math.max(
    macro.dataUpdatedAt || 0,
    sectors.dataUpdatedAt || 0,
    movers.dataUpdatedAt || 0,
    news.dataUpdatedAt || 0
  );

  return (
    <Panel
      title="Market Intelligence"
      isLoading={
        macro.isLoading || sectors.isLoading || movers.isLoading || news.isLoading
      }
      error={
        macro.error?.message ??
        sectors.error?.message ??
        movers.error?.message ??
        news.error?.message
      }
      onRetry={() => {
        macro.refetch();
        sectors.refetch();
        movers.refetch();
        news.refetch();
      }}
      lastUpdatedAt={updatedAt}
      staleAfterMs={REFETCH_INTERVALS.market}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 h-full divide-y md:divide-y-0 md:divide-x divide-terminal-border">
        <section className="p-3 flex flex-col justify-between bg-[linear-gradient(180deg,rgba(255,140,0,0.08),rgba(255,140,0,0.02))]">
          <div>
            <div
              className="text-[10px] uppercase tracking-widest text-terminal-muted"
              title="Overall market tone from breadth, trend, and volatility"
            >
              Regime
            </div>
            <div
              className={`mt-1 text-sm font-semibold ${
                regime.label === "RISK-ON"
                  ? "text-terminal-up"
                  : regime.label === "RISK-OFF"
                  ? "text-terminal-down"
                  : "text-yellow-400"
              }`}
            >
              {regime.label}
            </div>
            <div className="text-2xl font-mono mt-1">{regime.score}</div>
          </div>
          <div className="space-y-1 text-xs">
            <Metric label="Breadth" value={`${regime.breadthPercent}%`} />
            <Metric
              label="S&P 500"
              value={
                regime.spxChangePercent !== undefined
                  ? formatPercent(regime.spxChangePercent)
                  : "—"
              }
            />
            <Metric label="VIX" value={regime.vix ? regime.vix.toFixed(2) : "—"} />
            <Metric label="Confidence" value={`${regime.confidence}%`} />
          </div>
        </section>

        <section className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-terminal-muted mb-2">
            Leadership
          </div>
          <div className="space-y-2 text-xs">
            <div className="rounded border border-terminal-border p-2">
              <div className="text-terminal-muted text-[10px] uppercase mb-1">Top Gainer</div>
              {topGainer ? (
                <div className="flex justify-between">
                  <span className="font-mono text-terminal-accent">{topGainer.symbol}</span>
                  <span className="text-terminal-up font-mono">
                    {formatPercent(topGainer.regularMarketChangePercent)}
                  </span>
                </div>
              ) : (
                <div className="text-terminal-muted">—</div>
              )}
            </div>
            <div className="rounded border border-terminal-border p-2">
              <div className="text-terminal-muted text-[10px] uppercase mb-1">Top Loser</div>
              {topLoser ? (
                <div className="flex justify-between">
                  <span className="font-mono text-terminal-accent">{topLoser.symbol}</span>
                  <span className="text-terminal-down font-mono">
                    {formatPercent(topLoser.regularMarketChangePercent)}
                  </span>
                </div>
              ) : (
                <div className="text-terminal-muted">—</div>
              )}
            </div>
          </div>
        </section>

        <section className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-terminal-muted mb-2">
            Sector Breadth
          </div>
          <div className="space-y-1 text-xs">
            {(sectors.data ?? [])
              .slice()
              .sort((a, b) => b.changePercent - a.changePercent)
              .slice(0, 5)
              .map((sector) => (
                <div key={sector.symbol} className="flex justify-between">
                  <span className="truncate max-w-[120px]">{sector.name}</span>
                  <span
                    className={`font-mono ${
                      sector.changePercent >= 0 ? "text-terminal-up" : "text-terminal-down"
                    }`}
                  >
                    {formatPercent(sector.changePercent)}
                  </span>
                </div>
              ))}
          </div>
        </section>

        <section className="p-3">
          <div className="text-[10px] uppercase tracking-widest text-terminal-muted mb-2">
            Top Catalysts
          </div>
          <div className="space-y-2 text-xs">
            {catalysts.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded border border-terminal-border p-2 hover:bg-terminal-hover transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="text-terminal-accent text-[10px] uppercase tracking-wider"
                    title="Estimated strength of potential market impact (higher = stronger)"
                  >
                    impact {item.impactScore}
                  </span>
                  <span className="text-terminal-muted text-[10px]">
                    {item.publisher}
                  </span>
                </div>
                <p className="line-clamp-2 text-terminal-text">{item.title}</p>
                <div className="flex gap-1 mt-1">
                  {(item.catalystTags ?? []).slice(0, 2).map((tag) => (
                    <span
                      key={`${item.link}-${tag}`}
                      className="px-1 py-0.5 border border-terminal-border rounded text-[9px] uppercase tracking-wider text-terminal-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const tooltipByLabel: Record<string, string> = {
    Breadth: "Percent of sectors trading up today",
    "S&P 500": "Today's move in the S&P 500 index",
    VIX: "Market fear gauge based on S&P 500 options",
    Confidence: "How strong the regime signal is",
  };

  return (
    <div className="flex justify-between">
      <span className="text-terminal-muted" title={tooltipByLabel[label]}>
        {label}
      </span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
