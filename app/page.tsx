import Link from "next/link";
import type { Metadata } from "next";
import { getProduct } from "@/lib/catalog";
import { lv, minPpm2 } from "@/lib/laine";
import { RAYONS, rayonLinks, rayonPicks, rayonProducts } from "@/lib/rayons";
import { eur, num } from "@/lib/format";
import { COMPANY, SITE } from "@/lib/site";
import type { Card } from "@/lib/types";
import heroData from "@/lib/data/hero.json";
import { JsonLd } from "@/components/Breadcrumbs";
import { FaqList } from "@/components/Trust";
import { Shelf, ShelfArrows } from "@/components/Shelf";
import { FAQ } from "@/lib/faq";
import { IconChevron } from "@/components/Icons";

type Hero = { w: number; h: number; h800?: number; src: string; avif: string; webp: string; og: string };
const hero = heroData as unknown as Hero | null;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  ...(hero?.og ? { openGraph: { images: [{ url: hero.og, width: 1200, height: 630, alt: "Rouleau de laine de verre dans des combles en cours d'isolation" }] } } : {}),
};

// « Complétez votre chantier » : isoler → fixer → poser (références du catalogue)
const STEPS: { n: string; t: string; d: string; href: string; more: string; slugs: string[] }[] = [
  { n: "1", t: "Isoler", d: "Rouleaux, panneaux ou laine à souffler.", href: "/isolation", more: "Tout l'isolant",
    slugs: ["laine-de-verre-120mm-isover-gr-32-kraft-roule-324m2-r375", "laine-de-verre-280mm-isover-comble-ecolaine-336m2-r7", "comblissimo-isover"] },
  { n: "2", t: "Fixer", d: "L'ossature du doublage et ses fixations.", href: "/fixation-ossature", more: "Fixation & ossature",
    slugs: ["rail-pour-lisolation-interieure-iti-48mm-3ml", "montant-pour-lisolation-interieure-iti-48mm-3ml", "fourrure-pour-isolation-interieure-iti-45mm-3ml"] },
  { n: "3", t: "Poser", d: "Étanchéité, découpe et finitions.", href: "/materiel-de-pose", more: "Matériel de pose",
    slugs: ["pare-vapeur-pare-pluie-master-classic", "couteau-pour-laine-de-verre-28cm", "mousse-expansive-izo-mousse-pu-750-ml"] },
];
const short = (n: string) => n.replace(/\s+–\s+vendue? à la palette/i, "");

