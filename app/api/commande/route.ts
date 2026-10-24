import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getDetail, getProduct } from "@/lib/catalog";
import { clean, insertRow, isEmail } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

function reference() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rnd = Array.from(randomBytes(5), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
  return `ISO-${ymd}-${rnd}`;
}

/** Enregistre une commande. Les prix et libellés sont recalculés ici à partir du catalogue (jamais ceux du navigateur). */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return bad("Requête invalide."); }
  if (clean(body.website, 200)) return NextResponse.json({ reference: reference() }); // robot : on ignore sans le signaler

  const name = clean(body.name, 120), email = clean(body.email, 200).toLowerCase(), phone = clean(body.phone, 30);
  const mode = body.mode === "retrait" ? "retrait" : "livraison";
  const address = clean(body.address, 250), postal = clean(body.postal, 12), city = clean(body.city, 120);
  const country = body.country === "Belgique" ? "Belgique" : "France";
  if (name.length < 2) return bad("Indiquez votre nom.");
  if (!isEmail(email)) return bad("Indiquez une adresse e-mail valide.");
  if (phone.replace(/\D/g, "").length < 6) return bad("Indiquez un numéro de téléphone valide.");
  if (mode === "livraison" && (!address || !/^\d{4,5}$/.test(postal) || !city)) return bad("Indiquez une adresse de livraison complète.");

  const raw = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
  const items: { slug: string; name: string; option: string; sku: string; qty: number; unit_price: number; total: number }[] = [];
  for (const it of raw as Record<string, unknown>[]) {
    const slug = clean(it?.slug, 200), variantId = clean(it?.variantId, 40);
    const qty = Math.max(1, Math.min(999, Math.round(Number(it?.qty)) || 1));
    const p = getProduct(slug);
    const v = p ? getDetail(slug).variants.find((x) => x.id === variantId) : undefined;
    if (!p || !v) return bad("Un article du panier n'est plus disponible. Retirez-le puis réessayez.", 409);
    items.push({ slug, name: p.name, option: v.label === "Unité" ? "" : v.label, sku: v.sku || p.sku, qty, unit_price: v.price, total: Math.round(v.price * qty * 100) / 100 });
  }
  if (!items.length) return bad("Votre panier est vide.");
  const subtotal = Math.round(items.reduce((n, i) => n + i.total, 0) * 100) / 100;

  const ref = reference();
  try {
    await insertRow("orders", {
      reference: ref, status: "nouvelle", customer_name: name, company: clean(body.company, 120) || null, email, phone,
      address: mode === "livraison" ? address : null, postal_code: mode === "livraison" ? postal : null, city: mode === "livraison" ? city : null,
      country, delivery_mode: mode, notes: clean(body.notes, 2000) || null, items, subtotal, shipping: 0, total: subtotal,
    });
  } catch (e) {
    console.error("commande", (e as Error).message);
    return bad("La commande n'a pas pu être enregistrée. Réessayez dans un instant ou contactez-nous.", 502);
  }
  return NextResponse.json({ reference: ref });
}
