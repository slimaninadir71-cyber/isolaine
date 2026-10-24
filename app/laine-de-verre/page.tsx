import Link from "next/link";
import type { Metadata } from "next";
import { lv, lvSorted, minPpm2 } from "@/lib/laine";
import { eur } from "@/lib/format";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Listing from "@/components/Listing";
import { LvGuide, PaletteTable, UseTiles } from "@/components/LvBlocks";
import { IconQuote } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Laine de verre : combles, murs et laine à souffler",
  description: "Laine de verre Isover et Ursa : rouleaux pour combles, panneaux GR 32 pour murs, laine à souffler. Prix au m² affiché, vente à l'unité ou à la palette, livraison offerte.",
  alternates: { canonical: "/laine-de-verre" },
};

export default function LaineDeVerre() {
  const items = lvSorted(lv);
  const m2 = minPpm2(items);
  const brands = [...new Set(items.map((p) => p.brand).filter(Boolean))];
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ name: "Isolants", href: "/categorie/isolants" }, { name: "Laine de verre" }]} />
      <header className="cat-head lv-head">
        <h1>Laine de verre</h1>
        <p className="cat-intro">
          {items.length} références {brands.join(" et ")} pour isoler combles, planchers et murs{m2 != null ? <>, à partir de <b>{eur(m2)} le m²</b></> : null}.
          Vente à l'unité ou à la palette, prix au m² affiché sur chaque produit, livraison offerte.
        </p>
      </header>

      <h2 className="sr-only">Choisir par usage</h2>
      <UseTiles />

      <section className="section-tight" aria-labelledby="toutes">
        <h2 id="toutes">Toutes nos laines de verre</h2>
        <Listing products={items} lvFacets relevance orderLabel="Recommandés" showSub={false} />
      </section>

      <section className="section-tight" aria-labelledby="palettes">
        <div className="section-head">
          <div>
            <h2 id="palettes">Comparer les palettes</h2>
            <p className="section-sub">Prix au m² calculé à partir du prix de la palette et de la surface indiquée par le fabricant.</p>
          </div>
          <Link href="/contact?type=devis" className="btn btn-ghost btn-sm"><IconQuote size={18} /> Devis pour plusieurs palettes</Link>
        </div>
        <PaletteTable items={items} />
      </section>

      <LvGuide />
    </div>
  );
}
