"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Card } from "@/lib/types";
import { ProductCard } from "./ProductCard";

/** Flèches précédent / suivant d'un carrousel (placées où l'on veut, reliées par l'identifiant du carrousel). */
export function ShelfArrows({ target }: { target: string }) {
  const [st, setSt] = useState({ prev: false, next: true });
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    const upd = () => setSt({ prev: el.scrollLeft > 4, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    upd();
    el.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => { el.removeEventListener("scroll", upd); window.removeEventListener("resize", upd); };
  }, [target]);
  const go = (d: 1 | -1) => {
    const el = document.getElementById(target);
    const card = el?.firstElementChild as HTMLElement | null;
    el?.scrollBy({ left: d * ((card?.offsetWidth ?? 280) + 20) * 2, behavior: "smooth" });
  };
  return (
    <div className="shelf-arrows">
      <button type="button" className="arr" onClick={() => go(-1)} disabled={!st.prev} aria-label="Produits précédents" aria-controls={target}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button type="button" className="arr" onClick={() => go(1)} disabled={!st.next} aria-label="Produits suivants" aria-controls={target}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}

/** Carrousel de produits : défilement au doigt ou aux flèches, aucun mouvement automatique. */
export function Shelf({ id, items, label, small = false, arrows = false, labels }: {
  id: string; items: Card[]; label: string; small?: boolean; arrows?: boolean; labels?: Record<string, string>; children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={`shelf${small ? " shelf-sm" : ""}`} role="region" aria-label={label}>
      <div className="shelf-track" id={id} ref={ref}>
        {items.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 2} label={labels?.[p.slug]} />)}
      </div>
      {arrows && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><ShelfArrows target={id} /></div>}
    </div>
  );
}
