import { NextResponse } from "next/server";
import { cawlEnabled, createHostedTokenization } from "@/lib/cawl";
import { adminConfigured } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Ouvre la session de saisie de carte (cadre sécurisé CAWL). */
export async function POST() {
  if (!cawlEnabled() || !adminConfigured()) return NextResponse.json({ error: "Paiement par carte indisponible" }, { status: 400 });
  try {
    const { url, id, host } = await createHostedTokenization();
    return NextResponse.json({ url, id, host });
  } catch (e) {
    console.error("cawl session", (e as Error).message);
    return NextResponse.json({ error: "Le formulaire de paiement n'a pas pu s'ouvrir." }, { status: 502 });
  }
}
