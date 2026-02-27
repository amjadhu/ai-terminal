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
