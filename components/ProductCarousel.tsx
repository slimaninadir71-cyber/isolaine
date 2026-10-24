"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { eur, num, priceText } from "@/lib/format";
import type { Card } from "@/lib/types";
import { IconChevron } from "./Icons";

export type Slide = Pick<Card, "slug" | "name" | "brand" | "image" | "price" | "priceMax" | "variable" | "ppm2" | "thickness" | "r" | "facing" | "cu">;

const SPEED = 30; // pixels par seconde

/**
 * Carrousel de produits qui défile en continu. Pause au survol, au focus, au toucher et avec le bouton dédié ;
 * glisser ou utiliser les flèches reste possible. Aucun mouvement automatique si l'utilisateur l'a désactivé dans son système.
 */
export function ProductCarousel({ items, label }: { items: Slide[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [st] = useState(() => ({ pos: 0, set: -1, hold: 0, hover: false, paused: false })); // état d'animation (stable)
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStill(true); return; }
    const s = st;
    let raf = 0, last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(50, t - last);
      last = t;
      const half = el.scrollWidth / 2;
      if (s.set >= 0 && Math.abs(el.scrollLeft - s.set) > 2) { s.pos = el.scrollLeft; s.hold = t + 2500; } // défilement manuel
      if (el.scrollLeft >= half && half > 0) { el.scrollLeft -= half; s.pos = el.scrollLeft; }
      if (!s.hover && !s.paused && t > s.hold && !document.hidden && half > el.clientWidth) {
        s.pos += (SPEED * dt) / 1000;
        if (s.pos >= half) s.pos -= half;
        el.scrollLeft = s.pos;
      }
      s.set = el.scrollLeft;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [st]);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".cs-card");
    st.hold = performance.now() + 4000;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 260) + 16), behavior: "smooth" });
  };
  const toggle = () => { st.paused = !paused; setPaused(!paused); };
  const hold = (on: boolean) => { st.hover = on; };

  const slide = (p: Slide, dup: boolean) => (
    <Link key={`${dup ? "b" : "a"}-${p.slug}`} href={`/produit/${p.slug}`} className="cs-card" tabIndex={dup ? -1 : undefined} aria-hidden={dup || undefined} draggable={false}>
      <span className="cs-img">
        {p.image ? <img src={p.image} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
        {p.cu === "palette" && <span className="cs-flag">Palette</span>}
      </span>
      <span className="cs-body">
        {p.brand && <span className="cs-brand">{p.brand}</span>}
        <span className="cs-name">{p.name}</span>
        <span className="cs-specs">
          {p.thickness ? <span>{p.thickness} mm</span> : null}
          {p.r ? <span>R {num(p.r)}</span> : null}
          {p.facing ? <span>{p.facing}</span> : null}
        </span>
        <span className="cs-price">
          <b>{priceText(p)}</b>
          {p.ppm2 != null && <small>soit {eur(p.ppm2)}/m²</small>}
        </span>
      </span>
    </Link>
  );

  return (
    <div className="cs" role="region" aria-roledescription="carrousel" aria-label={label}
      onMouseEnter={() => hold(true)} onMouseLeave={() => hold(false)} onFocus={() => hold(true)} onBlur={() => hold(false)}
      onPointerDown={() => { st.hold = performance.now() + 4000; }}>
      <div className="cs-track" ref={ref}>
        <div className="cs-row">
          {items.map((p) => slide(p, false))}
          {!still && items.map((p) => slide(p, true))}
        </div>
      </div>
      <div className="cs-ctrl">
        <button type="button" className="cs-btn" onClick={() => step(-1)} aria-label="Produits précédents"><IconChevron size={20} className="rot" /></button>
        {!still && (
          <button type="button" className="cs-btn cs-pause" onClick={toggle} aria-pressed={paused} aria-label={paused ? "Relancer le défilement" : "Mettre le défilement en pause"}>
            {paused
              ? <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor" /></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /></svg>}
          </button>
        )}
        <button type="button" className="cs-btn" onClick={() => step(1)} aria-label="Produits suivants"><IconChevron size={20} /></button>
      </div>
    </div>
  );
}
