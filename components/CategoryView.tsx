import Link from "next/link";
import type { Card, Family } from "@/lib/types";
import { families } from "@/lib/catalog";
import { USES, lv, minPpm2 } from "@/lib/laine";
import { eur } from "@/lib/format";
import { familyIntro } from "@/lib/families-text";
import { Breadcrumbs } from "./Breadcrumbs";
import Listing from "./Listing";
import { IconBox, IconChevron } from "./Icons";

/** Page de famille ou de sous-famille : titre, introduction, sous-familles, produits filtrables, familles voisines. */
export function CategoryView({ family, subSlug, items }: { family: Family; subSlug?: string; items: Card[] }) {
  const sub = subSlug ? family.subs.find((s) => s.slug === subSlug) : undefined;
  const title = sub ? sub.name : family.name;
  const brands = [...new Set(items.map((p) => p.brand).filter(Boolean))].slice(0, 6);
  const priced = items.filter((p) => p.price != null).length;
  const others = families.filter((f) => f.slug !== family.slug);
  const crumbs = sub
    ? [{ name: family.name, href: `/categorie/${family.slug}` }, { name: sub.name }]
    : [{ name: family.name }];

  return (
    <div className="wrap page">
      <Breadcrumbs items={crumbs} />
      <header className="cat-head">
        <h1>{title}</h1>
        {sub ? (
          <p className="cat-intro">
            {items.length} produit{items.length > 1 ? "s" : ""} dans la famille <Link href={`/categorie/${family.slug}`}>{family.name}</Link>
            {brands.length > 0 && <> · marques : {brands.join(", ")}</>}
            {priced < items.length && <> · {items.length - priced} sur devis</>}.
          </p>
        ) : (
          <p className="cat-intro">{familyIntro(family.slug)}</p>
        )}
      </header>

      {family.slug === "isolants" && (!sub || sub.slug === "laine-de-verre") && <LvBanner />}

      {!sub && family.subs.length > 1 && (
        <nav className="subs" aria-label={`Sous-familles ${family.name}`}>
          {family.subs.map((s) => (
            <Link key={s.slug} href={`/categorie/${family.slug}/${s.slug}`} className="sub-tile">
              <span className="sub-img">{s.image ? <img src={s.image} alt="" loading="lazy" decoding="async" /> : <IconBox size={26} />}</span>
              <span className="sub-txt"><b>{s.name}</b><small>{s.count} produit{s.count > 1 ? "s" : ""}</small></span>
            </Link>
          ))}
        </nav>
      )}
      {sub && family.subs.length > 1 && (
        <nav className="sub-pills" aria-label="Autres sous-familles">
          <Link href={`/categorie/${family.slug}`} className="pill">Toute la famille</Link>
          {family.subs.filter((s) => s.slug !== sub.slug).map((s) => (
            <Link key={s.slug} href={`/categorie/${family.slug}/${s.slug}`} className="pill">{s.name} <small>{s.count}</small></Link>
          ))}
        </nav>
      )}

      <Listing products={items} showSub={!sub} lvFacets={family.slug === "isolants" && sub?.slug === "laine-de-verre"} />

      <aside className="near" aria-label="Autres familles">
        <h2>Autres familles de produits</h2>
        <div className="near-list">
          {others.map((f) => <Link key={f.slug} href={`/categorie/${f.slug}`}>{f.name} <small>{f.count}</small> <IconChevron size={14} /></Link>)}
        </div>
      </aside>
    </div>
  );
}

/** Raccourci vers la laine de verre classée par usage, avec le prix au m² d'entrée de gamme. */
function LvBanner() {
  const m2 = minPpm2(lv);
  return (
    <div className="lv-banner">
      <div>
        <p className="lv-banner-t">Laine de verre : choisissez par usage</p>
        <p className="lv-banner-s">Prix au m² affiché{m2 != null ? `, dès ${eur(m2)} le m²` : ""}. Calcul des quantités sur chaque fiche.</p>
      </div>
      <div className="lv-banner-links">
        {USES.map((u) => <Link key={u.key} href={`/laine-de-verre/${u.slug}`} className="pill">{u.title}</Link>)}
        <Link href="/laine-de-verre" className="btn btn-primary btn-sm">Toute la laine de verre <IconChevron size={16} /></Link>
      </div>
    </div>
  );
}
