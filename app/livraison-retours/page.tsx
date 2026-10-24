import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/Legal";
import { IconQuote, IconStore, IconTruck } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Livraison, commande et retours",
  description: "Livraison offerte en France métropolitaine et en Belgique, retrait en magasin, commande sans paiement en ligne, retours et garanties.",
  alternates: { canonical: "/livraison-retours" },
};

export default function Page() {
  return (
    <LegalPage title="Livraison, commande et retours">
      <div className="info-grid">
        <div className="info-box"><IconTruck size={22} /><div><b>Livraison offerte</b><p>En France métropolitaine et en Belgique, sur tous les produits livrables.</p></div></div>
        <div className="info-box"><IconStore size={22} /><div><b>Retrait en magasin</b><p>Pour les produits signalés « Retrait magasin » sur leur fiche.</p></div></div>
        <div className="info-box"><IconQuote size={22} /><div><b>Devis chantier</b><p>Palettes, grandes quantités : <Link href="/contact?type=devis">demandez un devis</Link>.</p></div></div>
      </div>

      <h2 id="commande">Comment commander</h2>
      <ol>
        <li>Ajoutez vos produits au panier en choisissant, le cas échéant, l'option souhaitée (épaisseur, longueur, conditionnement…).</li>
        <li>Envoyez votre commande en indiquant vos coordonnées et le mode de réception. Aucun paiement n'est demandé en ligne.</li>
        <li>Vous recevez un numéro de commande. Notre équipe vérifie la disponibilité, vous confirme la livraison ou le retrait et vous transmet les modalités de règlement.</li>
      </ol>

      <h2>Livraison</h2>
      <p>
        La livraison est offerte en France métropolitaine et en Belgique, quel que soit le montant de la commande, pour tous les produits
        livrables. Le délai vous est indiqué dans la confirmation de commande. Certains produits approvisionnés sur commande portent un
        délai d'approvisionnement, affiché sur leur fiche.
      </p>
      <p>
        À la réception, vérifiez l'état et le nombre de colis en présence du livreur. En cas d'avarie ou de manquant, notez des réserves
        précises sur le bon de livraison et signalez-le-nous via la page <Link href="/contact">Contact</Link>.
      </p>

      <h2>Retrait en magasin</h2>
      <p>
        Les produits signalés « Retrait en magasin uniquement » (notamment les éléments de décoration de façade) ne sont pas livrés.
        L'adresse et le créneau de retrait vous sont communiqués avec la confirmation de commande.
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
