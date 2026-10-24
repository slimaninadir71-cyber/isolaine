import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "./SearchResults";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Rechercher un produit Isolaine par nom, marque, référence ou famille.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/recherche" },
};

export default function SearchPage() {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="muted">Chargement de la recherche…</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
