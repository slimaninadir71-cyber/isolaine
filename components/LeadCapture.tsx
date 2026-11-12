"use client";
import { useEffect, useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { CODE_PCT, CONSENT_TEXT, PROMO_CODE, PROSPECT_KEY } from "@/lib/promo";

export type Inscrit = { email: string; at: number };
export const readInscrit = (): Inscrit | null => {
  try { const s = JSON.parse(localStorage.getItem(PROSPECT_KEY) || "null"); if (s && typeof s.email === "string") return s; } catch { /* stockage indisponible */ }
  return null;
};
/** Origine de l'inscription d'après la page consultée (pour savoir quelles pages amènent des prospects). */
export const sourceOf = (path: string) => (path === "/" ? "accueil" : path.startsWith("/produit/") ? "produit" : path.startsWith("/laine-de-verre") ? "laine-de-verre" : /^\/(categorie|boutique|recherche)/.test(path) ? "categorie" : path.startsWith("/blog") ? "blog" : "autre");

/** Formulaire du guide (e-mail + case newsletter facultative), partagé par la fenêtre, le pied de page et le panier. */
export function LeadForm({ source, variant = "bloc", onDone }: { source?: string; variant?: "bloc" | "popup" | "footer"; onDone?: () => void }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [got, setGot] = useState<Inscrit | null>(null);
  useEffect(() => { setGot(readInscrit()); }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    const hp = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    setBusy(true);
    try {
      const res = await fetch("/api/offre", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, newsletter, website: hp, source: source ?? sourceOf(window.location.pathname), page: window.location.pathname }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok !== true) throw new Error(data.error || "L'inscription est momentanément indisponible. Réessayez dans un instant.");
      const s = { email: email.trim().toLowerCase(), at: Date.now() };
      try { localStorage.setItem(PROSPECT_KEY, JSON.stringify(s)); } catch { /* ignore */ }
      setGot(s); onDone?.();
    } catch (err) { setError((err as Error).message); }
    setBusy(false);
  };

  if (got) {
    return (
      <div className={`lead lead-ok lead-${variant}`} role="status">
        <p className="lead-t">C'est envoyé !</p>
        <p className="lead-s">Votre guide et votre code <b>{PROMO_CODE}</b> (−{CODE_PCT} % sur votre première commande) arrivent par e-mail à <b>{got.email}</b>. Pensez à regarder dans vos courriers indésirables.</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className={`lead lead-${variant}`}>
      <label className="sr-only" htmlFor={`${id}-e`}>Votre adresse e-mail</label>
      <input id={`${id}-e`} type="email" required autoComplete="email" inputMode="email" maxLength={200} placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="hp" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="check lead-consent"><input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} /> <span>{CONSENT_TEXT}</span></label>
      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? "Envoi…" : `RECEVOIR MON GUIDE + ${CODE_PCT} %`}</button>
      {error && <p className="form-err" role="alert">{error}</p>}
      <p className="lead-legal">Votre e-mail sert à vous envoyer le guide et le code. Code valable une fois, sur la première commande passée avec cette adresse. <Link href="/confidentialite">Données personnelles</Link></p>
    </form>
  );
}

/** Bloc du panier et du pied de page : titre + formulaire. */
export function LeadCapture({ source, variant = "bloc" }: { source: string; variant?: "bloc" | "footer" }) {
  return (
    <section className={`lead-wrap lead-wrap-${variant}`} aria-labelledby={`lead-h-${source}`}>
      <h2 id={`lead-h-${source}`} className="lead-h">Le guide pratique pour réussir son isolation</h2>
      <p className="lead-p">Recevez-le gratuitement par e-mail, avec {CODE_PCT} % de remise sur votre première commande.</p>
      <LeadForm source={source} variant={variant} />
    </section>
  );
}
