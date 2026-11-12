"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { NavFamily, NavRayon } from "@/lib/types";
import { SITE } from "@/lib/site";
import { LV_USES } from "@/lib/lv-labels";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { IconCart, IconChat, IconCheck, IconChevron, IconChevronDown, IconClock, IconClose, IconMenu, IconQuote, IconSearch, IconTruck } from "./Icons";

/**
 * En-tête : bandeau d'engagements réels, logo, recherche, contact / devis / panier,
 * puis le menu des 5 rayons avec leurs sous-catégories (survol ou clavier). Téléphone : recherche + bande des rayons + menu latéral.
 */
export default function Header({ rayons }: { families: NavFamily[]; rayons: NavRayon[] }) {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [openR, setOpenR] = useState<string | null>(null);

  useEffect(() => { setDrawer(false); (document.activeElement as HTMLElement | null)?.blur?.(); }, [pathname]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setDrawer(false); (document.activeElement as HTMLElement | null)?.blur?.(); } };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  const n = ready ? count : 0;
  const cur = rayons.find((r) => pathname === `/${r.slug}`)?.key;
  const findSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => document.querySelector<HTMLInputElement>(".hdr-msearch input")?.focus(), 250);
  };


  return (
    <>
      <a href="#contenu" className="skip">Aller au contenu</a>
      <div className="util">
        <div className="wrap util-in">
          <ul>
            <li><IconTruck size={16} /> {SITE.delivery}</li>
            <li><IconClock size={16} /> {SITE.ship}</li>
            <li><IconCheck size={16} /> Paiement sécurisé par carte, 3-D Secure</li>
          </ul>
          <ul>
            <li><Link href="/contact">Aide et contact</Link></li>
            <li><Link href="/contact?type=devis">Devis professionnels</Link></li>
          </ul>
        </div>
      </div>
      <header className="hdr">
        <div className="wrap hdr-main">
          <button type="button" className="hdr-burger" aria-label="Ouvrir le menu" aria-expanded={drawer} aria-controls="menu-mobile" onClick={() => setDrawer(true)}>
            <IconMenu size={24} />
          </button>
          <Link href="/" className="hdr-logo" aria-label="Isolaine, retour à l'accueil"><Logo light /></Link>
          <div className="hdr-search"><SearchBox /></div>
          <nav className="hdr-actions" aria-label="Accès rapides">
            <button type="button" className="hdr-act hdr-sbtn" aria-label="Rechercher un produit" onClick={findSearch}><IconSearch size={22} /></button>
            <Link href="/contact" className="hdr-act hdr-quote"><IconChat size={22} /><span>Contact</span></Link>
            <Link href="/contact?type=devis" className="hdr-act hdr-quote"><IconQuote size={22} /><span>Devis</span></Link>
            <Link href="/panier" className="hdr-act hdr-cart" aria-label={`Panier : ${n} article${n > 1 ? "s" : ""}`}>
              <IconCart size={22} /><span>Panier</span>{n > 0 && <b className="badge" aria-hidden="true">{n > 99 ? "99+" : n}</b>}
            </Link>
          </nav>
        </div>
      </header>

      <nav className="rnav" aria-label="Rayons">
        <div className="wrap rnav-in">
          <div className="rnav-i"><Link href="/" className={pathname === "/" ? "on" : undefined}>Accueil</Link></div>
          {rayons.map((r) => (
            <div key={r.key} className={`rnav-i${r.key === "autres" ? " end" : ""}`}>
              <Link href={`/${r.slug}`} className={cur === r.key ? "on" : undefined} aria-haspopup="true">{r.title} <IconChevronDown size={14} /></Link>
              <div className="rmega">
                <div className="wrap rmega-in">
                  {r.key === "isolation" ? (
                    <>
                      <div><h4>Par matériau</h4><ul>{r.links.slice(0, 6).map((l) => <li key={l.href}><Link href={l.href}>{l.name} <small>{l.count}</small></Link></li>)}</ul></div>
                      <div><h4>Par usage</h4><ul>
                        {LV_USES.map((u) => <li key={u.key}><Link href={`/laine-de-verre/${u.slug}`}>{u.title}</Link></li>)}
                        {r.links.slice(6).map((l) => <li key={l.href}><Link href={l.href}>{l.name} <small>{l.count}</small></Link></li>)}
                      </ul></div>
                      <div><h4>Par format</h4><ul>
                        <li><Link href="/laine-de-verre?vente=unite">Rouleaux et sacs à l'unité</Link></li>
                        <li><Link href="/laine-de-verre?vente=palette&tri=m2">Palettes complètes</Link></li>
                        <li><Link href="/laine-de-verre">Toute la laine de verre</Link></li>
                      </ul></div>
                      <div><h4>Marques</h4><ul>
                        {["Isover", "Ursa", "Austrotherm", "Knauf", "Styrodur"].map((b) => <li key={b}><Link href={`/isolation?marque=${b}`}>{b}</Link></li>)}
                      </ul></div>
                    </>
                  ) : (
                    [0, 1, 2, 3].map((c) => {
                      const per = Math.ceil(r.links.length / 4);
                      const part = r.links.slice(c * per, c * per + per);
                      return part.length ? <div key={c}><h4>{c === 0 ? "Catégories" : " "}</h4><ul>{part.map((l) => <li key={l.href}><Link href={l.href}>{l.name} <small>{l.count}</small></Link></li>)}</ul></div> : <div key={c} />;
                    })
                  )}
                  <div className="rmega-feat">
                    <p><b>{r.title}</b><br />{r.total} produits, les plus demandés en premier.</p>
                    <Link href={`/${r.slug}`}>Voir tout le rayon <IconChevron size={14} /></Link>
                    {r.key === "isolation" && <Link href="/laine-de-verre?vente=palette&tri=m2">Palettes : prix au m² <IconChevron size={14} /></Link>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Téléphone : recherche et bande des rayons, sous la barre fixe */}
      <div className="hdr-sub">
        <div className="hdr-msearch"><SearchBox /></div>
      </div>
      <nav className="rstrip" aria-label="Rayons">
        {rayons.map((r) => <Link key={r.key} href={`/${r.slug}`} className={cur === r.key ? "on" : undefined}>{r.title}</Link>)}
      </nav>

      {drawer && (
        <div className="drawer-wrap">
          <div className="drawer-bg" onClick={() => setDrawer(false)} aria-hidden="true" />
          <div id="menu-mobile" className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="drawer-top">
              <Logo />
              <button type="button" className="icon-btn" aria-label="Fermer le menu" onClick={() => setDrawer(false)} autoFocus><IconClose size={24} /></button>
            </div>
            <p className="drawer-h">Nos rayons</p>
            {rayons.map((r) => (
              <div key={r.key} className="drawer-rayon">
                <div className="drawer-row">
                  <Link href={`/${r.slug}`}>{r.title} <small>{r.total}</small></Link>
                  <button type="button" className="icon-btn" aria-expanded={openR === r.key} aria-label={`Catégories ${r.title}`} onClick={() => setOpenR(openR === r.key ? null : r.key)}>
                    <IconChevronDown size={20} className={openR === r.key ? "rot" : ""} />
                  </button>
                </div>
                {openR === r.key && (
                  <ul>
                    {r.key === "isolation" && LV_USES.map((u) => <li key={u.key}><Link href={`/laine-de-verre/${u.slug}`}>{u.title}</Link></li>)}
                    {r.links.map((l) => <li key={l.href}><Link href={l.href}>{l.name} <small>{l.count}</small></Link></li>)}
                  </ul>
                )}
              </div>
            ))}
            <p className="drawer-h">Commander</p>
            <ul className="drawer-links">
              <li><Link href="/panier">Mon panier{n > 0 ? ` (${n})` : ""}</Link></li>
              <li><Link href="/contact?type=devis">Demander un devis</Link></li>
              <li><Link href="/livraison-retours">Livraison et retours</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/boutique">Tout le catalogue</Link></li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
