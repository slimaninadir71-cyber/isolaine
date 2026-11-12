import Link from "next/link";
import type { Metadata } from "next";
import { adminConfigured, getOrder } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Commande enregistrée", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function ThanksPage({ searchParams }: Props) {
  const sp = await searchParams;
  const reference = (sp.ref ?? "").replace(/[^A-Z0-9-]/gi, "").slice(0, 40);

  // Paiement par carte : l'état vient de la commande, mise à jour par le serveur après lecture du statut chez CAWL (jamais d'après le navigateur).
  let outcome: "paid" | "failed" | "pending" | null = null;
  if (reference && adminConfigured()) {
    try {
      const order = await getOrder(reference);
      if (order?.payment_method === "carte") outcome = order.payment_status === "payé" ? "paid" : order.payment_status === "refusé ou annulé" ? "failed" : "pending";
    } catch { outcome = null; }
  }

  return (
    <div className="wrap page narrow">
      <div className="thanks">
        <p className="thanks-ic" aria-hidden="true">{outcome === "failed" ? "!" : "✓"}</p>
        <h1>{outcome === "paid" ? "Merci, votre paiement est reçu" : outcome === "failed" ? "Le paiement n'a pas abouti" : outcome === "pending" ? "Paiement en cours de vérification" : "Merci, votre commande est enregistrée"}</h1>
        {reference && <p className="thanks-ref">Numéro de commande : <b>{reference}</b></p>}
        {outcome === "failed" && <p>Aucun montant n'a été débité pour cette commande. Contactez-nous en indiquant votre numéro de commande : nous vous proposons un autre moyen de règlement.</p>}
        {outcome === "pending" && <p>Votre banque n'a pas encore confirmé le paiement. Nous vous écrivons dès réception. Inutile de repayer.</p>}
        <ol className="steps steps-compact">
          <li><span>1</span><div><b>Confirmation</b><p>Vous recevez un e-mail de confirmation avec le récapitulatif de votre commande.</p></div></li>
          <li><span>2</span><div><b>Préparation</b><p>Nous préparons votre commande{outcome === "paid" ? "" : " dès réception du règlement"}.</p></div></li>
          <li><span>3</span><div><b>Livraison offerte</b><p>Commande expédiée sous 24 h, livraison en environ 7 jours.</p></div></li>
        </ol>
        <p className="muted">Conservez votre numéro de commande pour tout échange avec nous.</p>
        <div className="cta-row"><Link href="/" className="btn btn-primary">Retour à l'accueil</Link><Link href="/contact" className="btn btn-ghost">Nous contacter</Link></div>
      </div>
    </div>
  );
}
