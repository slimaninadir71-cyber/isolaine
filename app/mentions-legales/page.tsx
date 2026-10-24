import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage, UPDATED } from "@/components/Legal";
import { COMPANY, DATA_HOST, HOST, SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };

export default function Page() {
  return (
    <LegalPage title="Mentions légales" updated={UPDATED}>
      <h2>Éditeur du site</h2>
      <p>
        Le site {SITE.domain}, exploité sous l'enseigne {SITE.name}, est édité par :<br />
        <b>{COMPANY.legalName}</b>, {COMPANY.form}<br />
        Siège social : {COMPANY.address}<br />
        Immatriculation : {COMPANY.rcs} – SIRET du siège : {COMPANY.siret}<br />
        N° de TVA intracommunautaire : {COMPANY.vat}<br />
        Contact : <Link href="/contact">formulaire de contact</Link>
      </p>
      <h2>Directeur de la publication</h2>
      <p>{COMPANY.director}.</p>
      <h2>Hébergement</h2>
      <p>
        Site hébergé par {HOST.name}, {HOST.address} – {HOST.site}.<br />
        Données du catalogue, des commandes et des demandes : {DATA_HOST.name} – {DATA_HOST.detail} – {DATA_HOST.site}.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        La structure du site, ses textes, sa charte graphique et la marque {SITE.name} sont protégés. Toute reproduction ou représentation,
        totale ou partielle, sans autorisation écrite de l'éditeur est interdite. Les noms de marques et de produits cités appartiennent à leurs
        titulaires respectifs ; les photographies de produits sont fournies à titre d'illustration.
      </p>
      <h2>Responsabilité</h2>
      <p>
        L'éditeur veille à l'exactitude des informations publiées, notamment des caractéristiques et des prix des produits. Il ne saurait être
        tenu responsable d'une erreur matérielle manifeste. La mise en œuvre des produits doit respecter les notices des fabricants et les règles de l'art.
      </p>
      <h2>Données personnelles et cookies</h2>
      <p>Voir la page <Link href="/confidentialite">Données personnelles</Link> et la page <Link href="/cookies">Cookies</Link>.</p>
    </LegalPage>
  );
}
