// Prépare le catalogue Isolaine au moment du build, à partir de Supabase :
//  - lib/data/catalog.json  : familles, sous-familles et cartes produits (pages serveur)
//  - lib/data/details.json  : fiches détaillées (descriptions, caractéristiques, variantes, photos)
//  - public/search-index.json : index compact pour la recherche (chargé à la demande)
//  - public/img/p/*.webp    : photos optimisées (grand format + vignette)
// Mode test : CATALOG_FIXTURE=chemin/vers/rows.json (pas de réseau, pas de photos).
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const SB = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kquzvuhieiavbwtutpfi.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_8Nph9o5frxQ7K7-08_7Urg_HG2cvvnq";
const FIXTURE = process.env.CATALOG_FIXTURE;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Familles : nom affiché, adresse et ordre d'affichage
const FAMILIES = [
  ["Isolant", "isolants", "Isolants"],
  ["Enduit", "enduits", "Enduits"],
  ["Profilé de façade", "profiles-de-facade", "Profilés de façade"],
  ["Décoration de façade", "decoration-de-facade", "Décoration de façade"],
  ["Quincaillerie", "quincaillerie", "Quincaillerie"],
  ["Outillage", "outillage", "Outillage"],
  ["Cloison et plâtrerie", "cloison-et-platrerie", "Cloison et plâtrerie"],
  ["Energies renouvelables", "energies-renouvelables", "Énergies renouvelables"],
  ["Accessoire", "accessoires", "Accessoires"],
];
const FAM = new Map(FAMILIES.map(([key, slug, name], order) => [key, { slug, name, order }]));

