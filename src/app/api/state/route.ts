import { kv } from "@vercel/kv";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function sessionKey(id: string) {
  return `state:${id}`;
}

const TTL = 365 * 24 * 60 * 60; // 1 year in seconds

export async function GET() {
  if (!process.env.KV_REST_API_URL) {
    return NextResponse.json({});
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) return NextResponse.json({});

  const state = (await kv.get<object>(sessionKey(sessionId))) ?? {};
  return NextResponse.json(state);
}

export async function PUT(request: Request) {
  if (!process.env.KV_REST_API_URL) {
    return NextResponse.json({ ok: true });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const body = await request.json();
  await kv.set(sessionKey(sessionId), body, { ex: TTL });
  return NextResponse.json({ ok: true });
}
