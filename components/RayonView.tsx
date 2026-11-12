import Link from "next/link";
import type { Metadata } from "next";
import { RAYONS, extraProducts, rayonByKey, rayonProducts, rayonTiles, type RayonKey } from "@/lib/rayons";
import { SITE } from "@/lib/site";
import { Breadcrumbs, JsonLd } from "./Breadcrumbs";
import Listing from "./Listing";
import { Shelf, ShelfArrows } from "./Shelf";
import { IconBox, IconQuote } from "./Icons";

/** Métadonnées d'une page de rayon (titre, description, adresse canonique). */
export function rayonMetadata(key: RayonKey): Metadata {
  const r = rayonByKey(key);
  const n = rayonProducts(r).length;
  return {
    title: `${r.title} : ${n} produits`,
    description: `${r.desc} Livraison offerte en France métropolitaine et en Belgique.`.slice(0, 158),
    alternates: { canonical: `/${r.slug}` },
    openGraph: { title: `${r.title} | ${SITE.name}` },
  };
}

/**
 * Page de rayon : titre, vignettes des catégories (vers leurs pages actuelles), tous les produits du rayon
 * en grille avec filtres et tri « Les plus demandés », puis les produits complémentaires.
 */
export function RayonView({ k }: { k: RayonKey }) {
  const r = rayonByKey(k);
  const items = rayonProducts(r);
  const tiles = rayonTiles(r);
  const extra = extraProducts(r);
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "CollectionPage", name: r.title, url: `${SITE.url}/${r.slug}`, description: r.desc,
        mainEntity: { "@type": "ItemList", numberOfItems: items.length,
          itemListElement: items.slice(0, 20).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE.url}/produit/${p.slug}`, name: p.name })) },
      }} />
      <div className="wrap">
        <Breadcrumbs items={[{ name: r.title }]} />
        <header className="rh">
          <div>
            <h1>{r.title}</h1>
            <p>{r.desc}</p>
            {r.brands && <p className="ray-brands">Marques : <b>{r.brands}</b></p>}
          </div>
          <div className="rh-cta"><Link href="/contact?type=devis" className="btn btn-ghost"><IconQuote size={18} /> Demander un devis chantier</Link></div>
        </header>
        <nav className="tiles" aria-label={`Catégories du rayon ${r.title}`}>
          {tiles.map((t) => (
            <Link key={t.href} href={t.href} className="tile">
              <span className="tile-i">{t.image ? <img src={t.image} alt="" loading="lazy" decoding="async" /> : <IconBox size={26} />}</span>
              <b>{t.name}</b><small>{t.count} produit{t.count > 1 ? "s" : ""}</small>
            </Link>
          ))}
        </nav>
        <div className="rayon-list">
          <Listing products={items} showFamily={!!r.byFamily} lvFacets={k === "isolation"} />
        </div>
      </div>
      {extra.length > 0 && (
        <section className="cx" aria-labelledby="cx-h">
          <div className="wrap">
            <div className="ray-h" style={{ marginBottom: 0 }}>
              <div><h2 id="cx-h">Complétez votre chantier</h2><p className="s">{r.extraText}</p></div>
              <div className="ray-act"><ShelfArrows target="cx" /></div>
            </div>
            <Shelf id="cx" items={extra} label="Produits complémentaires" small />
          </div>
        </section>
      )}
      <nav className="wrap" aria-label="Autres rayons" style={{ padding: "28px 16px 44px" }}>
        <div className="sub-pills" style={{ margin: 0 }}>
          {RAYONS.filter((x) => x.key !== k).map((x) => <Link key={x.key} href={`/${x.slug}`} className="pill">{x.title}</Link>)}
        </div>
      </nav>
    </>
  );
}
