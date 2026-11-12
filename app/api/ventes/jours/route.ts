import { NextResponse } from "next/server";
import { tokenOk, ventes } from "@/lib/ventes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Repli : totaux par journée (heure de Paris). */
export async function GET(req: Request) {
  if (!tokenOk(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const d = u.searchParams.get("depuis") || "";
  const depuis = DAY.test(d) ? d : "2000-01-01";

  try {
    const all = await ventes(depuis);
    const by = new Map<string, { ventes: number; montant: number }>();
    for (const v of all) {
      const a = by.get(v.jour) || { ventes: 0, montant: 0 };
      a.ventes++; a.montant += v.montant_eur;
      by.set(v.jour, a);
    }
    const jours = [...by.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([jour, a]) => ({ jour, ventes: a.ventes, montant_eur: Math.round(a.montant * 100) / 100 }));
    return NextResponse.json({ depuis, sites: [{ site: "isolaine", jours }] }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("ventes jours", (e as Error).message);
    return NextResponse.json({ error: "erreur de lecture", code: (e as Error).message.match(/\((\d{3})\)/)?.[1] ?? "config" }, { status: 500 }); // code HTTP de la base seulement, jamais de secret
  }
}
