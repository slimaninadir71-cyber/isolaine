"use client";
import { useState } from "react";
import type { Photo } from "@/lib/types";
import { IconBox } from "./Icons";

/** Galerie de la fiche produit : grande photo et miniatures cliquables. */
export function Gallery({ photos, alt }: { photos: Photo[]; alt: string }) {
  const [i, setI] = useState(0);
  if (!photos.length) {
    return <div className="gallery-main gallery-empty"><IconBox size={48} /><span>Photo non disponible</span></div>;
  }
  const cur = photos[Math.min(i, photos.length - 1)];
  return (
    <div className="gallery">
      <div className="gallery-main">
        <img src={cur.src} alt={photos.length > 1 ? `${alt} – photo ${i + 1} sur ${photos.length}` : alt}
          width={cur.w || undefined} height={cur.h || undefined} fetchPriority={i === 0 ? "high" : "auto"} decoding="async" />
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs" role="group" aria-label="Choisir une photo">
          {photos.map((p, k) => (
            <button key={p.src} type="button" className={k === i ? "on" : ""} aria-label={`Photo ${k + 1}`} aria-pressed={k === i} onClick={() => setI(k)}>
              <img src={p.sm} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
