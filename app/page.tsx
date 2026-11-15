import Link from "next/link";
import type { Metadata } from "next";
import { getDetail, getProduct } from "@/lib/catalog";
import { USES, lv, lvOf, minPpm2 } from "@/lib/laine";
import { RAYONS, rayonByKey, rayonPicks, rayonProducts } from "@/lib/rayons";
import { eur } from "@/lib/format";
import { COMPANY, SITE } from "@/lib/site";
import type { Card } from "@/lib/types";
import heroData from "@/lib/data/hero.json";
import { JsonLd } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { Logo } from "@/components/Logo";
import { CONTACT } from "@/lib/contact";
import { SurfaceCalc } from "@/components/SurfaceCalc";
import { PROMO_PCT } from "@/components/Promo";
import { IconCheck, IconChevron, IconHeadset, IconShield, IconTruck } from "@/components/Icons";

type Hero = { w: number; h: number; h800?: number; src: string; avif: string; webp: string; og: string };
const hero = heroData as unknown as Hero | null;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  ...(hero?.og ? { openGraph: { images: [{ url: hero.og, width: 1200, height: 630, alt: "Rouleau de laine de verre dans des combles en cours d'isolation" }] } } : {}),
};


export default function Home() {
  const pal = minPpm2(lv.filter((p) => p.cu === "palette"));
  const roll = minPpm2(lv.filter((p) => p.cu === "rouleau"));
  const rates = USES.map((u) => ({ key: u.key, label: u.title, href: `/laine-de-verre/${u.slug}`, ppm2: minPpm2(lvOf(u.key)) }));

  // Trois univers : photo d'un vrai produit du rayon, en grand format
  const big = (slug?: string) => (slug ? getDetail(slug).images[0]?.src ?? getProduct(slug)?.image ?? "" : "");
  const outil = rayonPicks(rayonByKey("outillage")).find((p) => p.image);
  const UNIVERS = [
    { k: "isolation" as const, title: "Isolation & laine de verre", text: "Confort thermique et économies d'énergie : rouleaux, panneaux et laine à souffler.", cta: "Voir la sélection",
      img: big("laine-de-verre-120mm-isover-gr-32-kraft-roule-324m2-r375") },
    { k: "chauffage" as const, title: "Bois de chauffage", text: "Granulés, bûches et bûches densifiées : chauffez-vous au bois au meilleur prix.", cta: "Voir les offres",
      img: big("buches-feuillus-durs-33-cm-palette-2-9-steres") || big(rayonPicks(rayonByKey("chauffage"))[0]?.slug) },
    { k: "outillage" as const, title: "Outillage professionnel", text: "Perceuses, scies, laser, malaxeur : les machines pour tous vos travaux.", cta: "Voir la gamme",
      img: big(outil?.slug) },
  ].map((u) => ({ ...u, r: rayonByKey(u.k) }));
  const others = RAYONS.filter((r) => !UNIVERS.some((u) => u.k === r.key));

  // Meilleures offres : vrais produits du catalogue, prix et remises réels
  const palette = lv.filter((p) => p.cu === "palette" && p.ppm2 != null && p.image).sort((a, b) => (a.ppm2 as number) - (b.ppm2 as number))[0];
  const offers = [
    getProduct("laine-de-verre-120mm-isover-gr-32-kraft-roule-324m2-r375"),
    palette,
    outil,
    getProduct("buches-feuillus-durs-33-cm-palette-2-9-steres") ?? rayonPicks(rayonByKey("chauffage"))[0],
  ].filter((p, i, a): p is Card => !!p && p.price != null && a.findIndex((x) => x?.slug === p.slug) === i);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": `${SITE.url}/#org`, name: SITE.name, url: SITE.url },
          { "@type": "WebSite", "@id": `${SITE.url}/#site`, url: SITE.url, name: SITE.name, inLanguage: "fr-FR", publisher: { "@id": `${SITE.url}/#org` },
            potentialAction: { "@type": "SearchAction", target: `${SITE.url}/recherche?q={search_term_string}`, "query-input": "required name=search_term_string" } }
        ],
      }} />

      {/* Bannière : isolation et laine de verre */}
      <section className="hx" aria-labelledby="hx-h">
        <div className="hx-in">
          {hero && (
            <picture className="hx-img">
              {hero.avif && <source type="image/avif" srcSet={hero.avif} sizes="(min-width: 761px) 55vw, 100vw" />}
              {hero.webp && <source type="image/webp" srcSet={hero.webp} sizes="(min-width: 761px) 55vw, 100vw" />}
              <img src={hero.src} alt="Rouleau de laine de verre déroulé dans des combles en cours d'isolation" width={hero.w} height={hero.h} fetchPriority="high" decoding="async" />
            </picture>
          )}
          <div className="hx-txt">
            <h1 id="hx-h">Isolation performante <span>à prix cassés !</span></h1>
            <ul>
              <li><IconCheck size={20} /><Link href="/laine-de-verre">Laine de verre</Link></li>
              {USES.filter((u) => u.key !== "souffler").map((u) => <li key={u.key}><IconCheck size={20} /><Link href={`/laine-de-verre/${u.slug}`}>Isolation des {u.key === "combles" ? "combles" : "murs"}</Link></li>)}
              <li><IconCheck size={20} /><Link href="/laine-de-verre/laine-a-souffler">Laine à souffler</Link></li>
            </ul>
            <Link href="/isolation" className="btn-or">Découvrir notre rayon <IconChevron size={18} /></Link>
            {(pal != null || roll != null) && (
              <p className="hx-from num">
                {pal != null && <span>Dès <b>{eur(pal)}/m²</b> à la palette</span>}
                {roll != null && <span>dès <b>{eur(roll)}/m²</b> au rouleau</span>}
              </p>
            )}
          </div>
          <p className="hx-tag" aria-label={`Moins ${PROMO_PCT} pour cent sur tout le catalogue`}><small>Sur tout le catalogue</small>−{PROMO_PCT} %</p>
        </div>
      </section>

      {/* Trois univers */}
      <section className="wrap ux" aria-label="Nos univers">
        {UNIVERS.map((u) => (
          <Link key={u.k} href={`/${u.r.slug}`} className={`ux-card ux-${u.k}`}>
            <span className="ux-txt">
              <b>{u.title}</b>
              <span>{u.text}</span>
              <span className="btn-or">{u.cta} <IconChevron size={16} /></span>
            </span>
            <span className="ux-img">{u.img && <img src={u.img} alt="" loading="lazy" decoding="async" />}</span>
          </Link>
        ))}
      </section>
      <nav className="wrap ux-more" aria-label="Autres rayons">
        <span>Aussi :</span>
        {others.map((r) => <Link key={r.key} href={`/${r.slug}`}>{r.title} <small className="num">({rayonProducts(r).length})</small></Link>)}
        <Link href="/boutique">Tout le catalogue →</Link>
      </nav>

      {/* Meilleures offres (vrais produits, vrais prix) */}
      <section className="wrap ox" aria-labelledby="ox-h">
        <div className="ox-h">
          <h2 id="ox-h">Nos meilleures offres</h2>
          <Link href="/boutique" className="more-link">Voir tout le catalogue →</Link>
        </div>
        <div className="grid ox-grid">
          {offers.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 2} />)}
        </div>
      </section>

      {/* Réassurance */}
      <section className="rx2" aria-label="Nos engagements">
        <div className="wrap"><ul>
          <li><IconTruck size={34} /><div><b>Livraison offerte</b><p>France métropolitaine et Belgique · {SITE.ship.toLowerCase()}</p></div></li>
          <li><IconShield size={34} /><div><b>Paiement sécurisé</b><p>Carte bancaire, authentification 3-D Secure</p></div></li>
          <li><IconHeadset size={34} /><div><b>Conseils personnalisés</b><p>Sur WhatsApp au {CONTACT.whatsappDisplay} ou par e-mail</p></div></li>
          <li><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 19h18M5 19v-3h14v3M6 16V9h5v7M13 16V6h5v10" /></svg>
            <div><b>À l'unité ou à la palette</b><p>Pour un petit chantier comme pour un grand</p></div></li>
        </ul></div>
      </section>

      {/* Calculateur de surface (existant) */}
      <section className="wrap" style={{ paddingTop: 44 }} aria-label="Calculateur de surface">
        <SurfaceCalc rates={rates} />
      </section>

      {/* Outils et services */}
      <div className="wrap">
        <section className="tools-v" aria-labelledby="devis-h">
          <div className="tools-l">
            <p className="eyebrow-v">Chantier, palette, grande quantité</p>
            <h2 id="devis-h">Un devis pour votre chantier</h2>
            <p>Indiquez la surface, l'isolant et l'adresse de livraison : nous revenons vers vous par e-mail avec un chiffrage.</p>
            <Link href="/contact?type=devis" className="btn btn-primary">Demander un devis</Link>
            <ul><li>Particuliers et professionnels</li><li>Commande à la palette ou en plusieurs palettes</li><li>Réponse par e-mail</li></ul>
          </div>
          <div className="tools-r">
            <div className="tool"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 19h18M5 19v-3h14v3M6 16V9h5v7M13 16V6h5v10" /></svg>
              <div><b>Achat à la palette</b><p>Toutes les palettes de laine de verre triées par prix au m².</p><Link href="/laine-de-verre?vente=palette&tri=m2">Voir les palettes →</Link></div></div>
            <div className="tool"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 5h16v11H8l-4 3.5z" /><path d="M8 9.5h8M8 12.5h5" /></svg>
              <div><b>Contact commercial</b><p>Une question sur un produit, une livraison ou une commande en cours.</p><Link href="/contact">Nous écrire →</Link></div></div>
          </div>
        </section>
      </div>

      {/* Réassurance */}
      <section className="wrap" aria-labelledby="commande-h" id="comment-commander">
        <div className="sec-h"><p className="eyebrow-v">Commander chez {SITE.name}</p><h2 id="commande-h">Comment ça se passe</h2></div>
        <div className="reas">
          <div><b>Livraison</b><p>{SITE.delivery}. Certains produits signalés sur leur fiche sont en retrait magasin uniquement.</p><Link href="/livraison-retours">Livraison et retours</Link></div>
          <div><b>Paiement sécurisé</b><p>Par carte bancaire au moment de la commande, avec authentification 3-D Secure. Vos données de carte ne sont pas conservées.</p></div>
          <div><b>Commande</b><p>Panier, coordonnées, paiement par carte, puis e-mail de confirmation. {SITE.ship}, {SITE.eta}.</p></div>
          <div><b>Service client</b><p>Formulaire de contact ou WhatsApp, réponse rapide.</p><Link href="/contact">Contact</Link></div>
          <div><b>Professionnels</b><p>Devis chantier et grandes quantités. Conditions propres aux professionnels dans les CGV.</p><Link href="/cgv">Conditions de vente</Link></div>
        </div>
        <p className="company-line">{SITE.name} est l'enseigne en ligne de {COMPANY.legalName}, {COMPANY.form.split(" (")[0].toLowerCase()} immatriculée
          au RCS de {COMPANY.rcs.replace(/^RCS /, "").replace(/ \d.*$/, "")} (SIREN {COMPANY.siren}), {COMPANY.address.replace(/, France$/, "")}. Rétractation de 14 jours pour les particuliers, garantie légale de conformité de 2 ans.</p>
      </section>


      {/* Bandeau de marque */}
      <section className="bx" aria-label="Isolaine">
        <div className="wrap bx-in">
          <span className="bx-logo"><Logo light /></span>
          <p>Votre partenaire matériaux <span>au meilleur prix !</span></p>
          <Link href="/boutique" className="btn-or">Découvrir tous nos produits <IconChevron size={18} /></Link>
        </div>
      </section>
    </>
  );
}
