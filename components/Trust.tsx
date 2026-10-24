import Link from "next/link";
import type { Faq } from "@/lib/faq";
import { IconChevron } from "./Icons";

/** Questions fréquentes en accordéon (sans JavaScript). */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q} className="faq-item">
          <summary><span>{f.q}</span><IconChevron size={18} /></summary>
          <div className="faq-a"><p>{f.a}</p>{f.link && <Link href={f.link.href} className="link-arrow">{f.link.label} <IconChevron size={14} /></Link>}</div>
        </details>
      ))}
    </div>
  );
}

// Illustrations dessinées (pas des photos) : téléphone et panier, confirmation, camion chargé d'une palette de rouleaux
const ArtOrder = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true">
    <rect x="56" y="10" width="48" height="80" rx="9" fill="#fff" stroke="#1b2833" strokeWidth="2.5" />
    <rect x="64" y="22" width="32" height="18" rx="3" fill="#f7d873" />
    <path d="M70 25v12M76 25v12M82 25v12M88 25v12" stroke="#d9a800" strokeWidth="1.5" />
    <rect x="64" y="45" width="24" height="3.5" rx="1.7" fill="#e6e3dc" />
    <rect x="64" y="52" width="18" height="3.5" rx="1.7" fill="#e6e3dc" />
    <rect x="64" y="68" width="32" height="12" rx="4" fill="#f5b400" />
    <circle cx="106" cy="16" r="10" fill="#1b2833" />
    <text x="106" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">1</text>
  </svg>
);
const ArtConfirm = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true">
    <rect x="46" y="12" width="62" height="76" rx="7" fill="#fff" stroke="#1b2833" strokeWidth="2.5" />
    <rect x="56" y="24" width="30" height="4" rx="2" fill="#1b2833" />
    <rect x="56" y="36" width="42" height="3.5" rx="1.7" fill="#e6e3dc" />
    <rect x="56" y="44" width="36" height="3.5" rx="1.7" fill="#e6e3dc" />
    <rect x="56" y="52" width="40" height="3.5" rx="1.7" fill="#e6e3dc" />
    <circle cx="104" cy="70" r="17" fill="#12704a" />
    <path d="m96 70 6 6 11-12" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArtShip = () => (
  <svg viewBox="0 0 160 100" aria-hidden="true">
    <path d="M8 88h144" stroke="#e6e3dc" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="18" y="70" width="88" height="8" rx="2" fill="#3e4c59" />
    <rect x="26" y="65" width="72" height="5" fill="#c79a5c" />
    {[28, 52, 76].map((x) => (
      <g key={x}>
        <rect x={x} y="37" width="20" height="28" rx="5" fill="#f7d873" stroke="#d9a800" strokeWidth="1.5" />
        <path d={`M${x + 5} 41v20M${x + 10} 41v20M${x + 15} 41v20`} stroke="#e7bd32" strokeWidth="1.2" />
      </g>
    ))}
    <path d="M106 50h20l10 12v16h-30z" fill="#1b2833" />
    <path d="M111 54h13l7 8h-20z" fill="#cfe3f5" />
    <circle cx="38" cy="81" r="7" fill="#1b2833" /><circle cx="38" cy="81" r="2.5" fill="#fff" />
    <circle cx="122" cy="81" r="7" fill="#1b2833" /><circle cx="122" cy="81" r="2.5" fill="#fff" />
    <circle cx="134" cy="22" r="15" fill="#fff" stroke="#f5b400" strokeWidth="3" />
    <text x="134" y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1b2833">24 h</text>
  </svg>
);

/** Déroulé d'une commande en 3 étapes illustrées. */
export function OrderSteps({ pickup = false, lead = "" }: { pickup?: boolean; lead?: string }) {
  const last = pickup
    ? { t: "Vous retirez en magasin", d: "L'adresse et le créneau de retrait vous sont communiqués avec la confirmation." }
    : lead
      ? { t: "Nous expédions", d: `Après le délai d'approvisionnement (${lead}) et la réception du règlement. Livraison offerte.` }
      : { t: "Expédition sous 24 h", d: "Dès réception du règlement. Livraison offerte en France métropolitaine et en Belgique." };
  const steps = [
    { art: <ArtOrder />, t: "Vous commandez", d: "Choisissez vos produits, indiquez vos coordonnées et l'adresse. Aucun paiement en ligne." },
    { art: <ArtConfirm />, t: "Nous confirmons", d: "Disponibilité, livraison et modalités de règlement, par e-mail ou téléphone." },
    { art: <ArtShip />, ...last },
  ];
  return (
    <ol className="osteps">
      {steps.map((s, i) => (
        <li key={s.t}>
          <span className="osteps-art">{s.art}</span>
          <span className="osteps-n">{i + 1}</span>
          <b>{s.t}</b>
          <p>{s.d}</p>
        </li>
      ))}
    </ol>
  );
}
