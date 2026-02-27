import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const STATE_KEY = "state:global";

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export async function GET() {
  const redis = getRedis();
  if (!redis) return NextResponse.json({});

  const state = (await redis.get<object>(STATE_KEY)) ?? {};
  return NextResponse.json(state);
}

export async function PUT(request: Request) {
  const redis = getRedis();
  if (!redis) return NextResponse.json({ ok: true });

  const body = await request.json();
  await redis.set(STATE_KEY, body);
  return NextResponse.json({ ok: true });
}
