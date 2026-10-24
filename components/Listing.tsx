"use client";
import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/types";
import { eur, plural } from "@/lib/format";
import { R_LABEL, SALE_LABEL, USE_LABEL, rBucket } from "@/lib/lv-labels";
import { ProductCard } from "./ProductCard";
import { IconClose, IconFilter } from "./Icons";

type Sort = "pertinence" | "prix-asc" | "prix-desc" | "m2" | "nom";
type Opt = { value: string; label: string; count: number };
type Key = "fam" | "sub" | "brand" | "ep" | "use" | "rb" | "facing" | "sale";
type Sel = Record<Key, string[]> & { min: string; max: string; prix: boolean };
const EMPTY: Sel = { fam: [], sub: [], brand: [], ep: [], use: [], rb: [], facing: [], sale: [], min: "", max: "", prix: false };
// Paramètres d'adresse correspondant à chaque filtre
const PARAM: Record<Key, string> = { fam: "famille", sub: "sous", brand: "marque", ep: "ep", use: "usage", rb: "r", facing: "revetement", sale: "vente" };
const KEYS = Object.keys(PARAM) as Key[];

function options(products: Card[], key: (p: Card) => string | null, label: (p: Card) => string): Opt[] {
  const m = new Map<string, Opt>();
  for (const p of products) {
    const k = key(p);
    if (!k) continue;
    const o = m.get(k) ?? { value: k, label: label(p), count: 0 };
    o.count++;
    m.set(k, o);
  }
  return [...m.values()];
}

/**
 * Grille de produits avec filtres réels (sous-famille, marque, épaisseur, prix ; usage, résistance thermique,
 * revêtement et mode de vente pour la laine de verre), tri et chargement progressif.
 * Les filtres ne sont proposés que s'ils départagent réellement les produits affichés.
 */
