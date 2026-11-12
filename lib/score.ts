// Score « chances de vente » : commandes reçues sur le site + demande habituelle du marché français de l'isolation.
// Sert d'ordre par défaut (« Les plus demandés ») sur l'accueil, les rayons et les catégories. Plus le score est haut, plus le produit remonte.
import type { Card } from "./types";

/** Commandes reçues sur iso-laine.com (table orders au 12 novembre 2026) : [nombre de commandes, quantité totale]. */
const ORDERS: Record<string, [number, number]> = {
  "laine-de-verre-120mm-isover-gr-32-kraft-roule-324m2-r375": [3, 8],
  "laine-de-verre-280mm-isover-comble-ecolaine-336m2-r7": [1, 9],
  "comblissimo-isover": [1, 1],
  "laine-de-verre-ep-120-mm-revetue-kraft-ursa-mrk40": [1, 1],
  "laine-de-verre-ep-100-mm-revetue-kraft-ursa-mrk40": [1, 1],
  "mousse-expansive-izo-mousse-pu-750-ml": [1, 1],
  "profile-de-couronnement": [1, 2],
  "profile-de-depart-aluminium-120-mm": [1, 3],
};

// Demande par sous-famille d'isolant
const SUB: Record<string, number> = {
  "laine-de-verre": 60, "polystyrene-graphite": 40, "polystyrene-expanse": 30, "polystyrene-extrude": 30, "laine-de-roche": 32,
  "laine-de-bois": 26, "isolants-phoniques-et-sous-couches": 18, "kits-isolation-par-l-exterieur": 18, "panneaux-de-toiture": 14,
  "panneaux-de-soubassement": 10, "autres-isolants": 5,
};

// Produits courants des autres rayons (premier motif trouvé dans le nom)
const KW: [RegExp, number][] = [
  [/rail|montant|fourrure/, 30], [/cheville.*clou|clou.*cheville/, 22], [/cheville/, 12], [/^vis /, 12], [/rosace/, 8], [/cale|but[ée]e/, 6],
  [/pare.?vapeur|pare.?pluie/, 32], [/scotch|adh[ée]sif/, 18], [/couteau.*laine|laine.*couteau/, 26], [/mousse.*pu|mousse expansive/, 24],
  [/masque.*ffp|ffp/, 12], [/gants/, 10], [/polyane|poly[ée]thyl[èe]ne/, 10], [/mastic|joint/, 8], [/cutter/, 8],
  [/^perceuse/, 32], [/disqueuse|meuleuse/, 26], [/laser/, 24], [/scie sabre/, 22], [/malaxeur|m[ée]langeur \//, 22], [/scie d.angle/, 14],
  [/couteau [ée]lectrique/, 18], [/arche/, 12], [/cloueur/, 12], [/r[èe]gle|niveau/, 12], [/kit d.outils/, 14], [/aspirateur/, 10], [/ponceuse/, 8],
  [/iz110|collage.calage/, 30], [/profil[ée] de d[ée]part/, 24], [/po[êe]le/, 16], [/goutti[èe]re/, 10], [/enduit/, 12],
];

const TOOLS = /^(outillage-electroportatif|accessoires-pour-electroportatif|mesure-et-niveaux|pinces-et-cisailles|outillage-a-main|marteaux-cles-et-tournevis)$/;

export function demandScore(p: Card): number {
  const n = p.name.toLowerCase();
  let s = SUB[p.sub] ?? 0;
  if (p.sub === "laine-de-verre") {
    if (/r[ée]glette/.test(n)) s -= 50;
    if (p.cu === "rouleau") s += 22; else if (p.use === "souffler") s += 20; else if (p.cu === "palette") s += 10;
    const e = p.thickness ?? 0;
    if (p.use === "combles") s += e >= 260 ? 22 : e >= 200 ? 16 : e >= 140 ? 6 : 0; // R = 7 en combles perdus, R = 6 en rampants
    if (p.use === "murs") s += e >= 100 && e <= 140 ? (e === 120 ? 20 : 14) : 4;   // doublage de mur : 100 à 140 mm
    if (/kraft/.test(n)) s += 5;
  }
  if (/polystyr/.test(p.sub)) { const e = p.thickness ?? 0; if (e >= 100 && e <= 160) s += 14; else if (e >= 50 && e < 100) s += 8; }
  if (p.sub === "laine-de-roche" && /panneau/.test(n)) s += 8;
  if (/^(Isover|Ursa)$/.test(p.brand)) s += 10; else if (/^(Knauf|Rockwool|Austrotherm|Styrodur)$/.test(p.brand)) s += 4;
  for (const [re, b] of KW) if (re.test(n)) { s += b; break; }
  // Outillage : machines et outils à partir de 20 € devant, recharges et disques après
  if (TOOLS.test(p.sub)) s += (p.price != null && p.price >= 20 ? 15 : -15) + (p.sub === "accessoires-pour-electroportatif" ? -25 : 0);
  const o = ORDERS[p.slug];
  if (o) s += Math.min(75, o[0] * 25) + Math.min(20, o[1] * 2);
  if (!p.image) s -= 40;
  if (p.price == null) s -= 60;
  return s;
}

/** Tri « Les plus demandés » : score décroissant, puis prix croissant. */
export const byDemand = (a: Card, b: Card) =>
  (b.score ?? 0) - (a.score ?? 0) || (a.price ?? Infinity) - (b.price ?? Infinity) || a.position - b.position;
