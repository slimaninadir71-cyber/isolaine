import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Mon panier", robots: { index: false, follow: true } };

export default function CartPage() {
  return <CartView />;
}
