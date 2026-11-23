import { createHash } from "node:crypto";
import { adminConfigured, sb } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Compteur de visites anonyme : aucun cookie, aucune adresse IP conservée.
// Un visiteur = empreinte du jour (IP + navigateur + date + clé secrète), qui change chaque jour et ne permet pas de retrouver la personne.
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|pingdom|uptime|curl|wget|python|axios|node-fetch/i;

export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (!ua || BOT.test(ua) || !adminConfigured()) return new Response(null, { status: 204 });
    const body = JSON.parse((await req.text()).slice(0, 2000) || "{}") as { p?: unknown; r?: unknown };
    const path = String(body.p ?? "").slice(0, 300);
    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return new Response(null, { status: 204 });
    const today = new Date().toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const salt = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const visitor = createHash("sha256").update(`${today}|${ip}|${ua}|${salt}`).digest("hex").slice(0, 32);
    let referrer: string | null = null;
    try { const h = new URL(String(body.r ?? "")).hostname.replace(/^www\./, ""); if (h && !h.endsWith("iso-laine.com")) referrer = h.slice(0, 200); } catch { /* pas de provenance */ }
    const device = /mobi|android|iphone|ipad/i.test(ua) ? "mobile" : "ordinateur";
    await sb("site_visits", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ path, visitor, referrer, device }) });
  } catch (e) { console.error("visite", (e as Error).message); }
  return new Response(null, { status: 204 });
}
