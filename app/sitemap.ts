import type { MetadataRoute } from "next";
import { families, products } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { USES } from "@/lib/laine";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const u = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly" = "weekly") =>
    ({ url: `${SITE.url}${path}`, lastModified: now, changeFrequency, priority });
  return [
    u("", 1, "daily"),
    u("/laine-de-verre", 1, "daily"),
    ...USES.map((x) => u(`/laine-de-verre/${x.slug}`, 0.9)),
    u("/laine-de-verre/materiel-de-pose", 0.8),
    u("/boutique", 0.9, "daily"),
    ...families.map((f) => u(`/categorie/${f.slug}`, 0.9)),
    ...families.flatMap((f) => f.subs.map((s) => u(`/categorie/${f.slug}/${s.slug}`, 0.8))),
    ...products.map((p) => u(`/produit/${p.slug}`, 0.7)),
    u("/livraison-retours", 0.5, "monthly"),
    u("/contact", 0.5, "monthly"),
    u("/cgv", 0.3, "yearly"),
    u("/mentions-legales", 0.2, "yearly"),
    u("/confidentialite", 0.2, "yearly"),
    u("/cookies", 0.1, "yearly"),
  ];
}
