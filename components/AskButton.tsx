"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChat } from "./Icons";

/** Bouton « Une question ? » toujours visible, vers le formulaire de contact (masqué là où il ferait doublon). */
export function AskButton() {
  const path = usePathname();
  if (/^\/(contact|commande|panier)/.test(path ?? "")) return null;
  const produit = path?.startsWith("/produit/") ? `?produit=${encodeURIComponent(path.slice(9))}` : "";
  return (
    <Link href={`/contact${produit}`} className="ask-fab"><IconChat size={20} /> Une question ?</Link>
  );
}
