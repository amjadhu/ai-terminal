import { mergePanelLayouts } from "@/lib/layout";
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
