import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Commande enregistrée", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function ThanksPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const reference = (ref ?? "").replace(/[^A-Z0-9-]/gi, "").slice(0, 40);
  return (
    <div className="wrap page narrow">
      <div className="thanks">
        <p className="thanks-ic" aria-hidden="true">✓</p>
        <h1>Merci, votre commande est enregistrée</h1>
        {reference && <p className="thanks-ref">Numéro de commande : <b>{reference}</b></p>}
        <ol className="steps steps-compact">
          <li><span>1</span><div><b>Vérification</b><p>Notre équipe contrôle la disponibilité de chaque article.</p></div></li>
          <li><span>2</span><div><b>Confirmation</b><p>Nous vous contactons par e-mail ou téléphone pour confirmer la livraison ou le retrait.</p></div></li>
          <li><span>3</span><div><b>Règlement</b><p>Les modalités de règlement vous sont transmises avec la confirmation.</p></div></li>
        </ol>
        <p className="muted">Conservez votre numéro de commande pour tout échange avec nous.</p>
        <div className="cta-row"><Link href="/" className="btn btn-primary">Retour à l'accueil</Link><Link href="/contact" className="btn btn-ghost">Nous contacter</Link></div>
      </div>
    </div>
  );
}
