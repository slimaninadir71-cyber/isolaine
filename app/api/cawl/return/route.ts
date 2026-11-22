import { NextResponse } from "next/server";
import { cawlEnabled, classify, getPaymentDetails } from "@/lib/cawl";
import { adminConfigured, getOrder } from "@/lib/supabase-admin";
import { reconcilePayment } from "@/lib/reconcile";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Retour du client depuis la page 3-D Secure de sa banque : le statut est relu chez CAWL (les paramètres de l'adresse ne prouvent rien). */
async function back(req: Request) {
  const reference = (new URL(req.url).searchParams.get("ref") ?? "").replace(/[^A-Z0-9-]/gi, "").slice(0, 40);
  const done = `${SITE.url}/commande/merci?ref=${encodeURIComponent(reference)}`;
  if (!reference || !cawlEnabled() || !adminConfigured()) return NextResponse.redirect(done, 303);
  try {
    const order = await getOrder(reference);
    if (order && order.payment_status === "en attente" && order.payment_id) {
      let d = await getPaymentDetails(order.payment_id);
      // La banque vient de rendre la main : si CAWL est encore « en cours », on relit une fois après 3 s.
      if (classify(d.status) === "pending") { await new Promise((r) => setTimeout(r, 3000)); d = await getPaymentDetails(order.payment_id); }
      // Le paiement doit porter la référence de cette commande ; le montant est celui relu chez CAWL.
      if (!d.reference || d.reference === reference) await reconcilePayment(reference, { id: order.payment_id, status: d.status, amount: typeof d.amount === "number" ? d.amount : Math.round(Number(order.total) * 100) }); // statut encore « en cours » (banque pas finie) : la commande reste en attente, relue plus tard (lib/pending.ts)
    }
  } catch (e) { console.error("cawl return", (e as Error).message); }
  return NextResponse.redirect(done, 303);
}

export const GET = back;
export const POST = back;