export const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/²/g, "2").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// --- Données dérivées uniquement du contenu réel des fiches ---
const PICKUP = /retrait uniquement en magasin/i;
const LEAD = /d[ée]lai d'approvisionnement\s*:?\s*([^-–\n]+)/i;
const cleanLabel = (l) => l.replace(/\s*[-–]\s*d[ée]lai d'approvisionnement[^-–]*/i, "").replace(/\s*[-–]\s*retrait uniquement en magasin/i, "").trim();
// Conditionnement présent dans le nom (« Paquet de 3,60m² », « boîte de 200 pcs », « vendue à la palette »…)
function packOf(name) {
  const m = name.match(/\b((?:paquet|pack|bo[iî]te|lot|sac|seau|rouleau|palette|ballot|carton|sachet)s?\s+de\s+[^–—|]+?)(?:\s*[–—|]|$)/i)
    || name.match(/\b(vendue?s?\s+(?:à la|au|par)\s+[^–—|]+?)(?:\s*[–—|]|$)/i)
    || name.match(/[–—]\s*(\d+\s*(?:pcs|pièces|ml|m²|m2|kg|l|mL))\s*$/i);
  if (!m) return "";
  const s = m[1].trim().replace(/\s+/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// Épaisseur (mm) lue dans le nom pour les isolants : « ép.120mm », « 100 mm », « 10 cm »
function thicknessOf(name) {
  let m = name.match(/[ée]p\.?\s*(\d{1,3})\s*mm/i) || name.match(/\b(\d{2,3})\s?mm\b/i);
  if (m) return Number(m[1]);
  m = name.match(/\b(\d{1,2})\s?cm\b/i);
  return m ? Number(m[1]) * 10 : null;
}
// Caractères encodés résiduels (« &#8211; », « &rsquo; »…)
const ENT = { "&#8211;": "–", "&ndash;": "–", "&#8212;": "—", "&rsquo;": "’", "&#8217;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”", "&amp;": "&", "&quot;": '"', "&#215;": "×", "&times;": "×", "&#178;": "²", "&sup2;": "²", "&nbsp;": " ", "&deg;": "°" };
const dec = (s) => (s ?? "").replace(/&#?[a-z0-9]+;/gi, (m) => ENT[m] ?? m);
// Lignes héritées des anciennes fiches sur les modes et frais de livraison : retirées, la livraison étant offerte
const ZW = new RegExp(`[${String.fromCharCode(0x200b)}-${String.fromCharCode(0x200d)}${String.fromCharCode(0xfeff)}]`, "g"); // espaces invisibles
const DROP = [
  /^options de livraison$/i, /^retrait gratuit en magasin\.?$/i, /^livraison\b.*/i, /^en france m[ée]tropolitaine.*/i,
  /^paiement s[ée]curis[ée].*/i, /^\*\s*(tarif|transport|livraison).*/i, /^exp[ée]dition rapide\b.*/i,
  /^votre commande contient plusieurs packs/i, /^vous souhaitez vous faire livrer/i, /^pour avoir plus d.information sur la livraison/i,
];
const FEES = /frais de (port|livraison|transports?)|co[uû]t de (votre |la )?livraison|devis personnalis[ée][^.]*livraison/i;
const stripBoiler = (t) => (t ?? "").replace(ZW, "").split("\n").map((l) => l.trim())
  .map((l) => (!l || DROP.some((r) => r.test(l)) ? "" : FEES.test(l) ? l.split(/(?<=[.!?])\s+/).filter((x) => !FEES.test(x)).join(" ").trim() : l))
  .filter(Boolean).join("\n").trim();

// Noms saisis en capitales (« LAINE DE VERRE 300mm ISOVER IBR… ») : remis en casse normale, sigles et marques conservés
const KEEP = new Set(["IBR", "GR", "R", "PU", "XPS", "EPS", "ITE", "ITI", "PVC", "PE"]);
const PROPER = { ISOVER: "Isover", URSA: "Ursa", ECOLAINE: "Ecolaine", PHONIC: "Phonic", FASSA: "Fassa", BORTOLO: "Bortolo", LEGEO: "Legeo", MIX: "Mix" };
const ACCENT = { FENETRE: "fenêtre", PLATRE: "plâtre", ALLEGEE: "allégée", BACTERIEN: "bactérien", DESINFECTION: "désinfection", DESINFECTANT: "désinfectant", A: "à", BOITE: "boîte", "ÉP": "ép" };
export function tidyName(name) {
  const n = name.replace(/\s{2,}/g, " ").trim();
  if (!/^[A-ZÀ-Ý]{2,}[\s-]+[A-ZÀ-Ý]+\b/.test(n)) return n;
  const out = n.replace(/[A-Za-zÀ-ÿ0-9]+/g, (w) => {
    if (w !== w.toUpperCase() || !/[A-ZÀ-Ý]/.test(w)) return w;
    if (/\d/.test(w)) return w.replace(/(\d)(MM|CM|KG|ML)\b/g, (_, d, u) => d + u.toLowerCase());
    return KEEP.has(w) ? w : PROPER[w] ?? ACCENT[w] ?? w.toLowerCase();
  });
  return out.charAt(0).toUpperCase() + out.slice(1);
}

// Laine de verre : usage, revêtement, mode de vente et surface couverte, lus dans le nom et la fiche
const num = (s) => Number(String(s).replace(/\s/g, "").replace(",", "."));
const round2 = (x) => Math.round(x * 100) / 100;
function lvUse(name) {
  if (/souffl/i.test(name)) return "souffler";
  if (/\bGR\s?32\b/i.test(name)) return "murs";
  return "combles";
}
function rOf(name, desc, lv) {
  const m = name.match(/\bR\s?=\s?(\d+(?:[.,]\d+)?)/) || (lv ? (desc ?? "").match(/r[ée]sistance thermique(?: de)?\s*\n?\s*(\d+(?:[.,]\d+)?)\b/i) : null);
  return m ? num(m[1]) : null;
}
function coverOf(name, desc, nvar) {
  if (nvar !== 1) return null; // un seul prix : la surface correspond exactement à ce prix
  const d = desc ?? "";
  const pal = d.match(/nombre de m² par palette\s*\n\s*(\d+(?:[.,]\d+)?)/i);
  if (pal && /unit[ée] de vente\s*\n\s*palette/i.test(d)) {
    const m2 = num(pal[1]);
    const per = d.match(/soit\s+(\d+(?:[.,]\d+)?)\s*m²\s+par\s+(rouleau|plaque|panneau)/i);
    let inner = null;
    if (per) {
      const each = num(per[1]), n = m2 / each;
      if (Math.abs(n - Math.round(n)) < 0.01) inner = { n: Math.round(n), m2: each, kind: per[2].toLowerCase() };
    }
    return { m2, unit: "palette", inner };
  }
  const roll = name.match(/(\d+(?:[.,]\d+)?)\s?m²/) || d.match(/nombre de m(?:ètres carrés|²) par rouleau\s*\n\s*(\d+(?:[.,]\d+)?)/i) || d.match(/rouleau de\s+(\d+(?:[.,]\d+)?)\s*m²/i);
  return roll ? { m2: num(roll[1]), unit: "rouleau", inner: null } : null;
}
const hasUnit = (v) => /[a-zA-Zµ²³%]/.test(v);

async function loadRows() {
  if (FIXTURE) return JSON.parse(readFileSync(FIXTURE, "utf8"));
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(`${SB}/rest/v1/products?select=*,product_variants(*)&status=eq.published&order=position.asc&limit=2000`, { headers: { apikey: KEY } });
      if (r.ok) return r.json();
      console.warn(`Supabase ${r.status} : ${await r.text()}`);
    } catch (e) { console.warn("Supabase injoignable :", e.message); }
    await sleep(1500 * i);
  }
  throw new Error("Impossible de charger le catalogue depuis Supabase");
}

let sharp = null;
try { sharp = (await import("sharp")).default; } catch { console.warn("sharp indisponible : photos copiées sans optimisation"); }

async function saveImage(src, base) {
  const url = `${SB}/storage/v1/object/public/produits/${src.split("/").map(encodeURIComponent).join("/")}`;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) { await sleep(300 * (i + 1)); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      if (sharp) {
        const img = sharp(buf, { failOn: "none" }).rotate();
        const big = await img.clone().resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
        const sm = await img.clone().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
        await writeFile(`public/img/p/${base}.webp`, big.data);
        await writeFile(`public/img/p/${base}-sm.webp`, sm);
        return { src: `/img/p/${base}.webp`, sm: `/img/p/${base}-sm.webp`, w: big.info.width, h: big.info.height };
      }
      const ext = (src.match(/\.(jpe?g|png|webp|gif)$/i)?.[1] ?? "jpg").toLowerCase();
      await writeFile(`public/img/p/${base}.${ext}`, buf);
      return { src: `/img/p/${base}.${ext}`, sm: `/img/p/${base}.${ext}`, w: 0, h: 0 };
    } catch { await sleep(300 * (i + 1)); }
  }
  return null;
}

