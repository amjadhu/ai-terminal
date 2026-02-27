import type { PanelLayout } from "@/types";

export function mergePanelLayouts(
  incoming: PanelLayout[],
  defaults: PanelLayout[]
): PanelLayout[] {
  const merged = dedupeById(incoming);
  const existingIds = new Set(merged.map((l) => l.i));

  // Insert missing default panels at their intended vertical slot by shifting
  // existing panels down. This preserves user layout while avoiding collisions.
  for (const fallback of defaults) {
    if (existingIds.has(fallback.i)) continue;
    for (const item of merged) {
      if (item.y >= fallback.y) {
        item.y += fallback.h;
      }
    }
    merged.push({ ...fallback });
    existingIds.add(fallback.i);
  }

  const byId = new Map(merged.map((l) => [l.i, l]));
  return defaults
    .filter((d) => byId.has(d.i))
    .map((d) => byId.get(d.i) as PanelLayout);
}

export function stabilizeLayouts(
  incoming: PanelLayout[],
  defaults: PanelLayout[]
): PanelLayout[] {
  const merged = mergePanelLayouts(incoming, defaults);
  if (!isTopWorkspaceHealthy(merged)) {
    return defaults.map((d) => ({ ...d }));
  }
  return merged;
}

function dedupeById(layouts: PanelLayout[]): PanelLayout[] {
  const seen = new Set<string>();
  const out: PanelLayout[] = [];
  for (const layout of layouts) {
    if (seen.has(layout.i)) continue;
    out.push({ ...layout });
    seen.add(layout.i);
  }
  return out;
}

function isTopWorkspaceHealthy(layouts: PanelLayout[]): boolean {
  const byId = new Map(layouts.map((l) => [l.i, l]));
  const watchlist = byId.get("watchlist");
  const chart = byId.get("chart");
  const calendar = byId.get("calendar");

  if (!watchlist || !chart || !calendar) return false;
  if (watchlist.w < 2 || chart.w < 4 || calendar.w < 2) return false;

  // Core workspace should be on one band and reasonably fill row width.
  const yBand = Math.min(watchlist.y, chart.y, calendar.y);
  const coreOnBand = [watchlist, chart, calendar].filter((p) => p.y === yBand);
  const occupiedCols = coreOnBand.reduce((sum, p) => sum + p.w, 0);

  return occupiedCols >= 10;
}
