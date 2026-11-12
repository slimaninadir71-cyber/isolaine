import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { clean, isEmail } from "@/lib/supabase-rest";
import { adminConfigured, getProspectByEmail, insertProspect, logEvent, recentSignups, updateProspect } from "@/lib/supabase-admin";
import { sendByKey } from "@/lib/emailing";
import { CONSENT_VERSION, PROMO_CODE, CODE_PCT } from "@/lib/promo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const SOURCES = ["accueil", "produit", "categorie", "laine-de-verre", "blog", "pied-de-page", "panier", "autre"];
const done = () => NextResponse.json({ ok: true, code: PROMO_CODE, pct: CODE_PCT });

/**
 * Inscription au guide : l'e-mail suffit. La case newsletter est facultative et son état est conservé comme preuve.
 * La réponse est la même que l'adresse soit déjà connue ou non.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return bad("Requête invalide."); }
  if (clean(body.website, 200)) return done(); // robot : on ignore sans le signaler
  const email = clean(body.email, 200).toLowerCase();
  if (!isEmail(email)) return bad("Indiquez une adresse e-mail valide.");
  if (!adminConfigured()) return bad("L'inscription est momentanément indisponible. Réessayez dans un instant.", 503);
  const consent = body.newsletter === true;
  const source = SOURCES.includes(clean(body.source, 40)) ? clean(body.source, 40) : "autre";
  const now = new Date();

  try {
    let p = await getProspectByEmail(email);
    if (!p) {
      // Limite anti-abus : quelques inscriptions par heure depuis une même origine (empreinte, l'adresse IP n'est pas conservée).
      const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
      const ipHash = ip ? createHash("sha256").update(`isolaine|${ip}`).digest("hex").slice(0, 32) : null;
      if (ipHash && (await recentSignups(ipHash, new Date(now.getTime() - 3600000).toISOString())) >= 5) return bad("Trop de demandes. Réessayez plus tard.", 429);
      p = await insertProspect({
        email, source, page: clean(body.page, 200) || null, ip_hash: ipHash,
        newsletter_consent: consent, newsletter_consent_at: consent ? now.toISOString() : null, consent_policy_version: CONSENT_VERSION,
      });
      await logEvent(p.id, "inscription");
    } else if (consent && (!p.newsletter_consent || p.unsubscribed_at)) {
      // Nouvel accord explicite (la case n'est jamais décochée par un simple renvoi du formulaire).
      await updateProspect(p.id, { newsletter_consent: true, newsletter_consent_at: now.toISOString(), consent_policy_version: CONSENT_VERSION, unsubscribed_at: null });
      p = { ...p, newsletter_consent: true, unsubscribed_at: null };
    }
    // E-mail 1 (guide + code) : transactionnel, un seul envoi par adresse.
    const r = await sendByKey(p, "bienvenue");
    if (r === "envoyé") await updateProspect(p.id, { guide_sent_at: now.toISOString(), coupon_sent_at: now.toISOString() });
    return done();
  } catch (e) {
    console.error("offre", (e as Error).message);
    return bad("L'inscription est momentanément indisponible. Réessayez dans un instant.", 502);
  }
}
