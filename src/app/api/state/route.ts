import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const STATE_KEY = "state:global";

function getRedis() {
  // Vercel+Upstash integration may inject either naming convention
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.warn("[state] Redis env vars not set — persistence disabled");
    return null;
  }
  return new Redis({ url, token });
}

export async function GET() {
  const redis = getRedis();
  if (!redis) return NextResponse.json({});

  try {
    const state = (await redis.get<object>(STATE_KEY)) ?? {};
    return NextResponse.json(state);
  } catch (err) {
    console.error("[state] GET failed:", err);
    return NextResponse.json({});
  }
}

export async function PUT(request: Request) {
  const redis = getRedis();
  if (!redis) return NextResponse.json({ ok: true });

  try {
    const body = await request.json();
    await redis.set(STATE_KEY, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[state] PUT failed:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
