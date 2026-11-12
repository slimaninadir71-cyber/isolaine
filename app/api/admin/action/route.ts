import { NextResponse } from "next/server";
import { isAdminWrite } from "@/lib/admin-auth";
import { clean, isEmail } from "@/lib/supabase-rest";
import { listCampaigns, sb, updateCampaign, updateProspect } from "@/lib/supabase-admin";
import { buildEmail, resendSend } from "@/lib/emailing";
import { runAll, sendNewsletter } from "@/lib/marketing";
import { normCode } from "@/lib/promo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const ok = (extra: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...extra });
const num = (v: unknown) => (Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : 0);
const text = (v: unknown) => (typeof v === "string" ? v.replace(/\r/g, "").slice(0, 20000).trim() : "");
const DEMO = { token: "0000000000000000000000000000" }; // liens d'exemple pour les aperçus et les tests

/** Actions de l'administration. Chaque appel vérifie la session et l'origine de la requête. */
export async function POST(req: Request) {
  if (!isAdminWrite(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return bad("Requête invalide."); }
  try {
    const camp = async () => (await listCampaigns()).find((c) => c.id === num(b.id));
    switch (b.action) {
      case "runNow": return ok(await runAll(40000));
      case "saveCampaign": {
        const c = await camp(), subject = clean(b.subject, 150), content = text(b.content);
        if (!c) return bad("Campagne introuvable.", 404);
        if (subject.length < 3 || content.length < 20) return bad("Indiquez un objet et un texte.");
        if (c.campaign_type === "newsletter" && c.status !== "brouillon") return bad("Cette newsletter est déjà validée : son texte ne peut plus être modifié.");
        if (c.key === "bienvenue" && !(content.includes("{{guide_url}}") && content.includes("{{code}}"))) return bad("L'e-mail 1 doit garder le lien du guide {{guide_url}} et le code {{code}}.");
        const f: Record<string, unknown> = { subject, content, name: clean(b.name, 120) || c.name };
        if (c.campaign_type === "sequence") f.scheduled_delay = Math.max(1, Math.min(365, Math.round(Number(b.scheduled_delay)) || c.scheduled_delay));
        await updateCampaign(c.id, f);
        return ok();
      }
      case "toggle": { const c = await camp(); if (!c) return bad("Campagne introuvable.", 404); await updateCampaign(c.id, { active: b.active === true }); return ok(); }
      case "preview": {
        const subject = clean(b.subject, 150), content = text(b.content);
        if (subject.length < 3 || content.length < 20) return bad("Indiquez un objet et un texte.");
        const m = buildEmail(DEMO, { subject, content, campaign_type: b.campaign_type === "transactionnel" ? "transactionnel" : "newsletter" });
        return NextResponse.json({ subject: m.subject, html: m.html, text: m.text });
      }
      case "newNewsletter": {
        const subject = clean(b.subject, 150), content = text(b.content);
        if (subject.length < 3 || content.length < 20) return bad("Indiquez un objet et un texte.");
        await sb("email_campaigns", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ key: `newsletter-${Date.now()}`, name: clean(b.name, 120) || subject, subject, content, campaign_type: "newsletter", scheduled_delay: 0, active: true, status: "brouillon", scheduled_at: null, approved_at: null, sent_at: null }) });
        return ok();
      }
      case "deleteNewsletter": {
        const c = await camp();
        if (!c || c.campaign_type !== "newsletter" || c.status !== "brouillon") return bad("Seul un brouillon peut être supprimé.");
        await sb(`email_campaigns?id=eq.${c.id}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
        return ok();
      }
      case "test": { // version enregistrée de la campagne, envoyée à une seule adresse, sans rien écrire au journal
        const c = await camp(), to = clean(b.to, 200).toLowerCase();
        if (!c) return bad("Campagne introuvable.", 404);
        if (!isEmail(to)) return bad("Indiquez l'adresse qui doit recevoir le test.");
        const m = buildEmail(DEMO, c);
        const r = await resendSend(to, { ...m, subject: `[TEST] ${m.subject}` });
        return r.ok ? ok() : bad(`Le test n'est pas parti : ${r.error}`, 502);
      }
      case "approve": { // rien ne part sans cette validation explicite
        const c = await camp();
        if (!c || c.campaign_type !== "newsletter" || c.status !== "brouillon") return bad("Cette newsletter ne peut pas être validée.");
        const when = typeof b.scheduled_at === "string" && b.scheduled_at ? new Date(b.scheduled_at) : null;
        if (when && Number.isNaN(when.getTime())) return bad("Date d'envoi invalide.");
        await updateCampaign(c.id, { status: "validée", approved_at: new Date().toISOString(), scheduled_at: when ? when.toISOString() : null });
        return ok();
      }
      case "unapprove": {
        const c = await camp();
        if (!c || c.campaign_type !== "newsletter" || c.status !== "validée") return bad("L'envoi a déjà commencé : la validation ne peut plus être annulée.");
        await updateCampaign(c.id, { status: "brouillon", approved_at: null, scheduled_at: null });
        return ok();
      }
      case "sendNow": {
        const c = await camp();
        if (!c || c.campaign_type !== "newsletter" || (c.status !== "validée" && c.status !== "en cours")) return bad("Cette newsletter doit d'abord être validée (ou elle est déjà envoyée).");
        return ok(await sendNewsletter(c, 60, Date.now() + 40000));
      }
      case "setPromo": {
        const code = normCode(b.code), pct = Number(b.pct);
        if (code.length < 4 || !(pct >= 1 && pct <= 50)) return bad("Le pourcentage doit être compris entre 1 et 50.");
        await sb(`promo_codes?code=eq.${encodeURIComponent(code)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ pct, active: b.active === true, updated_at: new Date().toISOString() }) });
        return ok();
      }
      case "unsubscribe": if (!num(b.id)) return bad("Personne introuvable.", 404); await updateProspect(num(b.id), { unsubscribed_at: new Date().toISOString(), newsletter_consent: false }); return ok();
      case "erase": // droit à l'effacement : la personne et son journal d'envois sont supprimés (suppression en cascade)
        if (!num(b.id)) return bad("Personne introuvable.", 404);
        await sb(`email_events?prospect_id=eq.${num(b.id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
        await sb(`prospects?id=eq.${num(b.id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
        return ok();
      default: return bad("Action inconnue.");
    }
  } catch (e) { console.error("admin action", (e as Error).message); return bad("L'action n'a pas abouti. Réessayez.", 502); }
}
