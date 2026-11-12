// Lecture des ventes encaissées pour le tableau de bord externe (source « API partenaire »).
// Ne renvoie jamais de nom, d'e-mail, d'adresse, de produit ni de référence de commande : uniquement date, jour, montant.
import { timingSafeEqual } from "node:crypto";

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kquzvuhieiavbwtutpfi.supabase.co";

/** Jour calendaire à Paris (YYYY-MM-DD) : le tableau de bord raisonne en heure de Paris. */
export function parisDay(at: string | number | Date): string {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(at));
}

/** Jeton dédié, transmis en « Authorization: Bearer <jeton> » (variable d'environnement DASHPP_TOKEN). */
export function tokenOk(req: Request): boolean {
  const expected = process.env.DASHPP_TOKEN || "";
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (expected.length <= 20 || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export type Vente = { date: string; jour: string; montant_eur: number };

type Row = { total: number | string; paid_at: string | null; payment_id: string | null };

/**
 * Ventes encaissées (paiement par carte confirmé par la banque) dont le jour (Paris) est >= depuis, les plus récentes d'abord.
 * Un même identifiant de paiement avec le même montant ne compte qu'une fois.
 */
export async function ventes(depuis: string): Promise<Vente[]> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("configuration incomplète");
  const rows: Row[] = [];
  const PAGE = 1000; // plafond PostgREST par requête
  for (let p = 0; p < 50; p++) {
    const res = await fetch(`${SB}/rest/v1/orders?select=total,paid_at,payment_id&payment_status=eq.${encodeURIComponent("payé")}&paid_at=not.is.null&order=paid_at.desc&limit=${PAGE}&offset=${p * PAGE}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`lecture impossible (${res.status})`);
    const data = (await res.json()) as Row[];
    rows.push(...data);
    if (data.length < PAGE) break;
  }

  const seen = new Set<string>();
  const out: Vente[] = [];
  for (const o of rows) {
    if (!o.paid_at) continue;
    const jour = parisDay(o.paid_at);
    if (jour < depuis) continue;
    const montant_eur = Math.round((Number(o.total) || 0) * 100) / 100;
    const ref = o.payment_id ? String(o.payment_id).trim() : "";
    if (ref) {
      const k = `${ref}|${montant_eur}`;
      if (seen.has(k)) continue;
      seen.add(k);
    }
    out.push({ date: new Date(o.paid_at).toISOString(), jour, montant_eur });
  }
  out.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return out;
}
