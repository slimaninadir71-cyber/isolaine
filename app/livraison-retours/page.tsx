import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/Legal";
import { IconQuote, IconTruck } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Livraison, commande et retours",
  description: "Livraison offerte en France métropolitaine et en Belgique, paiement par carte sécurisé, retours et garanties.",
  alternates: { canonical: "/livraison-retours" },
};

export default function Page() {
  return (
    <LegalPage title="Livraison, commande et retours">
      <div className="info-grid">
        <div className="info-box"><IconTruck size={22} /><div><b>Livraison offerte</b><p>En France métropolitaine et en Belgique, sur tous les produits livrables.</p></div></div>
        <div className="info-box"><IconQuote size={22} /><div><b>Devis chantier</b><p>Palettes, grandes quantités : <Link href="/contact?type=devis">demandez un devis</Link>.</p></div></div>
      </div>

      <h2 id="commande">Comment commander</h2>
      <ol>
        <li>Ajoutez vos produits au panier en choisissant, le cas échéant, l'option souhaitée (épaisseur, longueur, conditionnement…).</li>
        <li>Indiquez vos coordonnées et votre adresse de livraison, puis réglez par carte bancaire (paiement sécurisé avec 3-D Secure).</li>
        <li>Vous recevez un numéro de commande et un e-mail de confirmation. Notre équipe prépare votre commande et vous indique le délai de livraison.</li>
      </ol>

      <h2>Livraison</h2>
      <p>
        La livraison est offerte en France métropolitaine et en Belgique, quel que soit le montant de la commande, pour tous les produits
        livrables. Commandé, expédié sous 24 h : la livraison prend en général environ 7 jours. Le délai vous est confirmé dans l'e-mail de confirmation de commande. Certains produits approvisionnés sur commande portent un
        délai d'approvisionnement, affiché sur leur fiche.
      </p>
      <p>
        À la réception, vérifiez l'état et le nombre de colis en présence du livreur. En cas d'avarie ou de manquant, notez des réserves
        précises sur le bon de livraison et signalez-le-nous via la page <Link href="/contact">Contact</Link>.
      </p>

      <h2>Retours et rétractation</h2>
      <p>
        Si vous êtes un particulier, vous disposez de quatorze jours après réception pour vous rétracter, sans avoir à vous justifier.
        Prévenez-nous via la page <Link href="/contact">Contact</Link>, puis retournez les produits complets et dans leur état d'origine ;
        les frais de retour restent à votre charge. Le remboursement intervient dans les quatorze jours suivant votre demande. Le détail
        figure à l'article 8 des <Link href="/cgv">conditions générales de vente</Link>.
      </p>

      <h2>Garanties</h2>
      <p>
        Tous les produits bénéficient de la garantie légale de conformité (deux ans à compter de la livraison pour les particuliers) et de
        la garantie contre les vices cachés. Voir l'article 9 des <Link href="/cgv">conditions générales de vente</Link>.
      </p>
    </LegalPage>
  );
}
