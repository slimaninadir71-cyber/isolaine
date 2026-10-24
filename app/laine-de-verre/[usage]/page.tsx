import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { USES, kitFor, lvOf, minPpm2, useBySlug } from "@/lib/laine";
import { eur } from "@/lib/format";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Listing from "@/components/Listing";
import { ProductCard } from "@/components/ProductCard";
import { PaletteTable, UseTiles } from "@/components/LvBlocks";

type Props = { params: Promise<{ usage: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => USES.map((u) => ({ usage: u.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = useBySlug((await params).usage);
  if (!u) return {};
  const m2 = minPpm2(lvOf(u.key));
  return {
    title: u.h1,
    description: `${u.text}${m2 != null ? ` À partir de ${eur(m2)} le m².` : ""} Livraison offerte.`.slice(0, 300),
    alternates: { canonical: `/laine-de-verre/${u.slug}` },
  };
}

export default async function UsagePage({ params }: Props) {
  const u = useBySlug((await params).usage);
  if (!u) notFound();
  const items = lvOf(u.key);
  const kit = kitFor(u.key, 8);
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ name: "Laine de verre", href: "/laine-de-verre" }, { name: u.title }]} />
      <header className="cat-head">
        <h1>{u.h1}</h1>
        <p className="cat-intro">{u.text}</p>
      </header>
      <nav className="sub-pills" aria-label="Autres usages">
        <Link href="/laine-de-verre" className="pill">Toute la laine de verre</Link>
        {USES.filter((x) => x.key !== u.key).map((x) => <Link key={x.key} href={`/laine-de-verre/${x.slug}`} className="pill">{x.title}</Link>)}
        <Link href="/laine-de-verre/materiel-de-pose" className="pill">Matériel de pose</Link>
      </nav>

      <Listing products={items} lvFacets relevance orderLabel="Recommandés" showSub={false} />

      {items.some((p) => p.cu === "palette" && p.ppm2 != null) && (
        <section className="section-tight" aria-labelledby="palettes">
          <h2 id="palettes">Comparer les palettes</h2>
          <PaletteTable items={items} />
        </section>
      )}

      {kit.length > 0 && (
        <section className="section-tight" aria-labelledby="pose">
          <div className="section-head">
            <h2 id="pose">Pour la pose</h2>
            <Link href="/laine-de-verre/materiel-de-pose" className="link-arrow">Tout le matériel de pose</Link>
          </div>
          <div className="grid grid-row">{kit.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        </section>
      )}

      <section className="section-tight" aria-labelledby="usages">
        <h2 id="usages">Autres usages</h2>
        <UseTiles current={u.key} />
      </section>
    </div>
  );
}
