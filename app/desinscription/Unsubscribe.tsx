"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/** Confirmation en un bouton (pas de désinscription au simple chargement : les messageries ouvrent parfois les liens toutes seules). */
export function Unsubscribe() {
  const [t, setT] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  useEffect(() => { setT(new URLSearchParams(window.location.search).get("t") || ""); }, []);
  const go = async () => {
    setState("busy");
    try {
      const r = await fetch(`/api/desinscription?t=${encodeURIComponent(t)}`, { method: "POST" });
      setState(r.ok ? "done" : "error");
    } catch { setState("error"); }
  };
  if (state === "done") return <div className="empty"><p role="status">C'est fait : vous ne recevrez plus nos conseils et offres par e-mail.</p><p className="muted">Les e-mails liés à une commande (confirmation, livraison) continuent de vous être envoyés.</p><Link href="/" className="btn btn-ghost">Retour au site</Link></div>;
  return (
    <div className="empty">
      <p>Vous ne souhaitez plus recevoir les conseils et offres d'ISO-LAINE par e-mail ?</p>
      <button type="button" className="btn btn-primary" onClick={go} disabled={state === "busy" || !t}>{state === "busy" ? "Enregistrement…" : "Confirmer ma désinscription"}</button>
      {state === "error" && <p className="form-err" role="alert">La désinscription n'a pas pu être enregistrée. Réessayez dans un instant.</p>}
      {!t && <p className="muted">Ouvrez cette page depuis le lien « Se désinscrire » de l'un de nos e-mails.</p>}
    </div>
  );
}
