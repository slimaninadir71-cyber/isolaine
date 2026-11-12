// Offre de bienvenue : code commun, réservé aux adresses inscrites au guide, valable une fois sur la première commande.
export const PROMO_CODE = "BIENVENUE10";
export const CODE_PCT = 10;
/** Clé du navigateur : inscription faite (e-mail, date) ou fenêtre refermée (date). Aucun cookie. */
export const PROSPECT_KEY = "isolaine-inscrit";
export const POPUP_KEY = "isolaine-guide-vu";
/** Version du texte d'accord affiché à côté de la case newsletter (conservée comme preuve). */
export const CONSENT_VERSION = "2026-11-v1";
export const CONSENT_TEXT = "J'accepte de recevoir les conseils, nouveautés et offres commerciales d'ISO-LAINE par e-mail. Je pourrai me désinscrire à tout moment.";

/** Remise en euros (arrondie au centime) pour un montant donné. */
export const discountOf = (subtotal: number, pct = CODE_PCT) => Math.round((Math.round(subtotal * 100) * pct) / 100) / 100;

/** Met un code saisi au format attendu (majuscules, chiffres, lettres et tiret). */
export const normCode = (s: unknown) => (typeof s === "string" ? s.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24) : "");
