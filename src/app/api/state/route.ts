import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function sessionKey(id: string) {
  return `state:${id}`;
}

const TTL = 365 * 24 * 60 * 60; // 1 year in seconds

export async function GET() {
  const redis = getRedis();
  if (!redis) return NextResponse.json({});

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) return NextResponse.json({});

  const state = (await redis.get<object>(sessionKey(sessionId))) ?? {};
  return NextResponse.json(state);
}

export async function PUT(request: Request) {
  const redis = getRedis();
  if (!redis) return NextResponse.json({ ok: true });

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const body = await request.json();
  await redis.set(sessionKey(sessionId), body, { ex: TTL });
  return NextResponse.json({ ok: true });
}
