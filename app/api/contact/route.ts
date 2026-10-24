import { NextResponse } from "next/server";
import { clean, insertRow, isEmail } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Enregistre une demande de contact ou de devis. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return bad("Requête invalide."); }
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const kind = body.kind === "devis" ? "devis" : "contact";
  const name = clean(body.name, 120), email = clean(body.email, 200).toLowerCase(), message = clean(body.message, 4000);
  if (name.length < 2) return bad("Indiquez votre nom.");
  if (!isEmail(email)) return bad("Indiquez une adresse e-mail valide.");
  if (message.length < 5) return bad("Précisez votre demande en quelques mots.");
  try {
    await insertRow("requests", {
      kind, status: "nouvelle", name, email, message,
      company: clean(body.company, 120) || null, phone: clean(body.phone, 30) || null, product: clean(body.product, 300) || null,
    });
  } catch (e) {
    console.error("contact", (e as Error).message);
    return bad("Votre demande n'a pas pu être envoyée. Réessayez dans un instant.", 502);
  }
  return NextResponse.json({ ok: true });
}
