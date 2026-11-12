import { NextResponse } from "next/server";
import { adminConfigured, getProspectByToken, logEvent, updateProspect } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Désinscription : bouton de la page /desinscription, ou « désinscription en un clic » des messageries (en-tête List-Unsubscribe). */
export async function POST(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!adminConfigured()) return NextResponse.json({ error: "Service momentanément indisponible." }, { status: 503 });
  try {
    const p = await getProspectByToken(t);
    if (p && !p.unsubscribed_at) {
      await updateProspect(p.id, { unsubscribed_at: new Date().toISOString(), newsletter_consent: false });
      await logEvent(p.id, "desinscription");
    }
    return NextResponse.json({ ok: true }); // même réponse si le lien est inconnu
  } catch (e) {
    console.error("desinscription", (e as Error).message);
    return NextResponse.json({ error: "La désinscription n'a pas pu être enregistrée. Réessayez dans un instant." }, { status: 502 });
  }
}
