import type { CalendarEvent, EarningsItem } from "@/types";

export function buildEventCalendar(
  earnings: EarningsItem[],
  customEvents: CalendarEvent[],
  now = Date.now()
): CalendarEvent[] {
  const macro = buildMacroEstimates(now);
  const earningsEvents = earnings
    .filter((e) => !!e.earningsDate)
    .map((e) => {
      const [year, month, day] = (e.earningsDate as string).split("-").map(Number);
      const dt = new Date(year, month - 1, day, 16, 0, 0, 0);
      return {
        id: `earnings-${e.symbol}-${e.earningsDate}`,
        title: `${e.symbol} Earnings`,
        category: "earnings",
        impact: "medium",
        timestamp: dt.getTime(),
        symbol: e.symbol,
        source: "system",
      } as CalendarEvent;
    });

  const all = [...macro, ...earningsEvents, ...customEvents]
    .filter((e) => e.timestamp >= now - 30 * 60_000)
    .sort((a, b) => a.timestamp - b.timestamp);

  const seen = new Set<string>();
  return all.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

export function buildMacroEstimates(now = Date.now()): CalendarEvent[] {
  const d = new Date(now);
  const year = d.getFullYear();
  const month = d.getMonth();

  const cpi = nextMonthlyEvent(year, month, 12, 8, 30, now);
  const nfp = nextFirstFridayEvent(year, month, 8, 30, now);
  const fomc = nextQuarterlyEvent(year, month, 18, 14, 0, now);

  return [
    {
      id: `macro-cpi-${dateKey(cpi)}`,
      title: "US CPI (Est.)",
      category: "macro",
      impact: "high",
      timestamp: cpi.getTime(),
      estimated: true,
      source: "system",
    },
    {
      id: `macro-nfp-${dateKey(nfp)}`,
      title: "US Jobs Report (Est.)",
      category: "macro",
      impact: "high",
      timestamp: nfp.getTime(),
      estimated: true,
      source: "system",
    },
    {
      id: `macro-fomc-${dateKey(fomc)}`,
      title: "FOMC Decision (Est.)",
      category: "macro",
      impact: "high",
      timestamp: fomc.getTime(),
      estimated: true,
      source: "system",
    },
  ];
}

function nextMonthlyEvent(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  now: number
) {
  const current = new Date(year, month, day, hour, minute, 0, 0);
  if (current.getTime() > now) return current;
  return new Date(year, month + 1, day, hour, minute, 0, 0);
}

function nextQuarterlyEvent(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  now: number
) {
  const quarterlyMonths = [2, 5, 8, 11]; // Mar, Jun, Sep, Dec
  for (const qMonth of quarterlyMonths) {
    const dt = new Date(year, qMonth, day, hour, minute, 0, 0);
    if (dt.getTime() > now) return dt;
  }
  return new Date(year + 1, quarterlyMonths[0], day, hour, minute, 0, 0);
}

function nextFirstFridayEvent(
  year: number,
  month: number,
  hour: number,
  minute: number,
  now: number
) {
  const current = firstFridayOfMonth(year, month, hour, minute);
  if (current.getTime() > now) return current;
  return firstFridayOfMonth(year, month + 1, hour, minute);
}

function firstFridayOfMonth(year: number, month: number, hour: number, minute: number) {
  const first = new Date(year, month, 1, hour, minute, 0, 0);
  const day = first.getDay();
  const offset = (5 - day + 7) % 7; // Friday = 5
  return new Date(year, month, 1 + offset, hour, minute, 0, 0);
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}
