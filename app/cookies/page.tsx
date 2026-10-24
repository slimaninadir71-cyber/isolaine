import type { Metadata } from "next";
import { LegalPage, UPDATED } from "@/components/Legal";

export const metadata: Metadata = { title: "Cookies", alternates: { canonical: "/cookies" } };

export default function Page() {
  return (
    <LegalPage title="Cookies" updated={UPDATED}>
      <p>
        Le site n'utilise aucun cookie publicitaire, de mesure d'audience ou de réseau social. C'est pourquoi aucun bandeau de
        consentement ne vous est présenté.
      </p>
      <h2>Stockage technique</h2>
      <p>
        Le contenu de votre panier est mémorisé dans le stockage local de votre navigateur, afin de le retrouver d'une page à l'autre.
        Ce stockage est strictement nécessaire au service que vous demandez ; il reste sur votre appareil et n'est pas transmis tant que
        vous n'envoyez pas de commande. Vous pouvez l'effacer à tout moment depuis les réglages de votre navigateur ou en vidant votre panier.
      </p>
    </LegalPage>
  );
}
