import type { Metadata } from "next";
import { Checkout } from "./Checkout";
import { cawlEnabled } from "@/lib/cawl";
import { adminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Validation de la commande", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic"; // la disponibilité du paiement par carte dépend de la configuration du serveur

export default function CheckoutPage() {
  return <Checkout cardEnabled={cawlEnabled() && adminConfigured()} />;
}
