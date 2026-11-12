// Accès à l'administration : mot de passe (variable ADMIN_PASSWORD, choisie par le propriétaire du site) puis session signée dans un cookie.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { sb, sbRows } from "@/lib/supabase-admin";

const COOKIE = "isl_admin";
const HOURS = 12;
const secret = () => `${process.env.ADMIN_PASSWORD ?? ""}|${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`;
const sign = (exp: string) => createHmac("sha256", secret()).update(`admin|${exp}`).digest("hex");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const digest = (s: string) => createHmac("sha256", "cmp").update(s).digest("hex");

/** L'administration n'existe que si un mot de passe d'au moins 12 caractères est configuré. */
export const adminEnabled = () => (process.env.ADMIN_PASSWORD ?? "").length >= 12 && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
export const passwordOk = (p: string) => adminEnabled() && same(digest(p), digest(process.env.ADMIN_PASSWORD as string));

export function sessionCookie(clear = false) {
  const base = "Path=/; HttpOnly; Secure; SameSite=Strict";
  if (clear) return `${COOKIE}=; ${base}; Max-Age=0`;
  const exp = String(Date.now() + HOURS * 3600000);
  return `${COOKIE}=${exp}.${sign(exp)}; ${base}; Max-Age=${HOURS * 3600}`;
}

/** Session valide (lecture). */
export function isAdmin(req: Request) {
  if (!adminEnabled()) return false;
  const m = (req.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=(\\d+)\\.([a-f0-9]{64})`));
  if (!m || Number(m[1]) < Date.now()) return false;
  return same(m[2], sign(m[1]));
}
/** Session valide ET requête émise par le site lui-même (en-tête Origin égal à l'hôte) : protection contre les envois forgés. */
export function isAdminWrite(req: Request) {
  const origin = req.headers.get("origin"), host = req.headers.get("host");
  if (!origin || !host) return false;
  try { if (new URL(origin).host !== host) return false; } catch { return false; }
  return isAdmin(req);
}

// Limite anti-force brute : huit échecs en un quart d'heure depuis une même origine bloquent la connexion.
const ipHash = (req: Request) => createHash("sha256").update(`isolaine-admin|${(req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "inconnue"}`).digest("hex").slice(0, 32);
export async function tooManyLogins(req: Request) {
  const since = new Date(Date.now() - 15 * 60000).toISOString();
  return (await sbRows<{ id: number }>(`admin_logins?ip_hash=eq.${ipHash(req)}&ok=eq.false&at=gte.${encodeURIComponent(since)}&select=id&limit=20`)).length >= 8;
}
export async function logLogin(req: Request, ok: boolean) {
  try { await sb("admin_logins", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ ip_hash: ipHash(req), ok, at: new Date().toISOString() }) }); } catch (e) { console.error("admin", (e as Error).message); }
}
