"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { Panel } from "@/components/ui/panel";
import { useCalendarStore } from "@/stores/calendar";
import { useEarnings } from "@/hooks/useMarketData";
import { buildEventCalendar } from "@/lib/calendar";
import { useSettingsStore } from "@/stores/settings";
import type { CalendarEvent, EventImpact } from "@/types";

type WindowKey = "24H" | "7D";

export function EventClock() {
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [windowKey, setWindowKey] = useState<WindowKey>("24H");
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [impact, setImpact] = useState<EventImpact>("medium");
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const { customEvents, addCustomEvent, removeCustomEvent } = useCalendarStore();
  const { data, isLoading, error, refetch, dataUpdatedAt } = useEarnings([selectedTicker]);

  const events = useMemo(
    () =>
      buildEventCalendar(data ?? [], customEvents, nowTs, {
        includeMacro: false,
        symbol: selectedTicker,
      }),
    [data, customEvents, nowTs, selectedTicker]
  );

  const horizonMs = windowKey === "24H" ? 24 * 60 * 60_000 : 7 * 24 * 60 * 60_000;
  const visibleEvents = events.filter(
    (e) => e.timestamp >= nowTs && e.timestamp <= nowTs + horizonMs
  );
  const nextEvent = visibleEvents[0] ?? events.find((e) => e.timestamp >= nowTs);

  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Panel
      title={`Event Clock — ${selectedTicker}`}
      isLoading={isLoading}
      error={error?.message}
      onRetry={() => refetch()}
      lastUpdatedAt={dataUpdatedAt}
      staleAfterMs={300_000}
    >
      <div className="flex flex-col h-full">
        <div className="border-b border-terminal-border px-3 py-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-terminal-muted">
              Next {selectedTicker} Event
            </div>
            {nextEvent ? (
              <div className="text-sm">
                <span className="font-semibold text-terminal-accent">{nextEvent.title}</span>
                <span className="text-terminal-muted"> in </span>
                <span className="font-mono">{formatCountdown(nextEvent.timestamp - nowTs)}</span>
              </div>
            ) : (
              <div className="text-xs text-terminal-muted">
                No upcoming {selectedTicker} events
              </div>
            )}
            <div className="text-[10px] text-terminal-muted mt-0.5">
              Ticker-specific timeline. Watchlist-wide schedule is in Earnings Calendar.
            </div>
          </div>
          <div className="flex gap-1">
            {(["24H", "7D"] as WindowKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setWindowKey(key)}
                className={`px-2 py-1 text-xs rounded font-mono ${
                  windowKey === key
                    ? "bg-terminal-accent text-terminal-bg"
                    : "text-terminal-muted hover:bg-terminal-hover"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0 divide-y divide-terminal-border">
          {visibleEvents.slice(0, 20).map((event) => (
            <EventRow key={event.id} event={event} onRemove={removeCustomEvent} />
          ))}
          {visibleEvents.length === 0 && (
            <div className="p-3 text-xs text-terminal-muted">No events in this window.</div>
          )}
        </div>

        <form
          className="border-t border-terminal-border p-2 grid grid-cols-4 gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title || !dateTime) return;
            const ts = new Date(dateTime).getTime();
            if (!Number.isFinite(ts)) return;
            addCustomEvent({ title, timestamp: ts, impact, symbol: selectedTicker });
            setTitle("");
            setDateTime("");
            setImpact("medium");
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Custom event title"
            className="col-span-2 bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs"
          />
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs"
          />
          <div className="flex gap-1">
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as EventImpact)}
              className="flex-1 bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button className="px-2 py-1 text-xs rounded bg-terminal-accent text-terminal-bg font-semibold">
              Add
            </button>
          </div>
        </form>
      </div>
    </Panel>
  );
}

function EventRow({
  event,
  onRemove,
}: {
  event: CalendarEvent;
  onRemove: (id: string) => void;
}) {
  const impactColor =
    event.impact === "high"
      ? "text-terminal-down"
      : event.impact === "medium"
      ? "text-yellow-400"
      : "text-terminal-up";

  return (
    <div className="px-3 py-2 text-xs hover:bg-terminal-hover transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`uppercase text-[10px] font-semibold ${impactColor}`}>
            {event.impact}
          </span>
          <span className="truncate">{event.title}</span>
          {event.estimated && (
            <span className="text-[10px] text-terminal-muted uppercase">est.</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-terminal-muted font-mono">
            {formatDateTime(event.timestamp)}
          </span>
          {event.source === "user" && (
            <button
              onClick={() => onRemove(event.id)}
              className="text-terminal-muted hover:text-terminal-down"
              title="Remove event"
            >
              x
            </button>
          )}
        </div>
      </div>
      <div className="mt-0.5 text-[10px] text-terminal-muted uppercase tracking-wider">
        {event.category} {event.symbol ? `| ${event.symbol}` : ""}
      </div>
    </div>
  );
}

function formatCountdown(diffMs: number) {
  if (diffMs <= 0) return "now";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
