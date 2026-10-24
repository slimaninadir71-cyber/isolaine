import Link from "next/link";
import type { Metadata } from "next";
import { families, products } from "@/lib/catalog";
import { familyShort } from "@/lib/families-text";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SearchBox } from "@/components/SearchBox";
import { IconBox, IconChevron } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Tout le catalogue",
  description: `Le catalogue Isolaine : ${products.length} produits répartis en ${families.length} familles – isolants, enduits, profilés et décoration de façade, quincaillerie, outillage.`,
  alternates: { canonical: "/boutique" },
};

export default function Catalogue() {
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ name: "Tout le catalogue" }]} />
      <header className="cat-head">
        <h1>Tout le catalogue</h1>
        <p className="cat-intro">{products.length} produits en {families.length} familles. Choisissez une famille ou une sous-famille, ou recherchez directement un produit, une marque ou une référence.</p>
        <div className="cat-search"><SearchBox /></div>
      </header>
      <div className="hub">
        {families.map((f) => (
          <section key={f.slug} className="hub-fam" aria-labelledby={`h-${f.slug}`}>
            <Link href={`/categorie/${f.slug}`} className="hub-head">
              <span className="hub-img">{f.image ? <img src={f.image} alt="" loading="lazy" decoding="async" /> : <IconBox size={28} />}</span>
              <span>
                <h2 id={`h-${f.slug}`}>{f.name}</h2>
                <small>{f.count} produits · {familyShort(f.slug)}</small>
              </span>
              <IconChevron size={18} />
            </Link>
            <ul>
              {f.subs.map((s) => (
                <li key={s.slug}><Link href={`/categorie/${f.slug}/${s.slug}`}>{s.name} <small>{s.count}</small></Link></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
