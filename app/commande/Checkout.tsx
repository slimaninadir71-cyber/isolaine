"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { eur } from "@/lib/format";
import { PROMO_CODE, PROSPECT_KEY, discountOf, normCode } from "@/lib/promo";

type CardFrame = { initialize: () => Promise<void>; submitTokenization: () => Promise<{ hostedTokenizationId?: string; success?: boolean }> };
declare global { interface Window { Tokenizer?: new (url: string, containerId: string, opts: Record<string, unknown>) => CardFrame } }

// Données du navigateur exigées par le 3-D Secure 2 (sans elles, la banque refuse ou impose un challenge à chaque fois).
function browserData() {
  return { language: navigator.language, colorDepth: screen.colorDepth, screenHeight: screen.height, screenWidth: screen.width, timezoneOffsetUtcMinutes: -new Date().getTimezoneOffset() };
}

type Field = "name" | "company" | "email" | "phone" | "address" | "postal" | "city" | "country" | "notes";

export function Checkout({ cardEnabled = false }: { cardEnabled?: boolean }) {
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const [f, setF] = useState<Record<Field, string>>({ name: "", company: "", email: "", phone: "", address: "", postal: "", city: "", country: "France", notes: "" });
  // Adresse de facturation différente : facultative, cochée par le client
  const [billDiff, setBillDiff] = useState(false);
  const [bill, setBill] = useState({ name: "", company: "", address: "", postal: "", city: "", country: "France" });
  const setB = (k: keyof typeof bill) => (e: { target: { value: string } }) => setBill((s) => ({ ...s, [k]: e.target.value }));
  const [cgv, setCgv] = useState(false);
  const [busy, setBusy] = useState(false);
  const frame = useRef<CardFrame | null>(null);
  const [cardUi, setCardUi] = useState<"loading" | "ready" | "error">("loading");
  const [cardKey, setCardKey] = useState(0);
  const [error, setError] = useState("");
  const [promoIn, setPromoIn] = useState("");
  const [promo, setPromo] = useState<{ code: string; pct: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  const set = (k: Field) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const pickupItems = items.filter((i) => i.pickup); // articles vendus uniquement en retrait : la boutique ne propose que la livraison

  const discount = promo ? discountOf(subtotal, promo.pct) : 0;
  const total = Math.round((subtotal - discount) * 100) / 100;
  // Le code dépend de l'adresse e-mail de la commande : il est vérifié par le serveur pour cette adresse, puis de nouveau à l'enregistrement.
  const applyPromo = async (raw: string, email = f.email) => {
    const code = normCode(raw);
    if (!code) return;
    setPromoMsg("");
    if (!email.trim()) { setPromo(null); setPromoMsg("Indiquez d'abord votre adresse e-mail dans le formulaire, puis appliquez le code."); return; }
    try {
      const r = await fetch("/api/promo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, email }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || typeof d.code !== "string") { setPromo(null); setPromoMsg(d.error || "Ce code promo n'est pas valable."); return; }
      setPromo({ code: d.code, pct: Number(d.pct) || 10 }); setPromoIn(d.code);
    } catch { setPromo(null); setPromoMsg("Le code n'a pas pu être vérifié. Réessayez."); }
  };
  useEffect(() => { // personne inscrite au guide sur ce navigateur : son e-mail et le code sont repris automatiquement
    try {
      const s = JSON.parse(localStorage.getItem(PROSPECT_KEY) || "null");
      if (s && typeof s.email === "string") { setF((v) => (v.email ? v : { ...v, email: s.email })); setPromoIn(PROMO_CODE); applyPromo(PROMO_CODE, s.email); }
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cardMode = cardEnabled && ready && items.length > 0;
  useEffect(() => {
    if (!cardMode) return;
    let dead = false, mounting = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    frame.current = null;
    setCardUi("loading");
    (async () => {
      try {
        const r = await fetch("/api/cawl/session", { method: "POST" });
        const s = await r.json();
        if (!r.ok || typeof s.url !== "string" || typeof s.host !== "string" || !s.host.startsWith("https://")) throw new Error("session");
        const src = `${s.host}/hostedtokenization/js/client/tokenizer.min.js`;
        if (!document.querySelector(`script[src="${src}"]`)) { const sc = document.createElement("script"); sc.src = src; sc.async = true; document.head.appendChild(sc); }
        // Le script peut déjà être en cache : on attend sa présence plutôt que son événement de chargement.
        let waited = 0;
        timer = setInterval(async () => {
          waited += 150;
          if (dead || frame.current || mounting) return;
          if (!window.Tokenizer || !document.getElementById("cawl-card-form")) { if (waited > 12000) { clearInterval(timer); setCardUi("error"); } return; }
          mounting = true;
          try {
            const t = new window.Tokenizer(s.url, "cawl-card-form", { hideCardholderName: false, hideTokenFields: true });
            await t.initialize();
            if (dead) return;
            frame.current = t; clearInterval(timer); setCardUi("ready");
          } catch { clearInterval(timer); if (!dead) setCardUi("error"); } finally { mounting = false; }
        }, 150);
      } catch { if (!dead) setCardUi("error"); }
    })();
    return () => { dead = true; if (timer) clearInterval(timer); frame.current = null; document.getElementById("cawl-card-form")?.replaceChildren(); };
  }, [cardMode, cardKey]);

  if (!ready) return <div className="wrap page"><h1>Validation de la commande</h1><p className="muted" role="status">Chargement…</p></div>;
  if (pickupItems.length) {
    return (
      <div className="wrap page narrow">
        <h1>Validation de la commande</h1>
        <div className="empty">
          <p>Pour l'instant, nous ne faisons que de la livraison. {pickupItems.length > 1 ? "Ces articles ne peuvent pas être livrés" : "Cet article ne peut pas être livré"} :</p>
          <ul>{pickupItems.map((i) => <li key={i.key}>{i.name}</li>)}</ul>
          <p className="muted">Retirez-{pickupItems.length > 1 ? "les" : "le"} du panier pour continuer, ou <Link href="/contact?type=devis">demandez-nous un devis</Link>.</p>
          <Link href="/panier" className="btn btn-primary">Modifier le panier</Link>
        </div>
      </div>
    );
  }
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
    const hp = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? ""; // à lire avant tout « await » (l'événement n'existe plus ensuite)
    setBusy(true);
    let tokenUsed = false;
    try {
      const byCard = cardEnabled;
      let token = "";
      if (byCard) {
        // La carte est vérifiée et transformée en jeton par CAWL avant que la commande soit enregistrée.
        if (!frame.current) throw new Error("Le formulaire de carte n'est pas encore chargé. Patientez un instant puis réessayez.");
        const t = await frame.current.submitTokenization();
        if (!t?.hostedTokenizationId) throw new Error("Vérifiez les informations de votre carte.");
        token = t.hostedTokenizationId; tokenUsed = true;
      }
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, billing: billDiff ? bill : null, mode: "livraison", website: hp, promo: promo?.code ?? "", pay: byCard ? "card" : "later", items: items.map((i) => ({ slug: i.slug, variantId: i.variantId, qty: i.qty })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reference) throw new Error(data.error || "La commande n'a pas pu être enregistrée.");
      if (byCard && !data.card) throw new Error("Le paiement par carte est momentanément indisponible. Réessayez dans un instant.");
      if (byCard) {
        const pr = await fetch("/api/cawl/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: data.reference, token, browser: browserData() }) });
        const pd = await pr.json().catch(() => ({}));
        if (pr.ok && typeof pd.redirect === "string" && pd.redirect.startsWith("https://")) { clear(); window.location.assign(pd.redirect); return; }
        throw new Error(pd.error || "Le paiement n'a pas abouti. Aucun montant n'a été débité.");
      }
      clear();
      router.push(`/commande/merci?ref=${encodeURIComponent(data.reference)}`);
    } catch (err) {
      setError((err as Error).message || "La commande n'a pas pu être enregistrée. Réessayez dans un instant.");
      if (tokenUsed) setCardKey((k) => k + 1); // le jeton de carte ne sert qu'une fois : on rouvre un cadre de saisie neuf
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
              <label>E-mail *<input required type="email" name="email" autoComplete="email" maxLength={200} value={f.email} onChange={set("email")} onBlur={() => { if (promo || (promoIn && promoMsg)) applyPromo(promoIn); }} /></label>
              <label>Téléphone *<input required type="tel" name="phone" autoComplete="tel" minLength={6} maxLength={30} value={f.phone} onChange={set("phone")} /></label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Adresse de livraison <small>(offerte)</small></legend>
            <div className="form-grid">
              <label className="span2">Adresse *<input required name="address" autoComplete="street-address" maxLength={250} value={f.address} onChange={set("address")} /></label>
              <label>Code postal *<input required name="postal" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{4,5}" title="4 ou 5 chiffres" value={f.postal} onChange={set("postal")} /></label>
              <label>Ville *<input required name="city" autoComplete="address-level2" maxLength={120} value={f.city} onChange={set("city")} /></label>
              <label>Pays *<select name="country" value={f.country} onChange={set("country")}><option>France</option><option>Belgique</option></select></label>
            </div>
            <details className="more">
              <summary>Ajouter une précision (accès chantier, créneau…)</summary>
              <label><span className="sr-only">Message</span><textarea name="notes" rows={3} maxLength={2000} placeholder="Accès chantier, créneau de livraison, référence de devis…" value={f.notes} onChange={set("notes")} /></label>
            </details>
            <label className="check bill-toggle"><input type="checkbox" checked={billDiff} onChange={(e) => setBillDiff(e.target.checked)} /> <span>Adresse de facturation différente de l'adresse de livraison</span></label>
          </fieldset>
          {billDiff && (
            <fieldset>
              <legend>Adresse de facturation</legend>
              <div className="form-grid">
                <label>Nom ou raison sociale *<input required name="bill-name" autoComplete="billing name" minLength={2} maxLength={120} value={bill.name} onChange={setB("name")} /></label>
                <label>Société <small>(facultatif)</small><input name="bill-company" autoComplete="billing organization" maxLength={120} value={bill.company} onChange={setB("company")} /></label>
                <label className="span2">Adresse *<input required name="bill-address" autoComplete="billing street-address" maxLength={250} value={bill.address} onChange={setB("address")} /></label>
                <label>Code postal *<input required name="bill-postal" autoComplete="billing postal-code" inputMode="numeric" pattern="[0-9]{4,5}" title="4 ou 5 chiffres" value={bill.postal} onChange={setB("postal")} /></label>
                <label>Ville *<input required name="bill-city" autoComplete="billing address-level2" maxLength={120} value={bill.city} onChange={setB("city")} /></label>
                <label>Pays *<select name="bill-country" value={bill.country} onChange={setB("country")}><option>France</option><option>Belgique</option></select></label>
              </div>
            </fieldset>
          )}
          <div className="hp" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {cardEnabled && (
            <fieldset>
              <legend>Paiement par carte</legend>
              <div className="cawl-payment-box">
                {cardUi !== "ready" && <p className="muted" role="status">{cardUi === "error" ? "Le formulaire de paiement n'a pas pu se charger. Rechargez la page." : "Chargement du formulaire de paiement sécurisé…"}</p>}
                <div id="cawl-card-form" style={{ minHeight: cardUi === "ready" ? undefined : 0 }} />
                <p className="sum-small">🔒 Paiement sécurisé avec 3-D Secure. Les données de carte sont saisies directement chez CAWL (Crédit Agricole) et ne passent jamais par ce site.</p>
              </div>
            </fieldset>
          )}
          <label className="check check-lg"><input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} required /> <span>J'ai lu et j'accepte les <Link href="/cgv" target="_blank">conditions générales de vente</Link>.</span></label>
          {!cardEnabled && <p className="sum-small">Le paiement en ligne n'est pas disponible pour le moment : nous vous contactons après réception de votre commande.</p>}
          {error && <p className="form-err" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy || (cardEnabled && cardUi !== "ready")}>{busy ? "Paiement en cours…" : cardEnabled ? `Payer ${eur(total)} par carte` : `Envoyer ma commande – ${eur(total)}`}</button>
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
          {promo && <div className="sum-row"><span>Code {promo.code}</span><span className="ok">−{eur(discount)}</span></div>}
          <div className="sum-row"><span>Livraison</span><span className="ok">Offerte</span></div>
          <div className="sum-row sum-total"><span>Total</span><span>{eur(total)}</span></div>
          <div className="promo-box">
            <label htmlFor="promo-code">Code promo</label>
            <div className="promo-row">
              <input id="promo-code" value={promoIn} maxLength={24} autoComplete="off" onChange={(e) => { setPromoIn(e.target.value); if (promo) setPromo(null); }} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => applyPromo(promoIn)}>Appliquer</button>
            </div>
            {promo && <p className="sum-small" role="status">Code appliqué : −{promo.pct} %.</p>}
            {promoMsg && <p className="form-err" role="alert">{promoMsg}</p>}
            <style>{`.promo-box{margin:12px 0}.promo-box label{display:block;font-size:14px;margin-bottom:4px}.promo-row{display:flex;gap:8px}.promo-row input{flex:1;min-width:0;padding:10px 12px;border:1px solid #b9c6d1;border-radius:8px;font-size:16px;text-transform:uppercase}`}</style>
          </div>
          <Link href="/panier" className="link-arrow">Modifier le panier</Link>
        </aside>
      </div>
    </div>
  );
}
