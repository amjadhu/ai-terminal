"use client";

import { useMemo, useState } from "react";
import { useDeepDive } from "@/hooks/useMarketData";
import { useViewStore } from "@/stores/view";
import { formatNumber, formatPercent, formatPrice } from "@/lib/utils";
import type { DeepDiveCompanyData, DeepDiveSectorData } from "@/types";

export function DeepDiveView() {
  const persistedQuery = useViewStore((s) => s.deepDiveQuery);
  const setPersistedQuery = useViewStore((s) => s.setDeepDiveQuery);
  const [query, setQuery] = useState(persistedQuery);
  const [submittedQuery, setSubmittedQuery] = useState(persistedQuery);
  const { data, isLoading, error, refetch } = useDeepDive(submittedQuery);

  const quickPills = useMemo(
    () => ["AAPL", "NVDA", "MSFT", "technology", "cybersecurity", "semiconductors"],
    []
  );

  const summary = useMemo(() => {
    if (!data) return null;
    if (data.type === "company") {
      return [
        { label: "Mode", value: "Company" },
        { label: "News", value: String(data.news.length) },
        { label: "Related", value: String(data.relatedSymbols.length) },
        { label: "Price", value: `$${formatPrice(data.price)}` },
      ];
    }
    return [
      { label: "Mode", value: "Sector" },
      { label: "News", value: String(data.news.length) },
      { label: "Basket", value: String(data.symbols.length) },
      { label: "Breadth", value: `${data.breadthPercent.toFixed(0)}%` },
    ];
  }, [data]);

  return (
    <div className="p-2 md:p-3 space-y-2">
      <div className="sticky top-0 z-20 rounded-lg border border-terminal-border bg-terminal-panel/95 backdrop-blur p-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="text-xs text-terminal-muted uppercase tracking-wider md:w-36">
            Dive Deep Query
          </div>
          <form
            className="flex-1 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const cleaned = query.trim();
              if (!cleaned) return;
              setSubmittedQuery(cleaned);
              setPersistedQuery(cleaned);
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ticker or sector (e.g., CRWD, technology, cybersecurity)"
              className="flex-1 bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-terminal-accent"
            />
            <button className="px-3 py-2 rounded bg-terminal-accent text-terminal-bg text-sm font-semibold">
              Analyze
            </button>
          </form>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => {
                setQuery(pill);
                setSubmittedQuery(pill);
                setPersistedQuery(pill);
              }}
              className="px-2 py-1 rounded border border-terminal-border text-xs text-terminal-muted hover:text-terminal-text hover:bg-terminal-hover transition-colors"
            >
              {pill}
            </button>
          ))}
          <button
            onClick={() => refetch()}
            className="px-2 py-1 rounded border border-terminal-border text-xs text-terminal-muted hover:text-terminal-text hover:bg-terminal-hover transition-colors"
          >
            refresh
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {summary.map((item) => (
            <div key={item.label} className="rounded border border-terminal-border bg-terminal-panel px-2 py-1.5">
              <div className="text-[9px] uppercase tracking-wider text-terminal-muted">{item.label}</div>
              <div className="text-xs font-mono text-terminal-text mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-terminal-border bg-terminal-panel p-4 text-sm text-terminal-muted">
          Running deep analysis...
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-terminal-border bg-terminal-panel p-4 text-sm text-terminal-down">
          {error.message}
        </div>
      )}
      {!isLoading && !error && !data && (
        <DeepDiveLanding
          onSelect={(value) => {
            setQuery(value);
            setSubmittedQuery(value);
            setPersistedQuery(value);
          }}
        />
      )}
      {data?.type === "company" && <CompanyView data={data} />}
      {data?.type === "sector" && <SectorView data={data} />}
    </div>
  );
}

