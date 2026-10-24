"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { eur } from "@/lib/format";

type Field = "name" | "company" | "email" | "phone" | "address" | "postal" | "city" | "country" | "mode" | "notes";

export function Checkout() {
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const [f, setF] = useState<Record<Field, string>>({ name: "", company: "", email: "", phone: "", address: "", postal: "", city: "", country: "France", mode: "livraison", notes: "" });
  const [cgv, setCgv] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: Field) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const pickupOnly = items.length > 0 && items.every((i) => i.pickup);
  const needsAddress = f.mode === "livraison";

  if (!ready) return <div className="wrap page"><h1>Validation de la commande</h1><p className="muted" role="status">Chargement…</p></div>;
  if (!items.length) {
    return (
      <div className="wrap page narrow">
        <h1>Validation de la commande</h1>
        <div className="empty"><p>Votre panier est vide.</p><Link href="/boutique" className="btn btn-primary">Parcourir le catalogue</Link></div>
      </div>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!cgv) { setError("Merci d'accepter les conditions générales de vente."); return; }
    setBusy(true);
    try {
      const hp = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, mode: pickupOnly ? "retrait" : f.mode, website: hp, items: items.map((i) => ({ slug: i.slug, variantId: i.variantId, qty: i.qty })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reference) throw new Error(data.error || "La commande n'a pas pu être enregistrée.");
      clear();
      router.push(`/commande/merci?ref=${encodeURIComponent(data.reference)}`);
    } catch (err) {
      setError((err as Error).message || "La commande n'a pas pu être enregistrée. Réessayez dans un instant.");
      setBusy(false);
    }
  };

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Étapes"><ol><li><Link href="/panier">Panier</Link></li><li><span aria-current="page">Coordonnées et validation</span></li></ol></nav>
      <h1>Validation de la commande</h1>
      <div className="checkout">
        <form className="form" onSubmit={submit} noValidate={false}>
          <fieldset>
            <legend>Vos coordonnées</legend>
            <div className="form-grid">
              <label>Nom et prénom *<input required name="name" autoComplete="name" minLength={2} maxLength={120} value={f.name} onChange={set("name")} /></label>
              <label>Société <small>(facultatif)</small><input name="company" autoComplete="organization" maxLength={120} value={f.company} onChange={set("company")} /></label>
              <label>E-mail *<input required type="email" name="email" autoComplete="email" maxLength={200} value={f.email} onChange={set("email")} /></label>
              <label>Téléphone *<input required type="tel" name="phone" autoComplete="tel" minLength={6} maxLength={30} value={f.phone} onChange={set("phone")} /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Réception</legend>
            <div className="radio-row">
              <label className="radio"><input type="radio" name="mode" value="livraison" checked={f.mode === "livraison"} onChange={set("mode")} disabled={pickupOnly} /> <span><b>Livraison offerte</b><small>France métropolitaine et Belgique</small></span></label>
              <label className="radio"><input type="radio" name="mode" value="retrait" checked={f.mode === "retrait" || pickupOnly} onChange={set("mode")} /> <span><b>Retrait en magasin</b><small>Modalités précisées à la confirmation</small></span></label>
            </div>
            {needsAddress && !pickupOnly && (
              <div className="form-grid">
                <label className="span2">Adresse de livraison *<input required name="address" autoComplete="street-address" maxLength={250} value={f.address} onChange={set("address")} /></label>
                <label>Code postal *<input required name="postal" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{4,5}" title="4 ou 5 chiffres" value={f.postal} onChange={set("postal")} /></label>
                <label>Ville *<input required name="city" autoComplete="address-level2" maxLength={120} value={f.city} onChange={set("city")} /></label>
                <label>Pays *<select name="country" value={f.country} onChange={set("country")}><option>France</option><option>Belgique</option></select></label>
              </div>
            )}
          </fieldset>
          <fieldset>
            <legend>Précisions <small>(facultatif)</small></legend>
            <label><span className="sr-only">Message</span><textarea name="notes" rows={3} maxLength={2000} placeholder="Accès chantier, créneau de livraison, référence de devis…" value={f.notes} onChange={set("notes")} /></label>
          </fieldset>
          <div className="hp" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="check check-lg"><input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} required /> <span>J'ai lu et j'accepte les <Link href="/cgv" target="_blank">conditions générales de vente</Link>.</span></label>
          <div className="info-box">
            <b>Comment se passe la suite ?</b>
            <p>Votre commande est enregistrée avec un numéro. Notre équipe vérifie la disponibilité, vous confirme la livraison ou le retrait, puis vous transmet les modalités de règlement. Aucun paiement n'est demandé en ligne.</p>
          </div>
          {error && <p className="form-err" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? "Envoi en cours…" : `Envoyer ma commande – ${eur(subtotal)}`}</button>
          <p className="sum-small">Vos données servent uniquement au traitement de votre commande. <Link href="/confidentialite">En savoir plus</Link>.</p>
        </form>
        <aside className="summary" aria-label="Votre commande">
          <h2>Votre commande</h2>
          <ul className="sum-lines">
            {items.map((i) => (
              <li key={i.key}><span>{i.qty} × {i.name}{i.label && i.label !== "Unité" ? <small> – {i.label}</small> : null}</span><span>{eur(Math.round(i.price * i.qty * 100) / 100)}</span></li>
            ))}
          </ul>
          <div className="sum-row"><span>Sous-total</span><span>{eur(subtotal)}</span></div>
          <div className="sum-row"><span>Livraison</span><span className="ok">Offerte</span></div>
          <div className="sum-row sum-total"><span>Total</span><span>{eur(subtotal)}</span></div>
          <Link href="/panier" className="link-arrow">Modifier le panier</Link>
        </aside>
      </div>
    </div>
  );
}
