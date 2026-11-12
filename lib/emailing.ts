// E-mails du guide et de la newsletter : mise en forme commune, règles d'accord, un seul envoi par personne et par campagne.
import { COMPANY, SITE } from "@/lib/site";
import { CONTACT } from "@/lib/contact";
import { PROMO_CODE } from "@/lib/promo";
import { claimSend, closeSend, getCampaign, type Campaign, type Prospect } from "@/lib/supabase-admin";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const safeUrl = (u: string) => (/^https:\/\/[^\s"<>]+$/.test(u) ? u : SITE.url);

export const linksFor = (p: Pick<Prospect, "token">) => ({
  guide_url: `${SITE.url}/api/guide?t=${p.token}`,
  desinscription_url: `${SITE.url}/desinscription?t=${p.token}`,
  boutique_url: `${SITE.url}/laine-de-verre`,
  site_url: SITE.url,
  code: PROMO_CODE,
});

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => vars[k] ?? m);
// Mise en forme en ligne : **gras** et [texte](lien). Le texte est d'abord échappé.
const inline = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, (_m, t, u) => `<a href="${safeUrl(u.replace(/&amp;/g, "&"))}" style="color:#1f5fae">${t}</a>`);
const plain = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, "$1 : $2");

/**
 * Transforme le texte d'une campagne en HTML et en texte brut.
 * Syntaxe : paragraphes séparés par une ligne vide, « ## Titre », listes « - », bouton « [[Texte | lien]] », encadré « > texte ».
 */
export function renderBody(content: string, vars: Record<string, string>) {
  const html: string[] = [], text: string[] = [];
  for (const raw of fill(content, vars).replace(/\r/g, "").split(/\n{2,}/)) {
    const b = raw.trim();
    if (!b) continue;
    const btn = b.match(/^\[\[\s*(.+?)\s*\|\s*(\S+)\s*\]\]$/);
    if (btn) {
      html.push(`<p style="margin:22px 0"><a href="${safeUrl(btn[2])}" style="display:inline-block;padding:14px 22px;background:#f5b400;color:#1b1400;font-weight:bold;border-radius:8px;text-decoration:none">${esc(btn[1])}</a></p>`);
      text.push(`${btn[1]} : ${safeUrl(btn[2])}`);
    } else if (b.startsWith("## ")) {
      html.push(`<h2 style="margin:26px 0 8px;font-size:18px;color:#0f2233">${inline(b.slice(3))}</h2>`); text.push(plain(b.slice(3)).toUpperCase());
    } else if (b.split("\n").every((l) => l.startsWith("- "))) {
      html.push(`<ul style="margin:0 0 14px;padding-left:20px">${b.split("\n").map((l) => `<li style="margin:0 0 6px">${inline(l.slice(2))}</li>`).join("")}</ul>`); text.push(b.split("\n").map(plain).join("\n"));
    } else if (b.startsWith("> ")) {
      const t = b.split("\n").map((l) => l.replace(/^> ?/, ""));
      html.push(`<div style="margin:18px 0;padding:14px 16px;background:#f5f7f9;border-left:4px solid #f5b400;border-radius:6px">${t.map(inline).join("<br>")}</div>`); text.push(t.map(plain).join("\n"));
    } else {
      html.push(`<p style="margin:0 0 14px">${b.split("\n").map(inline).join("<br>")}</p>`); text.push(b.split("\n").map(plain).join("\n"));
    }
  }
  return { html: html.join(""), text: text.join("\n\n") };
}

