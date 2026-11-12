import { NextResponse } from "next/server";
import { isAdmin, isAdminWrite } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kquzvuhieiavbwtutpfi.supabase.co";
const FILE = "guide-isolation-isolaine.pdf";
const PUBLIC = process.env.GUIDE_PDF_URL || `${SB}/storage/v1/object/public/guides/${FILE}`;

/** Le guide est-il en ligne ? */
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const r = await fetch(PUBLIC, { method: "HEAD", cache: "no-store" });
    return NextResponse.json({ online: r.ok, size: r.ok ? Number(r.headers.get("content-length")) || 0 : 0, url: PUBLIC }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ online: false, size: 0, url: PUBLIC }); }
}

/** Mise en ligne (ou remplacement) du guide PDF dans le dossier public « guides ». 4 Mo au plus. */
export async function POST(req: Request) {
  if (!isAdminWrite(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const buf = new Uint8Array(await req.arrayBuffer());
  if (buf.length > 4 * 1024 * 1024) return NextResponse.json({ error: "Le fichier doit faire 4 Mo au plus." }, { status: 400 });
  if (buf.length < 8 || String.fromCharCode(...buf.slice(0, 5)) !== "%PDF-") return NextResponse.json({ error: "Ce fichier n'est pas un PDF." }, { status: 400 });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  try {
    const res = await fetch(`${SB}/storage/v1/object/guides/${FILE}`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/pdf", "x-upsert": "true", "Cache-Control": "max-age=300" }, body: buf, cache: "no-store" });
    if (!res.ok) { console.error("admin guide", res.status, (await res.text().catch(() => "")).slice(0, 200)); return NextResponse.json({ error: "Le fichier n'a pas pu être enregistré. Réessayez." }, { status: 502 }); }
    return NextResponse.json({ ok: true, url: PUBLIC, size: buf.length });
  } catch (e) { console.error("admin guide", (e as Error).message); return NextResponse.json({ error: "Le fichier n'a pas pu être enregistré. Réessayez." }, { status: 502 }); }
}
