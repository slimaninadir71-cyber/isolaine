import { NextResponse } from "next/server";
import { classify, verifyWebhook } from "@/lib/cawl";
import { adminConfigured, markPaid, getOrder, setPayment } from "@/lib/supabase-admin";
import { billingLine, itemsText, notifyCustomer, notifyTeam, promoLine } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Event = { type?: string; payment?: { id?: string; status?: string; paymentOutput?: { amountOfMoney?: { amount?: number }; references?: { merchantReference?: string } } } };

/** Notification de CAWL : confirme (ou refuse) un paiement. Signature vérifiée avant tout traitement. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-gcs-signature"), req.headers.get("x-gcs-keyid"))) return new NextResponse("Signature invalide", { status: 401 });
  if (!adminConfigured()) return new NextResponse("Configuration incomplète", { status: 503 });
  let events: Event[];
  try { const j = JSON.parse(raw); events = Array.isArray(j) ? j : [j]; } catch { return new NextResponse("Corps invalide", { status: 400 }); }

  for (const ev of events) {
    const pay = ev.payment, ref = pay?.paymentOutput?.references?.merchantReference;
    if (!pay || !ref || !ev.type?.startsWith("payment.") || ev.type === "payment.test") continue;
    try {
      const order = await getOrder(ref);
      if (!order) continue;
      const kind = classify(pay.status ?? "");
      if (kind === "paid" && order.payment_status !== "payé") {
        const cents = pay.paymentOutput?.amountOfMoney?.amount;
        if (cents !== Math.round(Number(order.total) * 100)) {
          await setPayment(ref, { payment_status: "montant à vérifier", payment_id: pay.id ?? null });
          await notifyTeam(`ATTENTION : montant à vérifier – commande ${ref}`, [["Référence", ref], ["Montant reçu (centimes)", String(cents)], ["Total de la commande", `${Number(order.total).toFixed(2)} €`]]);
        } else {
          await setPayment(ref, { payment_status: "payé", payment_id: pay.id ?? null, paid_at: new Date().toISOString() });
          await notifyTeam(`Paiement reçu – commande ${ref} – ${Number(order.total).toFixed(2)} €`, [
            ["Référence", ref], ["Client", order.customer_name], ["E-mail", order.email], ["Téléphone", order.phone],
            ["Réception", order.delivery_mode === "livraison" ? `Livraison : ${order.address}, ${order.postal_code} ${order.city}, ${order.country}` : "Retrait en magasin"],
            ...billingLine(order), ["Articles", itemsText(order.items)], ...promoLine(order), ["Total payé", `${Number(order.total).toFixed(2)} € (livraison offerte)`],
          ], order.email);
          await markPaid(order);
          await notifyCustomer(order);
        }
      } else if (kind === "failed" && order.payment_status !== "payé") {
        await setPayment(ref, { payment_status: "refusé ou annulé", payment_id: pay.id ?? null });
      }
    } catch (e) {
      console.error("webhook", (e as Error).message);
      return new NextResponse("Erreur de traitement", { status: 500 }); // CAWL renverra la notification
    }
  }
  return NextResponse.json({ ok: true });
}
