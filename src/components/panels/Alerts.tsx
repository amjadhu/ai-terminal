"use client";

import { useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { useAlertsStore } from "@/stores/alerts";
import { useWatchlistStore } from "@/stores/watchlist";
import { useMultiQuote } from "@/hooks/useMarketData";
import { alertRuleLabel, evaluateAlert } from "@/lib/alerts";
import type { AlertMetric, AlertOperator } from "@/types";

const METRICS: { value: AlertMetric; label: string }[] = [
  { value: "price", label: "Price" },
  { value: "changePercent", label: "% Change" },
  { value: "volume", label: "Volume" },
];

const OPERATORS: { value: AlertOperator; label: string }[] = [
  { value: "gte", label: ">=" },
  { value: "lte", label: "<=" },
];

export function AlertsPanel() {
  const { tickers } = useWatchlistStore();
  const { data, isLoading, error, refetch, dataUpdatedAt } = useMultiQuote(tickers);
  const { rules, events, addRule, toggleRule, removeRule, pushEvent, recordTriggered, clearEvents } =
    useAlertsStore();
  const [symbol, setSymbol] = useState("AAPL");
  const [metric, setMetric] = useState<AlertMetric>("price");
  const [operator, setOperator] = useState<AlertOperator>("gte");
  const [threshold, setThreshold] = useState("200");

  const quoteMap = useMemo(
    () => new Map((data ?? []).map((q) => [q.symbol, q])),
    [data]
  );

  useEffect(() => {
    if (!data?.length) return;
    const now = Date.now();

    rules.forEach((rule) => {
      const quote = quoteMap.get(rule.symbol);
      if (!quote || !evaluateAlert(rule, quote)) return;

      if (rule.lastTriggeredAt && now - rule.lastTriggeredAt < 60_000) return;

      const message = `${alertRuleLabel(rule)} | last ${quote.regularMarketPrice.toFixed(2)}`;
      pushEvent({
        ruleId: rule.id,
        symbol: rule.symbol,
        message,
        triggeredAt: now,
      });
      recordTriggered(rule.id, now);
    });
  }, [data, rules, quoteMap, pushEvent, recordTriggered]);

  return (
    <Panel
      title="Alerts"
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={45_000}
    >
      <div className="flex flex-col h-full">
        <form
          className="grid grid-cols-4 gap-1 p-2 border-b border-terminal-border"
          onSubmit={(e) => {
            e.preventDefault();
            const value = Number(threshold);
            if (!Number.isFinite(value)) return;
            addRule({ symbol, metric, operator, threshold: value });
          }}
        >
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono"
            placeholder="Symbol"
          />
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as AlertMetric)}
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs"
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value as AlertOperator)}
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs"
          >
            {OPERATORS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs font-mono"
              placeholder="Threshold"
            />
            <button
              type="submit"
              className="bg-terminal-accent text-terminal-bg rounded px-2 py-1 text-xs font-semibold"
            >
              Add
            </button>
          </div>
        </form>

        <div className="border-b border-terminal-border p-2">
          <div className="text-[10px] uppercase tracking-wider text-terminal-muted mb-1">
            Active Rules
          </div>
          <div className="space-y-1 max-h-28 overflow-auto">
            {rules.length === 0 && (
              <div className="text-xs text-terminal-muted">No alerts configured</div>
            )}
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    rule.enabled ? "bg-terminal-up" : "bg-terminal-muted"
                  }`}
                  title={rule.enabled ? "Disable" : "Enable"}
                />
                <span className="flex-1 font-mono">{alertRuleLabel(rule)}</span>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="text-terminal-muted hover:text-terminal-down"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-wider text-terminal-muted">
              Triggered Events
            </div>
            {events.length > 0 && (
              <button
                onClick={clearEvents}
                className="text-[10px] text-terminal-muted hover:text-terminal-text"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {events.length === 0 && (
              <div className="text-xs text-terminal-muted">No events yet</div>
            )}
            {events.map((e) => (
              <div key={e.id} className="text-xs border border-terminal-border rounded px-2 py-1">
                <div className="font-mono text-terminal-accent">{e.symbol}</div>
                <div>{e.message}</div>
                <div className="text-[10px] text-terminal-muted">
                  {new Date(e.triggeredAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
