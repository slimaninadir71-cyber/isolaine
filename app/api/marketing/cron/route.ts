import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminConfigured } from "@/lib/supabase-admin";
import { runAll } from "@/lib/marketing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Tâche planifiée (Vercel Cron, une fois par jour) : protégée par CRON_SECRET, transmis en « Authorization: Bearer ». */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET || "";
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (expected.length < 16 || got.length !== expected.length || !timingSafeEqual(Buffer.from(got), Buffer.from(expected))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!adminConfigured()) return NextResponse.json({ error: "configuration incomplète" }, { status: 503 });
  try { return NextResponse.json(await runAll()); } catch (e) { console.error("cron", (e as Error).message); return NextResponse.json({ error: "erreur" }, { status: 500 }); }
}
