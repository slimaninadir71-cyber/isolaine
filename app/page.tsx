import Link from "next/link";
import type { Metadata } from "next";
import { families, products } from "@/lib/catalog";
import { kitAll, lv, lvOf, lvSorted, minPpm2 } from "@/lib/laine";
import { eur } from "@/lib/format";
import { COMPANY, SITE } from "@/lib/site";
import type { Card } from "@/lib/types";
import heroData from "@/lib/data/hero.json";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/Breadcrumbs";
import { FaqList, OrderSteps } from "@/components/Trust";
import { TopProducts, type TopTab } from "@/components/TopProducts";
import { FAQ } from "@/lib/faq";
import { IconCheck, IconChevron, IconQuote } from "@/components/Icons";

type Hero = { w: number; h: number; h800?: number; src: string; avif: string; webp: string; og: string };
const hero = heroData as unknown as Hero | null;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  ...(hero?.og ? { openGraph: { images: [{ url: hero.og, width: 1200, height: 630, alt: "Rouleau de laine de verre dans des combles en cours d'isolation" }] } } : {}),
};

/** Un produit par épaisseur, dans l'ordre donné. */
const byThickness = (list: Card[], n: number) => {
  const seen = new Set<number | null>();
  return list.filter((p) => !seen.has(p.thickness) && (seen.add(p.thickness), true)).slice(0, n);
};
/** Alterne les listes (un de chaque, puis le suivant…) sans doublon. */
const mix = (lists: Card[][], n: number) => {
  const out = new Map<string, Card>();
  for (let i = 0; out.size < n && lists.some((l) => i < l.length); i++) for (const l of lists) if (l[i] && out.size < n) out.set(l[i].slug, l[i]);
  return [...out.values()];
};

