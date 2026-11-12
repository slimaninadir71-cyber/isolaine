// Les 5 rayons de la boutique : regroupement des familles et sous-familles du catalogue (aucun produit n'est retiré).
// Les pages /categorie/... existantes restent en place ; chaque rayon a en plus sa propre page.
import { families, products } from "./catalog";
import { byDemand } from "./score";
import type { Card } from "./types";

export type RayonKey = "isolation" | "fixation" | "pose" | "outillage" | "autres";
type Part = [family: string, sub?: string];
export type Rayon = {
  key: RayonKey; n: string; slug: string; title: string; short: string; desc: string; brands?: string;
  parts: Part[]; /** vignettes par famille plutôt que par sous-famille */ byFamily?: boolean;
  /** sélection de l'accueil : groupes de sous-familles et nombre de produits par groupe */
  picks: { label: string; subs: string[]; n: number; test?: (p: Card) => boolean }[];
  /** produits complémentaires « Complétez votre chantier » */
  extra: string[]; extraText: string;
};

const LV_TOP = ["laine-de-verre-120mm-isover-gr-32-kraft-roule-324m2-r375", "laine-de-verre-280mm-isover-comble-ecolaine-336m2-r7", "comblissimo-isover"];
const isTool = (p: Card) => p.price != null && p.price >= 20 && !/pompe|projecteur|cheville|600W/i.test(p.name);

