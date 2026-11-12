// Envoi d'e-mails via Resend (https://resend.com). Inactif tant que RESEND_API_KEY et ORDER_EMAIL_TO ne sont pas définis.
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

import { layout } from "@/lib/emailing";
import { SITE } from "@/lib/site";

export const mailConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.ORDER_EMAIL_TO;

/** Envoie un e-mail à l'équipe. Ne lève jamais d'erreur : un échec d'e-mail ne doit pas bloquer une commande. */
export async function notifyTeam(subject: string, lines: [string, string][], replyTo?: string) {
  const key = process.env.RESEND_API_KEY, to = process.env.ORDER_EMAIL_TO;
  if (!key || !to) return false;
  const from = process.env.ORDER_EMAIL_FROM || "Isolaine <commandes@iso-laine.com>";
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#202923"><h2 style="margin:0 0 12px;color:#173D32">${esc(subject)}</h2><table cellpadding="6" style="border-collapse:collapse">${
    lines.map(([k, v]) => `<tr><td style="vertical-align:top;color:#5B665F;white-space:nowrap">${esc(k)}</td><td style="white-space:pre-line">${esc(v)}</td></tr>`).join("")
  }</table></div>`;
  const text = `${subject}\n\n${lines.map(([k, v]) => `${k} : ${v}`).join("\n")}\n`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()).filter(Boolean), subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
      cache: "no-store",
    });
    if (!res.ok) { console.error("mail", res.status, (await res.text().catch(() => "")).slice(0, 200)); return false; }
    return true;
  } catch (e) { console.error("mail", (e as Error).message); return false; }
}

type Line = { qty: number; name: string; option?: string | null; unit_price?: number | null; total?: number | null };
type ConfirmOrder = { billing?: import("./types").Billing | null; reference: string; customer_name?: string | null; email?: string | null; phone?: string | null; total: number | string; delivery_mode?: string | null; address?: string | null; postal_code?: string | null; city?: string | null; country?: string | null; discount?: number | string | null; promo_code?: string | null; items?: Line[] };

const money = (n: unknown) => Number(n).toFixed(2).replace(".", ",") + " €";
const lineText = (i: Line) => `${i.qty} × ${i.name}${i.option ? ` (${i.option})` : ""}${i.total != null ? ` : ${money(i.total)}` : ""}`;
/** Articles d'une commande, un par ligne, avec leur montant (pour l'e-mail de l'équipe). */
/** Ligne « Code promo » pour l'e-mail de l'équipe (vide si aucun code). */
export const promoLine = (o: { discount?: number | string | null; promo_code?: string | null }): [string, string][] => (o.promo_code && Number(o.discount) > 0 ? [["Code promo", `${o.promo_code} : −${money(o.discount)}`]] : []);
export const itemsText = (items: Line[] = []) => items.map(lineText).join("\n");
/** Ligne « Facturation » pour l'e-mail de l'équipe (vide si le client n'a pas indiqué d'adresse de facturation différente). */
export const billingLine = (o: { billing?: import("./types").Billing | null }): [string, string][] =>
  (o.billing ? [["Facturation", `${o.billing.name}${o.billing.company ? ` (${o.billing.company})` : ""}, ${o.billing.address}, ${o.billing.postal} ${o.billing.city}, ${o.billing.country}`]] : []);

/** E-mail de confirmation envoyé au client après un paiement accepté (récapitulatif de la commande). Ne lève jamais d'erreur. */
export async function notifyCustomer(order: ConfirmOrder) {
  try {
    const key = process.env.RESEND_API_KEY, team = process.env.ORDER_EMAIL_TO;
    const to = (order.email ?? "").trim();
    if (!key || !to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;
    const from = process.env.ORDER_EMAIL_FROM || "Isolaine <commandes@iso-laine.com>";
    const total = money(order.total);
    const items = order.items ?? [];
    const delivered = order.delivery_mode === "livraison" && !!order.address;
    const where = delivered ? `${order.address}\n${order.postal_code ?? ""} ${order.city ?? ""}\n${order.country ?? ""}` : "";
    const b = order.billing;
    const bill = b ? `${b.name}${b.company ? `\n${b.company}` : ""}\n${b.address}\n${b.postal} ${b.city}\n${b.country}` : "";
    const name = (order.customer_name ?? "").trim();
    const promo = !!order.promo_code && Number(order.discount) > 0;
    const subject = `Confirmation de votre commande ${order.reference} – Isolaine`;
    const text = [
      name ? `Bonjour ${name},` : "Bonjour,",
      "",
      `Merci pour votre commande ! Nous avons bien reçu votre paiement de ${total}.`,
      `Numéro de commande : ${order.reference}`,
      "",
      "RÉCAPITULATIF",
      ...items.map(lineText),
      ...(promo ? [`Code promo ${order.promo_code} : −${money(order.discount)}`] : []),
      "Livraison : offerte",
      `Total payé : ${total}`,
      "",
      delivered ? `ADRESSE DE LIVRAISON\n${where}\n` : "",
      bill ? `ADRESSE DE FACTURATION\n${bill}\n` : "",
      "Livraison offerte",
      "Votre commande est expédiée sous 24 h. Comptez environ 7 jours pour la livraison.",
      "",
      `Suivre l'actualité d'ISO-LAINE : ${SITE.url}`,
    ].join("\n");
    // Mise en page commune aux e-mails ISO-LAINE (en-tête vert foncé, filet vert clair, pied de page légal).
    const cell = "padding:12px 0;border-bottom:1px solid #D5DAD4;vertical-align:top";
    const rows = items.map((i) => `<tr><td style="${cell}"><b>${esc(i.name)}</b>${i.option ? `<br><span style="color:#5B665F;font-size:14px">${esc(i.option)}</span>` : ""}<br><span style="color:#5B665F;font-size:14px">Quantité : ${esc(i.qty)}${i.unit_price != null ? ` × ${esc(money(i.unit_price))}` : ""}</span></td><td style="${cell};text-align:right;white-space:nowrap;padding-left:12px"><b>${i.total != null ? esc(money(i.total)) : ""}</b></td></tr>`).join("");
    const line = (label: string, value: string, color = "#202923") => `<tr><td style="padding:8px 0;color:#5B665F">${label}</td><td style="padding:8px 0;text-align:right;white-space:nowrap;color:${color}">${value}</td></tr>`;
    const body = `<h1 style="margin:0 0 6px;font-size:24px;line-height:1.25;color:#173D32">Merci pour votre commande !</h1>
