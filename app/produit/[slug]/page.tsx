import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDetail, getFamily, getProduct, products, related } from "@/lib/catalog";
import { isLv, kitFor, lvOf, useByKey } from "@/lib/laine";
import { cap, eur, num, unitWord } from "@/lib/format";
import { SITE } from "@/lib/site";
import { Breadcrumbs, JsonLd } from "@/components/Breadcrumbs";
import { Gallery } from "@/components/Gallery";
import { BuyBox } from "@/components/BuyBox";
import { ProductCard } from "@/components/ProductCard";
import { RichText } from "@/components/RichText";
import { ReadMore } from "@/components/ReadMore";
import { FaqList, OrderSteps } from "@/components/Trust";
import { FAQ_PRODUCT } from "@/lib/faq";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, "")}…` : s);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const d = getDetail(slug);
  const base = (d.short || d.desc || "").replace(/\s+/g, " ").trim();
  const price = p.price != null ? ` à partir de ${p.price.toFixed(2).replace(".", ",")} €` : " sur devis";
  return {
    title: clip(p.name, 70),
    description: clip(base ? `${base}` : `${p.name}${p.brand ? ` ${p.brand}` : ""}${price}. ${p.subName}, livraison offerte.`, 158),
    alternates: { canonical: `/produit/${p.slug}` },
    openGraph: { type: "website", title: p.name, images: d.images[0] ? [d.images[0].src] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const d = getDetail(slug);
  const fam = getFamily(p.family);
  const lvp = isLv(p);
  const use = lvp ? useByKey(p.use ?? "") : undefined;
  // Laine de verre : autres épaisseurs du même usage (les plus proches d'abord) et matériel de pose
  const rel = lvp
    ? lvOf(p.use ?? "").filter((x) => x.slug !== p.slug).sort((a, b) => Math.abs((a.thickness ?? 0) - (p.thickness ?? 0)) - Math.abs((b.thickness ?? 0) - (p.thickness ?? 0))).slice(0, 8)
    : related(p, 8);
  const kit = lvp ? kitFor(p.use, 8) : [];

  // Caractéristiques : uniquement les données présentes sur la fiche
  const rows: [string, string][] = [];
  if (p.brand) rows.push(["Marque", p.brand]);
  if (p.sku) rows.push(["Référence", p.sku]);
  rows.push(["Famille", `${p.familyName} › ${p.subName}${use ? ` › ${use.title}` : ""}`]);
  if (p.pack) rows.push(["Conditionnement", p.pack]);
  if (p.thickness) rows.push(["Épaisseur", `${p.thickness} mm`]);
  if (p.r) rows.push(["Résistance thermique", `R = ${num(p.r)} m².K/W`]);
  if (p.facing) rows.push(["Revêtement", p.facing === "Nu" ? "Nue (sans parement)" : "Revêtue kraft"]);
  if (d.cover) rows.push(["Surface couverte", `${num(d.cover.m2)} m² par ${d.cover.unit}${d.cover.inner ? ` (${d.cover.inner.n} ${unitWord(d.cover.inner.kind, d.cover.inner.n)} de ${num(d.cover.inner.m2)} m²)` : ""}`]);
  if (p.ppm2 != null) rows.push(["Prix au m²", eur(p.ppm2)]);
  for (const a of d.attrs) rows.push([a.name, a.values.join(", ")]);
  if (d.variants.length > 1) rows.push(["Options disponibles", String(d.variants.length)]);
  if (d.lead) rows.push(["Délai d'approvisionnement", d.lead]);
  rows.push(["Mode de réception", p.pickup ? "Retrait en magasin uniquement" : "Livraison offerte (France métropolitaine et Belgique)"]);

  const prices = d.variants.map((v) => v.price);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url: `${SITE.url}/produit/${p.slug}`,
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    ...(d.images.length ? { image: d.images.map((i) => `${SITE.url}${i.src}`) } : {}),
    ...(d.short || d.desc ? { description: clip((d.short || d.desc).replace(/\s+/g, " "), 500) } : {}),
    category: `${p.familyName} > ${p.subName}`,
    ...(prices.length ? {
      offers: prices.length > 1 && Math.min(...prices) !== Math.max(...prices)
        ? { "@type": "AggregateOffer", priceCurrency: "EUR", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length, url: `${SITE.url}/produit/${p.slug}` }
        : { "@type": "Offer", priceCurrency: "EUR", price: prices[0], url: `${SITE.url}/produit/${p.slug}` },
    } : {}),
  };

  return (
    <div className="wrap page">
      <JsonLd data={ld} />
      <Breadcrumbs items={lvp ? [
        { name: "Laine de verre", href: "/laine-de-verre" },
        ...(use ? [{ name: use.title, href: `/laine-de-verre/${use.slug}` }] : []),
        { name: p.name },
      ] : [
        { name: p.familyName, href: `/categorie/${p.family}` },
        { name: p.subName, href: `/categorie/${p.family}/${p.sub}` },
        { name: p.name },
      ]} />

      <div className="pdp">
        <div className="pdp-media"><Gallery photos={d.images} alt={p.name} /></div>
        <div className="pdp-info">
          <p className="pdp-meta">
            {p.brand && <span className="tag">{p.brand}</span>}
            {use
              ? <Link href={`/laine-de-verre/${use.slug}`} className="tag tag-link">Laine de verre · {use.title}</Link>
              : <Link href={`/categorie/${p.family}/${p.sub}`} className="tag tag-link">{p.subName}</Link>}
          </p>
          <h1 className="pdp-title">{p.name}</h1>
          <p className="pdp-ref">{p.sku ? <>Réf. {p.sku}</> : null}{p.pack ? <>{p.sku ? " · " : ""}{p.pack}</> : null}</p>
          {(p.thickness || p.r || p.facing) && (
            <p className="pdp-keys">
              {p.thickness ? <span><small>Épaisseur</small>{p.thickness} mm</span> : null}
              {p.r ? <span><small>Résistance R</small>{num(p.r)}</span> : null}
              {p.facing ? <span><small>Revêtement</small>{p.facing === "Nu" ? "Nue" : "Kraft"}</span> : null}
              {d.cover ? <span><small>{cap(d.cover.unit)}</small>{num(d.cover.m2)} m²</span> : null}
            </p>
          )}
          {d.short && <p className="pdp-short">{clip(d.short.replace(/\s+/g, " "), 320)}</p>}
          <BuyBox product={{ slug: p.slug, name: p.name, image: p.image, pickup: p.pickup }} variants={d.variants} lead={d.lead} cover={d.cover} />
        </div>
      </div>

      <div className="pdp-more">
        <section className="pdp-desc" aria-labelledby="desc">
          <h2 id="desc">Description</h2>
          {d.desc || d.short
            ? <ReadMore><RichText text={d.desc || d.short} /></ReadMore>
            : <p className="muted">Pas de description détaillée pour ce produit. Pour toute question technique, <Link href={`/contact?produit=${encodeURIComponent(p.slug)}`}>contactez-nous</Link>.</p>}
        </section>
        <section className="pdp-specs" aria-labelledby="specs">
          <h2 id="specs">Caractéristiques</h2>
          <table className="specs"><tbody>{rows.map(([k, v], i) => <tr key={`${k}-${i}`}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table>
          {d.variants.length > 1 && (
            <>
              <h3 className="specs-h">Options et prix</h3>
              <table className="specs specs-opts">
                <thead><tr><th scope="col">Option</th><th scope="col">Réf.</th><th scope="col">Prix</th></tr></thead>
                <tbody>{d.variants.map((v) => <tr key={v.id}><td>{v.label}</td><td>{v.sku || "–"}</td><td className="num">{v.price.toFixed(2).replace(".", ",")} €</td></tr>)}</tbody>
              </table>
            </>
          )}
        </section>
      </div>

      <section className="section-tight pdp-how" aria-labelledby="how">
        <div className="section-head">
          <h2 id="how">Comment ça se passe</h2>
          <Link href="/livraison-retours" className="link-arrow">Livraison et retours</Link>
        </div>
        <OrderSteps pickup={p.pickup} lead={d.lead} />
        <h3 className="pdp-faq-h">Vos questions</h3>
        <FaqList items={FAQ_PRODUCT} />
      </section>

      {kit.length > 0 && (
        <section className="section-tight" aria-labelledby="kit">
          <div className="section-head">
            <h2 id="kit">Pour la pose</h2>
            <Link href="/laine-de-verre/materiel-de-pose" className="link-arrow">Tout le matériel de pose</Link>
          </div>
          <div className="grid grid-row">{kit.map((x) => <ProductCard key={x.slug} p={x} />)}</div>
        </section>
      )}

      {rel.length > 0 && (
        <section className="section-tight" aria-labelledby="rel">
          <div className="section-head">
            <h2 id="rel">{lvp ? "Autres épaisseurs et formats" : "Produits complémentaires"}</h2>
            {use
              ? <Link href={`/laine-de-verre/${use.slug}`} className="link-arrow">Voir {use.h1.toLowerCase()}</Link>
              : fam && <Link href={`/categorie/${fam.slug}`} className="link-arrow">Voir {fam.name.toLowerCase()}</Link>}
          </div>
          <div className="grid grid-row">{rel.map((x) => <ProductCard key={x.slug} p={x} />)}</div>
        </section>
      )}
    </div>
  );
}
