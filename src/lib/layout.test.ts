import { mergePanelLayouts, stabilizeLayouts } from "@/lib/layout";
import type { PanelLayout } from "@/types";

describe("mergePanelLayouts", () => {
  it("keeps incoming order and appends missing defaults", () => {
    const incoming: PanelLayout[] = [
      { i: "watchlist", x: 0, y: 0, w: 3, h: 6 },
      { i: "chart", x: 3, y: 0, w: 9, h: 6 },
    ];
    const defaults: PanelLayout[] = [
      { i: "market", x: 0, y: 0, w: 12, h: 4 },
      { i: "watchlist", x: 0, y: 4, w: 3, h: 8 },
      { i: "chart", x: 3, y: 4, w: 9, h: 8 },
    ];

    const merged = mergePanelLayouts(incoming, defaults);
    expect(merged.map((m) => m.i)).toEqual(["market", "watchlist", "chart"]);
  });
});

describe("stabilizeLayouts", () => {
  it("heals sparse layouts so core top workspace is present and aligned", () => {
    const sparse: PanelLayout[] = [
      { i: "market", x: 0, y: 0, w: 12, h: 4 },
      { i: "watchlist", x: 0, y: 10, w: 3, h: 10 },
      { i: "calendar", x: 9, y: 10, w: 3, h: 10 },
      { i: "intel", x: 0, y: 30, w: 12, h: 6 },
    ];
    const defaults: PanelLayout[] = [
      { i: "market", x: 0, y: 0, w: 12, h: 4 },
      { i: "watchlist", x: 0, y: 10, w: 3, h: 10 },
      { i: "chart", x: 3, y: 10, w: 6, h: 10 },
      { i: "calendar", x: 9, y: 10, w: 3, h: 10 },
      { i: "intel", x: 0, y: 20, w: 12, h: 6 },
    ];

    const stabilized = stabilizeLayouts(sparse, defaults);
    const byId = new Map(stabilized.map((l) => [l.i, l]));
    expect(byId.has("chart")).toBe(true);
    expect(byId.has("watchlist")).toBe(true);
    expect(byId.has("calendar")).toBe(true);
    expect(byId.get("watchlist")?.y).toBe(byId.get("calendar")?.y);
  });
});