const rows = await loadRows();
if (!rows.length) throw new Error("Catalogue vide");
mkdirSync("public/img/p", { recursive: true });

// Photos (optimisées en parallèle)
const imgOf = new Map();
if (!FIXTURE) {
  const jobs = rows.flatMap((p) => (p.images ?? []).slice(0, 3).map((src, i) => ({ key: `${p.slug}#${i}`, src, base: `${p.slug}-${i + 1}` })));
  let cursor = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (cursor < jobs.length) { const j = jobs[cursor++]; const r = await saveImage(j.src, j.base); if (r) imgOf.set(j.key, r); }
  }));
  console.log(`Photos : ${imgOf.size}/${jobs.length}`);
}

const products = [], details = {}, subs = new Map();
for (const p of rows) {
  p.name = tidyName(dec(p.name)); p.sku = dec(p.sku); p.short_description = stripBoiler(dec(p.short_description)); p.description = stripBoiler(dec(p.description));
  p.attributes = (p.attributes ?? []).map((a) => ({ name: dec(a.name), values: (a.values ?? []).map(dec) }));
  for (const v of p.product_variants ?? []) { v.label = dec(v.label); v.sku = dec(v.sku); }
  const fam = FAM.get(p.family) ?? { slug: "autres", name: "Autres produits", order: 99 };
  const subSlug = slugify(p.sub || fam.name);
  const attrsRaw = (p.attributes ?? []).map((a) => ({ name: a.name, values: (a.values ?? []).filter(Boolean) }));
  const variantsRaw = (p.product_variants ?? []).slice().sort((a, b) => Number(a.price) - Number(b.price) || a.position - b.position);
  const allText = [...attrsRaw.flatMap((a) => a.values), ...variantsRaw.map((v) => v.label)].join(" | ");
  const pickup = PICKUP.test(allText) || PICKUP.test(p.description ?? "");
  const lead = (allText.match(LEAD)?.[1] ?? "").trim();
  const variants = variantsRaw.map((v) => ({ id: String(v.id), label: cleanLabel(v.label) || "Unité", price: Number(v.price), sku: v.sku || "" }));
  const attrs = attrsRaw
    .filter((a) => !(/^poids$/i.test(a.name) && !a.values.some(hasUnit)))
    .map((a) => ({ name: a.name, values: [...new Set(a.values.map(cleanLabel))].filter(Boolean) }))
    .filter((a) => a.values.length);
  const images = (p.images ?? []).slice(0, 3).map((_, i) => imgOf.get(`${p.slug}#${i}`)).filter(Boolean);
  const prices = variants.map((v) => v.price).filter((x) => x > 0);
  const price = prices.length ? Math.min(...prices) : (p.price == null ? null : Number(p.price));
  const priceMax = prices.length ? Math.max(...prices) : price;
  const thickness = fam.slug === "isolants" ? thicknessOf(p.name) : null;
  const lv = fam.slug === "isolants" && subSlug === "laine-de-verre";
  const card = {
    id: p.id, slug: p.slug, name: p.name, brand: p.brand || "", sku: p.sku || "",
    family: fam.slug, familyName: fam.name, sub: subSlug, subName: p.sub || fam.name,
    image: images[0]?.sm ?? "", w: images[0]?.w ?? 0, h: images[0]?.h ?? 0,
    price, priceMax, variable: variants.length > 1, nvar: variants.length,
    buyId: variants.length === 1 ? variants[0].id : "", buyLabel: variants.length === 1 ? variants[0].label : "",
    pack: packOf(p.name), thickness, pickup, position: p.position ?? 0,
  };
  let cover = null;
  if (fam.slug === "isolants") {
    const r = rOf(p.name, p.description, lv);
    if (r) card.r = r;
  }
  if (lv) {
    const use = lvUse(p.name);
    const blown = use === "souffler" || /r[ée]glette/i.test(p.name);
    card.use = use;
    if (!blown) card.facing = /kraft/i.test(p.name) || /surfa[çc]age kraft/i.test(p.description ?? "") ? "Kraft" : "Nu";
    const pal = /vendue? à la palette/i.test(p.name) || /unit[ée] de vente\s*\n\s*palette/i.test(p.description ?? "") || variants.some((v) => /^palette/i.test(v.label));
    const unit = !/vendue? à la palette/i.test(p.name) && (variants.length === 0 ? false : variants.some((v) => !/^palette/i.test(v.label)));
    const sale = [unit && "unite", pal && "palette"].filter(Boolean).join("+");
    if (sale) card.sale = sale;
    cover = price != null ? coverOf(p.name, p.description, variants.length) : null;
    if (cover) { card.m2 = cover.m2; card.cu = cover.unit; card.ppm2 = round2(price / cover.m2); }
  }
  products.push(card);
  details[p.slug] = { short: p.short_description ?? "", desc: p.description ?? "", images, attrs, variants, lead, cats: p.cats ?? [], ...(cover ? { cover } : {}) };
  const k = `${fam.slug}/${subSlug}`;
  subs.set(k, { family: fam.slug, slug: subSlug, name: p.sub || fam.name, count: (subs.get(k)?.count ?? 0) + 1 });
}
products.sort((a, b) => a.position - b.position);

