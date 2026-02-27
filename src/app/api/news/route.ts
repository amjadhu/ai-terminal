import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const query = symbol || "stock market";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yahooFinance.search(query, {
      quotesCount: 0,
      newsCount: 15,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (result.news ?? []).map((n: any) => ({
      title: n.title,
      link: n.link,
      publisher: n.publisher,
      providerPublishTime: new Date(n.providerPublishTime).getTime(),
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
