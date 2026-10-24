"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";

export function ContactForm({ kind, product }: { kind: "contact" | "devis"; product: string }) {
  const [type, setType] = useState(kind);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, kind: type }) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Votre demande n'a pas pu être envoyée.");
      setState("done");
      form.reset();
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="thanks thanks-inline" role="status">
        <p className="thanks-ic" aria-hidden="true">✓</p>
        <h2>Demande envoyée</h2>
        <p>Merci, nous avons bien reçu votre {type === "devis" ? "demande de devis" : "message"}. Nous vous répondons par e-mail.</p>
        <Link href="/boutique" className="btn btn-ghost">Retour au catalogue</Link>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      <fieldset className="radio-row" aria-label="Type de demande">
        <label className="radio"><input type="radio" name="t" checked={type === "devis"} onChange={() => setType("devis")} /> <span><b>Demande de devis</b></span></label>
        <label className="radio"><input type="radio" name="t" checked={type === "contact"} onChange={() => setType("contact")} /> <span><b>Question</b></span></label>
      </fieldset>
      <div className="form-grid">
        <label>Nom et prénom *<input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
        <label>Société <small>(facultatif)</small><input name="company" maxLength={120} autoComplete="organization" /></label>
        <label>E-mail *<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
        <label>Téléphone <small>(facultatif)</small><input name="phone" type="tel" maxLength={30} autoComplete="tel" /></label>
        <label className="span2">Produit concerné <small>(facultatif)</small><input name="product" maxLength={300} defaultValue={product} /></label>
        <label className="span2">Votre message *
          <textarea name="message" required minLength={5} maxLength={4000} rows={6}
            placeholder={type === "devis" ? "Références, quantités, adresse ou code postal de livraison, délai souhaité…" : "Votre question…"} />
        </label>
      </div>
      <div className="hp" aria-hidden="true"><label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p className="form-err" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary btn-lg" disabled={state === "busy"}>{state === "busy" ? "Envoi…" : type === "devis" ? "Envoyer ma demande de devis" : "Envoyer mon message"}</button>
      <p className="sum-small">Vos coordonnées servent uniquement à vous répondre. <Link href="/confidentialite">Données personnelles</Link>.</p>
    </form>
  );
}
