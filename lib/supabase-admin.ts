// Accès serveur à Supabase avec la clé de service (jamais exposée au navigateur) : commandes, prospects, campagnes d'e-mails.
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kquzvuhieiavbwtutpfi.supabase.co";

export const adminConfigured = () => !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function sb(path: string, init: RequestInit = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  const res = await fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers ?? {}) }, cache: "no-store" });
  if (!res.ok) throw new Error(`Supabase ${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`);
  return res;
}
const rows = async <T>(path: string) => (await (await sb(path, { method: "GET" })).json()) as T[];
const patch = (path: string, body: Record<string, unknown>) => sb(path, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(body) });
const q = encodeURIComponent;

export type OrderRow = { billing?: import("./types").Billing | null; reference: string; total: number; payment_status: string; payment_method: string; payment_id: string | null; customer_name: string; email: string; phone: string; delivery_mode: string; address: string | null; postal_code: string | null; city: string | null; country: string; discount?: number; promo_code?: string | null; items: { name: string; option: string; qty: number; unit_price: number; total: number }[] };

export async function getOrder(reference: string): Promise<OrderRow | null> {
  return (await rows<OrderRow>(`orders?reference=eq.${q(reference)}&select=reference,total,payment_status,payment_method,payment_id,customer_name,email,phone,delivery_mode,address,postal_code,city,country,billing,discount,promo_code,items&limit=1`))[0] ?? null;
}
export async function setPayment(reference: string, fields: Record<string, unknown>) {
  await patch(`orders?reference=eq.${q(reference)}`, fields);
}

// Prospects (inscriptions au guide). Table lisible uniquement avec la clé de service.
export type Prospect = { id: number; email: string; token: string; created_at: string; source: string | null; newsletter_consent: boolean; newsletter_consent_at: string | null; guide_sent_at: string | null; coupon_used_at: string | null; customer_status: string; unsubscribed_at: string | null };
const P_COLS = "id,email,token,created_at,source,newsletter_consent,newsletter_consent_at,guide_sent_at,coupon_used_at,customer_status,unsubscribed_at";

export const getProspectByEmail = async (email: string) => (await rows<Prospect>(`prospects?email=eq.${q(email.toLowerCase())}&select=${P_COLS}&limit=1`))[0] ?? null;
export const getProspectByToken = async (token: string) => (/^[a-f0-9]{20,64}$/.test(token) ? (await rows<Prospect>(`prospects?token=eq.${token}&select=${P_COLS}&limit=1`))[0] ?? null : null);
export async function insertProspect(row: Record<string, unknown>): Promise<Prospect> {
  return ((await (await sb(`prospects?select=${P_COLS}`, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) })).json()) as Prospect[])[0];
}
export const updateProspect = (id: number, fields: Record<string, unknown>) => patch(`prospects?id=eq.${id}`, fields);
/** Nombre d'inscriptions récentes depuis une même origine (limite anti-abus). */
export async function recentSignups(ipHash: string, sinceIso: string) {
  return (await rows<{ id: number }>(`prospects?ip_hash=eq.${q(ipHash)}&created_at=gte.${q(sinceIso)}&select=id&limit=20`)).length;
}

// Code promo (table promo_codes, modifiable depuis l'administration).
export type Promo = { code: string; pct: number; active: boolean; first_order_only: boolean; subscribers_only: boolean };
export const getPromo = async (code: string) => (await rows<Promo>(`promo_codes?code=eq.${q(code)}&select=code,pct,active,first_order_only,subscribers_only&limit=1`))[0] ?? null;
export const hasPaidOrder = async (email: string) => (await rows<{ reference: string }>(`orders?email=eq.${q(email.toLowerCase())}&payment_status=eq.${q("payé")}&select=reference&limit=1`)).length > 0;

export type PromoCheck = { ok: true; code: string; pct: number } | { ok: false; status: number; error: string };
/** Règles du code : actif, e-mail inscrit au guide, première commande, jamais utilisé. Toujours vérifié côté serveur. */
export async function checkPromo(code: string, email: string): Promise<PromoCheck> {
  const promo = await getPromo(code);
  if (!promo || !promo.active) return { ok: false, status: 404, error: "Ce code promo n'est pas valable." };
  const p = email ? await getProspectByEmail(email) : null;
  if (promo.subscribers_only && !p) return { ok: false, status: 403, error: "Ce code est réservé aux personnes inscrites au guide ISO-LAINE, avec la même adresse e-mail que la commande." };
  if (p?.coupon_used_at) return { ok: false, status: 409, error: "Ce code a déjà été utilisé avec cette adresse e-mail." };
  if (promo.first_order_only && email && (await hasPaidOrder(email))) return { ok: false, status: 409, error: "Ce code est réservé à la première commande." };
  return { ok: true, code: promo.code, pct: Number(promo.pct) };
}

