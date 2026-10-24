"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loadIndex, matchCategories, search, type SearchIndex } from "@/lib/search";
import type { Card } from "@/lib/types";
import Listing from "@/components/Listing";
import { SearchBox } from "@/components/SearchBox";

export function SearchResults() {
  const q = (useSearchParams().get("q") ?? "").trim();
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [res, setRes] = useState<Card[]>([]);
  const [cats, setCats] = useState<{ href: string; label: string; parent?: string }[]>([]);
  const [index, setIndex] = useState<SearchIndex | null>(null);

  useEffect(() => {
    let alive = true;
    setState("loading");
    loadIndex()
      .then(({ index, docs }) => {
        if (!alive) return;
        setIndex(index);
        setRes(q ? search(docs, q) : []);
        setCats(q ? matchCategories(index, q, 6) : []);
        setState("ready");
      })
      .catch(() => alive && setState("error"));
    return () => { alive = false; };
  }, [q]);

  return (
    <>
      <nav className="crumbs" aria-label="Fil d'Ariane"><ol><li><Link href="/">Accueil</Link></li><li><span aria-current="page">Recherche</span></li></ol></nav>
      <header className="cat-head">
        <h1>{q ? <>Résultats pour « {q} »</> : "Rechercher un produit"}</h1>
        <div className="cat-search"><SearchBox key={q} /></div>
        {cats.length > 0 && (
          <div className="sub-pills" aria-label="Catégories correspondantes">
            {cats.map((c) => <Link key={c.href} href={c.href} className="pill">{c.label}{c.parent && <small> · {c.parent}</small>}</Link>)}
          </div>
        )}
      </header>
      {state === "loading" && <p className="muted" role="status">Recherche en cours…</p>}
      {state === "error" && <p className="form-err" role="alert">La recherche n'a pas pu être chargée. Vérifiez votre connexion puis rechargez la page.</p>}
      {state === "ready" && q && res.length > 0 && <Listing key={q} products={res} showFamily relevance />}
      {state === "ready" && q && res.length === 0 && (
        <div className="empty">
          <p>Aucun produit ne correspond à « {q} ».</p>
          <p className="muted">Vérifiez l'orthographe, essayez un terme plus général (ex. « laine », « cheville », « enduit ») ou une référence.</p>
          {index && (
            <div className="sub-pills">
              {index.families.map(([slug, name]) => <Link key={slug} href={`/categorie/${slug}`} className="pill">{name}</Link>)}
            </div>
          )}
        </div>
      )}
      {state === "ready" && !q && index && (
        <div className="sub-pills">
          {index.families.map(([slug, name]) => <Link key={slug} href={`/categorie/${slug}`} className="pill">{name}</Link>)}
        </div>
      )}
    </>
  );
}
