import type { Metadata } from "next";
import { getProduct } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "./ContactForm";
import { IconQuote, IconTruck } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contact et demande de devis",
  description: "Une question sur un produit, une commande ou un chantier ? Demandez un devis pour les palettes et grandes quantités : réponse personnalisée.",
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ type?: string; produit?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const p = sp.produit ? getProduct(sp.produit) : undefined;
  const kind: "devis" | "contact" = sp.type === "devis" || (!!p && p.price == null) ? "devis" : "contact";
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ name: kind === "devis" ? "Demande de devis" : "Contact" }]} />
      <div className="contact">
        <div>
          <h1>{kind === "devis" ? "Demander un devis" : "Nous contacter"}</h1>
          <p className="cat-intro">
            {kind === "devis"
              ? "Palettes, quantités chantier, produits sur devis : décrivez votre besoin, nous vous répondons avec une proposition personnalisée."
              : "Une question sur un produit, une commande en cours ou une livraison ? Écrivez-nous, nous vous répondons par e-mail."}
          </p>
          <ContactForm kind={kind} product={p ? `${p.name}${p.sku ? ` (réf. ${p.sku})` : ""}` : ""} />
        </div>
        <aside className="contact-side">
          <div className="info-box"><IconQuote size={22} /><div><b>Devis chantier</b><p>Indiquez les références, les quantités, l'adresse de livraison et le délai souhaité pour une réponse précise.</p></div></div>
          <div className="info-box"><IconTruck size={22} /><div><b>Livraison offerte</b><p>{SITE.delivery}. Certains produits se retirent en magasin : c'est indiqué sur leur fiche.</p></div></div>
        </aside>
      </div>
    </div>
  );
}
