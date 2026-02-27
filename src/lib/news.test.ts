import {
  classifyNewsCatalysts,
  computeNewsImpactScore,
  enrichNewsItem,
} from "@/lib/news";

describe("news enrichment", () => {
  it("classifies catalyst tags from title", () => {
    const tags = classifyNewsCatalysts("Company beats earnings and raises guidance");
    expect(tags).toContain("earnings");
  });

  it("gives newer headlines higher scores", () => {
    const now = Date.now();
    const fresh = computeNewsImpactScore("Merger announced", now - 5 * 60_000);
    const stale = computeNewsImpactScore("Merger announced", now - 24 * 60 * 60_000);
    expect(fresh).toBeGreaterThan(stale);
  });

  it("adds tags and score to item", () => {
    const item = enrichNewsItem({
      title: "Analyst upgrades stock and raises price target",
      link: "https://example.com",
      publisher: "Example",
      providerPublishTime: Date.now(),
    });
    expect(item.catalystTags.length).toBeGreaterThan(0);
    expect(item.impactScore).toBeGreaterThan(0);
  });
});