export const RAYONS: Rayon[] = [
  {
    key: "isolation", n: "01", slug: "isolation", title: "Isolation", short: "Laine de verre, roche, bois, polystyrène",
    desc: "Laine de verre en rouleaux, panneaux et à souffler, laine de roche, laine de bois, polystyrène. À l'unité ou à la palette, avec le prix au m² sur la laine de verre.",
    brands: "Isover · Ursa · Knauf · Austrotherm · Styrodur · Gutex",
    parts: ["laine-de-verre", "polystyrene-graphite", "laine-de-bois", "isolants-phoniques-et-sous-couches", "panneaux-de-toiture", "laine-de-roche",
      "polystyrene-expanse", "polystyrene-extrude", "kits-isolation-par-l-exterieur", "panneaux-de-soubassement", "autres-isolants"].map((s): Part => ["isolants", s]),
    picks: [
      { label: "Laine de verre", subs: ["laine-de-verre"], n: 3, test: (p) => p.cu === "rouleau" },
      { label: "Laine à souffler", subs: ["laine-de-verre"], n: 2, test: (p) => p.use === "souffler" && !/r[ée]glette/i.test(p.name) },
      { label: "Palette", subs: ["laine-de-verre"], n: 3, test: (p) => p.cu === "palette" },
      { label: "Polystyrène graphité", subs: ["polystyrene-graphite"], n: 2 },
      { label: "Laine de roche", subs: ["laine-de-roche"], n: 2 },
      { label: "Polystyrène extrudé", subs: ["polystyrene-extrude"], n: 2 },
      { label: "Laine de bois", subs: ["laine-de-bois"], n: 2 },
    ],
    extra: ["rail-pour-lisolation-interieure-iti-48mm-3ml", "montant-pour-lisolation-interieure-iti-48mm-3ml", "fourrure-pour-isolation-interieure-iti-45mm-3ml",
      "pare-vapeur-pare-pluie-master-classic", "couteau-pour-laine-de-verre-28cm", "grand-couteau-gradue-pour-la-laine-480mm", "scotch-facade-izotherm-48mm-x-50m", "mousse-expansive-izo-mousse-pu-750-ml"],
    extraText: "Ossature, pare-vapeur et outils de découpe qui vont avec l'isolant.",
  },
  {
    key: "fixation", n: "02", slug: "fixation-ossature", title: "Fixation & ossature", short: "Rails, montants, chevilles, vis",
    desc: "L'ossature pour doubler un mur et tout ce qui fixe l'isolant : rails, montants et fourrures, chevilles d'isolation, vis, fixations techniques et fixations de volets.",
    brands: "Ejot · Etanco",
    parts: [["cloison-et-platrerie", "ossatures-et-rails"], ["cloison-et-platrerie", "accessoires-de-cloison"], ["quincaillerie", "chevilles-d-isolation"],
      ["quincaillerie", "vis"], ["quincaillerie", "fixations-techniques"], ["quincaillerie", "fixations-de-volets"], ["quincaillerie", "chevilles-pour-support-plein"]],
    picks: [
      { label: "Ossature", subs: ["ossatures-et-rails"], n: 3, test: (p) => !/grille/i.test(p.name) },
      { label: "Chevilles", subs: ["chevilles-d-isolation"], n: 3 },
      { label: "Vis", subs: ["vis"], n: 2 },
      { label: "Fixations", subs: ["fixations-techniques"], n: 2 },
    ],
    extra: [...LV_TOP, "laine-de-verre-ep-100-mm-revetue-kraft-ursa-mrk40", "pare-vapeur-pare-pluie-master-classic", "perceuse-a-percussion-1050w-2-vitesses",
      "laser-de-mesure-40-m-professionnel", "couteau-pour-laine-de-verre-28cm"],
    extraText: "L'isolant à poser entre les montants, le pare-vapeur et les outils pour fixer.",
  },
  {
    key: "pose", n: "03", slug: "materiel-de-pose", title: "Matériel de pose", short: "Pare-vapeur, adhésifs, découpe, protections",
    desc: "Pare-vapeur et membranes, mousse PU, adhésifs et bâches, couteaux à laine et scies, protections, consommables, spatules et outils de finition.",
    brands: "Izotherm · Sika",
    parts: [["isolants", "membranes-et-films"], ["isolants", "mousses-et-colles-pu"], ["outillage", "baches-adhesifs-et-sacs"], ["outillage", "couteaux-et-scies"],
      ["outillage", "equipements-de-protection"], ["outillage", "consommables"], ["outillage", "spatules-platoirs-et-taloches"], ["outillage", "pinceaux-rouleaux-et-bacs"]],
    picks: [
      { label: "Membranes", subs: ["membranes-et-films"], n: 3, test: (p) => /pare|membrane|r[ée]flecteur/i.test(p.name) },
      { label: "Mousse PU", subs: ["mousses-et-colles-pu"], n: 1 },
      { label: "Découpe", subs: ["couteaux-et-scies"], n: 3 },
      { label: "Adhésifs", subs: ["baches-adhesifs-et-sacs"], n: 2 },
      { label: "Protection", subs: ["equipements-de-protection"], n: 2 },
      { label: "Consommables", subs: ["consommables"], n: 2 },
    ],
    extra: [...LV_TOP, "rail-pour-lisolation-interieure-iti-48mm-3ml", "montant-pour-lisolation-interieure-iti-48mm-3ml", "fourrure-pour-isolation-interieure-iti-45mm-3ml",
      "perceuse-a-percussion-1050w-2-vitesses"],
    extraText: "L'isolant et l'ossature qui vont avec votre matériel de pose.",
  },
  {
    key: "outillage", n: "04", slug: "outillage", title: "Outillage", short: "Perceuse, scies, laser, malaxeur",
    desc: "Machines et outils de chantier : perceuse, disqueuses, scies, laser de mesure, malaxeur, découpe du polystyrène, cloueur à gaz, niveaux et outils à main.",
    parts: ["outillage-electroportatif", "accessoires-pour-electroportatif", "mesure-et-niveaux", "pinces-et-cisailles", "outillage-a-main", "marteaux-cles-et-tournevis"]
      .map((s): Part => ["outillage", s]),
    picks: [
      { label: "Électroportatif", subs: ["outillage-electroportatif"], n: 8, test: isTool },
      { label: "Mesure", subs: ["mesure-et-niveaux"], n: 2, test: isTool },
      { label: "Outillage à main", subs: ["outillage-a-main"], n: 2, test: isTool },
    ],
    extra: ["fil-chaud-a-decouper-le-polystyrene", "mousse-expansive-izo-mousse-pu-750-ml", "couteau-pour-laine-de-verre-28cm", "masques-ffp1-antipoussiere-vendus-par-lot-de-3-pieces",
      "gants-latex-rouge-noir", "scotch-facade-izotherm-48mm-x-50m", "pare-vapeur-pare-pluie-master-classic", "chevilles-90-mm-clou-en-plastique-200-pcs"],
    extraText: "Les consommables et protections qui vont avec vos machines.",
  },
  {
    key: "autres", n: "05", slug: "autres-produits", title: "Autres produits", short: "Enduits, façade, gouttières, chauffage", byFamily: true,
    desc: "Enduits et colles de façade, profilés, décoration de façade, gouttières, poêles à granulés et chauffe-eau, trappes de visite et plaques.",
    brands: "Izotherm · Fassa Bortolo · Weber · Extraflame · GDS",
    parts: [["enduits"], ["profiles-de-facade"], ["decoration-de-facade"], ["energies-renouvelables"], ["accessoires"],
      ["cloison-et-platrerie", "trappes-de-visite"], ["cloison-et-platrerie", "plaques-de-platre-et-ciment"], ["cloison-et-platrerie", "planchers"]],
    picks: [
      { label: "Profilés", subs: ["profiles-de-depart", "profiles-de-couronnement"], n: 3 },
      { label: "Enduits", subs: ["colles-et-sous-enduits"], n: 2, test: (p) => /enduit/i.test(p.name) },
      { label: "Gouttières", subs: ["gouttieres"], n: 2, test: (p) => /goutti[èe]re/i.test(p.name) },
      { label: "Chauffage", subs: ["poeles-a-granules"], n: 2 },
      { label: "Décoration", subs: ["contours-de-fenetre"], n: 1 },
    ],
    extra: ["polystyrene-graphite-austrotherm-eps-ite-ep-120mm", "laine-de-verre-isover-etics-35", "chevilles-90-mm-clou-en-plastique-200-pcs", "scotch-facade-izotherm-48mm-x-50m",
      "kit-doutils-isolation-par-lexterieur", "arche-de-decoupe-au-fil-chaud-decoupeuse-a-polystyrene-ite-2", "fil-chaud-a-decouper-le-polystyrene"],
    extraText: "Pour une isolation par l'extérieur : isolant, chevilles et outils de découpe.",
  },
];

