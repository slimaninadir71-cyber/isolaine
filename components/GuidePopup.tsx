"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { POPUP_KEY } from "@/lib/promo";
import { LeadForm, readInscrit } from "./LeadCapture";

const DELAY_MS = 20000;   // au plus tôt après 20 secondes de visite…
const MIN_MS = 6000;      // …ou après la moitié de la page, mais jamais dans les 6 premières secondes
const PAUSE_DAYS = 14;    // fenêtre refermée : pas de nouvel affichage avant 14 jours
const QUIET = /^\/(panier|commande|desinscription|admin|contact|cgv|mentions-legales|confidentialite|cookies)/;

/** Fenêtre d'inscription au guide : discrète, une fois par visite au plus, jamais pendant la commande ni pour une personne déjà inscrite. */
export default function GuidePopup() {
  const path = usePathname() || "/";
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const quiet = QUIET.test(path);

  useEffect(() => {
    if (quiet || open) return;
    try {
      if (readInscrit() || sessionStorage.getItem(POPUP_KEY)) return;
      const last = Number(localStorage.getItem(POPUP_KEY) || 0);
      if (last && Date.now() - last < PAUSE_DAYS * 86400000) return;
    } catch { return; } // stockage indisponible : on ne risque pas un affichage à chaque page
    const start = Date.now();
    const show = () => { cleanup(); if (!document.querySelector("dialog[open]")) setOpen(true); };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (Date.now() - start >= MIN_MS && max > 200 && window.scrollY / max >= 0.5) show();
    };
    const timer = setTimeout(show, DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    const cleanup = () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
    return cleanup;
  }, [path, quiet, open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { try { sessionStorage.setItem(POPUP_KEY, "1"); } catch { /* ignore */ } d.showModal(); d.querySelector<HTMLElement>(".gp-t")?.focus(); }
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => { if (quiet && open) setOpen(false); }, [quiet, open]);

  const close = () => {
    if (!done) { try { localStorage.setItem(POPUP_KEY, String(Date.now())); } catch { /* ignore */ } }
    setOpen(false);
  };

  return (
    <dialog ref={ref} className="gp" aria-labelledby="gp-t" onClose={close} onClick={(e) => { if (e.target === ref.current) close(); }}>
      {open && (
        <div className="gp-in">
          <button type="button" className="gp-x" aria-label="Fermer" onClick={close}>×</button>
          <p className="gp-tag">Guide gratuit · PDF</p>
          <h2 id="gp-t" className="gp-t" tabIndex={-1}>Réussissez votre projet d'isolation avec ISO-LAINE&nbsp;!</h2>
          <p className="gp-s">Recevez gratuitement notre guide pratique pour réussir votre isolation et profitez de 10 % de remise sur votre première commande.</p>
          <LeadForm variant="popup" onDone={() => setDone(true)} />
          {done
            ? <button type="button" className="btn btn-ghost btn-block" onClick={close}>Continuer ma visite</button>
            : <button type="button" className="gp-no" onClick={close}>Non merci, je préfère continuer ma visite.</button>}
        </div>
      )}
    </dialog>
  );
}
