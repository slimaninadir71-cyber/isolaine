"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { eur } from "@/lib/format";
import { SITE } from "@/lib/site";
import { IconBox, IconMinus, IconPlus, IconStore, IconTrash, IconTruck } from "@/components/Icons";

export function CartView() {
  const { items, ready, setQty, remove, subtotal, count } = useCart();
  const pickup = items.some((i) => i.pickup);

  if (!ready) return <div className="wrap page"><h1>Mon panier</h1><p className="muted" role="status">Chargement du panier…</p></div>;
  if (!items.length) {
    return (
      <div className="wrap page narrow">
        <h1>Mon panier</h1>
        <div className="empty">
          <p>Votre panier est vide.</p>
          <div className="cta-row"><Link href="/boutique" className="btn btn-primary">Parcourir le catalogue</Link><Link href="/contact?type=devis" className="btn btn-ghost">Demander un devis</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap page">
      <h1>Mon panier <small className="muted">({count} article{count > 1 ? "s" : ""})</small></h1>
      <div className="cart">
        <ul className="cart-lines" aria-label="Articles du panier">
          {items.map((i) => (
            <li key={i.key} className="cart-line">
              <Link href={`/produit/${i.slug}`} className="cart-img" tabIndex={-1} aria-hidden="true">
                {i.image ? <img src={i.image} alt="" loading="lazy" /> : <IconBox size={28} />}
              </Link>
              <div className="cart-info">
                <Link href={`/produit/${i.slug}`} className="cart-name">{i.name}</Link>
                {i.label && i.label !== "Unité" && <p className="cart-opt">{i.label}</p>}
                <p className="cart-unit">{eur(i.price)} l'unité{i.pickup && <> · <IconStore size={14} /> retrait en magasin</>}</p>
              </div>
              <div className="qty qty-sm" role="group" aria-label={`Quantité de ${i.name}`}>
                <button type="button" aria-label="Diminuer" onClick={() => setQty(i.key, i.qty - 1)} disabled={i.qty <= 1}><IconMinus size={16} /></button>
                <input type="number" min={1} max={999} value={i.qty} aria-label="Quantité" inputMode="numeric" onChange={(e) => setQty(i.key, Number(e.target.value))} />
                <button type="button" aria-label="Augmenter" onClick={() => setQty(i.key, i.qty + 1)}><IconPlus size={16} /></button>
              </div>
              <p className="cart-total">{eur(Math.round(i.price * i.qty * 100) / 100)}</p>
              <button type="button" className="icon-btn cart-del" aria-label={`Retirer ${i.name}`} onClick={() => remove(i.key)}><IconTrash size={20} /></button>
            </li>
          ))}
        </ul>
        <aside className="summary" aria-label="Récapitulatif">
          <h2>Récapitulatif</h2>
          <div className="sum-row"><span>Sous-total</span><span>{eur(subtotal)}</span></div>
          <div className="sum-row"><span>Livraison</span><span className="ok">Offerte</span></div>
          <div className="sum-row sum-total"><span>Total</span><span>{eur(subtotal)}</span></div>
          <p className="sum-note"><IconTruck size={16} /> {SITE.delivery}.</p>
          {pickup && <p className="sum-note"><IconStore size={16} /> Certains articles sont à retirer en magasin : nous vous précisons les modalités à la confirmation.</p>}
          <Link href="/commande" className="btn btn-primary btn-block">Passer commande</Link>
          <p className="sum-small">Aucun paiement en ligne : notre équipe confirme la disponibilité et vous transmet les modalités de règlement.</p>
          <Link href="/boutique" className="link-arrow">Continuer mes achats</Link>
        </aside>
      </div>
    </div>
  );
}
