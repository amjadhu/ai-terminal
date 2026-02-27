import { GET } from "@/app/api/news/route";
import yahooFinance from "@/lib/yahoo";

vi.mock("@/lib/yahoo", () => ({
  default: {
    search: vi.fn(),
  },
}));

describe("/api/news", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-27T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("returns enriched news sorted by impact", async () => {
    vi.mocked(yahooFinance.search).mockResolvedValue({
      news: [
        {
          title: "Tech giant announces merger",
          link: "https://example.com/1",
          publisher: "Wire",
          providerPublishTime: "2026-02-27T11:55:00Z",
        },
        {
          title: "Company launches new product",
          link: "https://example.com/2",
          publisher: "Wire",
          providerPublishTime: "2026-02-27T11:50:00Z",
        },
      ],
    } as never);

    const res = await GET(new Request("http://localhost/api/news"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data[0].impactScore).toBeGreaterThanOrEqual(body.data[1].impactScore);
    expect(body.data[0].catalystTags.length).toBeGreaterThan(0);
  });
});
