"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { coverText, eur, num, priceText } from "@/lib/format";
import type { Card } from "@/lib/types";
import { IconBox, IconCart, IconStore } from "./Icons";

/** Carte produit : photo, marque, nom, caractéristiques clés, prix exact (et prix au m² si connu) et action adaptée. */
export function ProductCard({ p, priority = false }: { p: Card; priority?: boolean }) {
  const { add, notify } = useCart();
  const href = `/produit/${p.slug}`;
  const canAdd = p.price != null && !p.variable && p.buyId;
  const specs = [p.thickness ? `${p.thickness} mm` : "", p.r ? `R ${num(p.r)}` : "", p.facing ?? ""].filter(Boolean);
  return (
    <article className="pcard">
      <Link href={href} className="pcard-img" tabIndex={-1} aria-hidden="true">
        {p.image
          ? <img src={p.image} alt="" loading={priority ? "eager" : "lazy"} decoding="async" width={p.w ? Math.min(480, p.w) : undefined} height={p.h && p.w ? Math.round(Math.min(480, p.w) * p.h / p.w) : undefined} />
          : <span className="pcard-noimg"><IconBox size={34} /><small>Photo non disponible</small></span>}
        {p.pickup && <span className="pcard-flag"><IconStore size={14} /> Retrait magasin</span>}
        {p.cu === "palette" && <span className="pcard-flag pcard-flag-pal">Palette</span>}
      </Link>
      <div className="pcard-body">
        <p className="pcard-meta">{p.brand || p.subName}</p>
        <h3 className="pcard-name"><Link href={href}>{p.name}</Link></h3>
        {specs.length > 0
          ? <p className="pcard-specs">{specs.map((s) => <span key={s}>{s}</span>)}</p>
          : <p className="pcard-ref">{p.sku ? <>Réf. {p.sku}</> : <span aria-hidden="true">&nbsp;</span>}</p>}
        {p.m2 && p.cu ? <p className="pcard-pack">{coverText(p.cu, p.m2)}</p> : p.pack && <p className="pcard-pack">{p.pack}</p>}
        <div className="pcard-foot">
          <div className="pcard-prices">
            <p className={`pcard-price${p.price == null ? " quote" : ""}`}>{priceText(p)}</p>
            {p.ppm2 != null && <p className="pcard-ppm2">soit <b>{eur(p.ppm2)}/m²</b></p>}
          </div>
          {canAdd ? (
            <button type="button" className="btn btn-sm btn-primary" aria-label={`Ajouter ${p.name} au panier`}
              onClick={() => { add({ slug: p.slug, variantId: p.buyId, name: p.name, label: p.buyLabel, price: p.price as number, image: p.image, pickup: p.pickup }); notify("Ajouté au panier", { href: "/panier", label: "Voir le panier" }); }}>
              <IconCart size={18} /><span>Ajouter</span>
            </button>
          ) : p.price == null ? (
            <Link href={`/contact?type=devis&produit=${encodeURIComponent(p.slug)}`} className="btn btn-sm btn-ghost">Devis</Link>
          ) : (
            <Link href={href} className="btn btn-sm btn-ghost">Options</Link>
          )}
        </div>
      </div>
    </article>
  );
}
