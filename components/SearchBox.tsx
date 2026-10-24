"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadIndex, matchCategories, search } from "@/lib/search";
import { priceText } from "@/lib/format";
import type { Card } from "@/lib/types";
import { IconSearch } from "./Icons";

type Sugg = { cats: { href: string; label: string; parent?: string }[]; items: Card[]; total: number };

/** Champ de recherche avec suggestions pendant la saisie (produits et catégories). */
export function SearchBox({ autoFocus = false, onNavigate, size = "md" }: { autoFocus?: boolean; onNavigate?: () => void; size?: "md" | "lg" }) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [sugg, setSugg] = useState<Sugg>({ cats: [], items: [], total: 0 });
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setSugg({ cats: [], items: [], total: 0 }); return; }
    let alive = true;
    setState((s) => (s === "idle" ? "loading" : s));
    const t = setTimeout(() => {
      loadIndex().then(({ index, docs }) => {
        if (!alive) return;
        const res = search(docs, term, 200);
        setSugg({ cats: matchCategories(index, term, 3), items: res.slice(0, 6), total: res.length });
        setState("idle");
        setActive(-1);
      }).catch(() => alive && setState("error"));
    }, 120);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const links = [...sugg.cats.map((c) => c.href), ...sugg.items.map((p) => `/produit/${p.slug}`)];
  const go = (href: string) => { setOpen(false); onNavigate?.(); router.push(href); };
  const submit = () => {
    const term = q.trim();
    if (active >= 0 && links[active]) return go(links[active]);
    if (term) go(`/recherche?q=${encodeURIComponent(term)}`);
  };
  const show = open && q.trim().length >= 2;

  return (
    <div className={`search search-${size}`} ref={box}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label htmlFor={`${id}-q`} className="sr-only">Rechercher un produit</label>
        <input
          id={`${id}-q`}
          type="search"
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Rechercher : laine de verre 200 mm, GR 32, pare-vapeur…"
          role="combobox"
          aria-expanded={show}
          aria-controls={`${id}-list`}
          aria-activedescendant={active >= 0 ? `${id}-o${active}` : undefined}
          onFocus={() => { setOpen(true); loadIndex().catch(() => setState("error")); }}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(links.length - 1, a + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
            else if (e.key === "Escape") { setOpen(false); }
          }}
        />
        <button type="submit" className="search-btn" aria-label="Lancer la recherche"><IconSearch size={20} /></button>
      </form>
      {show && (
        <div className="search-pop" id={`${id}-list`} role="listbox" aria-label="Suggestions">
          {state === "error" && <p className="search-msg">La recherche est momentanément indisponible. Appuyez sur Entrée pour réessayer.</p>}
          {state !== "error" && !sugg.cats.length && !sugg.items.length && (
            <p className="search-msg">{state === "loading" ? "Recherche…" : <>Aucun produit pour « {q.trim()} ». Essayez un autre mot ou une référence.</>}</p>
          )}
          {sugg.cats.length > 0 && (
            <div className="search-group">
              <p className="search-h">Catégories</p>
              {sugg.cats.map((c, i) => (
                <Link key={c.href} id={`${id}-o${i}`} role="option" aria-selected={active === i} href={c.href}
                  className={`search-cat${active === i ? " on" : ""}`} onClick={() => { setOpen(false); onNavigate?.(); }}>
                  {c.label}{c.parent && <small> · {c.parent}</small>}
                </Link>
              ))}
            </div>
          )}
          {sugg.items.length > 0 && (
            <div className="search-group">
              <p className="search-h">Produits</p>
              {sugg.items.map((p, j) => {
                const i = sugg.cats.length + j;
                return (
                  <Link key={p.slug} id={`${id}-o${i}`} role="option" aria-selected={active === i} href={`/produit/${p.slug}`}
                    className={`search-item${active === i ? " on" : ""}`} onClick={() => { setOpen(false); onNavigate?.(); }}>
                    <span className="search-thumb">{p.image ? <img src={p.image} alt="" loading="lazy" decoding="async" /> : null}</span>
                    <span className="search-txt"><span className="search-name">{p.name}</span><small>{[p.brand, p.subName].filter(Boolean).join(" · ")}</small></span>
                    <span className="search-price">{priceText(p)}</span>
                  </Link>
                );
              })}
              {sugg.total > sugg.items.length && (
                <button type="button" className="search-all" onClick={() => go(`/recherche?q=${encodeURIComponent(q.trim())}`)}>
                  Voir les {sugg.total} résultats
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