function DeepDiveLanding({ onSelect }: { onSelect: (value: string) => void }) {
  const sectors = [
    "technology",
    "cybersecurity",
    "semiconductors",
    "financials",
    "energy",
    "healthcare",
  ];
  const focus = ["earnings quality", "valuation reset", "AI demand", "rate sensitivity"];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
      <section className="xl:col-span-2 rounded-lg border border-terminal-border bg-terminal-panel p-3">
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted">Start With A Theme</h3>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
          {sectors.map((item) => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className="text-left rounded border border-terminal-border px-3 py-2 text-sm font-mono text-terminal-accent hover:bg-terminal-hover transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-3">
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted">Suggested Angles</h3>
        <div className="mt-2 space-y-1">
          {focus.map((item) => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className="w-full text-left rounded border border-terminal-border px-2 py-1.5 text-xs text-terminal-text hover:bg-terminal-hover transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function CompanyView({ data }: { data: DeepDiveCompanyData }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
      <section className="xl:col-span-2 rounded-lg border border-terminal-border bg-terminal-panel p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{data.name}</h2>
            <div className="text-xs text-terminal-muted mt-0.5">{data.symbol} | Company Deep Dive</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-mono">${formatPrice(data.price)}</div>
            <div
              className={`text-sm font-mono ${
                data.changePercent >= 0 ? "text-terminal-up" : "text-terminal-down"
              }`}
            >
              {formatPercent(data.changePercent)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <Stat label="Market Cap" value={data.marketCap ? formatNumber(data.marketCap) : "—"} />
          <Stat
            label="P/E"
            value={data.trailingPE ? data.trailingPE.toFixed(2) : "—"}
            tooltip="Price-to-earnings ratio based on trailing earnings"
          />
          <Stat label="Volume" value={data.volume ? formatNumber(data.volume) : "—"} />
          <Stat label="Avg Volume" value={data.avgVolume ? formatNumber(data.avgVolume) : "—"} />
        </div>
        <div className="mt-3">
          <h3 className="text-xs uppercase tracking-wider text-terminal-muted mb-1">Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {data.trends.map((trend) => (
              <div key={trend.label} className="rounded border border-terminal-border p-2">
                <div className="text-[10px] uppercase text-terminal-muted">{trend.label}</div>
                <div
                  className={`mt-1 font-mono ${
                    trend.tone === "up"
                      ? "text-terminal-up"
                      : trend.tone === "down"
                      ? "text-terminal-down"
                      : "text-terminal-text"
                  }`}
                >
                  {trend.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-3">
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted">Related Symbols</h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {data.relatedSymbols.map((s) => (
            <span
              key={s}
              className="px-2 py-1 rounded border border-terminal-border text-xs font-mono text-terminal-accent"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="xl:col-span-3 rounded-lg border border-terminal-border bg-terminal-panel p-3">
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted mb-2">Comprehensive News + Catalysts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {data.news.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-terminal-border p-2 hover:bg-terminal-hover transition-colors"
            >
              <div className="flex justify-between gap-2 text-[10px]">
                <span
                  className="text-terminal-accent uppercase terminal-tooltip"
                  data-tooltip="Estimated strength of potential market impact (higher = stronger)"
                >
                  Impact {item.impactScore}
                </span>
                <span className="text-terminal-muted">{item.publisher}</span>
              </div>
              <p className="text-sm mt-1 line-clamp-3">{item.title}</p>
              <div className="flex gap-1 mt-2">
                {(item.catalystTags ?? []).slice(0, 3).map((tag) => (
                  <span
                    key={`${item.link}-${tag}`}
                    className="px-1 py-0.5 rounded border border-terminal-border text-[9px] uppercase text-terminal-muted"
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
  );
}

function SectorView({ data }: { data: DeepDiveSectorData }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
      <section className="xl:col-span-2 rounded-lg border border-terminal-border bg-terminal-panel p-3">
        <h2 className="text-lg font-semibold">{data.sector}</h2>
        <div className="text-xs text-terminal-muted mt-0.5">Sector Deep Dive</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
          <Stat
            label="Breadth"
            value={`${data.breadthPercent.toFixed(0)}%`}
            tooltip="Percent of symbols in the theme trading up"
          />
          <Stat label="Avg Move" value={formatPercent(data.avgChangePercent)} />
          <Stat label="Leaders" value={String(data.leaders.length)} />
          <Stat label="Laggards" value={String(data.laggards.length)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          <div className="rounded border border-terminal-border p-2">
            <div className="text-xs uppercase tracking-wider text-terminal-muted">Leaders</div>
            <div className="space-y-1 mt-2">
              {data.leaders.map((item) => (
                <div key={item.symbol} className="flex justify-between text-sm">
                  <span className="font-mono text-terminal-accent">{item.symbol}</span>
                  <span className="font-mono text-terminal-up">{formatPercent(item.changePercent)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded border border-terminal-border p-2">
            <div className="text-xs uppercase tracking-wider text-terminal-muted">Laggards</div>
            <div className="space-y-1 mt-2">
              {data.laggards.map((item) => (
                <div key={item.symbol} className="flex justify-between text-sm">
                  <span className="font-mono text-terminal-accent">{item.symbol}</span>
                  <span className="font-mono text-terminal-down">{formatPercent(item.changePercent)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-terminal-border bg-terminal-panel p-3">
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted">Theme Basket</h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {data.symbols.map((s) => (
            <span
              key={s}
              className="px-2 py-1 rounded border border-terminal-border text-xs font-mono text-terminal-accent"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="xl:col-span-3 rounded-lg border border-terminal-border bg-terminal-panel p-3">
        <h3 className="text-xs uppercase tracking-wider text-terminal-muted mb-2">News + Industry Catalysts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {data.news.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-terminal-border p-2 hover:bg-terminal-hover transition-colors"
            >
              <div className="flex justify-between gap-2 text-[10px]">
                <span
                  className="text-terminal-accent uppercase terminal-tooltip"
                  data-tooltip="Estimated strength of potential market impact (higher = stronger)"
                >
                  Impact {item.impactScore}
                </span>
                <span className="text-terminal-muted">{item.publisher}</span>
              </div>
              <p className="text-sm mt-1 line-clamp-3">{item.title}</p>
              <div className="flex gap-1 mt-2">
                {(item.catalystTags ?? []).slice(0, 3).map((tag) => (
                  <span
                    key={`${item.link}-${tag}`}
                    className="px-1 py-0.5 rounded border border-terminal-border text-[9px] uppercase text-terminal-muted"
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
  );
}

function Stat({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) {
  return (
    <div className="rounded border border-terminal-border p-2">
      <div
        className="text-[10px] uppercase tracking-wider text-terminal-muted terminal-tooltip"
        data-tooltip={tooltip}
      >
        {label}
      </div>
      <div className="mt-1 text-sm font-mono">{value}</div>
    </div>
  );
}