export default function Home() {
  const ok = (p: Card) => p.price != null && !!p.image && !/r[ée]glette/i.test(p.name);
  const rolls = byThickness(lvSorted(lv.filter((p) => ok(p) && p.cu === "rouleau")), 8);
  const pallets = byThickness([...lv.filter((p) => ok(p) && p.cu === "palette")].sort((a, b) => (a.ppm2 ?? 1e9) - (b.ppm2 ?? 1e9)), 8);
  const rock = products.filter((p) => p.sub === "laine-de-roche" && ok(p) && /laine de roche/i.test(p.name));
  const tabs: TopTab[] = [
    { key: "tous", label: "Tous", items: mix([rolls, pallets, rock], 8) },
    { key: "verre", label: "Laine de verre", items: mix([rolls, pallets], 8) },
    { key: "roche", label: "Laine de roche", items: rock.slice(0, 8) },
    { key: "rouleaux", label: "Rouleaux", items: rolls },
    { key: "palettes", label: "Palettes", items: pallets },
  ].filter((t) => t.items.length > 0);

  const m2 = minPpm2(lv);
  const brands = [...new Set(lv.map((p) => p.brand).filter(Boolean))];
  const total = families.reduce((n, f) => n + f.count, 0);
  const img = (list: Card[]) => list.find((p) => p.image)?.image ?? "";
  const cats = [
    { href: "/laine-de-verre", label: "Laine de verre", image: img(lvOf("combles")) },
    { href: "/categorie/isolants/laine-de-roche", label: "Laine de roche", image: img(rock) },
    { href: "/laine-de-verre?vente=unite", label: "Rouleaux à l'unité", image: img(rolls) },
    { href: "/laine-de-verre?vente=palette&tri=m2", label: "Palettes", image: img(pallets) },
    { href: "/laine-de-verre/laine-a-souffler", label: "Laine à souffler", image: img(lvOf("souffler")) },
    { href: "/laine-de-verre/materiel-de-pose", label: "Matériel de pose", image: img(kitAll()) },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": `${SITE.url}/#org`, name: SITE.name, url: SITE.url },
          { "@type": "WebSite", "@id": `${SITE.url}/#site`, url: SITE.url, name: SITE.name, inLanguage: "fr-FR", publisher: { "@id": `${SITE.url}/#org` },
            potentialAction: { "@type": "SearchAction", target: `${SITE.url}/recherche?q={search_term_string}`, "query-input": "required name=search_term_string" } },
          { "@type": "FAQPage", "@id": `${SITE.url}/#faq`,
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      }} />
      <Reveal />

      <nav className="wrap cats" aria-label="Nos rayons">
        {cats.map((c) => (
          <Link key={c.href} href={c.href} className="cat">
            <span className="cat-img">{c.image ? <img src={c.image} alt="" decoding="async" /> : null}</span>
            <span className="cat-name">{c.label}</span>
          </Link>
        ))}
      </nav>

      <section className="wrap hb-wrap">
        <div className="hb">
          {hero && (
            <picture className="hb-media">
              {hero.avif && <source type="image/avif" srcSet={hero.avif} sizes="100vw" />}
              {hero.webp && <source type="image/webp" srcSet={hero.webp} sizes="100vw" />}
              <img src={hero.src} alt="Rouleau de laine de verre déroulé dans des combles en cours d'isolation" width={hero.w} height={hero.h} fetchPriority="high" decoding="async" />
            </picture>
          )}
          <div className="hb-txt">
            <p className="hb-eyebrow">Livraison offerte · expédition sous 24 h</p>
            <h1>La laine de verre et la laine de roche, livrées chez vous.</h1>
            {m2 != null && <p className="hb-price">Dès <b>{eur(m2)}</b> le m²</p>}
            <div className="hb-cta">
              <a href="#produits" className="btn btn-primary btn-lg">Voir les produits <IconChevron size={18} /></a>
              <Link href="/contact?type=devis" className="btn btn-light btn-lg"><IconQuote size={18} /> Devis chantier</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap" id="produits" aria-labelledby="top">
        <h2 id="top" className="top-h">Nos produits phares</h2>
        <p className="top-sub">Rouleaux et palettes, avec le prix au m² et la livraison offerte.</p>
        <TopProducts tabs={tabs} />
        <div className="top-more">
          <Link href="/laine-de-verre" className="btn btn-ghost">Toute la laine de verre <IconChevron size={16} /></Link>
          <Link href="/boutique" className="btn btn-ghost">Tout le catalogue ({total}) <IconChevron size={16} /></Link>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="s30" data-reveal>
        <div className="s30">
          <div className="s30-txt">
            <p className="s30-eyebrow">{SITE.name} en 30 secondes</p>
            <h2 id="s30">L'isolant livré devant chez vous, sans frais de livraison.</h2>
            <p>Rouleaux pour les combles, panneaux pour les murs, laine à souffler : à l'unité pour un petit chantier, à la palette pour un grand.</p>
            <ul className="s30-list">
              <li><IconCheck size={20} /> Livraison offerte en France métropolitaine et en Belgique</li>
              <li><IconCheck size={20} /> {SITE.shipping}</li>
              <li><IconCheck size={20} /> Aucun paiement en ligne : règlement après confirmation</li>
              {brands.length > 0 && <li><IconCheck size={20} /> Laine de verre {brands.join(" et ")}, prix au m² affiché</li>}
            </ul>
          </div>
          {hero && (
            <picture className="s30-media">
              {hero.webp && <source type="image/webp" srcSet={hero.webp} sizes="(min-width: 1000px) 560px, 100vw" />}
              <img src={hero.src} alt="" width={hero.w} height={hero.h} loading="lazy" decoding="async" />
            </picture>
          )}
        </div>
      </section>

      <section className="section wrap" aria-labelledby="commander" id="comment-commander" data-reveal>
        <div className="order-band">
          <div className="order-intro">
            <h2 id="commander">Commander simplement</h2>
            <p>Nous confirmons la disponibilité et la livraison avant tout règlement. Pour plusieurs palettes, demandez un devis.</p>
          </div>
          <OrderSteps />
        </div>
      </section>

      <section className="section wrap" aria-labelledby="faq" data-reveal>
        <h2 id="faq" className="top-h">Questions fréquentes</h2>
        <FaqList items={FAQ} />
      </section>

      <section className="section wrap" aria-labelledby="vendeur" data-reveal>
        <div className="trust">
          <div className="trust-intro">
            <h2 id="vendeur">Qui vous livre ?</h2>
            <p>{SITE.name} est l'enseigne en ligne de {COMPANY.legalName}, {COMPANY.form.split(" (")[0].toLowerCase()} immatriculée
              au RCS de {COMPANY.rcs.replace(/^RCS /, "").replace(/ \d.*$/, "")} (SIREN {COMPANY.siren}), {COMPANY.address.replace(/, France$/, "")}.</p>
          </div>
          <ul className="trust-list">
            <li><IconCheck size={18} /><span>Commande sans paiement : nous vérifions la disponibilité et confirmons la livraison avant tout règlement.</span></li>
            <li><IconCheck size={18} /><span>Rétractation de 14 jours pour les particuliers et garantie légale de conformité de 2 ans.</span></li>
          </ul>
          <p className="trust-links">
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/cgv">Conditions de vente</Link>
            <Link href="/livraison-retours">Livraison et retours</Link>
          </p>
        </div>
      </section>
    </>
  );
}
