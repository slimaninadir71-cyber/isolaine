import data from "./data/catalog.json";
import detailsData from "./data/details.json";
import type { Card, Detail, Family, NavFamily } from "./types";

// Catalogue préparé au build depuis Supabase (voir scripts/fetch-catalog.mjs). Prix normaux, sans promotion.
export const families = (data as { families: Family[] }).families;
export const products = (data as { products: Card[] }).products;
const details = detailsData as unknown as Record<string, Detail>;

const bySlug = new Map(products.map((p) => [p.slug, p]));
export const getProduct = (slug: string) => bySlug.get(slug);
export const getDetail = (slug: string): Detail =>
  details[slug] ?? { short: "", desc: "", images: [], attrs: [], variants: [], lead: "", cats: [] };
export const getFamily = (slug: string) => families.find((f) => f.slug === slug);
export const productsOf = (family: string, sub?: string) =>
  products.filter((p) => p.family === family && (!sub || p.sub === sub));

export const navFamilies: NavFamily[] = families.map((f) => ({
  slug: f.slug, name: f.name, count: f.count, subs: f.subs.map((s) => ({ slug: s.slug, name: s.name, count: s.count })),
}));

/** Produits proches : même sous-famille d'abord, puis même famille ; avec photo et prix en priorité. */
export function related(p: Card, n = 8) {
  const score = (x: Card) => (x.sub === p.sub ? 2 : 0) + (x.image ? 1 : 0) + (x.price != null ? 1 : 0);
  return products
    .filter((x) => x.family === p.family && x.slug !== p.slug)
    .sort((a, b) => score(b) - score(a) || a.position - b.position)
    .slice(0, n);
}

/** Sélection d'accueil : un produit avec photo et prix par sous-famille, dans les familles principales. */
export function featured(n = 8) {
  const seen = new Set<string>();
  const out: Card[] = [];
  for (const f of families) {
    for (const p of products) {
      if (out.length >= n) return out;
      if (p.family !== f.slug || !p.image || p.price == null || seen.has(p.family + p.sub)) continue;
      seen.add(p.family + p.sub);
      out.push(p);
      break;
    }
  }
  for (const p of products) {
    if (out.length >= n) break;
    if (p.image && p.price != null && !out.includes(p)) out.push(p);
  }
  return out;
}
