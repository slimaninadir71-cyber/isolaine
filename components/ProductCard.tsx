"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { eur, num } from "@/lib/format";
import type { Card } from "@/lib/types";
import { PromoSticker, WasPrice } from "./Promo";
import { IconBox } from "./Icons";

/**
 * Carte produit : photo, catégorie et marque, nom, caractéristiques (épaisseur, R, surface, conditionnement),
 * prix mis en avant (prix au m² quand il est connu, sinon prix exact), remise en cours et bouton d'achat.
 * Le prix affiché est le prix facturé (remise de 20 % appliquée au catalogue, voir scripts/fetch-catalog.mjs).
 */
export function ProductCard({ p, priority = false, label }: { p: Card; priority?: boolean; label?: string }) {
  const { add, notify } = useCart();
  const href = `/produit/${p.slug}`;
  const canAdd = p.price != null && !p.variable && p.buyId;
  const from = p.variable && p.priceMax != null && p.price != null && p.priceMax > p.price;
  const promo = p.was != null && p.price != null && p.was > p.price;
  const specs: [string, string][] = [];
  if (p.thickness) specs.push(["Épaisseur", `${p.thickness} mm`]);
  if (p.r) specs.push(["Résistance", `R = ${num(p.r)}`]);
  if (p.m2) specs.push(["Surface", `${num(p.m2)} m²`]);
  if (p.pack && !/vendu/i.test(p.pack)) specs.push(["Conditionnement", p.pack]);
  if (p.cu) specs.push(["Vendu par", p.cu === "palette" ? "Palette" : p.cu === "rouleau" ? "Rouleau" : p.cu]);
  const unitWord = p.cu === "palette" ? "la palette" : p.cu === "rouleau" ? "le rouleau" : "l'unité";
  const name = p.name.replace(/\s+–\s+vendue? à la palette/i, "");

  return (
    <article className="pc">
      <Link href={href} className="pc-img" tabIndex={-1} aria-hidden="true">
        {promo && <PromoSticker className="pc-promo" />}
        {p.cu === "palette" ? <span className="pc-flag pal">Palette</span> : p.pickup ? <span className="pc-flag">Retrait magasin</span> : null}
        {p.image
          ? <img src={p.image} alt="" loading={priority ? "eager" : "lazy"} decoding="async" width={p.w ? Math.min(480, p.w) : undefined} height={p.h && p.w ? Math.round(Math.min(480, p.w) * p.h / p.w) : undefined} />
          : <span className="pc-noimg"><IconBox size={30} /><small>Photo à venir</small></span>}
      </Link>
      <div className="pc-b">
        <span className="pc-cat">{label ?? p.subName}{p.brand ? <> · <b>{p.brand}</b></> : null}</span>
        <h3 className="pc-name"><Link href={href}>{name}</Link></h3>
        {specs.length > 0 && (
          <dl className="pc-specs">{specs.map(([k, v]) => <div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        )}
        <div className="pc-price">
          {p.price == null ? (
            <><span className="pc-quote">Sur devis</span><span className="pc-tot">prix selon quantité</span></>
          ) : p.ppm2 != null ? (
            <><span className="pc-big">{eur(p.ppm2)}<small>/m²</small></span><span className="pc-tot"><WasPrice was={p.was} price={p.price} /> <b>{eur(p.price)}</b><br />{unitWord}</span></>
          ) : (
            <><span className="pc-big">{from && <small className="from">dès </small>}{eur(p.price)}</span><span className="pc-tot"><WasPrice was={p.was} price={p.price} />{promo ? <br /> : null}{from ? "selon option" : unitWord}</span></>
          )}
        </div>
        {canAdd ? (
          <button type="button" className="btn btn-primary pc-act" aria-label={`Ajouter ${name} au panier`}
            onClick={() => { add({ slug: p.slug, variantId: p.buyId, name: p.name, label: p.buyLabel, price: p.price as number, image: p.image, pickup: p.pickup }); notify("Ajouté au panier", { href: "/panier", label: "Voir le panier" }); }}>
            Ajouter au panier
          </button>
        ) : p.price == null ? (
          <Link href={`/contact?type=devis&produit=${encodeURIComponent(p.slug)}`} className="btn btn-ghost pc-act">Demander un devis</Link>
        ) : (
          <Link href={href} className="btn btn-primary pc-act">Choisir l'option</Link>
        )}
      </div>
    </article>
  );
}
