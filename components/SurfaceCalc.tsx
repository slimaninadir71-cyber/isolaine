"use client";
import { useState } from "react";
import Link from "next/link";
import { eur, num } from "@/lib/format";
import { IconChevron, IconRuler } from "./Icons";

export type Rate = { key: string; label: string; href: string; ppm2: number | null };

/** Petit calculateur d'accueil : surface à isoler → usage → prix indicatif d'après le prix au m² le plus bas du catalogue. */
export function SurfaceCalc({ rates }: { rates: Rate[] }) {
  const [surf, setSurf] = useState("");
  const [use, setUse] = useState(rates[0]?.key ?? "");
  const area = parseFloat(surf.replace(",", "."));
  const r = rates.find((x) => x.key === use) ?? rates[0];
  const ok = area > 0 && area < 100000;
  return (
    <div className="hcalc">
      <div className="hcalc-head">
        <span className="pi"><IconRuler size={20} /></span>
        <div>
          <h2 id="calc">Quelle surface à isoler ?</h2>
          <p>Indiquez vos m², nous vous orientons vers les produits adaptés.</p>
        </div>
      </div>
      <div className="hcalc-form">
        <label>Surface
          <span className="hcalc-in">
            <input inputMode="decimal" autoComplete="off" placeholder="ex. 60" value={surf}
              onChange={(e) => setSurf(e.target.value.replace(/[^\d.,]/g, "").slice(0, 8))} aria-describedby="calc-out" />
            <b>m²</b>
          </span>
        </label>
        <label>Chantier
          <select value={use} onChange={(e) => setUse(e.target.value)}>
            {rates.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
          </select>
        </label>
        <Link href={r?.href ?? "/laine-de-verre"} className="btn btn-primary hcalc-go">Voir les produits <IconChevron size={16} /></Link>
      </div>
      <p id="calc-out" className="hcalc-out" aria-live="polite">
        {ok && r?.ppm2 != null
          ? <>Pour <b>{num(area)} m²</b> : à partir de <b>{eur(Math.round(area * r.ppm2 * 100) / 100)}</b> (laine de verre au prix le plus bas de la gamme, soit {eur(r.ppm2)}/m²). Calcul indicatif : le nombre exact de rouleaux est calculé sur chaque fiche produit.</>
          : "Le calcul exact (nombre de rouleaux ou de palettes) se fait ensuite sur la fiche du produit choisi."}
      </p>
    </div>
  );
}
