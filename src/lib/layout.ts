import type { PanelLayout } from "@/types";

export function mergePanelLayouts(
  incoming: PanelLayout[],
  defaults: PanelLayout[]
): PanelLayout[] {
  const byId = new Map(incoming.map((l) => [l.i, l]));
  const merged: PanelLayout[] = [];
  const seen = new Set<string>();

  for (const layout of incoming) {
    if (seen.has(layout.i)) continue;
    merged.push(layout);
    seen.add(layout.i);
  }

  for (const fallback of defaults) {
    if (seen.has(fallback.i)) continue;
    merged.push(byId.get(fallback.i) ?? fallback);
    seen.add(fallback.i);
  }

  return merged;
}
