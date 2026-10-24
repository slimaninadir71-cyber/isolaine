import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage, UPDATED } from "@/components/Legal";
import { COMPANY, SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Conditions générales de vente", alternates: { canonical: "/cgv" } };

export default function Page() {
  return (
    <LegalPage title="Conditions générales de vente" updated={UPDATED}>
      <h2>Article 1 – Objet et champ d'application</h2>
      <p>
        Les présentes conditions générales de vente (CGV) régissent les ventes de produits conclues sur le site {SITE.domain} entre
        la société {COMPANY.legalName} (le « Vendeur ») et toute personne, professionnelle ou non (le « Client »). Les dispositions
        réservées aux consommateurs (droit de rétractation, garanties légales, médiation) s'appliquent aux seuls clients consommateurs
        et non-professionnels. Le fait de passer commande vaut acceptation des CGV en vigueur à la date de la commande.
      </p>
      <h2>Article 2 – Identification du Vendeur</h2>
      <p>{COMPANY.legalName}, {COMPANY.form}, {COMPANY.address}, {COMPANY.rcs}, TVA {COMPANY.vat}. Contact : <Link href="/contact">formulaire de contact</Link>.</p>
      <h2>Article 3 – Produits</h2>
      <p>
        Les produits sont décrits avec la plus grande exactitude possible (désignation, caractéristiques, conditionnement, références).
        Les photographies sont fournies à titre d'illustration. Les caractéristiques techniques détaillées sont celles communiquées par les
        fabricants. Certains produits, signalés sur leur fiche, sont disponibles sur approvisionnement et uniquement en retrait en magasin.
      </p>
      <h2>Article 4 – Prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises. Le prix applicable est celui affiché sur le site au moment de l'envoi
        de la commande. La livraison est offerte en France métropolitaine et en Belgique, sauf pour les produits proposés uniquement en
        retrait en magasin. Les produits « sur devis » font l'objet d'une proposition de prix personnalisée.
      </p>
      <h2>Article 5 – Commande</h2>
      <p>
        Le Client sélectionne ses produits, vérifie le récapitulatif de son panier, renseigne ses coordonnées, accepte les CGV puis envoie
        sa commande. Un numéro de commande lui est attribué. Le Vendeur vérifie la disponibilité des produits puis adresse au Client une
        confirmation précisant les modalités de livraison ou de retrait et de règlement. La vente est conclue à l'acceptation de cette
        confirmation par le Client. Le Vendeur se réserve le droit de refuser une commande présentant un caractère anormal ou émanant d'un
        Client avec lequel existe un litige. En cas d'indisponibilité d'un produit, le Client en est informé et aucune somme ne lui est due
        pour ce produit.
      </p>
      <h2>Article 6 – Règlement</h2>
      <p>
        Aucun paiement n'est demandé lors de l'envoi de la commande en ligne. Les modalités et le délai de règlement sont indiqués dans la
        confirmation adressée par le Vendeur. Les produits restent la propriété du Vendeur jusqu'au paiement intégral du prix.
      </p>
      <h2>Article 7 – Livraison et retrait</h2>
      <p>
        Les produits sont livrés à l'adresse indiquée par le Client, en France métropolitaine ou en Belgique. Le délai de livraison est
        précisé dans la confirmation de commande ; à défaut, la livraison intervient au plus tard trente jours après la conclusion du
        contrat (article L216-1 du Code de la consommation). Le Client vérifie l'état des colis à la réception et porte sur le bon du
        transporteur des réserves précises en cas d'avarie ou de manquant. Pour un Client professionnel, ces réserves sont confirmées au
        transporteur dans les trois jours suivant la réception (article L133-3 du Code de commerce). Les produits en retrait en magasin
        sont mis à disposition selon les modalités indiquées dans la confirmation. Le transfert des risques au Client consommateur
        intervient lorsqu'il prend physiquement possession des produits.
      </p>
      <h2>Article 8 – Droit de rétractation (consommateurs)</h2>
      <p>
        Le Client consommateur dispose d'un délai de quatorze jours à compter de la réception des produits pour exercer son droit de
        rétractation, sans avoir à motiver sa décision (article L221-18 du Code de la consommation). Il notifie sa décision par une
        déclaration dénuée d'ambiguïté, par exemple au moyen du formulaire ci-dessous adressé via la page <Link href="/contact">Contact</Link>.
        Il renvoie les produits, complets et dans leur état d'origine, au plus tard quatorze jours après avoir communiqué sa décision ;
        les frais de retour restent à sa charge. Le Vendeur rembourse la totalité des sommes versées au plus tard quatorze jours après
        avoir été informé de la décision, ce remboursement pouvant être différé jusqu'à la récupération des produits ou la preuve de leur
        expédition. Le droit de rétractation ne s'applique pas aux biens confectionnés selon les spécifications du Client ou nettement
        personnalisés (article L221-28). Les Clients professionnels ne bénéficient pas du droit de rétractation.
      </p>
      <h2>Article 9 – Garanties légales</h2>
      <p>
        Le Client consommateur dispose d'un délai de deux ans à compter de la délivrance du bien pour obtenir la mise en œuvre de la
        garantie légale de conformité en cas d'apparition d'un défaut de conformité (articles L217-3 et suivants du Code de la
        consommation). Il a droit à la réparation ou au remplacement du bien, ou à défaut à une réduction du prix ou à la résolution du
        contrat, dans les conditions prévues par ces articles. Durant ce délai, il n'est tenu d'établir que l'existence du défaut, et non
        sa date d'apparition. Le Client peut également mettre en œuvre la garantie contre les vices cachés de la chose vendue (articles 1641
        à 1649 du Code civil) dans un délai de deux ans à compter de la découverte du vice ; il peut alors choisir entre la résolution de
        la vente et une réduction du prix.
      </p>
      <h2>Article 10 – Responsabilité</h2>
      <p>
        Les produits doivent être mis en œuvre conformément aux notices des fabricants, aux documents techniques applicables et aux règles
        de l'art. La responsabilité du Vendeur ne saurait être engagée en cas de mauvaise utilisation, de mise en œuvre non conforme ou de
        stockage inadapté des produits.
      </p>
      <h2>Article 11 – Données personnelles</h2>
      <p>Les données transmises lors d'une commande sont traitées conformément à la page <Link href="/confidentialite">Données personnelles</Link>.</p>
      <h2>Article 12 – Médiation et litiges</h2>
      <p>
        En cas de difficulté, le Client est invité à contacter d'abord le Vendeur via la page <Link href="/contact">Contact</Link>.
        Conformément aux articles L611-1 et suivants du Code de la consommation, le Client consommateur peut recourir gratuitement à un
        médiateur de la consommation en vue de la résolution amiable d'un litige ; les coordonnées du médiateur compétent lui sont
        communiquées sur simple demande. Les présentes CGV sont soumises au droit français. À défaut d'accord amiable, les litiges avec un
        Client professionnel relèvent des tribunaux du ressort du siège social du Vendeur ; le Client consommateur peut saisir la
        juridiction prévue par la loi.
      </p>
      <h2>Annexe – Formulaire de rétractation</h2>
      <div className="legal-box">
        <p>À l'attention de {COMPANY.legalName}, {COMPANY.address} :</p>
        <p>
          Je vous notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous : …<br />
          Commandé le : … / reçu le : …<br />
          Numéro de commande : …<br />
          Nom du consommateur : …<br />
          Adresse du consommateur : …<br />
          Date : …
        </p>
      </div>
    </LegalPage>
  );
}
