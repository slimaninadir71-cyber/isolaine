"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { cap, eur, num, unitWord } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { Cover, Variant } from "@/lib/types";
import { IconCart, IconMinus, IconPlus, IconQuote, IconStore, IconTruck } from "./Icons";

type P = { slug: string; name: string; image: string; pickup: boolean };

/** Bloc d'achat : choix de l'option, quantité, calcul de surface, ajout au panier ou demande de devis. */
export function BuyBox({ product, variants, lead, cover }: { product: P; variants: Variant[]; lead: string; cover?: Cover }) {
  const { add, notify } = useCart();
  const [vi, setVi] = useState(variants.length > 1 ? -1 : 0);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const [surf, setSurf] = useState("");
  const v = vi >= 0 ? variants[vi] : undefined;
  const multi = variants.length > 1;
  const prices = variants.map((x) => x.price);
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const buttons = multi && variants.length <= 12 && variants.every((x) => x.label.length <= 42);
  const devis = `/contact?type=devis&produit=${encodeURIComponent(product.slug)}`;

  const doAdd = (n = qty) => {
    if (!v) { setErr("Choisissez d'abord une option."); document.getElementById("options")?.focus(); return; }
    add({ slug: product.slug, variantId: v.id, name: product.name, label: v.label, price: v.price, image: product.image, pickup: product.pickup }, n);
    notify(`${n > 1 ? `${n} × ` : ""}${product.name} ajouté au panier`, { href: "/panier", label: "Voir le panier" });
    setErr("");
  };
  // Surface couverte par unité de vente (uniquement pour un prix unique, d'après la fiche)
  const cv = cover && variants.length === 1 ? cover : undefined;
  const area = parseFloat(surf.replace(",", "."));
  const need = cv && area > 0 && area < 100000 ? Math.ceil(area / cv.m2 - 1e-9) : 0;

  if (!variants.length) {
    return (
      <div className="buy">
        <p className="buy-price quote">Prix sur devis</p>
        <p className="buy-note">Ce produit est vendu sur devis (quantité, conditionnement ou livraison spécifiques). Réponse personnalisée.</p>
        <Link href={devis} className="btn btn-primary btn-block"><IconQuote size={20} /> Demander un devis</Link>
        <Delivery pickup={product.pickup} lead={lead} />
      </div>
    );
  }

  const price = v ? v.price : min;
  return (
    <div className="buy">
      <p className="buy-price">
        {!v && multi && min !== max ? <><small>À partir de</small> {eur(min as number)}</> : eur(price as number)}
      </p>
      {cv && v && (
        <div className="cover">
          <p className="cover-line">
            <b>{eur(Math.round((v.price / cv.m2) * 100) / 100)} le m²</b>
            <span>{cap(cv.unit)} de {num(cv.m2)} m²{cv.inner ? ` (${cv.inner.n} ${unitWord(cv.inner.kind, cv.inner.n)} de ${num(cv.inner.m2)} m²)` : ""}</span>
          </p>
          <div className="calc">
            <label htmlFor="surface">Votre surface à isoler</label>
            <div className="calc-in">
              <input id="surface" inputMode="decimal" autoComplete="off" placeholder="ex. 60" value={surf}
                onChange={(e) => setSurf(e.target.value.replace(/[^\d.,]/g, "").slice(0, 8))} />
              <span>m²</span>
            </div>
            {need > 0 && (
              <div className="calc-out" aria-live="polite">
                <p>Il vous faut <b>{need} {unitWord(cv.unit, need)}</b> ({num(Math.round(need * cv.m2 * 100) / 100)} m²) : <b>{eur(Math.round(need * v.price * 100) / 100)}</b></p>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => { setQty(need); doAdd(need); }}>
                  <IconCart size={18} /> Ajouter {need} {unitWord(cv.unit, need)} au panier
                </button>
              </div>
            )}
            <p className="calc-note">Calcul indicatif d'après la surface couverte indiquée par le fabricant. Prévoyez une marge pour les découpes.</p>
          </div>
        </div>
      )}
      {multi && (
        <fieldset className="opts" id="options" tabIndex={-1}>
          <legend>Choisissez une option <small>({variants.length} disponibles)</small></legend>
          {buttons ? (
            <div className="opt-grid">
              {variants.map((x, i) => (
                <button key={x.id} type="button" className={`opt${i === vi ? " on" : ""}`} aria-pressed={i === vi} onClick={() => { setVi(i); setErr(""); }}>
                  <span>{x.label}</span><small>{eur(x.price)}</small>
                </button>
              ))}
            </div>
          ) : (
            <select value={vi} onChange={(e) => { setVi(Number(e.target.value)); setErr(""); }} aria-label="Option">
              <option value={-1} disabled>Sélectionner…</option>
              {variants.map((x, i) => <option key={x.id} value={i}>{x.label} – {eur(x.price)}</option>)}
            </select>
          )}
          {v?.sku && <p className="opt-ref">Réf. de l'option : {v.sku}</p>}
        </fieldset>
      )}
      <div className="buy-row">
        <div className="qty" role="group" aria-label="Quantité">
          <button type="button" aria-label="Diminuer la quantité" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}><IconMinus size={18} /></button>
          <input type="number" min={1} max={999} value={qty} aria-label="Quantité" inputMode="numeric"
            onChange={(e) => setQty(Math.max(1, Math.min(999, Math.round(Number(e.target.value)) || 1)))} />
          <button type="button" aria-label="Augmenter la quantité" onClick={() => setQty((q) => Math.min(999, q + 1))}><IconPlus size={18} /></button>
        </div>
        <button type="button" className="btn btn-primary btn-grow" onClick={() => doAdd()}><IconCart size={20} /> Ajouter au panier</button>
      </div>
      {err && <p className="form-err" role="alert">{err}</p>}
      {v && qty > 1 && <p className="buy-total">Total pour {qty} : <b>{eur(Math.round(v.price * qty * 100) / 100)}</b></p>}
      <Delivery pickup={product.pickup} lead={lead} />
      <p className="buy-quote"><IconQuote size={18} /> Chantier ou grande quantité ? <Link href={devis}>Demandez un devis</Link></p>

      <div className="sticky-buy" aria-hidden="false">
        <div>
          <p className="sticky-name">{product.name}</p>
          <p className="sticky-price">{v ? eur(v.price) : multi && min !== max ? `Dès ${eur(min as number)}` : eur(price as number)}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => { if (!v) { document.getElementById("options")?.scrollIntoView({ behavior: "smooth", block: "center" }); setErr("Choisissez d'abord une option."); } else doAdd(); }}>
          <IconCart size={20} /> {v ? "Ajouter" : "Choisir"}
        </button>
      </div>
    </div>
  );
}

function Delivery({ pickup, lead }: { pickup: boolean; lead: string }) {
  return pickup ? (
    <div className="buy-ship pickup"><IconStore size={20} /><p><b>Retrait en magasin uniquement</b>{lead && <><br />Délai d'approvisionnement : {lead}</>}</p></div>
  ) : (
    <div className="buy-ship"><IconTruck size={20} /><p><b>Livraison offerte</b><br />{SITE.delivery.replace("Livraison offerte ", "")}{lead ? ` · délai d'approvisionnement : ${lead}` : ""}</p></div>
  );
}
