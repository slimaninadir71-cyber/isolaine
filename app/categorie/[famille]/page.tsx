import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { families, getFamily, productsOf } from "@/lib/catalog";
import { familyIntro } from "@/lib/families-text";
import { CategoryView } from "@/components/CategoryView";

type Props = { params: Promise<{ famille: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => families.map((f) => ({ famille: f.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { famille } = await params;
  const f = getFamily(famille);
  if (!f) return {};
  const intro = familyIntro(f.slug);
  return {
    title: `${f.name} : ${f.count} produits`,
    description: (intro || `${f.name} : ${f.count} produits.`).slice(0, 158),
    alternates: { canonical: `/categorie/${f.slug}` },
    openGraph: { title: `${f.name} | Isolaine`, images: f.image ? [f.image] : undefined },
  };
}

export default async function FamilyPage({ params }: Props) {
  const { famille } = await params;
  const f = getFamily(famille);
  if (!f) notFound();
  return <CategoryView family={f} items={productsOf(f.slug)} />;
}
