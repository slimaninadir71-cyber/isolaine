// Rapprochement d'un paiement : met à jour la commande et prévient l'équipe. Sans danger si appelé plusieurs fois (webhook et retour client).
import { adminConfigured, markPaid, getOrder, setPayment, recordCustomerMail, type OrderRow } from "@/lib/supabase-admin";
import { classify } from "@/lib/cawl";
import { billingLine, itemsText, notifyCustomer, notifyTeam, promoLine } from "@/lib/mail";

type RefusedOrder = Pick<OrderRow, "reference" | "customer_name" | "email" | "phone" | "items" | "total">;

/** Prévient l'équipe d'un paiement refusé ou annulé (une seule fois : appelé au passage à « refusé ou annulé »). */
export async function notifyRefused(order: RefusedOrder, status: string): Promise<void> {
  try {
    await notifyTeam(`Paiement refusé – commande ${order.reference} – ${Number(order.total).toFixed(2)} €`, [
      ["Référence", order.reference], ["Client", order.customer_name], ["E-mail", order.email], ["Téléphone", order.phone],
      ["Articles", itemsText(order.items)], ["Total", `${Number(order.total).toFixed(2)} €`],
      ["Statut de la banque", status || "inconnu"], ["À faire", "Contacter le client : la commande n'est pas payée."],
    ], order.email);
  } catch (e) { console.error("notify refused", (e as Error).message); }
}

export type PaymentFacts = { id: string; status: string; amount?: number };

/** final = true : tout statut qui n'est pas « payé » est un échec (fin de la tentative de paiement). */
export async function reconcilePayment(reference: string, pay: PaymentFacts, opts: { final?: boolean } = {}): Promise<void> {
  if (!adminConfigured() || !reference) return;
  const order = await getOrder(reference);
  if (!order) return;
  const kind = classify(pay.status);
  if (kind === "paid" && order.payment_status !== "payé") {
    if (pay.amount !== Math.round(Number(order.total) * 100)) {
      if (order.payment_status === "montant à vérifier") return;
      await setPayment(reference, { payment_status: "montant à vérifier", payment_id: pay.id || null });
      await notifyTeam(`ATTENTION : montant à vérifier – commande ${reference}`, [["Référence", reference], ["Montant reçu (centimes)", String(pay.amount)], ["Total de la commande", `${Number(order.total).toFixed(2)} €`]]);
      return;
    }
    await setPayment(reference, { payment_status: "payé", payment_id: pay.id || null, paid_at: new Date().toISOString() });
    await notifyTeam(`Paiement reçu – commande ${reference} – ${Number(order.total).toFixed(2)} €`, [
      ["Référence", reference], ["Client", order.customer_name], ["E-mail", order.email], ["Téléphone", order.phone],
      ["Réception", order.delivery_mode === "livraison" ? `Livraison : ${order.address}, ${order.postal_code} ${order.city}, ${order.country}` : "Retrait en magasin"],
      ...billingLine(order), ["Articles", itemsText(order.items)], ...promoLine(order), ["Total payé", `${Number(order.total).toFixed(2)} € (livraison offerte)`],
    ], order.email);
    await markPaid(order);
    await recordCustomerMail(reference, await notifyCustomer(order));
  } else if ((kind === "failed" || (opts.final && kind !== "paid")) && order.payment_status !== "payé" && order.payment_status !== "refusé ou annulé") {
    await setPayment(reference, { payment_status: "refusé ou annulé", payment_id: pay.id || null });
    await notifyRefused(order, pay.status);
  }
}
