import { NextResponse } from "next/server";
import { getDetail, getProduct } from "@/lib/catalog";

export const runtime = "nodejs";

/** Prix actuels des articles d'un panier (le panier du navigateur garde le prix du moment de l'ajout ; il est remis à jour ici). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { items?: unknown } | null;
  const raw = Array.isArray(body?.items) ? (body!.items as Record<string, unknown>[]).slice(0, 200) : [];
  const prices: Record<string, { price: number; name: string; label: string } | null> = {};
  for (const it of raw) {
    const slug = String(it?.slug ?? "").slice(0, 200), variantId = String(it?.variantId ?? "").slice(0, 40);
    const p = getProduct(slug);
    const v = p ? getDetail(slug).variants.find((x) => x.id === variantId) : undefined;
    prices[`${slug}:${variantId}`] = p && v ? { price: v.price, name: p.name, label: v.label } : null;
  }
  return NextResponse.json({ prices }, { headers: { "Cache-Control": "no-store" } });
}