const families = FAMILIES.map(([key, slug, name]) => {
  const items = products.filter((p) => p.family === slug);
  const withImg = items.find((p) => p.image);
  return {
    key, slug, name, count: items.length, image: withImg?.image ?? "",
    subs: [...subs.values()].filter((s) => s.family === slug).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"))
      .map((s) => ({ slug: s.slug, name: s.name, count: s.count, image: items.find((p) => p.sub === s.slug && p.image)?.image ?? "" })),
  };
}).filter((f) => f.count > 0);

// Index de recherche compact (voir lib/search.ts, type IndexRow)
const kw = (s) => (s ?? "").replace(/\s+/g, " ").slice(0, 220);
const index = products.map((p) => [p.slug, p.name, p.brand, p.sku, p.family, p.familyName, p.sub, p.subName, p.price, p.image,
  kw(`${details[p.slug].short} ${details[p.slug].desc}`), p.variable ? 1 : 0, p.buyId, p.buyLabel, p.pack, p.pickup ? 1 : 0, p.priceMax]);

// Photo d'accueil : déclinaisons AVIF et WebP (800 et 1600 px) et image de partage, à partir de l'original fourni
async function hero() {
  const master = "public/img/accueil-1600.avif";
  if (!existsSync(master)) return null;
  if (!sharp) return { w: 1600, h: 900, src: "/img/accueil-1600.avif", avif: "/img/accueil-1600.avif 1600w", webp: "", og: "" };
  const img = sharp(readFileSync(master));
  const { width = 1600, height = 900 } = await img.metadata();
  const h800 = Math.round((height * 800) / width);
  await img.clone().resize({ width: 800 }).avif({ quality: 45 }).toFile("public/img/accueil-800.avif");
  await img.clone().resize({ width: 800 }).webp({ quality: 72 }).toFile("public/img/accueil-800.webp");
  await img.clone().webp({ quality: 72 }).toFile("public/img/accueil-1600.webp");
  await img.clone().resize({ width: 1200, height: 630, fit: "cover", position: "right" }).jpeg({ quality: 78, mozjpeg: true }).toFile("public/img/og-accueil.jpg");
  return {
    w: width, h: height, h800, src: "/img/accueil-1600.webp",
    avif: `/img/accueil-800.avif 800w, /img/accueil-1600.avif ${width}w`,
    webp: `/img/accueil-800.webp 800w, /img/accueil-1600.webp ${width}w`,
    og: "/img/og-accueil.jpg",
  };
}

mkdirSync("lib/data", { recursive: true });
writeFileSync("lib/data/hero.json", JSON.stringify(await hero()));
// Icône pour l'écran d'accueil des téléphones, tirée du logo
if (sharp && existsSync("app/icon.svg")) {
  try { await sharp(readFileSync("app/icon.svg"), { density: 600 }).resize(180, 180).flatten({ background: "#1b2833" }).png().toFile("app/apple-icon.png"); }
  catch (e) { console.warn("Icône non générée :", e.message); }
}
writeFileSync("lib/data/catalog.json", JSON.stringify({ families, products }));
writeFileSync("lib/data/details.json", JSON.stringify(details));
writeFileSync("public/search-index.json", JSON.stringify({ families: families.map((f) => [f.slug, f.name, f.subs.map((s) => [s.slug, s.name])]), items: index }));
console.log(`OK : ${products.length} produits, ${families.length} familles, ${subs.size} sous-familles, ${products.filter((p) => p.price == null).length} sur devis`);
