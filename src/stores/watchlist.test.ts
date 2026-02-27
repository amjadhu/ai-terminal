import { useWatchlistStore } from "@/stores/watchlist";

describe("watchlist store", () => {
  beforeEach(() => {
    useWatchlistStore.setState({ tickers: ["AAPL", "MSFT", "GOOG"] });
  });

  it("moves a ticker and preserves resulting order", () => {
    useWatchlistStore.getState().moveTicker(2, 0);
    expect(useWatchlistStore.getState().tickers).toEqual(["GOOG", "AAPL", "MSFT"]);
  });

  it("does not mutate state for invalid indexes", () => {
    const before = useWatchlistStore.getState().tickers;
    useWatchlistStore.getState().moveTicker(-1, 0);
    expect(useWatchlistStore.getState().tickers).toEqual(before);
  });
});
