import { mergeWatchlists } from "@/lib/watchlist";

describe("mergeWatchlists", () => {
  it("keeps primary ordering and appends missing defaults", () => {
    const result = mergeWatchlists(
      ["msft", "aapl", "tsla"],
      ["AAPL", "GOOG", "MSFT"]
    );
    expect(result).toEqual(["MSFT", "AAPL", "TSLA", "GOOG"]);
  });

  it("deduplicates and drops empty symbols", () => {
    const result = mergeWatchlists(["", "aapl", "AAPL"], ["AAPL", "MSFT"]);
    expect(result).toEqual(["AAPL", "MSFT"]);
  });
});