/** À appeler quand une commande est payée : le client sort des relances, et son code de bienvenue est marqué utilisé. Ne lève jamais d'erreur. */
export async function markPaid(order: { reference: string; email: string; promo_code?: string | null }) {
  try {
    const now = new Date().toISOString();
    const email = q((order.email || "").toLowerCase());
    await patch(`prospects?email=eq.${email}&customer_status=neq.client`, { customer_status: "client", customer_at: now });
    if (order.promo_code) await patch(`prospects?email=eq.${email}&coupon_used_at=is.null`, { coupon_used_at: now, coupon_used_order: order.reference });
  } catch (e) { console.error("prospect", (e as Error).message); }
}

// Campagnes et journal des envois.
export type Campaign = { id: number; key: string; name: string; subject: string; content: string; campaign_type: string; scheduled_delay: number; active: boolean };
export const getCampaign = async (key: string) => (await rows<Campaign>(`email_campaigns?key=eq.${q(key)}&select=id,key,name,subject,content,campaign_type,scheduled_delay,active&limit=1`))[0] ?? null;

/**
 * Réserve un envoi : un seul par prospect et par campagne (contrainte d'unicité en base).
 * Un envoi en échec peut être repris, trois tentatives au plus. Renvoie null si l'envoi est déjà fait ou en cours.
 */
export async function claimSend(prospectId: number, campaignId: number): Promise<{ id: number; attempts: number } | null> {
  const ins = await sb("email_events?on_conflict=prospect_id,campaign_id&select=id,attempts", { method: "POST", headers: { Prefer: "return=representation,resolution=ignore-duplicates" }, body: JSON.stringify({ prospect_id: prospectId, campaign_id: campaignId, event_type: "envoi", status: "en attente" }) });
  const a = ((await ins.json()) as { id: number; attempts: number }[])[0];
  if (a) return a;
  const retry = await sb(`email_events?prospect_id=eq.${prospectId}&campaign_id=eq.${campaignId}&status=eq.${q("échec")}&attempts=lt.3&select=id,attempts`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "en attente" }) });
  return ((await retry.json()) as { id: number; attempts: number }[])[0] ?? null;
}
export const closeSend = (id: number, ok: boolean, info: string, attempts: number) => patch(`email_events?id=eq.${id}`, ok ? { status: "envoyé", sent_at: new Date().toISOString(), provider_id: info, error_message: null, attempts } : { status: "échec", error_message: info.slice(0, 300), attempts });
export async function logEvent(prospectId: number, type: "telechargement" | "desinscription" | "inscription") {
  try { await sb("email_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ prospect_id: prospectId, event_type: type, status: "fait", sent_at: new Date().toISOString() }) }); } catch (e) { console.error("journal", (e as Error).message); }
}

// Sélections utilisées par l'envoi automatique et par l'administration.
export const sbRows = rows;
export const rpc = async <T>(fn: string, args: Record<string, unknown> = {}) => (await (await sb(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) })).json()) as T;
export const P_SELECT = P_COLS;
export async function prospectsByIds(ids: number[]): Promise<Prospect[]> {
  return ids.length ? rows<Prospect>(`prospects?id=in.(${ids.join(",")})&select=${P_COLS}`) : [];
}
export const C_SELECT = "id,key,name,subject,content,campaign_type,scheduled_delay,active,status,scheduled_at,approved_at,sent_at,created_at";
export type CampaignFull = Campaign & { status: string; scheduled_at: string | null; approved_at: string | null; sent_at: string | null; created_at: string };
export const listCampaigns = () => rows<CampaignFull>(`email_campaigns?select=${C_SELECT}&order=id.asc`);
export const updateCampaign = (id: number, fields: Record<string, unknown>) => patch(`email_campaigns?id=eq.${id}`, fields);
