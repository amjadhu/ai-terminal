import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";
import { enrichNewsItem } from "@/lib/news";
import type { NewsItem } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const query = symbol || "stock market";

    const result: any = await yahooFinance.search(query, {
      quotesCount: 0,
      newsCount: 15,
    });

    const data = ((result.news ?? []) as Array<{
      title: string;
      link: string;
      publisher: string;
      providerPublishTime: string | number | Date;
    }>)
      .map((n) =>
        enrichNewsItem({
          title: n.title,
          link: n.link,
          publisher: n.publisher,
          providerPublishTime: new Date(n.providerPublishTime).getTime(),
        })
      )
      .sort((a: NewsItem, b: NewsItem) => b.impactScore - a.impactScore);

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
