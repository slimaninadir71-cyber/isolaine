import type { Card } from "./types";

const fmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const eur = (n: number) => fmt.format(n);

/** Libellé de prix d'une carte : prix exact, « à partir de » pour les variantes de prix différents, ou devis. */
export function priceText(p: Pick<Card, "price" | "priceMax" | "variable">) {
  if (p.price == null) return "Sur devis";
  if (p.variable && p.priceMax != null && p.priceMax > p.price) return `À partir de ${eur(p.price)}`;
  return eur(p.price);
}

export const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
/** Nombre au format français (74,88). */
export const num = (n: number) => nf.format(n);
const PLURAL: Record<string, string> = { palette: "palettes", rouleau: "rouleaux", plaque: "plaques", panneau: "panneaux", sac: "sacs" };
export const unitWord = (u: string, n: number) => (n > 1 ? PLURAL[u] ?? `${u}s` : u);
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** « Palette de 74,88 m² », « Rouleau de 3,36 m² » */
export const coverText = (unit: string, m2: number) => `${cap(unit)} de ${num(m2)} m²`;
