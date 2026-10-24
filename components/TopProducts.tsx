"use client";
import { useState } from "react";
import type { Card } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export type TopTab = { key: string; label: string; items: Card[] };

/** Produits phares de l'accueil, filtrés par onglet (laine de verre, laine de roche, rouleaux, palettes). */
export function TopProducts({ tabs }: { tabs: TopTab[] }) {
  const [cur, setCur] = useState(tabs[0]?.key);
  const tab = tabs.find((t) => t.key === cur) ?? tabs[0];
  if (!tab) return null;
  return (
    <>
      <div className="top-tabs" role="tablist" aria-label="Choisir une sélection">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={t.key === tab.key} className={`top-tab${t.key === tab.key ? " on" : ""}`} onClick={() => setCur(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid top-grid" role="tabpanel" aria-label={tab.label}>
        {tab.items.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 2} />)}
      </div>
    </>
  );
}
