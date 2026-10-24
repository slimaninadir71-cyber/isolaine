import Link from "next/link";
import type { Metadata } from "next";
import { families, getFamily } from "@/lib/catalog";
import { kitAll, lv, lvSorted, minPpm2, minPrice } from "@/lib/laine";
import { eur, num } from "@/lib/format";
import { COMPANY, SITE } from "@/lib/site";
import heroData from "@/lib/data/hero.json";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel, type Slide } from "@/components/ProductCarousel";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/Breadcrumbs";
import { LvGuide, UseTiles } from "@/components/LvBlocks";
import { FaqList, OrderSteps } from "@/components/Trust";
import { FAQ } from "@/lib/faq";
import { IconCheck, IconChevron, IconClock, IconQuote, IconRuler, IconTruck } from "@/components/Icons";

type Hero = { w: number; h: number; h800?: number; src: string; avif: string; webp: string; og: string };
const hero = heroData as unknown as Hero | null;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  ...(hero?.og ? { openGraph: { images: [{ url: hero.og, width: 1200, height: 630, alt: "Rouleau de laine de verre dans des combles en cours d'isolation" }] } } : {}),
};

export default function Home() {
  const priced = lvSorted(lv.filter((p) => p.price != null && p.image && !/r[ée]glette/i.test(p.name)));
  const slides: Slide[] = priced.slice(0, 18).map((p) => ({
    slug: p.slug, name: p.name, brand: p.brand, image: p.image, price: p.price, priceMax: p.priceMax, variable: p.variable,
    ppm2: p.ppm2, thickness: p.thickness, r: p.r, facing: p.facing, cu: p.cu,
  }));
  const kit = kitAll().filter((p) => p.image && p.price != null).slice(0, 4);
  const m2 = minPpm2(lv);
  const roll = minPrice(lv.filter((p) => p.cu === "rouleau"));
  const palMax = Math.max(0, ...lv.filter((p) => p.cu === "palette").map((p) => p.m2 ?? 0));
  const brands = [...new Set(lv.map((p) => p.brand).filter(Boolean))];
  const isolants = getFamily("isolants");
  const otherIso = isolants?.subs.filter((s) => s.slug !== "laine-de-verre") ?? [];
  const others = families.filter((f) => f.slug !== "isolants");
  const total = families.reduce((n, f) => n + f.count, 0);

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

      <section className={`hero2${hero ? "" : " hero2-plain"}`}>
        {hero && (
          <div className="hero2-media">
            <picture>
              {hero.avif && <source type="image/avif" srcSet={hero.avif} sizes="100vw" />}
              {hero.webp && <source type="image/webp" srcSet={hero.webp} sizes="100vw" />}
              <img src={hero.src} alt="Rouleau de laine de verre déroulé dans des combles en cours d'isolation" width={hero.w} height={hero.h}
                fetchPriority="high" decoding="async" />
            </picture>
            <div className="hero2-badges">
              {m2 != null && <span className="chip-price"><small>Dès</small><b>{eur(m2)}</b><small>le m²</small></span>}
              {roll != null && <span className="chip-price chip-alt"><small>Rouleau dès</small><b>{eur(roll)}</b></span>}
            </div>
          </div>
        )}
        <div className="wrap hero2-body">
          <div className="hero2-txt">
            <p className="eyebrow">Laine de verre {brands.join(" · ")}</p>
            <h1>La laine de verre livrée chez vous, sans frais de livraison.</h1>
            <p className="hero2-lead">
              Rouleaux pour combles, panneaux pour murs, laine à souffler : comparez les épaisseurs et le prix au m²,
              commandez à l'unité ou à la palette.
            </p>
            <div className="cta-row">
              <Link href="/laine-de-verre" className="btn btn-primary btn-lg">Voir la laine de verre <IconChevron size={18} /></Link>
              <Link href="/contact?type=devis" className="btn btn-ghost btn-lg"><IconQuote size={18} /> <span className="lg-only">Devis chantier</span><span className="sm-only">Devis</span></Link>
            </div>
            <div className="hero2-chips">
              {m2 != null && <span className="chip-price"><small>Dès</small><b>{eur(m2)}</b><small>le m²</small></span>}
              {roll != null && <span className="chip-price chip-alt"><small>Rouleau à l'unité dès</small><b>{eur(roll)}</b></span>}
            </div>
          </div>
        </div>
      </section>

      <div className="proofs2">
        <div className="wrap proofs2-in">
          <div><span className="pi"><IconTruck size={20} /></span><p><b>Livraison offerte</b><span>France métropolitaine et Belgique</span></p></div>
          <div><span className="pi"><IconRuler size={20} /></span><p><b>Prix au m² affiché</b><span>Et calcul des quantités</span></p></div>
          <div><span className="pi"><IconClock size={20} /></span><p><b>Expédition sous 24 h</b><span>Dès réception du règlement</span></p></div>
          <div><span className="pi"><IconCheck size={20} /></span><p><b>Aucun paiement en ligne</b><span>Règlement après confirmation</span></p></div>
        </div>
      </div>

      <section className="section wrap" aria-labelledby="usages" data-reveal>
        <div className="section-head">
          <div>
            <h2 id="usages">Que voulez-vous isoler ?</h2>
            <p className="section-sub">Choisissez votre chantier, nous affichons les produits adaptés.</p>
          </div>
          <Link href="/laine-de-verre" className="link-arrow">Toute la laine de verre <IconChevron size={16} /></Link>
        </div>
        <UseTiles />
      </section>

      {slides.length > 3 && (
        <section className="section section-soft cs-section" aria-labelledby="selection">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2 id="selection">Nos laines de verre</h2>
                <p className="section-sub">Rouleaux, panneaux et palettes{palMax > 0 ? <> jusqu'à {num(palMax)} m²</> : null}, avec le prix au m².</p>
              </div>
              <Link href="/laine-de-verre?vente=palette&tri=m2" className="link-arrow">Comparer les palettes <IconChevron size={16} /></Link>
            </div>
          </div>
          <ProductCarousel items={slides} label="Sélection de laines de verre" />
        </section>
      )}

      {kit.length > 0 && (
        <section className="section wrap" aria-labelledby="pose" data-reveal>
          <div className="section-head">
            <div>
              <h2 id="pose">Tout pour la pose</h2>
              <p className="section-sub">Pare-vapeur, couteaux, accessoires de combles : à ajouter à la même commande.</p>
            </div>
            <Link href="/laine-de-verre/materiel-de-pose" className="link-arrow">Tout le matériel de pose <IconChevron size={16} /></Link>
          </div>
          <div className="grid grid-4 swipe">{kit.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        </section>
      )}

      <section className="section wrap" aria-labelledby="commander" id="comment-commander" data-reveal>
        <div className="order-band">
          <div className="order-intro">
            <h2 id="commander">Commander simplement</h2>
            <p>Aucun paiement en ligne : nous confirmons la disponibilité et la livraison avant tout règlement.
              Pour plusieurs palettes, demandez un devis.</p>
            <Link href="/contact?type=devis" className="btn btn-primary"><IconQuote size={18} /> Demander un devis</Link>
          </div>
          <OrderSteps />
        </div>
      </section>

      <section className="section wrap" aria-labelledby="vendeur" data-reveal>
        <div className="trust">
          <div className="trust-intro">
            <h2 id="vendeur">Qui vous livre ?</h2>
            <p>{SITE.name} est l'enseigne en ligne de {COMPANY.legalName}, {COMPANY.form.split(" (")[0].toLowerCase()} immatriculée
              au RCS de {COMPANY.rcs.replace(/^RCS /, "").replace(/ \d.*$/, "")} (SIREN {COMPANY.siren}), {COMPANY.address.replace(/, France$/, "")}.</p>
          </div>
          <ul className="trust-list">
            {brands.length > 0 && <li><IconCheck size={18} /><span>Laine de verre de marque {brands.join(" et ")}, avec épaisseur, résistance R et prix au m² sur chaque fiche.</span></li>}
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

      <section className="section wrap" aria-labelledby="faq" data-reveal>
        <div className="section-head">
          <div>
            <h2 id="faq">Questions fréquentes</h2>
            <p className="section-sub">Livraison, paiement, retours : l'essentiel avant de commander.</p>
          </div>
          <Link href="/contact" className="link-arrow">Une autre question ? <IconChevron size={16} /></Link>
        </div>
        <FaqList items={FAQ} />
      </section>

      <div className="wrap section" data-reveal><LvGuide /></div>

      <section className="section wrap rayons" aria-labelledby="rayons" data-reveal>
        <h2 id="rayons">Nos autres rayons</h2>
        {otherIso.length > 0 && (
          <div className="rayon">
            <p className="rayon-h">Autres isolants</p>
            <div className="near-list">
              {otherIso.map((s) => <Link key={s.slug} href={`/categorie/isolants/${s.slug}`}>{s.name} <small>{s.count}</small></Link>)}
            </div>
          </div>
        )}
        <div className="rayon">
          <p className="rayon-h">Façade, plâtrerie et chantier</p>
          <div className="near-list">
            {others.map((f) => <Link key={f.slug} href={`/categorie/${f.slug}`}>{f.name} <small>{f.count}</small></Link>)}
          </div>
        </div>
        <Link href="/boutique" className="btn btn-ghost btn-block rayons-all">Voir tous nos produits ({total}) <IconChevron size={16} /></Link>
      </section>
    </>
  );
}
