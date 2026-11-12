// Paiement par carte CAWL Solutions (Crédit Agricole, plateforme Worldline GCS) : jeton de carte saisi dans un cadre sécurisé CAWL
// (Hosted Tokenization), puis création du paiement avec 3-D Secure. Aucune donnée de carte ne transite par ce site.
import { createHmac, timingSafeEqual } from "node:crypto";

// Serveurs CAWL Solutions : préproduction (clés de test) et production (clés réelles).
const HOSTS = { test: "https://payment.preprod.cawl-solutions.fr", production: "https://payment.cawl-solutions.fr" } as const;

export function cawlConfig() {
  const env = process.env.CAWL_ENV === "production" ? "production" : process.env.CAWL_ENV === "test" ? "test" : null;
  const pspid = process.env.CAWL_PSPID, keyId = process.env.CAWL_API_KEY_ID, secret = process.env.CAWL_API_SECRET;
  if (!env || !pspid || !keyId || !secret) return null;
  return { env, host: HOSTS[env], pspid, keyId, secret } as const;
}
export const cawlEnabled = () => cawlConfig() !== null;
export const cawlHost = () => cawlConfig()?.host ?? "";

/** Signature des requêtes : « GCS v1HMAC:<identifiant de clé>:<signature> » = base64(HMAC-SHA256(secret, « MÉTHODE\nContent-Type\nDate\nchemin\n »)). */
export function authHeader(method: string, contentType: string, date: string, resource: string, keyId: string, secret: string) {
  const toSign = `${method}\n${contentType}\n${date}\n${resource}\n`;
  return `GCS v1HMAC:${keyId}:${createHmac("sha256", secret).update(toSign, "utf8").digest("base64")}`;
}

async function request(method: "GET" | "POST", resource: string, body?: unknown) {
  const c = cawlConfig();
  if (!c) throw new Error("Paiement CAWL non configuré");
  const date = new Date().toUTCString();
  const contentType = method === "POST" ? "application/json; charset=utf-8" : "";
  const res = await fetch(c.host + resource, {
    method,
    headers: { ...(contentType ? { "Content-Type": contentType } : {}), Date: date, Authorization: authHeader(method, contentType, date, resource, c.keyId, c.secret) },
    body: method === "POST" && body != null ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try { json = text ? JSON.parse(text) : {}; } catch { /* réponse non JSON */ }
  if (res.status >= 400) {
    const errs = (json.errors as { message?: string }[] | undefined) ?? [];
    throw new Error(`CAWL HTTP ${res.status}: ${errs[0]?.message || text.slice(0, 200)}`);
  }
  return json;
}

/** Ouvre une session de saisie de carte : renvoie l'adresse du cadre sécurisé CAWL. */
export async function createHostedTokenization() {
  const c = cawlConfig();
  if (!c) throw new Error("Paiement CAWL non configuré");
  const json = await request("POST", `/v2/${encodeURIComponent(c.pspid)}/hostedtokenizations`, { askConsumerConsent: false, locale: "fr_FR" });
  const url = String(json.hostedTokenizationUrl ?? "");
  if (!url.startsWith("https://")) throw new Error("CAWL: réponse de tokenisation invalide");
  return { url, id: String(json.hostedTokenizationId ?? ""), host: c.host };
}

export type Device = Record<string, unknown>;

/** Crée le paiement à partir du jeton de carte. Le montant (en euros) vient toujours de la commande enregistrée, jamais du navigateur. */
export async function createPayment(o: { reference: string; total: number; email: string; country: "France" | "Belgique"; city: string; zip: string; street: string }, hostedTokenizationId: string, device: Device, returnUrl: string) {
  const c = cawlConfig();
  if (!c) throw new Error("Paiement CAWL non configuré");
  return request("POST", `/v2/${encodeURIComponent(c.pspid)}/payments`, {
    order: {
      amountOfMoney: { amount: Math.round(o.total * 100), currencyCode: "EUR" },
      customer: { device, contactDetails: { emailAddress: o.email }, billingAddress: { countryCode: o.country === "Belgique" ? "BE" : "FR", city: o.city, zip: o.zip, street: o.street } },
      references: { merchantReference: o.reference },
    },
    cardPaymentMethodSpecificInput: {
      authorizationMode: "SALE",
      transactionChannel: "ECOMMERCE",
      // On laisse la banque du client décider entre validation directe et challenge : forcer le challenge multiplie les refus.
      threeDSecure: { skipAuthentication: false, challengeIndicator: "no-preference", redirectionData: { returnUrl } },
    },
    hostedTokenizationId,
  });
}

/** Statut réel d'un paiement, lu chez CAWL (requête signée). */
export async function getPaymentDetails(paymentId: string) {
  const c = cawlConfig();
  if (!c) throw new Error("Paiement CAWL non configuré");
  const json = await request("GET", `/v2/${encodeURIComponent(c.pspid)}/payments/${encodeURIComponent(paymentId)}/details`);
  const pay = (json.payment as Record<string, unknown> | undefined) ?? json;
  const out = (pay.paymentOutput as { amountOfMoney?: { amount?: number }; references?: { merchantReference?: string } } | undefined) ?? undefined;
  return { status: String(pay.status ?? json.status ?? ""), amount: out?.amountOfMoney?.amount, reference: out?.references?.merchantReference ?? "" };
}

/** Vérifie la signature d'une notification (webhook), si elle est configurée : HMAC-SHA256 du corps brut, en base64. */
export function verifyWebhook(rawBody: string, signature: string | null, keyId: string | null) {
  const secret = process.env.CAWL_WEBHOOK_SECRET, expectedKey = process.env.CAWL_WEBHOOK_KEY_ID;
  if (!secret || !expectedKey || !signature || keyId !== expectedKey) return false;
  const a = Buffer.from(createHmac("sha256", secret).update(rawBody, "utf8").digest("base64")), b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Statuts CAWL : payé (vente encaissée ou en cours d'encaissement), refusé/annulé, ou encore en cours. */
export function classify(status: string): "paid" | "failed" | "pending" {
  if (["CAPTURED", "PAID", "PENDING_CAPTURE", "CAPTURE_REQUESTED", "AUTHORIZED", "PENDING_FRAUD_APPROVAL"].includes(status)) return "paid";
  if (["REJECTED", "REJECTED_CAPTURE", "CANCELLED", "REVERSED", "CHARGEBACKED", "REFUNDED"].includes(status)) return "failed";
  return "pending";
}
