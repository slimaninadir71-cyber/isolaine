import { NextResponse } from "next/server";
import { adminEnabled, isAdmin, logLogin, passwordOk, sessionCookie, tooManyLogins } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return NextResponse.json({ enabled: adminEnabled(), ok: isAdmin(req) }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: Request) {
  if (!adminEnabled()) return NextResponse.json({ error: "L'administration n'est pas encore activée (variable ADMIN_PASSWORD absente ou trop courte)." }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  try {
    if (await tooManyLogins(req)) return NextResponse.json({ error: "Trop de tentatives. Réessayez dans un quart d'heure." }, { status: 429 });
  } catch { return NextResponse.json({ error: "Connexion momentanément indisponible." }, { status: 502 }); }
  const ok = passwordOk(typeof body.password === "string" ? body.password : "");
  await logLogin(req, ok);
  if (!ok) { await new Promise((r) => setTimeout(r, 800)); return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 }); }
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(), "Cache-Control": "no-store" } });
}
export async function DELETE() {
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(true) } });
}