export const rayonByKey = (k: RayonKey) => RAYONS.find((r) => r.key === k) as Rayon;
const inParts = (parts: Part[], p: Card) => parts.some(([f, s]) => p.family === f && (!s || p.sub === s));

/** Produits du rayon, les plus demandés d'abord. */
export const rayonProducts = (r: Rayon) => products.filter((p) => inParts(r.parts, p)).sort(byDemand);

/** Rayon d'un produit (pour le fil d'Ariane et les liens). */
export const rayonOf = (p: Pick<Card, "family" | "sub">) => RAYONS.find((r) => inParts(r.parts, p as Card));

/** Vignettes du rayon : sous-familles (ou familles) avec leur page actuelle, photo du produit le plus demandé. */
export function rayonTiles(r: Rayon) {
  const list = rayonProducts(r);
  if (r.byFamily) {
    const seen = new Map<string, { href: string; name: string; count: number; image: string }>();
    for (const p of list) {
      const t = seen.get(p.family) ?? { href: `/categorie/${p.family}`, name: p.familyName, count: 0, image: "" };
      t.count++; if (!t.image && p.image) t.image = p.image;
      seen.set(p.family, t);
    }
    return [...seen.values()].sort((a, b) => b.count - a.count);
  }
  return r.parts.map(([f, s]) => {
    const sub = families.find((x) => x.slug === f)?.subs.find((x) => x.slug === s);
    const img = list.find((p) => p.family === f && p.sub === s && p.image)?.image ?? sub?.image ?? "";
    return { href: `/categorie/${f}/${s}`, name: sub?.name ?? s ?? "", count: sub?.count ?? 0, image: img };
  }).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);
}

/** Sélection de l'accueil : les plus demandés de chaque groupe, avec photo et prix. */
export function rayonPicks(r: Rayon) {
  const out = new Map<string, Card>();
  for (const g of r.picks) {
    let pool = products.filter((p) => g.subs.includes(p.sub) && p.image && p.price != null && (!g.test || g.test(p))).sort(byDemand);
    if (g.subs.includes("laine-de-verre")) { const seen = new Set<number | null>(); pool = pool.filter((p) => !seen.has(p.thickness) && (seen.add(p.thickness), true)); }
    pool.filter((p) => !out.has(p.slug)).slice(0, g.n).forEach((p) => out.set(p.slug, p));
  }
  return [...out.values()].sort(byDemand);
}

export const extraProducts = (r: Rayon) =>
  r.extra.map((s) => products.find((p) => p.slug === s)).filter((p): p is Card => !!p && !!p.image && p.price != null);

/** Liens des sous-catégories pour le menu et l'accueil. */
export const rayonLinks = (r: Rayon) => rayonTiles(r).map(({ href, name, count }) => ({ href, name, count }));
