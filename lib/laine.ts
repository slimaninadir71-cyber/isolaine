// Laine de verre : regroupements par usage et matériel de pose, construits uniquement à partir des fiches du catalogue
import { getProduct, products } from "./catalog";
import type { Card } from "./types";
import { LV_USES } from "./lv-labels";

export type Use = { key: string; slug: string; nav: string; title: string; h1: string; lead: string; text: string };

// Textes repris des fiches produits (destinations indiquées par le fabricant)
const TEXT: Record<string, { h1: string; lead: string; text: string }> = {
  combles: {
    h1: "Laine de verre pour combles et planchers",
    lead: "Rouleaux à dérouler entre solives ou sur plancher.",
    text: "Rouleaux Isover IBR et Ecolaine, Ursa MRK40 : isolation thermo-acoustique des combles perdus, entre solives et sur plancher, ainsi que des plafonds et sous plancher bois ou béton. Versions nues ou revêtues kraft.",
  },
  murs: {
    h1: "Laine de verre pour les murs",
    lead: "Panneaux et rouleaux GR 32 pour murs maçonnés.",
    text: "Isover GR 32 en panneaux de 0,81 m² ou en rouleaux : isolation thermo-acoustique étanche à l'air des murs maçonnés, de 60 à 180 mm d'épaisseur, nue ou revêtue kraft.",
  },
  souffler: {
    h1: "Laine de verre à souffler",
    lead: "En sacs, pour combles perdus difficiles d'accès.",
    text: "Laine de verre en sacs pour isoler par soufflage mécanique les combles perdus non aménagés ou difficilement accessibles. Vendue au sac ou à la palette, avec les réglettes de repérage d'épaisseur.",
  },
};
export const USES: Use[] = LV_USES.map((u) => ({ ...u, ...TEXT[u.key] }));
export const useBySlug = (slug: string) => USES.find((u) => u.slug === slug);
export const useByKey = (key: string) => USES.find((u) => u.key === key);

// Matériel de pose : produits du catalogue utiles autour de la laine de verre
export const KIT: { key: string; title: string; text: string; slugs: string[] }[] = [
  { key: "pare-vapeur", title: "Pare-vapeur", text: "Membranes en rouleaux de 75 m².", slugs: ["pare-vapeur-pare-pluie-master-classic", "pare-vapeur-pare-pluie-master-top-3-noir", "pare-vapeur-pare-pluie-master-extra"] },
  { key: "decoupe", title: "Découpe", text: "Couteaux spécial laine.", slugs: ["couteau-pour-laine-de-verre-28cm", "grand-couteau-gradue-pour-la-laine-480mm"] },
  { key: "combles", title: "Combles", text: "Trappe d'accès, protection des spots, repérage.", slugs: ["trappe-de-visite-acier-laque-comble-500x500-mm", "kit-de-10-protecteurs-de-spots-electriques-isospot-de-chez-isover", "reglette-tige"] },
  { key: "ossature", title: "Ossature", text: "Fourrures, rails et montants pour doublage.", slugs: ["fourrure-pour-isolation-interieure-iti-45mm-3ml", "rail-pour-lisolation-interieure-iti-48mm-3ml", "montant-pour-lisolation-interieure-iti-48mm-3ml", "appui-intermediaire-reglable-pour-fourrure-boite-de-50pcs"] },
  { key: "plaques", title: "Plaques de plâtre", text: "Pour refermer le doublage.", slugs: ["plaque-de-platre-ba13-2500x1200mm-3m2", "plaque-de-platre-ba13-hydrofuge-2500x1200mm-3m2", "plaque-de-platre-gypsolignum-2500x1200mm-3m2"] },
  { key: "protection", title: "Protection", text: "Masques, combinaisons et gants.", slugs: ["masques-ffp1-antipoussiere-vendus-par-lot-de-3-pieces", "combinaison-jetable-blanche-a-capuche-protection-corps", "lot-de-10-paires-de-gants-de-travail-nylon-blanc-taille-l", "gants-latex-rouge-noir"] },
];

const cards = (slugs: string[]) => slugs.map((s) => getProduct(s)).filter((p): p is Card => !!p);
export const kitGroups = () => KIT.map((g) => ({ ...g, items: cards(g.slugs) })).filter((g) => g.items.length);
export const kitAll = () => [...new Map(kitGroups().flatMap((g) => g.items).map((p) => [p.slug, p])).values()];

/** Accessoires conseillés selon l'usage d'une laine de verre (produits avec photo et prix en priorité). */
export function kitFor(use?: string, n = 8) {
  const order: Record<string, string[]> = {
    combles: ["pare-vapeur", "decoupe", "combles", "protection"],
    murs: ["ossature", "plaques", "pare-vapeur", "decoupe", "protection"],
    souffler: ["combles", "protection"],
  };
  const keys = order[use ?? ""] ?? ["pare-vapeur", "decoupe", "protection"];
  const out = keys.flatMap((k) => cards(KIT.find((g) => g.key === k)?.slugs ?? []));
  return out.filter((p) => p.image && p.price != null).concat(out.filter((p) => !(p.image && p.price != null))).slice(0, n);
}

export const isLv = (p: Card) => p.family === "isolants" && p.sub === "laine-de-verre";
export const lv = products.filter(isLv);

/** Tri par défaut : produits vendus à l'unité d'abord, puis palettes, puis sur devis ; par épaisseur croissante. */
export const lvRank = (p: Card) => (p.price == null ? 2 : p.sale?.includes("unite") ? 0 : 1);
const USE_ORDER = LV_USES.map((u) => u.key);
export const lvSorted = (list: Card[]) =>
  [...list].sort((a, b) => lvRank(a) - lvRank(b) || USE_ORDER.indexOf(a.use ?? "") - USE_ORDER.indexOf(b.use ?? "")
    || (a.thickness ?? 0) - (b.thickness ?? 0) || (a.ppm2 ?? 1e9) - (b.ppm2 ?? 1e9) || a.position - b.position);
export const lvOf = (key: string) => lvSorted(lv.filter((p) => p.use === key));

export const minPpm2 = (list: Card[]) => {
  const v = list.map((p) => p.ppm2).filter((x): x is number => x != null);
  return v.length ? Math.min(...v) : null;
};
export const minPrice = (list: Card[]) => {
  const v = list.map((p) => p.price).filter((x): x is number => x != null);
  return v.length ? Math.min(...v) : null;
};
/** Produits vendus à l'unité (rouleau ou sac) avec prix : les plus accessibles pour un petit chantier. */
export const lvUnit = () => lvSorted(lv.filter((p) => p.price != null && p.sale?.includes("unite") && !/r[ée]glette/i.test(p.name)));