/** Habillage commun aux e-mails ISO-LAINE. Les e-mails commerciaux portent toujours le lien de désinscription. */
export function layout(subject: string, body: { html: string; text: string }, opts: { commercial: boolean; unsubscribe: string; why?: string }) {
  const why = opts.why ? opts.why : opts.commercial
    ? `Vous recevez cet e-mail car vous avez accepté de recevoir les conseils et offres d'ISO-LAINE.`
    : `Vous recevez cet e-mail car vous avez demandé le guide ISO-LAINE sur ${SITE.domain}. Il ne s'agit pas d'une inscription à la newsletter.`;
  const legal = `${COMPANY.legalName}, ${COMPANY.address} – SIREN ${COMPANY.siren}`;
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head><body style="margin:0;padding:0;background:#f5f7f9"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f9"><tr><td align="center" style="padding:20px 10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#1b2833"><tr><td style="background:#0f2233;padding:18px 26px;border-bottom:4px solid #f5b400"><a href="${SITE.url}" style="color:#ffffff;text-decoration:none;font-size:22px;font-weight:bold;letter-spacing:.5px">ISO<span style="color:#f5b400">-</span>LAINE</a><div style="color:#c4d0db;font-size:12px;margin-top:2px">Laine de verre et isolants, livraison offerte</div></td></tr><tr><td style="padding:26px">${body.html}<p style="margin:22px 0 0">L'équipe ISO-LAINE<br><span style="color:#5d6b7a;font-size:14px">Une question ? Répondez à cet e-mail ou écrivez-nous sur WhatsApp au ${esc(CONTACT.whatsappDisplay)}.</span></p></td></tr><tr><td style="background:#f5f7f9;padding:16px 26px;color:#5d6b7a;font-size:12px;line-height:1.5">${esc(why)}<br>${opts.commercial ? `<a href="${opts.unsubscribe}" style="color:#5d6b7a">Se désinscrire en un clic</a> · ` : ""}<a href="${SITE.url}/confidentialite" style="color:#5d6b7a">Données personnelles</a><br>${esc(legal)}</td></tr></table></td></tr></table></body></html>`;
  const text = `${body.text}\n\nL'équipe ISO-LAINE\nUne question ? Répondez à cet e-mail ou écrivez-nous sur WhatsApp au ${CONTACT.whatsappDisplay}.\n\n--\n${why}\n${opts.commercial ? `Se désinscrire : ${opts.unsubscribe}\n` : ""}Données personnelles : ${SITE.url}/confidentialite\n${legal}\n`;
  return { html, text };
}

const isCommercial = (c: Pick<Campaign, "campaign_type">) => c.campaign_type !== "transactionnel";

/** Une campagne commerciale ne part jamais sans accord explicite, ni après une désinscription ; les relances s'arrêtent après un achat. */
export function eligible(p: Prospect, c: Pick<Campaign, "campaign_type">) {
  if (!isCommercial(c)) return true;
  if (!p.newsletter_consent || p.unsubscribed_at) return false;
  if (c.campaign_type === "sequence" && p.customer_status === "client") return false;
  return true;
}

export function buildEmail(p: Pick<Prospect, "token">, c: Pick<Campaign, "subject" | "content" | "campaign_type">) {
  const vars = linksFor(p);
  const subject = fill(c.subject, vars);
  return { subject, ...layout(subject, renderBody(c.content, vars), { commercial: isCommercial(c), unsubscribe: vars.desinscription_url }) };
}

type Sent = { ok: true; id: string } | { ok: false; error: string };
/** Envoi par Resend. Ne dit « envoyé » que si le service a confirmé (identifiant de message renvoyé). */
export async function resendSend(to: string, mail: { subject: string; html: string; text: string }, opts: { idem?: string; unsubscribe?: string } = {}): Promise<Sent> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY manquante" };
  const from = process.env.MARKETING_EMAIL_FROM || process.env.ORDER_EMAIL_FROM || "Isolaine <commandes@iso-laine.com>";
  const reply = process.env.ORDER_EMAIL_TO?.split(",")[0]?.trim();
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(opts.idem ? { "Idempotency-Key": opts.idem } : {}) },
      body: JSON.stringify({ from, to: [to], subject: mail.subject, html: mail.html, text: mail.text, ...(reply ? { reply_to: reply } : {}), ...(opts.unsubscribe ? { headers: { "List-Unsubscribe": `<${opts.unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } } : {}) }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok || !data.id) return { ok: false, error: `Resend ${res.status} ${data.message ?? ""}`.trim() };
    return { ok: true, id: data.id };
  } catch (e) { return { ok: false, error: (e as Error).message }; }
}

export type SendResult = "envoyé" | "ignoré" | "déjà envoyé" | "échec";
/** Envoie une campagne à un prospect : contrôle de l'accord, réservation (anti-doublon), envoi, journal. Ne lève jamais d'erreur. */
export async function sendCampaign(p: Prospect, c: Campaign): Promise<SendResult> {
  try {
    if (!c.active || !eligible(p, c)) return "ignoré";
    const claim = await claimSend(p.id, c.id);
    if (!claim) return "déjà envoyé";
    const r = await resendSend(p.email, buildEmail(p, c), { idem: `isolaine-${c.id}-${p.id}-${claim.attempts}`, unsubscribe: isCommercial(c) ? `${SITE.url}/api/desinscription?t=${p.token}` : undefined });
    await closeSend(claim.id, r.ok, r.ok ? r.id : r.error, claim.attempts + 1);
    if (!r.ok) console.error("campagne", c.key, r.error);
    return r.ok ? "envoyé" : "échec";
  } catch (e) { console.error("campagne", (e as Error).message); return "échec"; }
}

export async function sendByKey(p: Prospect, key: string): Promise<SendResult> {
  try { const c = await getCampaign(key); return c ? await sendCampaign(p, c) : "ignoré"; } catch (e) { console.error("campagne", (e as Error).message); return "échec"; }
}
