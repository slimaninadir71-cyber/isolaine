"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { NavFamily } from "@/lib/types";
import { SITE } from "@/lib/site";
import { LV_USES } from "@/lib/lv-labels";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { IconCart, IconChevron, IconChevronDown, IconClose, IconMenu, IconQuote, IconSearch, IconTruck } from "./Icons";

export default function Header({ families }: { families: NavFamily[] }) {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [openFam, setOpenFam] = useState<string | null>(null);
  const hover = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMega(false); setDrawer(false); }, [pathname]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setMega(false); setDrawer(false); } };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  const enter = () => { if (hover.current) clearTimeout(hover.current); hover.current = setTimeout(() => setMega(true), 120); };
  const leave = () => { if (hover.current) clearTimeout(hover.current); hover.current = setTimeout(() => setMega(false), 180); };
  const n = ready ? count : 0;
  // Bouton loupe (téléphone) : remonte à la recherche et place le curseur dedans
  const findSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => document.querySelector<HTMLInputElement>(".hdr-msearch input")?.focus(), 250);
  };

  return (
    <>
      <a href="#contenu" className="skip">Aller au contenu</a>
      <div className="topbar">
        <div className="wrap topbar-in">
          <span><IconTruck size={16} /> <span className="tb-long">{SITE.delivery}</span><span className="tb-short">Livraison offerte : France métropolitaine et Belgique</span></span>
          <Link href="/contact?type=devis" className="topbar-link">Chantier, palette, grande quantité : demandez un devis</Link>
        </div>
      </div>
      <header className="hdr">
        <div className="wrap hdr-main">
          <button type="button" className="hdr-burger" aria-label="Ouvrir le menu" aria-expanded={drawer} aria-controls="menu-mobile" onClick={() => setDrawer(true)}>
            <IconMenu size={24} />
          </button>
          <Link href="/" className="hdr-logo" aria-label="Isolaine, retour à l'accueil"><Logo /></Link>
          <div className="hdr-search"><SearchBox /></div>
          <nav className="hdr-actions" aria-label="Accès rapides">
            <button type="button" className="hdr-act hdr-sbtn" aria-label="Rechercher un produit" onClick={findSearch}><IconSearch size={22} /></button>
            <Link href="/contact?type=devis" className="hdr-act"><IconQuote size={20} /><span>Devis</span></Link>
            <Link href="/panier" className="hdr-act hdr-cart" aria-label={`Panier : ${n} article${n > 1 ? "s" : ""}`}>
              <IconCart size={22} /><span>Panier</span>{n > 0 && <b className="badge" aria-hidden="true">{n > 99 ? "99+" : n}</b>}
            </Link>
          </nav>
        </div>
        <nav className="hdr-nav" aria-label="Familles de produits" onMouseLeave={leave}>
          <div className="wrap hdr-nav-in">
            <button type="button" className={`mega-btn${mega ? " on" : ""}`} aria-expanded={mega} aria-controls="mega"
              onClick={() => setMega((m) => !m)} onMouseEnter={enter}>
              <IconMenu size={18} /> Tous nos produits <IconChevronDown size={16} />
            </button>
            <Link href="/laine-de-verre" className={`hdr-nav-link hdr-nav-lv${pathname === "/laine-de-verre" ? " on" : ""}`}>Laine de verre</Link>
            {LV_USES.map((u) => (
              <Link key={u.key} href={`/laine-de-verre/${u.slug}`} className={`hdr-nav-link${pathname === `/laine-de-verre/${u.slug}` ? " on" : ""}`}>{u.nav}</Link>
            ))}
            <Link href="/laine-de-verre/materiel-de-pose" className={`hdr-nav-link${pathname === "/laine-de-verre/materiel-de-pose" ? " on" : ""}`}>Matériel de pose</Link>
            <Link href="/categorie/isolants" className={`hdr-nav-link${pathname?.startsWith("/categorie/isolants") ? " on" : ""}`}>Autres isolants</Link>
            <Link href="/livraison-retours" className="hdr-nav-link hdr-nav-end">Livraison offerte</Link>
          </div>
          {mega && (
            <div id="mega" className="mega" onMouseEnter={enter}>
              <div className="wrap mega-grid">
                <div className="mega-col mega-lv">
                  <Link href="/laine-de-verre" className="mega-title">Laine de verre</Link>
                  <ul>
                    {LV_USES.map((u) => <li key={u.key}><Link href={`/laine-de-verre/${u.slug}`}>{u.title}</Link></li>)}
                    <li><Link href="/laine-de-verre/materiel-de-pose">Matériel de pose</Link></li>
                  </ul>
                </div>
                {families.map((f) => (
                  <div key={f.slug} className="mega-col">
                    <Link href={`/categorie/${f.slug}`} className="mega-title">{f.name} <small>{f.count}</small></Link>
                    <ul>
                      {f.subs.slice(0, 6).map((s) => (
                        <li key={s.slug}><Link href={`/categorie/${f.slug}/${s.slug}`}>{s.name}</Link></li>
                      ))}
                      {f.subs.length > 6 && <li><Link href={`/categorie/${f.slug}`} className="mega-more">Tout voir ({f.subs.length} sous-familles)</Link></li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>
      {/* Téléphone : recherche et raccourcis laine de verre, sous la barre fixe (ils défilent avec la page) */}
      <div className="hdr-sub">
        <div className="wrap hdr-msearch"><SearchBox /></div>
        <nav className="qnav" aria-label="Laine de verre">
          <div className="qnav-in">
            <Link href="/laine-de-verre" className={`qpill qpill-lv${pathname === "/laine-de-verre" ? " on" : ""}`}>Laine de verre</Link>
            {LV_USES.map((u) => (
              <Link key={u.key} href={`/laine-de-verre/${u.slug}`} className={`qpill${pathname === `/laine-de-verre/${u.slug}` ? " on" : ""}`}>{u.nav}</Link>
            ))}
            <Link href="/laine-de-verre/materiel-de-pose" className={`qpill${pathname === "/laine-de-verre/materiel-de-pose" ? " on" : ""}`}>Matériel de pose</Link>
          </div>
        </nav>
      </div>

      {drawer && (
        <div className="drawer-wrap">
          <div className="drawer-bg" onClick={() => setDrawer(false)} aria-hidden="true" />
          <div id="menu-mobile" className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="drawer-top">
              <Logo />
              <button type="button" className="icon-btn" aria-label="Fermer le menu" onClick={() => setDrawer(false)} autoFocus><IconClose size={24} /></button>
            </div>
            <p className="drawer-h">Laine de verre</p>
            <ul className="drawer-links drawer-lv">
              <li><Link href="/laine-de-verre">Toute la laine de verre <IconChevron size={16} /></Link></li>
              {LV_USES.map((u) => <li key={u.key}><Link href={`/laine-de-verre/${u.slug}`}>{u.title}</Link></li>)}
              <li><Link href="/laine-de-verre/materiel-de-pose">Matériel de pose</Link></li>
            </ul>
            <p className="drawer-h">Informations</p>
            <ul className="drawer-links">
              <li><Link href="/panier">Mon panier{n > 0 ? ` (${n})` : ""}</Link></li>
              <li><Link href="/contact?type=devis">Demander un devis</Link></li>
              <li><Link href="/livraison-retours">Livraison et retours</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
            <details className="drawer-more">
              <summary>Autres produits <small>isolants, façade, outillage…</small> <IconChevronDown size={20} /></summary>
              <ul className="drawer-list">
                <li><div className="drawer-row"><Link href="/boutique">Tout le catalogue</Link></div></li>
                {families.map((f) => (
                  <li key={f.slug}>
                    <div className="drawer-row">
                      <Link href={`/categorie/${f.slug}`}>{f.name} <small>{f.count}</small></Link>
                      <button type="button" className="icon-btn" aria-expanded={openFam === f.slug} aria-label={`Sous-familles ${f.name}`}
                        onClick={() => setOpenFam(openFam === f.slug ? null : f.slug)}>
                        <IconChevronDown size={20} className={openFam === f.slug ? "rot" : ""} />
                      </button>
                    </div>
                    {openFam === f.slug && (
                      <ul className="drawer-sub">
                        {f.subs.map((s) => (<li key={s.slug}><Link href={`/categorie/${f.slug}/${s.slug}`}>{s.name} <small>{s.count}</small></Link></li>))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      )}
    </>
  );
}