export default function Home() {
  const pal = minPpm2(lv.filter((p) => p.cu === "palette"));
  const roll = minPpm2(lv.filter((p) => p.cu === "rouleau"));
  const steps = STEPS.map((s) => ({ ...s, items: s.slugs.map(getProduct).filter((p): p is Card => !!p && p.price != null) }));

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

      {/* Bannière */}
      <section className="v-hero">
        <div className="v-hero-in">
          {hero && (
            <picture className="v-hero-img">
              {hero.avif && <source type="image/avif" srcSet={hero.avif} sizes="(min-width: 761px) 58vw, 100vw" />}
              {hero.webp && <source type="image/webp" srcSet={hero.webp} sizes="(min-width: 761px) 58vw, 100vw" />}
              <img src={hero.src} alt="Rouleau de laine de verre déroulé dans des combles en cours d'isolation" width={hero.w} height={hero.h} fetchPriority="high" decoding="async" />
            </picture>
          )}
          <div className="v-hero-txt">
            <p className="kicker">Isolants, ossature, pose et outillage</p>
            <h1>Tout pour isoler.<span>Tout pour bien poser.</span></h1>
            <p className="v-hero-sub">Les bons matériaux pour vos combles, murs et chantiers, au prix juste.</p>
            <div className="v-hero-cta">
              <Link href="/isolation" className="btn btn-primary">Découvrir nos isolants <IconChevron size={18} /></Link>
              <Link href="/contact?type=devis" className="btn btn-line">Demander un devis chantier</Link>
            </div>
            {(pal != null || roll != null) && (
              <div className="v-hero-from num">
                {pal != null && <div><b>{eur(pal)}/m²</b>laine de verre à la palette</div>}
                {roll != null && <div><b>{eur(roll)}/m²</b>rouleau à l'unité</div>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="adv" aria-label="Nos engagements">
        <div className="wrap"><ul>
          <li><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4.5l3.5 3.5v3h-8" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></svg>
            <div><b>Livraison offerte</b><p>France métropolitaine et Belgique. Expédition sous 24 h après règlement.</p></div></li>
          <li><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 4h16v16H4z" /><path d="M4 9.5h16M9.5 4v16" /></svg>
            <div><b>Prix au m² affiché</b><p>Sur chaque rouleau et chaque palette de laine, pour comparer d'un coup d'œil.</p></div></li>
          <li><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 19h18M5 19v-3h14v3M6 16V9h5v7M13 16V6h5v10" /></svg>
            <div><b>À l'unité ou à la palette</b><p>Un rouleau pour un petit chantier, une palette complète pour un grand.</p></div></li>
          <li><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8.5" cy="8" r="3" /><circle cx="16.5" cy="9" r="2.5" /><path d="M3 19c.8-3.4 3-5 5.5-5s4.7 1.6 5.5 5M14 14.5c2.6-.6 5.4.6 6.5 4.5" /></svg>
            <div><b>Particuliers et pros</b><p>Commande en ligne ou devis chantier pour les grandes quantités.</p></div></li>
        </ul></div>
      </section>

      {/* Rayons en carrousels */}
      <section className="ray-intro" aria-labelledby="rayons-h">
        <div className="wrap">
          <p className="eyebrow-v">Nos rayons</p>
          <h2 id="rayons-h">Nos produits phares, rayon par rayon</h2>
          <p className="lead">Dans chaque rayon, les références les plus demandées de chaque catégorie, en premier celles qui se vendent le mieux.</p>
          <nav className="ray-jump" aria-label="Aller au rayon">
            {RAYONS.map((r) => <a key={r.key} href={`#r${r.n}`}><span>{r.n}</span>{r.title}</a>)}
          </nav>
        </div>
      </section>
      {RAYONS.map((r) => {
        const picks = rayonPicks(r);
        const labels = Object.fromEntries(picks.map((p) => [p.slug, r.picks.find((g) => g.subs.includes(p.sub))?.label ?? p.subName]));
        const total = rayonProducts(r).length;
        return (
          <section key={r.key} className="ray" id={`r${r.n}`} aria-labelledby={`r${r.n}-h`}>
            <div className="wrap">
              <div className="ray-h">
                <div className="ray-t">
                  <span className="ray-n">{r.n}</span>
                  <div>
                    <h2 id={`r${r.n}-h`}><Link href={`/${r.slug}`}>{r.title}</Link></h2>
                    <p>{r.desc}</p>
                    {r.key === "isolation" && r.brands && <p className="ray-brands">Marques : <b>{r.brands}</b></p>}
                  </div>
                </div>
                <div className="ray-act">
                  <Link href={`/${r.slug}`} className="more-link">Tout le rayon <span className="num">({total})</span></Link>
                  <ShelfArrows target={`car-${r.key}`} />
                </div>
              </div>
              <nav className="ray-subs" aria-label={`Catégories ${r.title}`}>
                {rayonLinks(r).map((l) => <Link key={l.href} href={l.href}>{l.name}</Link>)}
              </nav>
              <Shelf id={`car-${r.key}`} items={picks} label={`Produits phares : ${r.title}`} labels={labels} />
              <p className="ray-sort">Les plus demandés en premier{r.key === "outillage" ? " · machines et outils à partir de 20 €" : ""}</p>
            </div>
          </section>
        );
      })}

      {/* Complétez votre chantier */}
      <section className="chantier" aria-labelledby="chantier-h">
        <div className="wrap">
          <div className="sec-h">
            <p className="eyebrow-v">Complétez votre chantier</p>
            <h2 id="chantier-h">Isoler, fixer, poser : tout dans le même panier</h2>
            <p>Pour un doublage de mur ou des combles, voici ce qui va avec l'isolant.</p>
          </div>
          <div className="steps3">
            {steps.map((s) => (
              <div key={s.n} className="step3">
                <div className="step3-h">
                  <span className="step3-n">{s.n}</span><h3>{s.t}</h3>
                  {s.n !== "3" && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
                </div>
                <p>{s.d}</p>
                {s.items.map((p) => {
                  const from = p.variable && p.priceMax != null && p.priceMax > (p.price as number);
                  return (
                    <div key={p.slug} className="mini">
                      {p.image ? <img src={p.image} alt="" loading="lazy" decoding="async" /> : <span />}
                      <div>
                        <Link href={`/produit/${p.slug}`}>{short(p.name)}</Link>
                        <span>{p.ppm2 != null ? `${p.r ? `R = ${num(p.r)} · ` : ""}${eur(p.ppm2)}/m²` : p.pack || (from ? "Plusieurs options" : "À l'unité")}</span>
                      </div>
                      <div className="p num">{from ? "dès " : ""}{eur(p.price as number)}</div>
                    </div>
                  );
                })}
                <Link href={s.href} className="more-link">{s.more} →</Link>
              </div>
            ))}
          </div>
        </div>
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
            <div className="tool"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M8 7h8M8 11h2M12 11h1M15 11h1M8 14.5h2M12 14.5h1M15 14.5h1M8 18h2M12 18h4" /></svg>
              <div><b>Calculateur de surface</b><p>Sur chaque fiche d'isolant : indiquez vos m², il donne le nombre de rouleaux ou de palettes.</p><Link href="/laine-de-verre">Choisir un isolant →</Link></div></div>
            <div className="tool"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 19h18M5 19v-3h14v3M6 16V9h5v7M13 16V6h5v10" /></svg>
              <div><b>Achat à la palette</b><p>Toutes les palettes de laine de verre triées par prix au m².</p><Link href="/laine-de-verre?vente=palette&tri=m2">Voir les palettes →</Link></div></div>
            <div className="tool"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>
              <div><b>Accès rapide</b><p>Combles, murs, laine à souffler, rails, pare-vapeur : tous les rayons en un clic.</p><Link href="/boutique">Tout le catalogue →</Link></div></div>
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
          <div><b>Règlement</b><p>Aucun paiement en ligne. Vous réglez après notre confirmation de disponibilité et de livraison.</p></div>
          <div><b>Commande</b><p>Panier, envoi de la commande, puis confirmation par e-mail ou téléphone. {SITE.shipping}.</p></div>
          <div><b>Service client</b><p>Formulaire de contact, réponse par e-mail. Un bouton « Une question ? » sur chaque fiche.</p><Link href="/contact">Contact</Link></div>
          <div><b>Professionnels</b><p>Devis chantier et grandes quantités. Conditions propres aux professionnels dans les CGV.</p><Link href="/cgv">Conditions de vente</Link></div>
        </div>
        <p className="company-line">{SITE.name} est l'enseigne en ligne de {COMPANY.legalName}, {COMPANY.form.split(" (")[0].toLowerCase()} immatriculée
          au RCS de {COMPANY.rcs.replace(/^RCS /, "").replace(/ \d.*$/, "")} (SIREN {COMPANY.siren}), {COMPANY.address.replace(/, France$/, "")}. Rétractation de 14 jours pour les particuliers, garantie légale de conformité de 2 ans.</p>
      </section>

      <section className="wrap v-faq" aria-labelledby="faq">
        <h2 id="faq">Questions fréquentes</h2>
        <FaqList items={FAQ} />
      </section>
    </>
  );
}
