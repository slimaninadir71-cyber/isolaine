import { NextResponse } from "next/server";
import { cawlEnabled, createPayment, type Device } from "@/lib/cawl";
import { adminConfigured, getOrder, setPayment } from "@/lib/supabase-admin";
import { reconcilePayment } from "@/lib/reconcile";
import { classify } from "@/lib/cawl";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const int = (v: unknown, d = 0) => Math.round(Number(v)) || d;

/** Crée le paiement à partir du jeton de carte. Renvoie l'adresse de la banque du client (3-D Secure) ou la page de remerciement. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("Requête invalide.");
  const reference = String(body.reference ?? "").replace(/[^A-Z0-9-]/gi, "").slice(0, 40);
  const token = String(body.token ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 100);
  const b = (body.browser && typeof body.browser === "object" ? body.browser : {}) as Record<string, unknown>;
  if (!reference || !token) return fail("Données de paiement manquantes.");
  if (!cawlEnabled() || !adminConfigured()) return fail("Paiement par carte indisponible.");

  const order = await getOrder(reference).catch(() => null);
  if (!order) return fail("Commande introuvable.", 404);
  if (order.payment_method !== "carte") return fail("Cette commande n'est pas à régler par carte.", 409);
  if (order.payment_status === "payé") return NextResponse.json({ paid: true, redirect: `${SITE.url}/commande/merci?ref=${encodeURIComponent(reference)}` });
  if (order.payment_status !== "en attente") return fail("Cette commande ne peut plus être réglée. Passez une nouvelle commande.", 409);

  const device: Device = {
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "",
    acceptHeader: req.headers.get("accept")?.slice(0, 2048) || "*/*",
    userAgent: req.headers.get("user-agent") ?? "",
    locale: String(b.language || "fr-FR").replace("-", "_").slice(0, 10),
    timezoneOffsetUtcMinutes: String(int(b.timezoneOffsetUtcMinutes)),
    browserData: { colorDepth: int(b.colorDepth, 24), screenHeight: String(int(b.screenHeight)), screenWidth: String(int(b.screenWidth)), javaEnabled: false },
  };

  const merci = `${SITE.url}/commande/merci?ref=${encodeURIComponent(reference)}`;
  let resp: Record<string, unknown>;
  try {
    // Le montant est celui de la commande enregistrée (recalculé par le serveur), jamais un montant envoyé par le navigateur.
    resp = await createPayment(
      { reference, total: Number(order.total), email: order.email, country: order.country === "Belgique" ? "Belgique" : "France", city: order.city ?? "", zip: order.postal_code ?? "", street: order.address ?? "" },
      token, device, `${SITE.url}/api/cawl/return?ref=${encodeURIComponent(reference)}`,
    );
  } catch (e) {
    console.error("cawl pay", (e as Error).message);
    // Le résultat est incertain (erreur réseau possible après création du paiement) : on le signale à l'équipe sans conclure à un refus.
    await setPayment(reference, { payment_status: "erreur de paiement à vérifier" }).catch(() => {});
    return fail("Le paiement n'a pas pu être finalisé. Si un montant apparaît sur votre compte, ne payez pas une seconde fois : contactez-nous avec votre numéro de commande.", 502);
  }
  const payment = (resp.payment as { id?: string; status?: string } | undefined) ?? {};
  const paymentId = String(payment.id ?? "");
  // À partir d'ici le paiement existe chez CAWL : une erreur de notre côté ne doit jamais faire croire qu'il n'a pas eu lieu.
  if (paymentId) await setPayment(reference, { payment_id: paymentId }).catch((e) => console.error("cawl pay id", (e as Error).message));

  const action = resp.merchantAction as { actionType?: string; redirectData?: { redirectURL?: string } } | undefined;
  if (action?.actionType === "REDIRECT" && action.redirectData?.redirectURL?.startsWith("https://")) return NextResponse.json({ redirect: action.redirectData.redirectURL });

  const status = String(payment.status ?? "");
  try {
    await reconcilePayment(reference, { id: paymentId, status, amount: Math.round(Number(order.total) * 100) }, { final: true });
  } catch (e) {
    console.error("cawl pay reconcile", (e as Error).message);
    return NextResponse.json({ redirect: merci }); // la page « Merci » indique « paiement en cours de vérification »
  }
  if (classify(status) === "paid") return NextResponse.json({ paid: true, redirect: merci });
  return fail(`Paiement refusé par la banque${status ? ` (${status})` : ""}. Aucun montant n'a été débité.`);
}
