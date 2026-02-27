"use client";

import { Panel } from "@/components/ui/panel";
import { useAnalysts } from "@/hooks/useMarketData";
import { useSettingsStore } from "@/stores/settings";
import type { AnalystData } from "@/types";

// Maps Yahoo's recommendationKey to a display label and color
const RATING_CONFIG: Record<
  string,
  { label: string; color: string; score: number }
> = {
  strongBuy: { label: "STRONG BUY", color: "#00dc82", score: 5 },
  buy: { label: "BUY", color: "#4ade80", score: 4 },
  hold: { label: "HOLD", color: "#facc15", score: 3 },
  underperform: { label: "UNDERPERFORM", color: "#fb923c", score: 2 },
  sell: { label: "SELL", color: "#ff4757", score: 1 },
};

export function AnalystRatings() {
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const { data, isLoading, error, refetch } = useAnalysts(selectedTicker);

  return (
    <Panel
      title={`Analyst Ratings — ${selectedTicker}`}
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
    >
      {data && <RatingsContent data={data} />}
    </Panel>
  );
}

function RatingsContent({ data }: { data: AnalystData }) {
  const cfg = data.recommendationKey
    ? RATING_CONFIG[data.recommendationKey] ?? null
    : null;

  // Latest trend period (most recent month)
  const latest = data.trend?.[0];
  const totalVotes = latest
    ? latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell
    : 0;

  const current = data.currentPrice ?? 0;
  const targetMean = data.targetMeanPrice ?? 0;
  const upside =
    current > 0 && targetMean > 0
      ? ((targetMean - current) / current) * 100
      : null;

  return (
    <div className="flex flex-col gap-0 divide-y divide-terminal-border">
      {/* Consensus rating */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-widest text-terminal-muted">
            Consensus
          </span>
          {cfg ? (
            <span
              className="text-sm font-bold tracking-wide"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </span>
          ) : (
            <span className="text-sm text-terminal-muted">—</span>
          )}
          {data.numberOfAnalysts !== undefined && (
            <span className="text-[10px] text-terminal-muted">
              {data.numberOfAnalysts} analysts
            </span>
          )}
        </div>
        {/* Score gauge (1-5 as bar) */}
        {data.recommendationMean !== undefined && (
          <ScoreGauge score={data.recommendationMean} />
        )}
      </div>

      {/* Price targets */}
      <div className="px-3 py-3">
        <div className="text-[9px] uppercase tracking-widest text-terminal-muted mb-2">
          Price Target
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-mono font-bold text-terminal-text">
            ${targetMean > 0 ? targetMean.toFixed(2) : "—"}
          </span>
          {upside !== null && (
            <span
              className={`text-xs font-semibold font-mono ${
                upside >= 0 ? "text-terminal-up" : "text-terminal-down"
              }`}
            >
              {upside >= 0 ? "+" : ""}
              {upside.toFixed(1)}% upside
            </span>
          )}
        </div>
        {/* Low / Mean / High range bar */}
        {data.targetLowPrice !== undefined &&
          data.targetHighPrice !== undefined && (
            <PriceTargetBar
              low={data.targetLowPrice}
              high={data.targetHighPrice}
              mean={targetMean}
              current={current}
            />
          )}
        <div className="flex justify-between mt-1 text-[10px] font-mono text-terminal-muted">
          <span>Low ${data.targetLowPrice?.toFixed(0) ?? "—"}</span>
          <span>High ${data.targetHighPrice?.toFixed(0) ?? "—"}</span>
        </div>
      </div>

      {/* Rating breakdown */}
      {latest && totalVotes > 0 && (
        <div className="px-3 py-3">
          <div className="text-[9px] uppercase tracking-widest text-terminal-muted mb-2">
            Breakdown (current month)
          </div>
          <RatingBar label="Strong Buy" count={latest.strongBuy} total={totalVotes} color="#00dc82" />
          <RatingBar label="Buy" count={latest.buy} total={totalVotes} color="#4ade80" />
          <RatingBar label="Hold" count={latest.hold} total={totalVotes} color="#facc15" />
          <RatingBar label="Underperform" count={latest.sell} total={totalVotes} color="#fb923c" />
          <RatingBar label="Sell" count={latest.strongSell} total={totalVotes} color="#ff4757" />
        </div>
      )}
    </div>
  );
}

// ─── Score gauge (1=Sell → 5=Strong Buy) ──────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  // Yahoo: 1=Strong Buy, 5=Strong Sell — invert so higher = better visually
  const normalized = (5 - score) / 4; // 0 = sell, 1 = strong buy
  const color =
    normalized > 0.7
      ? "#00dc82"
      : normalized > 0.5
      ? "#4ade80"
      : normalized > 0.35
      ? "#facc15"
      : normalized > 0.2
      ? "#fb923c"
      : "#ff4757";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          <circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${normalized * 100.5} 100.5`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono"
          style={{ color }}
        >
          {score.toFixed(1)}
        </span>
      </div>
      <span className="text-[8px] text-terminal-muted">/ 5.0</span>
    </div>
  );
}

// ─── Price target range bar ────────────────────────────────────────────────

function PriceTargetBar({
  low,
  high,
  mean,
  current,
}: {
  low: number;
  high: number;
  mean: number;
  current: number;
}) {
  if (high <= low) return null;

  const pos = (v: number) =>
    Math.max(0, Math.min(100, ((v - low) / (high - low)) * 100));

  return (
    <div className="relative h-2 rounded-full bg-terminal-border mt-1">
      {/* Mean marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-terminal-accent z-10"
        style={{ left: `calc(${pos(mean)}% - 4px)` }}
        title={`Mean: $${mean.toFixed(2)}`}
      />
      {/* Current price marker */}
      {current > 0 && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-sm bg-terminal-text z-20"
          style={{ left: `calc(${pos(current)}% - 3px)` }}
          title={`Current: $${current.toFixed(2)}`}
        />
      )}
      {/* Fill to mean */}
      <div
        className="absolute top-0 left-0 h-full rounded-full bg-terminal-accent opacity-20"
        style={{ width: `${pos(mean)}%` }}
      />
    </div>
  );
}

// ─── Rating breakdown bar ──────────────────────────────────────────────────

function RatingBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[10px] text-terminal-muted w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-terminal-border relative">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-mono text-terminal-muted w-4 text-right shrink-0">
        {count}
      </span>
    </div>
  );
}