<p style="margin:0 0 18px">${name ? `Bonjour ${esc(name)}, n` : "N"}ous avons bien reçu votre paiement. Votre commande est en préparation.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E9ECE8;border-radius:3px;margin:0 0 22px"><tr>
<td style="padding:14px 16px"><span style="color:#5B665F;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Commande</span><br><b style="font-size:17px">${esc(order.reference)}</b></td>
<td style="padding:14px 16px;text-align:right"><span style="color:#5B665F;font-size:13px;text-transform:uppercase;letter-spacing:.5px">Total payé</span><br><b style="font-size:17px">${esc(total)}</b></td></tr></table>
<h2 style="margin:0 0 4px;font-size:18px;color:#173D32">Récapitulatif</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:6px">
${promo ? line(`Code promo ${esc(order.promo_code)}`, `−${esc(money(order.discount))}`, "#28734B") : ""}
${line("Livraison", "<b>Offerte</b>", "#28734B")}
<tr><td style="padding:12px 0 0;border-top:2px solid #173D32;font-size:18px"><b>Total payé</b></td><td style="padding:12px 0 0;border-top:2px solid #173D32;text-align:right;font-size:18px;white-space:nowrap"><b>${esc(total)}</b></td></tr></table>
${delivered ? `<h2 style="margin:26px 0 6px;font-size:18px;color:#173D32">Adresse de livraison</h2><p style="margin:0;white-space:pre-line">${esc(where)}</p>` : ""}
${bill ? `<h2 style="margin:20px 0 6px;font-size:18px;color:#173D32">Adresse de facturation</h2><p style="margin:0;white-space:pre-line">${esc(bill)}</p>` : ""}
<div style="margin:24px 0 6px;padding:14px 16px;background:#F1F6E1;border-left:4px solid #A8CD38;border-radius:3px"><b>Livraison offerte</b><br>Votre commande est expédiée sous 24 h. Comptez environ 7 jours pour la livraison.</div>
<p style="margin:22px 0 0"><a href="${SITE.url}" style="display:inline-block;padding:13px 20px;background:#A8CD38;color:#173D32;font-weight:bold;border-radius:3px;text-decoration:none">Retourner sur iso-laine.com</a></p>`;
    const mail = layout(subject, { html: body, text }, { commercial: false, unsubscribe: "", why: `Vous recevez cet e-mail suite à votre commande ${order.reference} sur ${SITE.domain}. Conservez-le : il fait office de récapitulatif de commande.` });
    const html = mail.html;
    const fullText = mail.text;
    const reply = team?.split(",")[0]?.trim();
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, text: fullText, ...(reply ? { reply_to: reply } : {}) }),
      cache: "no-store",
    });
    if (!res.ok) { console.error("mail client", res.status, (await res.text().catch(() => "")).slice(0, 200)); return false; }
    return true;
  } catch (e) { console.error("mail client", (e as Error).message); return false; }
}
