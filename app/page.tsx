import Link from "next/link";
import type { Metadata } from "next";
import { families, getFamily, productsOf } from "@/lib/catalog";
import { USES, kitAll, lv, lvOf, lvSorted, minPpm2, minPrice } from "@/lib/laine";
import { eur } from "@/lib/format";
import { SITE } from "@/lib/site";
import heroData from "@/lib/data/hero.json";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel, type Slide } from "@/components/ProductCarousel";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/Breadcrumbs";
import { SurfaceCalc } from "@/components/SurfaceCalc";
import { PromoSticker } from "@/components/Promo";
import { IconChevron, IconQuote, IconRuler, IconTruck, IconLayers, IconRoof, IconWall, IconWind } from "@/components/Icons";

type Hero = { w: number; h: number; h800?: number; src: string; avif: string; webp: string; og: string };
const hero = heroData as unknown as Hero | null;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  ...(hero?.og ? { openGraph: { images: [{ url: hero.og, width: 1200, height: 630, alt: "Rouleau de laine de verre dans des combles en cours d'isolation" }] } } : {}),
};

export default function Home() {
  const priced = lvSorted(lv.filter((p) => p.price != null && p.image && !/r[ée]glette/i.test(p.name)));
  const gra = productsOf("isolants", "polystyrene-graphite");
  const graPick = gra.filter((p) => p.image && p.price != null).sort((a, b) => (a.thickness ?? 0) - (b.thickness ?? 0));
  const toSlide = (p: (typeof priced)[number]): Slide => ({ slug: p.slug, name: p.name, brand: p.brand, image: p.image, price: p.price, was: p.was, priceMax: p.priceMax, variable: p.variable, ppm2: p.ppm2, thickness: p.thickness, r: p.r, facing: p.facing, cu: p.cu });
  const byPrice = (a: { price: number | null }, b: { price: number | null }) => (a.price ?? 0) - (b.price ?? 0);
  // Petits budgets : laine de verre vendue à l'unité (rouleaux, sacs), le prix le plus bas de chaque usage + un rouleau fin de 100 à 120 mm
  const unit = priced.filter((p) => p.sale?.split("+").includes("unite")).sort(byPrice);
  const cheapUse = (u: string) => unit.find((p) => p.use === u);
  const thin = unit.find((p) => p.use === "combles" && (p.thickness ?? 999) <= 120);
  const blow = cheapUse("souffler");
  const budget = [cheapUse("combles"), thin, cheapUse("murs")].filter((p): p is (typeof priced)[number] => !!p);
  const budgetUniq = [...new Map(budget.map((p) => [p.slug, p])).values()].sort(byPrice).map(toSlide);
  if (blow) budgetUniq.splice(Math.min(3, budgetUniq.length), 0, toSlide(blow)); // la laine à souffler en 4e position
  // Polystyrène graphité : les paquets au prix affiché le plus bas (une épaisseur chacun)
  const graFixed = graPick.filter((p) => !p.variable).sort(byPrice);
  const graSlides: Slide[] = [...new Map(graFixed.map((p) => [p.thickness, p])).values()].slice(0, 2).map(toSlide);
  // Produits phares : palettes de laine de verre 200 et 300 mm pour les combles (la moins chère de chaque épaisseur)
  const flag = [200, 300].map((t) => priced.filter((p) => p.use === "combles" && p.thickness === t && p.sale?.split("+").includes("palette")).sort(byPrice)[0]).filter((p): p is (typeof priced)[number] => !!p).map(toSlide);
  const selSlides: Slide[] = [...budgetUniq, ...graSlides, ...flag];
  const graImg = graPick[0]?.image ?? gra.find((p) => p.image)?.image;
  const graFrom = gra.map((p) => p.price).filter((x): x is number => x != null);
  const kitIte = getFamily("isolants")?.subs.find((s) => s.slug === "kits-isolation-par-l-exterieur");
  const rates = [...USES.map((u) => ({ key: u.key, label: u.title, href: `/laine-de-verre/${u.slug}`, ppm2: minPpm2(lvOf(u.key)) }))];
  const kit = kitAll().filter((p) => p.image && p.price != null).slice(0, 4);
  const m2 = minPpm2(lv);
  const roll = minPrice(lv.filter((p) => p.cu === "rouleau"));
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
            <p className="eyebrow">Laine de verre {brands.join(" · ")} <span className="promo-pill">−20 % sur tout le catalogue</span></p>
            <h1>L'isolation performante, au bon prix.</h1>
            <p className="hero2-lead">
              Découvrez notre sélection de matériaux isolants pour vos combles, murs et façades. Des solutions adaptées aux particuliers et aux professionnels.
            </p>
            <div className="cta-row">
              <Link href="/laine-de-verre" className="btn btn-primary btn-lg">Découvrir la laine de verre <IconChevron size={18} /></Link>
              <Link href="/contact?type=devis" className="btn btn-ghost btn-lg"><IconQuote size={18} /> <span className="lg-only">Demander un devis chantier</span><span className="sm-only">Devis chantier</span></Link>
            </div>
            <div className="hero2-chips">
              {m2 != null && <span className="chip-price"><small>Dès</small><b>{eur(m2)}</b><small>le m²</small></span>}
              {roll != null && <span className="chip-price chip-alt"><small>Rouleau à l'unité dès</small><b>{eur(roll)}</b></span>}
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="cats" data-reveal>
        <div className="section-head">
          <div>
            <h2 id="cats">Nos solutions d'isolation</h2>
            <p className="section-sub">Choisissez votre famille de produits : prix affichés, livraison offerte.</p>
          </div>
        </div>
        <div className="hcats">
          <Link href="/laine-de-verre" className="hcat hcat-big hcat-lv">
            <span className="hcat-img">{lv.find((p) => p.image) && <img src={(lv.find((p) => p.image) as { image: string }).image} alt="" loading="lazy" decoding="async" />}<PromoSticker /></span>
            <span className="hcat-body">
              <span className="hcat-tag">Produit phare</span>
              <b className="hcat-title">Laine de verre</b>
              <span className="hcat-lead">Rouleaux, panneaux et sacs Isover et Ursa, de nombreuses épaisseurs, à l'unité ou à la palette.</span>
              <span className="hcat-foot">{m2 != null ? <>dès <b>{eur(m2)}</b>/m²</> : null}<span className="hcat-go">{lv.length} produits <IconChevron size={14} /></span></span>
            </span>
          </Link>
          <Link href="/categorie/isolants/polystyrene-graphite" className="hcat hcat-big hcat-pg">
            <span className="hcat-img">{graImg ? <img src={graImg} alt="" loading="lazy" decoding="async" /> : null}<PromoSticker /></span>
            <span className="hcat-body">
              <span className="hcat-tag">Isolation par l'extérieur</span>
              <b className="hcat-title">Polystyrène graphité</b>
              <span className="hcat-lead">Panneaux pour l'isolation thermique par l'extérieur (ITE), en plusieurs épaisseurs, pour particuliers et professionnels.</span>
              <span className="hcat-foot">{graFrom.length ? <>dès <b>{eur(Math.min(...graFrom))}</b> le paquet</> : null}<span className="hcat-go">{gra.length} produits <IconChevron size={14} /></span></span>
            </span>
          </Link>
          {USES.map((u) => {
            const items = lvOf(u.key);
            const Icon = u.key === "combles" ? IconRoof : u.key === "murs" ? IconWall : IconWind;
            const mm = minPpm2(items);
            return (
              <Link key={u.key} href={`/laine-de-verre/${u.slug}`} className="hcat hcat-small">
                <span className="pi"><Icon size={22} /></span>
                <span className="hcat-body">
                  <b className="hcat-title">{u.key === "combles" ? "Isolation des combles" : u.key === "murs" ? "Isolation des murs" : "Laine à souffler"}</b>
                  <span className="hcat-lead">{u.lead}</span>
                  <span className="hcat-foot">{mm != null ? <>dès <b>{eur(mm)}</b>/m²</> : <span />}<span className="hcat-go">{items.length} produits <IconChevron size={14} /></span></span>
                </span>
              </Link>
            );
          })}
        </div>
        {kitIte && <p className="hcats-more">Kits d'isolation par l'extérieur : <Link href="/categorie/isolants/kits-isolation-par-l-exterieur">{kitIte.count} solutions complètes</Link></p>}
      </section>


      {selSlides.length > 3 && (
        <section className="section section-soft cs-section" aria-labelledby="selection">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2 id="selection">Nos sélections en isolation</h2>
                <p className="section-sub">Des petits prix aux palettes : rouleaux et sacs dès quelques dizaines d'euros, polystyrène graphité, et nos palettes de laine de verre 200 et 300 mm.</p>
              </div>
              <Link href="/laine-de-verre?vente=unite&tri=prix-asc" className="link-arrow">Voir tous les petits prix <IconChevron size={16} /></Link>
            </div>
          </div>
          <ProductCarousel items={selSlides} label="Sélection de produits d'isolation" />
        </section>
      )}

      <section className="section wrap" aria-labelledby="calc" data-reveal>
        <SurfaceCalc rates={rates} />
      </section>

      <div className="proofs2">
        <div className="wrap proofs2-in proofs4">
          <div><span className="pi"><IconTruck size={20} /></span><p><b>Livraison offerte</b><span>Expédié sous 24 h, France et Belgique</span></p></div>
          <div><span className="pi"><IconRuler size={20} /></span><p><b>Prix au m² affiché</b><span>Transparent, sans surprise</span></p></div>
          <div><span className="pi"><IconLayers size={20} /></span><p><b>À l'unité ou à la palette</b><span>Du petit au grand chantier</span></p></div>
          <div><span className="pi"><IconQuote size={20} /></span><p><b>Particuliers et professionnels</b><span>Devis chantier sur demande</span></p></div>
        </div>
      </div>

      <section className="section wrap seo-block" aria-labelledby="seo" data-reveal>
        <h2 id="seo">Isolation thermique : laine de verre, polystyrène graphité et isolation extérieure</h2>
        <div className="seo-cols">
          <p>
            Isolaine propose de la <Link href="/laine-de-verre">laine de verre Isover et Ursa</Link> pour l'<Link href="/laine-de-verre/combles">isolation des combles</Link>,
            des <Link href="/laine-de-verre/murs">murs</Link> et des cloisons, en rouleaux, en panneaux ou en <Link href="/laine-de-verre/laine-a-souffler">laine à souffler</Link>.
            Chaque fiche indique l'épaisseur, la résistance thermique R, le conditionnement et le prix au m².
          </p>
        </div>
      </section>

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
    </>
  );
}