export default function Listing({ products, showFamily = false, showSub = true, pageSize = 24, relevance = false, emptyText, lvFacets = false, orderLabel }:
  { products: Card[]; showFamily?: boolean; showSub?: boolean; pageSize?: number; relevance?: boolean; emptyText?: string; lvFacets?: boolean; orderLabel?: string }) {
  const [sel, setSel] = useState<Sel>(EMPTY);
  const [sort, setSort] = useState<Sort>("pertinence");
  const [shown, setShown] = useState(pageSize);
  const [panel, setPanel] = useState(false);

  const facets = useMemo(() => {
    const fam = showFamily ? options(products, (p) => p.family, (p) => p.familyName).sort((a, b) => b.count - a.count) : [];
    const sub = showSub ? options(products, (p) => p.sub, (p) => p.subName).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fr")) : [];
    const brand = options(products, (p) => p.brand || null, (p) => p.brand).sort((a, b) => a.label.localeCompare(b.label, "fr"));
    const ep = options(products, (p) => (p.thickness ? String(p.thickness) : null), (p) => `${p.thickness} mm`).sort((a, b) => Number(a.value) - Number(b.value));
    const priced = products.filter((p) => p.price != null).map((p) => p.price as number);
    const use = lvFacets ? options(products, (p) => p.use ?? null, (p) => USE_LABEL[p.use ?? ""] ?? "").sort((a, b) => Object.keys(USE_LABEL).indexOf(a.value) - Object.keys(USE_LABEL).indexOf(b.value)) : [];
    const rb = lvFacets ? options(products, (p) => rBucket(p.r), (p) => R_LABEL[rBucket(p.r) ?? ""]).sort((a, b) => Number(a.value) - Number(b.value)) : [];
    const facing = lvFacets ? options(products, (p) => p.facing ?? null, (p) => (p.facing === "Nu" ? "Nue (sans parement)" : "Revêtue kraft")) : [];
    const sale = lvFacets ? ["unite", "palette"].map((k) => ({ value: k, label: SALE_LABEL[k], count: products.filter((p) => p.sale?.split("+").includes(k)).length })).filter((o) => o.count) : [];
    return {
      fam: fam.length > 1 ? fam : [],
      sub: sub.length > 1 ? sub : [],
      brand: brand.length > 1 && brand.reduce((n, o) => n + o.count, 0) >= 3 ? brand : [],
      ep: ep.length > 1 && ep.reduce((n, o) => n + o.count, 0) >= 3 ? ep : [],
      use: use.length > 1 ? use : [],
      rb: rb.length > 1 ? rb : [],
      facing: facing.length > 1 ? facing : [],
      sale: sale.length > 1 ? sale : [],
      m2: products.filter((p) => p.ppm2 != null).length > 2,
      min: priced.length ? Math.floor(Math.min(...priced)) : 0,
      max: priced.length ? Math.ceil(Math.max(...priced)) : 0,
      quote: products.some((p) => p.price == null) && priced.length > 0,
      price: priced.length > 2,
    };
  }, [products, showFamily, showSub, lvFacets]);

  // Lecture des filtres présents dans l'adresse (liens partagés, retour arrière)
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const list = (k: string) => (u.get(k) ? (u.get(k) as string).split(",").filter(Boolean) : []);
    const next = { ...EMPTY, min: u.get("min") ?? "", max: u.get("max") ?? "", prix: u.get("prix") === "1" };
    for (const k of KEYS) next[k] = list(PARAM[k]);
    setSel(next);
    const t = u.get("tri");
    if (t === "prix-asc" || t === "prix-desc" || t === "m2" || t === "nom" || t === "pertinence") setSort(t);
  }, []);

  // Mise à jour de l'adresse sans recharger la page
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const put = (k: string, v: string) => (v ? u.set(k, v) : u.delete(k));
    for (const k of KEYS) put(PARAM[k], sel[k].join(","));
    put("min", sel.min); put("max", sel.max); put("prix", sel.prix ? "1" : ""); put("tri", sort === "pertinence" ? "" : sort);
    const qs = u.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, "", next);
    setShown(pageSize);
  }, [sel, sort, pageSize]);

  const list = useMemo(() => {
    const min = parseFloat(sel.min.replace(",", "."));
    const max = parseFloat(sel.max.replace(",", "."));
    const out = products.filter((p) =>
      (!sel.fam.length || sel.fam.includes(p.family)) &&
      (!sel.sub.length || sel.sub.includes(p.sub)) &&
      (!sel.brand.length || sel.brand.includes(p.brand)) &&
      (!sel.ep.length || (p.thickness != null && sel.ep.includes(String(p.thickness)))) &&
      (!sel.use.length || (p.use != null && sel.use.includes(p.use))) &&
      (!sel.rb.length || sel.rb.includes(rBucket(p.r) ?? "")) &&
      (!sel.facing.length || (p.facing != null && sel.facing.includes(p.facing))) &&
      (!sel.sale.length || sel.sale.some((k) => p.sale?.split("+").includes(k))) &&
      (!sel.prix || p.price != null) &&
      (!(min >= 0) || (p.price != null && p.price >= min)) &&
      (!(max > 0) || (p.price != null && p.price <= max)));
    const priceOf = (p: Card, dir: 1 | -1) => (p.price == null ? Infinity : dir * p.price);
    if (sort === "prix-asc") out.sort((a, b) => priceOf(a, 1) - priceOf(b, 1));
    else if (sort === "prix-desc") out.sort((a, b) => priceOf(a, -1) - priceOf(b, -1));
    else if (sort === "m2") out.sort((a, b) => (a.ppm2 ?? Infinity) - (b.ppm2 ?? Infinity) || priceOf(a, 1) - priceOf(b, 1));
    else if (sort === "nom") out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    else if (!relevance) out.sort((a, b) => a.position - b.position);
    return out;
  }, [products, sel, sort, relevance]);

  const toggle = (k: Key, v: string) =>
    setSel((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  const chips: { label: string; clear: () => void }[] = [
    ...sel.fam.map((v) => ({ label: facets.fam.find((o) => o.value === v)?.label ?? v, clear: () => toggle("fam", v) })),
    ...sel.sub.map((v) => ({ label: facets.sub.find((o) => o.value === v)?.label ?? v, clear: () => toggle("sub", v) })),
    ...sel.brand.map((v) => ({ label: v, clear: () => toggle("brand", v) })),
    ...sel.ep.map((v) => ({ label: `${v} mm`, clear: () => toggle("ep", v) })),
    ...sel.use.map((v) => ({ label: USE_LABEL[v] ?? v, clear: () => toggle("use", v) })),
    ...sel.rb.map((v) => ({ label: `R ${(R_LABEL[v] ?? v).toLowerCase()}`, clear: () => toggle("rb", v) })),
    ...sel.facing.map((v) => ({ label: v === "Nu" ? "Nue" : "Kraft", clear: () => toggle("facing", v) })),
    ...sel.sale.map((v) => ({ label: SALE_LABEL[v] ?? v, clear: () => toggle("sale", v) })),
    ...(sel.min ? [{ label: `Dès ${sel.min} €`, clear: () => setSel((s) => ({ ...s, min: "" })) }] : []),
    ...(sel.max ? [{ label: `Jusqu'à ${sel.max} €`, clear: () => setSel((s) => ({ ...s, max: "" })) }] : []),
    ...(sel.prix ? [{ label: "Prix affiché", clear: () => setSel((s) => ({ ...s, prix: false })) }] : []),
  ];
  const hasFilters = KEYS.some((k) => facets[k].length > 0) || facets.price || facets.quote;

  const group = (title: string, k: Key, opts: Opt[]) => opts.length > 0 && (
    <fieldset className="facet">
      <legend>{title}</legend>
      <div className={opts.length > 8 ? "facet-scroll" : undefined}>
        {opts.map((o) => (
          <label key={o.value} className="check">
            <input type="checkbox" checked={sel[k].includes(o.value)} onChange={() => toggle(k, o.value)} />
            <span>{o.label}</span><small>{o.count}</small>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className={`listing${hasFilters ? "" : " listing-nofilter"}`}>
      {hasFilters && (
        <aside className={`filters${panel ? " open" : ""}`} aria-label="Filtres">
          <div className="filters-head">
            <p className="filters-title">Filtrer</p>
            <button type="button" className="icon-btn filters-close" aria-label="Fermer les filtres" onClick={() => setPanel(false)}><IconClose size={22} /></button>
          </div>
          <div className="filters-body">
            {group("Usage", "use", facets.use)}
            {group("Vente", "sale", facets.sale)}
            {group("Famille", "fam", facets.fam)}
            {group("Sous-famille", "sub", facets.sub)}
            {group("Épaisseur", "ep", facets.ep)}
            {group("Résistance thermique R", "rb", facets.rb)}
            {group("Revêtement", "facing", facets.facing)}
            {group("Marque", "brand", facets.brand)}
            {facets.price && (
              <fieldset className="facet">
                <legend>Prix (€)</legend>
                <div className="price-range">
                  <label><span className="sr-only">Prix minimum</span>
                    <input inputMode="decimal" placeholder={`Min ${facets.min}`} value={sel.min} onChange={(e) => setSel((s) => ({ ...s, min: e.target.value.replace(/[^\d.,]/g, "") }))} />
                  </label>
                  <span aria-hidden="true">–</span>
                  <label><span className="sr-only">Prix maximum</span>
                    <input inputMode="decimal" placeholder={`Max ${facets.max}`} value={sel.max} onChange={(e) => setSel((s) => ({ ...s, max: e.target.value.replace(/[^\d.,]/g, "") }))} />
                  </label>
                </div>
              </fieldset>
            )}
            {facets.quote && (
              <fieldset className="facet">
                <legend>Disponibilité du prix</legend>
                <label className="check"><input type="checkbox" checked={sel.prix} onChange={() => setSel((s) => ({ ...s, prix: !s.prix }))} /><span>Masquer les produits sur devis</span></label>
              </fieldset>
            )}
          </div>
          <div className="filters-foot">
            <button type="button" className="btn btn-ghost" onClick={() => setSel(EMPTY)} disabled={!chips.length}>Effacer</button>
            <button type="button" className="btn btn-primary" onClick={() => setPanel(false)}>Voir {plural(list.length, "produit", "produits")}</button>
          </div>
        </aside>
      )}
      {panel && <div className="filters-bg" onClick={() => setPanel(false)} aria-hidden="true" />}

      <section className="results" aria-label="Produits">
        <div className="results-bar">
          <p className="results-count" aria-live="polite"><b>{list.length}</b> {list.length > 1 ? "produits" : "produit"}</p>
          <div className="results-tools">
            {hasFilters && (
              <button type="button" className="btn btn-ghost btn-sm filters-open" onClick={() => setPanel(true)} aria-expanded={panel}>
                <IconFilter size={18} /> Filtres{chips.length ? ` (${chips.length})` : ""}
              </button>
            )}
            <label className="sort">
              <span>Trier</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="pertinence">{orderLabel ?? (relevance ? "Pertinence" : "Recommandés")}</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
                {facets.m2 && <option value="m2">Prix au m² croissant</option>}
                <option value="nom">Nom (A à Z)</option>
              </select>
            </label>
          </div>
        </div>
        {chips.length > 0 && (
          <div className="chips">
            {chips.map((c) => (
              <button key={c.label} type="button" className="chip" onClick={c.clear} aria-label={`Retirer le filtre ${c.label}`}>{c.label} <IconClose size={14} /></button>
            ))}
            <button type="button" className="chip-clear" onClick={() => setSel(EMPTY)}>Tout effacer</button>
          </div>
        )}
        {list.length === 0 ? (
          <div className="empty">
            <p>{emptyText ?? "Aucun produit ne correspond à ces filtres."}</p>
            {chips.length > 0 && <button type="button" className="btn btn-ghost" onClick={() => setSel(EMPTY)}>Effacer les filtres</button>}
          </div>
        ) : (
          <>
            <div className="grid">{list.slice(0, shown).map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 4} />)}</div>
            {shown < list.length && (
              <div className="more">
                <p>{shown} produits affichés sur {list.length}</p>
                <button type="button" className="btn btn-ghost" onClick={() => setShown((n) => n + pageSize)}>
                  Afficher {Math.min(pageSize, list.length - shown)} produits de plus
                </button>
              </div>
            )}
          </>
        )}
        {facets.price && sel.min && sel.max && parseFloat(sel.min) > parseFloat(sel.max) && (
          <p className="hint">Le prix minimum ({eur(parseFloat(sel.min))}) est supérieur au prix maximum.</p>
        )}
      </section>
    </div>
  );
}
