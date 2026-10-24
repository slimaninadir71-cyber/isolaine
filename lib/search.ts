import type { Card } from "./types";

// Recherche locale (sans service payant) : accents ignorés, préfixes, références, marques,
// familles, mots des descriptions et tolérance aux fautes de frappe.

/** Ligne de l'index : voir scripts/fetch-catalog.mjs */
export type IndexRow = [
  slug: string, name: string, brand: string, sku: string, family: string, familyName: string, sub: string, subName: string,
  price: number | null, image: string, keywords: string, variable: 0 | 1, buyId: string, buyLabel: string, pack: string,
  pickup: 0 | 1, priceMax: number | null,
];
export type SearchIndex = { families: [string, string, [string, string][]][]; items: IndexRow[] };

export const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/²/g, "2").replace(/[^a-z0-9]+/g, " ").trim();

const STOP = new Set(["de", "du", "des", "la", "le", "les", "pour", "et", "en", "a", "au", "aux", "un", "une", "l", "d", "avec", "sur", "par"]);
export const terms = (q: string) => norm(q).split(" ").filter((t) => t && !STOP.has(t));

// Distance d'édition bornée (renvoie max+1 dès que la borne est dépassée)
export function lev(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

type Doc = { card: Card; name: string[]; code: string[]; cat: string[]; kw: string[]; full: string };

export function toCard(r: IndexRow, i: number): Card {
  return {
    id: i, slug: r[0], name: r[1], brand: r[2], sku: r[3], family: r[4], familyName: r[5], sub: r[6], subName: r[7],
    price: r[8], image: r[9], w: 0, h: 0, variable: r[11] === 1, nvar: r[11] === 1 ? 2 : 1, buyId: r[12], buyLabel: r[13],
    pack: r[14], pickup: r[15] === 1, priceMax: r[16], thickness: null, position: i,
  };
}

export function prepare(index: SearchIndex): Doc[] {
  return index.items.map((r, i) => {
    const card = toCard(r, i);
    const name = terms(r[1]);
    return {
      card,
      name,
      code: terms(`${r[2]} ${r[3]}`).concat(norm(r[3]).replace(/ /g, "") ? [norm(r[3]).replace(/ /g, "")] : []),
      cat: terms(`${r[5]} ${r[7]}`),
      kw: terms(r[10]),
      full: norm(r[1]),
    };
  });
}

function tokenScore(d: Doc, t: string) {
  if (d.name.includes(t)) return 8;
  if (d.code.some((w) => w === t || w.startsWith(t))) return 7;
  if (d.name.some((w) => w.startsWith(t))) return 6;
  if (d.cat.some((w) => w.startsWith(t))) return 4;
  if (d.kw.some((w) => w.startsWith(t))) return 2;
  if (t.length >= 4) {
    const max = t.length >= 7 ? 2 : 1;
    if (d.name.some((w) => lev(t, w.slice(0, t.length + 1), max) <= max || lev(t, w, max) <= max)) return 3;
    if (d.cat.some((w) => lev(t, w, max) <= max)) return 2;
  }
  return 0;
}

/** Résultats triés par pertinence. Tous les mots doivent correspondre ; à défaut, meilleurs résultats partiels. */
export function search(docs: Doc[], q: string, limit = 500): Card[] {
  const ts = terms(q);
  if (!ts.length) return [];
  const phrase = norm(q);
  const all: { c: Card; s: number; hit: number }[] = [];
  for (const d of docs) {
    let s = 0, hit = 0;
    for (const t of ts) { const v = tokenScore(d, t); if (v) { hit++; s += v; } }
    if (!hit) continue;
    if (phrase.length > 3 && d.full.includes(phrase)) s += 10;
    all.push({ c: d.card, s, hit });
  }
  const strict = all.filter((x) => x.hit === ts.length);
  const pool = strict.length ? strict : all.filter((x) => x.hit >= Math.max(1, ts.length - 1));
  return pool.sort((a, b) => b.s - a.s || a.c.position - b.c.position).slice(0, limit).map((x) => x.c);
}

/** Familles et sous-familles dont le nom correspond à la saisie. */
export function matchCategories(index: SearchIndex, q: string, limit = 4) {
  const ts = terms(q);
  if (!ts.length) return [];
  const out: { href: string; label: string; parent?: string }[] = [];
  const ok = (name: string) => { const w = terms(name); return ts.every((t) => w.some((x) => x.startsWith(t) || (t.length >= 4 && lev(t, x, 1) <= 1))); };
  for (const [fs, fn, subs] of index.families) {
    if (ok(fn)) out.push({ href: `/categorie/${fs}`, label: fn });
    for (const [ss, sn] of subs) if (ok(sn)) out.push({ href: `/categorie/${fs}/${ss}`, label: sn, parent: fn });
  }
  return out.slice(0, limit);
}

let cache: Promise<{ index: SearchIndex; docs: Doc[] }> | null = null;
/** Charge l'index une seule fois, à la première recherche. */
export function loadIndex() {
  if (!cache) {
    cache = fetch("/search-index.json")
      .then((r) => { if (!r.ok) throw new Error("index"); return r.json(); })
      .then((index: SearchIndex) => ({ index, docs: prepare(index) }))
      .catch((e) => { cache = null; throw e; });
  }
  return cache;
}
