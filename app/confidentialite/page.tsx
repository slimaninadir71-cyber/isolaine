import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage, UPDATED } from "@/components/Legal";
import { COMPANY, DATA_HOST, HOST, SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Données personnelles", alternates: { canonical: "/confidentialite" } };

export default function Page() {
  return (
    <LegalPage title="Données personnelles" updated={UPDATED}>
      <h2>Responsable du traitement</h2>
      <p>{COMPANY.legalName}, {COMPANY.form}, {COMPANY.address}, éditeur du site {SITE.domain}.</p>
      <h2>Données collectées</h2>
      <p>
        Le site ne collecte que les données que vous saisissez : lors d'une commande (nom, société, e-mail, téléphone, adresse de
        livraison, contenu de la commande, message) et lors d'une demande de contact ou de devis (nom, société, e-mail, téléphone, produit
        concerné, message). Aucun compte client n'est créé et aucune donnée bancaire n'est collectée sur le site.
      </p>
      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Traitement et suivi des commandes, livraison, facturation : exécution du contrat.</li>
        <li>Réponse aux demandes de contact et de devis : mesures précontractuelles prises à votre demande.</li>
        <li>Conservation des pièces comptables : obligation légale.</li>
      </ul>
      <h2>Destinataires</h2>
      <p>
        Les données sont destinées au personnel habilité de {COMPANY.legalName} et, pour la livraison, au transporteur chargé de
        l'acheminement. Elles sont hébergées par nos prestataires techniques : {HOST.name} (hébergement du site) et {DATA_HOST.name}
        ({DATA_HOST.detail}). Lorsqu'un prestataire est établi hors de l'Union européenne, les transferts sont encadrés par les garanties
        prévues par le RGPD. Vos données ne sont ni vendues ni cédées.
      </p>
      <h2>Durées de conservation</h2>
      <ul>
        <li>Commandes et pièces comptables : dix ans (article L123-22 du Code de commerce).</li>
        <li>Demandes de contact et de devis sans suite : trois ans à compter du dernier échange.</li>
      </ul>
      <h2>Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données.
        Pour les exercer, écrivez-nous via la page <Link href="/contact">Contact</Link> en précisant votre demande. Vous pouvez également
        introduire une réclamation auprès de la CNIL (www.cnil.fr).
      </p>
      <h2>Cookies</h2>
      <p>Voir la page <Link href="/cookies">Cookies</Link>.</p>
    </LegalPage>
  );
}
