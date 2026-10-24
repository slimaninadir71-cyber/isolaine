import Link from "next/link";
import type { Card } from "@/lib/types";
import { USES, kitGroups, lv, lvOf, minPpm2, minPrice } from "@/lib/laine";
import { eur, num } from "@/lib/format";
import { IconBox, IconChevron, IconRoof, IconTool, IconWall, IconWind } from "./Icons";

const ICON: Record<string, typeof IconRoof> = { combles: IconRoof, murs: IconWall, souffler: IconWind };
const notStrip = (p: Card) => !/r[ée]glette/i.test(p.name);

/** Accès par usage : combles, murs, laine à souffler (+ matériel de pose). Prix d'appel calculés sur le catalogue. */
export function UseTiles({ current, kit = true }: { current?: string; kit?: boolean }) {
  return (
    <div className="use-grid">
      {USES.map((u) => {
        const items = lvOf(u.key);
        const img = items.find((p) => p.image)?.image;
        const m2 = minPpm2(items);
        const from = minPrice(items.filter(notStrip));
        const Icon = ICON[u.key] ?? IconBox;
        return (
          <Link key={u.key} href={`/laine-de-verre/${u.slug}`} className={`use-card${current === u.key ? " on" : ""}`} aria-current={current === u.key ? "page" : undefined}>
            <span className="use-img">{img ? <img src={img} alt="" loading="lazy" decoding="async" /> : <Icon size={40} />}</span>
            <span className="use-body">
              <span className="use-title"><Icon size={20} /> {u.title}</span>
              <span className="use-lead">{u.lead}</span>
              <span className="use-foot">
                <span className="use-price">{m2 != null ? <>dès <b>{eur(m2)}</b>/m²</> : from != null ? <>dès <b>{eur(from)}</b> le sac</> : "Sur devis"}</span>
                <span className="use-count">{items.length} produits <IconChevron size={14} /></span>
              </span>
            </span>
          </Link>
        );
      })}
      {kit && (
        <Link href="/laine-de-verre/materiel-de-pose" className={`use-card use-kit${current === "pose" ? " on" : ""}`}>
          <span className="use-img"><IconTool size={40} /></span>
          <span className="use-body">
            <span className="use-title"><IconTool size={20} /> Matériel de pose</span>
            <span className="use-lead">{kitGroups().map((g) => g.title).join(", ")}.</span>
            <span className="use-foot"><span className="use-count">Voir le matériel <IconChevron size={14} /></span></span>
          </span>
        </Link>
      )}
    </div>
  );
}

/** Repères pour choisir : uniquement des informations présentes sur les fiches (λ, R, parement, surfaces). */
export function LvGuide() {
  const pal = lv.filter((p) => p.cu === "palette" && p.m2).map((p) => p.m2 as number);
  return (
    <section className="guide" aria-labelledby="guide">
      <h2 id="guide">Bien choisir sa laine de verre</h2>
      <div className="guide-grid">
        <div>
          <h3>La résistance thermique R</h3>
          <p>Exprimée en m².K/W, elle indique la performance de l'isolant : plus R est élevé, plus l'isolation est efficace.
            Elle augmente avec l'épaisseur : en λ 0,040 (IBR, Ecolaine, MRK40), 100 mm donnent R = 2,5, 200 mm R = 5 et 280 mm R = 7.
            Le GR 32, en λ 0,032, atteint R = 3,15 dès 100 mm.</p>
        </div>
        <div>
          <h3>Nue ou revêtue kraft</h3>
          <p>Le papier kraft forme un pare-vapeur sur une face de l'isolant. La version nue, sans parement, s'associe à une membrane
            pare-vapeur indépendante ou se pose en seconde couche.</p>
        </div>
        <div>
          <h3>À l'unité ou à la palette</h3>
          <p>Rouleaux et sacs à l'unité pour les petites surfaces ; palettes de {num(Math.min(...pal))} à {num(Math.max(...pal))} m² pour les chantiers.
            Le prix au m² affiché sur chaque produit permet de comparer, et le calculateur de chaque fiche indique la quantité nécessaire.</p>
        </div>
      </div>
    </section>
  );
}

const short = (name: string) => name.replace(/^laine de verre\s*/i, "").replace(/\s*[–-]\s*vendue? à la palette$/i, "")
  .replace(/\b\d+\s?mm\b/i, "").replace(/\bR\s?=\s?[\d,]+/, "").replace(/\s{2,}/g, " ").trim();

/** Tableau comparatif des palettes : épaisseur, R, surface, prix au m² et prix de la palette. */
export function PaletteTable({ items }: { items: Card[] }) {
  const rows = items.filter((p) => p.cu === "palette" && p.ppm2 != null);
  if (!rows.length) return null;
  const groups = USES.map((u) => ({ u, rows: rows.filter((p) => p.use === u.key).sort((a, b) => (a.thickness ?? 0) - (b.thickness ?? 0) || (a.ppm2 ?? 0) - (b.ppm2 ?? 0)) })).filter((g) => g.rows.length);
  return (
    <div className="tbl-wrap">
      <table className="ptable">
        <thead><tr><th scope="col">Produit</th><th scope="col">Épaisseur</th><th scope="col">R</th><th scope="col">Surface</th><th scope="col">Prix au m²</th><th scope="col">Prix palette</th></tr></thead>
        {groups.map((g) => (
          <tbody key={g.u.key}>
            <tr className="ptable-group"><th colSpan={6} scope="colgroup">{g.u.title}</th></tr>
            {g.rows.map((p) => (
              <tr key={p.slug}>
                <td><Link href={`/produit/${p.slug}`}>{short(p.name)}</Link></td>
                <td>{p.thickness} mm</td>
                <td>{p.r != null ? num(p.r) : "–"}</td>
                <td>{num(p.m2 as number)} m²</td>
                <td className="num strong">{eur(p.ppm2 as number)}</td>
                <td className="num">{eur(p.price as number)}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
