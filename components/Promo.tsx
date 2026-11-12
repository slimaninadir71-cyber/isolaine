import { eur } from "@/lib/format";

/** Remise affichée sur tout le catalogue (le prix facturé est le prix réduit, voir scripts/fetch-catalog.mjs). */
export const PROMO_PCT = 20;

/** Pastille rouge « −20 % » à poser sur une image. */
export function PromoSticker({ className = "" }: { className?: string }) {
  return <span className={`promo-sticker ${className}`.trim()} aria-label={`Moins ${PROMO_PCT} pour cent`}>−{PROMO_PCT} %</span>;
}

/** Ancien prix barré. */
export function WasPrice({ was, price }: { was?: number | null; price?: number | null }) {
  if (was == null || price == null || was <= price) return null;
  return <s className="was" aria-label={`Ancien prix ${eur(was)}`}>{eur(was)}</s>;
}
