"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CONTACT } from "@/lib/contact";

const base = `https://wa.me/${CONTACT.whatsapp}`;

/** Bouton flottant : ouvre directement WhatsApp avec un message déjà rédigé (page consultée, numéro de commande le cas échéant). */
export default function WhatsAppButton() {
  const path = usePathname() || "/";
  const [href, setHref] = useState(`${base}?text=${encodeURIComponent("Bonjour, j'ai besoin de renseignements à propos d'un article.")}`);
  useEffect(() => {
    let text = "Bonjour, j'ai besoin de renseignements à propos d'un article.";
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (path.startsWith("/commande/merci") && ref) text = `Bonjour, j'ai une question sur ma commande ${ref.replace(/[^A-Z0-9-]/gi, "").slice(0, 40)}.`;
    else if (path.startsWith("/produit/")) text = `Bonjour, j'ai besoin de renseignements à propos de cet article : ${window.location.origin}${path}`;
    else if (path.startsWith("/commande") || path.startsWith("/panier")) text = "Bonjour, j'ai besoin de renseignements avant de commander.";
    setHref(`${base}?text=${encodeURIComponent(text)}`);
  }, [path]);
  return (
    <>
      <a className="wa-fab" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Une question ? Écrivez-nous sur WhatsApp au ${CONTACT.whatsappDisplay}`}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 1 1 6.97 3.85Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.17-.48-.29Z" /></svg>
        <span>Une question ?</span>
      </a>
      <style>{`
        .wa-fab{position:fixed;right:16px;bottom:16px;z-index:60;display:inline-flex;align-items:center;gap:8px;padding:12px 16px;border-radius:999px;background:#25d366;color:#fff;font-weight:600;font-size:15px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25)}
        .wa-fab:hover{background:#1ebe5a}
        .wa-fab:focus-visible{outline:3px solid #0f2233;outline-offset:2px}
        @media (max-width:520px){.wa-fab{padding:13px;right:12px;bottom:12px}.wa-fab span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}}
      `}</style>
    </>
  );
}
