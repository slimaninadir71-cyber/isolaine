import type { Metadata } from "next";
import { Checkout } from "./Checkout";

export const metadata: Metadata = { title: "Validation de la commande", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return <Checkout />;
}
