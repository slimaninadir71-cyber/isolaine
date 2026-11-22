// Paiements par carte restés « en attente » (client parti pendant la validation 3-D Secure de sa banque) :
// le statut est relu chez CAWL ; payé ou refusé → traitement habituel (e-mails compris) ; toujours bloqué après 1 h → « non finalisé » + e-mail à l'équipe.
import { cawlEnabled, classify, getPaymentDetails } from "@/lib/cawl";
import { adminConfigured, sb, setPayment, type OrderRow } from "@/lib/supabase-admin";
import { reconcilePayment } from "@/lib/reconcile";
import { itemsText, notifyTeam } from "@/lib/mail";

const MIN_AGE = 15 * 60_000, GIVE_UP = 60 * 60_000, MAX_AGE = 7 * 86_400_000;

export async function checkPendingPayments(limit = 10): Promise<number> {
  if (!cawlEnabled() || !adminConfigured()) return 0;
  const now = Date.now();
  const res = await sb(`orders?payment_method=eq.carte&payment_status=eq.${encodeURIComponent("en attente")}&payment_id=not.is.null`
    + `&created_at=lt.${encodeURIComponent(new Date(now - MIN_AGE).toISOString())}&created_at=gt.${encodeURIComponent(new Date(now - MAX_AGE).toISOString())}`
    + `&select=reference,created_at,total,payment_id,customer_name,email,phone,items&order=created_at.asc&limit=${limit}`, { method: "GET" });
  const list = (await res.json()) as (Pick<OrderRow, "reference" | "total" | "payment_id" | "customer_name" | "email" | "phone" | "items"> & { created_at: string })[];
  let done = 0;
  for (const o of list) {
    try {
      const d = await getPaymentDetails(String(o.payment_id));
      if (d.reference && d.reference !== o.reference) continue;
      const kind = classify(d.status);
      if (kind !== "pending") {
        await reconcilePayment(o.reference, { id: String(o.payment_id), status: d.status, amount: typeof d.amount === "number" ? d.amount : Math.round(Number(o.total) * 100) });
        done++;
      } else if (now - new Date(o.created_at).getTime() > GIVE_UP) {
        await setPayment(o.reference, { payment_status: "non finalisé" });
        await notifyTeam(`Paiement non finalisé – commande ${o.reference} – ${Number(o.total).toFixed(2)} €`, [
          ["Référence", o.reference], ["Client", o.customer_name], ["E-mail", o.email], ["Téléphone", o.phone],
          ["Articles", itemsText(o.items)], ["Total", `${Number(o.total).toFixed(2)} €`],
          ["Statut chez CAWL", d.status || "inconnu"],
          ["Ce qui s'est passé", "Le client n'a pas terminé la validation de sa banque (3-D Secure) : rien n'a été débité."],
          ["À faire", "Contacter le client pour qu'il repasse commande ou règle autrement."],
        ], o.email);
        done++;
      }
    } catch (e) { console.error("pending", o.reference, (e as Error).message); }
  }
  return done;
}
