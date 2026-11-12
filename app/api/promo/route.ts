import { NextResponse } from "next/server";
import { clean, isEmail } from "@/lib/supabase-rest";
import { adminConfigured, checkPromo } from "@/lib/supabase-admin";
import { normCode } from "@/lib/promo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vérifie un code promo pour une adresse e-mail (lecture seule : le montant final est recalculé à la commande). */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const code = normCode(body.code), email = clean(body.email, 200).toLowerCase();
  if (code.length < 4) return NextResponse.json({ error: "Ce code promo n'est pas valable." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Indiquez d'abord votre adresse e-mail dans le formulaire, puis appliquez le code." }, { status: 400 });
  if (!adminConfigured()) return NextResponse.json({ error: "Les codes promo sont momentanément indisponibles." }, { status: 503 });
  try {
    const c = await checkPromo(code, email);
    if (!c.ok) return NextResponse.json({ error: c.error }, { status: c.status });
    return NextResponse.json({ code: c.code, pct: c.pct });
  } catch (e) {
    console.error("promo", (e as Error).message);
    return NextResponse.json({ error: "Les codes promo sont momentanément indisponibles." }, { status: 502 });
  }
}
