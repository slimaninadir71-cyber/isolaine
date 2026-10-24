import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { families, getFamily, productsOf } from "@/lib/catalog";
import { CategoryView } from "@/components/CategoryView";

type Props = { params: Promise<{ famille: string; sous: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => families.flatMap((f) => f.subs.map((s) => ({ famille: f.slug, sous: s.slug })));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { famille, sous } = await params;
  const f = getFamily(famille);
  const s = f?.subs.find((x) => x.slug === sous);
  if (!f || !s) return {};
  const items = productsOf(f.slug, s.slug);
  const brands = [...new Set(items.map((p) => p.brand).filter(Boolean))].slice(0, 4);
  return {
    title: `${s.name} – ${f.name}`,
    description: `${s.name} : ${s.count} produit${s.count > 1 ? "s" : ""}${brands.length ? ` (${brands.join(", ")})` : ""}. Prix affichés, livraison offerte, devis pour les chantiers.`.slice(0, 158),
    alternates: { canonical: `/categorie/${f.slug}/${s.slug}` },
    openGraph: { title: `${s.name} | Isolaine`, images: s.image ? [s.image] : undefined },
  };
}

export default async function SubPage({ params }: Props) {
  const { famille, sous } = await params;
  const f = getFamily(famille);
  if (!f || !f.subs.some((s) => s.slug === sous)) notFound();
  return <CategoryView family={f} subSlug={sous} items={productsOf(f.slug, sous)} />;
}
