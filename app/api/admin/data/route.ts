import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { listCampaigns, rpc, sb, sbRows } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLS = "id,email,created_at,source,page,newsletter_consent,newsletter_consent_at,consent_policy_version,guide_sent_at,guide_downloads,customer_status,coupon_used_at,coupon_used_order,unsubscribed_at";
const SIZE = 50;
const FILTERS: Record<string, string[]> = {
  abonnes: ["newsletter_consent=is.true", "unsubscribed_at=is.null"], "sans-accord": ["newsletter_consent=is.false", "unsubscribed_at=is.null"],
  clients: ["customer_status=eq.client"], "guide-telecharge": ["guide_downloads=gt.0"], "code-utilise": ["coupon_used_at=not.is.null"], desinscrits: ["unsubscribed_at=not.is.null"],
};
function where(u: URL) {
  const parts: string[] = [];
  const q = (u.searchParams.get("q") || "").toLowerCase().replace(/[^a-z0-9@._+-]/g, "").slice(0, 80);
  if (q) parts.push(`email=ilike.*${encodeURIComponent(q)}*`);
  parts.push(...(FILTERS[u.searchParams.get("filter") || ""] ?? []));
  const src = (u.searchParams.get("source") || "").replace(/[^a-z-]/g, "");
  if (src) parts.push(`source=eq.${src}`);
  return parts;
}
// Une cellule qui commence par = + - @ serait lue comme une formule par un tableur : on la neutralise.
const cell = (v: unknown) => { const s = v == null ? "" : String(v); if (/^[=+\-@\t\r]/.test(s)) return `"'${s.replace(/"/g, '""')}"`; return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const id = (u: URL) => Math.max(0, Math.floor(Number(u.searchParams.get("id")) || 0));

/** Lectures de l'administration : statistiques, prospects (liste, export CSV), historique et données d'une personne. */
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url), view = u.searchParams.get("view");
  const noStore = { "Cache-Control": "no-store" };
  try {
    if (view === "stats") {
      const [stats, campaigns, promo] = await Promise.all([rpc("marketing_stats"), listCampaigns(), sbRows("promo_codes?select=code,pct,active&order=code.asc")]);
      return NextResponse.json({ stats, campaigns, promo }, { headers: noStore });
    }
    if (view === "prospects") {
      const csv = u.searchParams.get("format") === "csv";
      const page = csv ? 0 : Math.max(0, Math.floor(Number(u.searchParams.get("page")) || 0));
      const res = await sb(`prospects?${[`select=${COLS}`, "order=created_at.desc", `limit=${csv ? 10000 : SIZE}`, `offset=${page * SIZE}`, ...where(u)].join("&")}`, { method: "GET", headers: { Prefer: "count=exact" } });
      const rows = (await res.json()) as Record<string, unknown>[];
      if (csv) {
        const cols = COLS.split(",");
        const body = "﻿" + [cols.join(";"), ...rows.map((r) => cols.map((c) => cell(r[c])).join(";"))].join("\r\n") + "\r\n";
        return new Response(body, { headers: { ...noStore, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="prospects-isolaine-${new Date().toISOString().slice(0, 10)}.csv"` } });
      }
      const total = Number((res.headers.get("content-range") || "").split("/")[1]);
      return NextResponse.json({ rows, total: Number.isFinite(total) ? total : page * SIZE + rows.length, size: SIZE }, { headers: noStore });
    }
    if (view === "clients") { // dernières demandes (contact, devis) et dernières commandes, pour y répondre
      const [requests, orders] = await Promise.all([
        sbRows("requests?select=id,created_at,kind,name,email,phone,product,message,status&order=created_at.desc&limit=40"),
        sbRows("orders?select=reference,created_at,customer_name,email,total,payment_method,payment_status,status,customer_mail_at,customer_mail_error&order=created_at.desc&limit=40"),
      ]);
      return NextResponse.json({ requests, orders }, { headers: noStore });
    }
    if (view === "history") return NextResponse.json({ events: await sbRows(`email_events?prospect_id=eq.${id(u)}&select=id,campaign_id,event_type,status,attempts,sent_at,error_message,created_at&order=created_at.desc&limit=200`) }, { headers: noStore });
    if (view === "export") { // droit d'accès : toutes les données conservées sur une personne
      const prospect = (await sbRows<Record<string, unknown>>(`prospects?id=eq.${id(u)}&select=${COLS}&limit=1`))[0];
      if (!prospect) return NextResponse.json({ error: "Personne introuvable." }, { status: 404 });
      const evenements = await sbRows(`email_events?prospect_id=eq.${id(u)}&select=campaign_id,event_type,status,attempts,sent_at,created_at&order=created_at.asc&limit=1000`);
      return NextResponse.json({ prospect, evenements }, { headers: { ...noStore, "Content-Disposition": `attachment; filename="donnees-personne-${id(u)}.json"` } });
    }
    return NextResponse.json({ error: "Vue inconnue." }, { status: 400 });
  } catch (e) { console.error("admin data", (e as Error).message); return NextResponse.json({ error: "Lecture impossible. Réessayez." }, { status: 502 }); }
}
