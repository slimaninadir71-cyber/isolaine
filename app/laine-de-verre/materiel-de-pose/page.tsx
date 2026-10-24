import Link from "next/link";
import type { Metadata } from "next";
import { kitGroups } from "@/lib/laine";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { UseTiles } from "@/components/LvBlocks";

export const metadata: Metadata = {
  title: "Matériel de pose pour laine de verre",
  description: "Pare-vapeur, couteaux à laine, trappe de combles, protections de spots, ossature, plaques de plâtre et équipements de protection pour poser votre laine de verre. Livraison offerte.",
  alternates: { canonical: "/laine-de-verre/materiel-de-pose" },
};

export default function MaterielDePose() {
  const groups = kitGroups();
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ name: "Laine de verre", href: "/laine-de-verre" }, { name: "Matériel de pose" }]} />
      <header className="cat-head">
        <h1>Matériel de pose pour laine de verre</h1>
        <p className="cat-intro">Tout ce qu'il faut autour de l'isolant : {groups.map((g) => g.title.toLowerCase()).join(", ")}.</p>
      </header>
      <nav className="sub-pills" aria-label="Rubriques">
        {groups.map((g) => <a key={g.key} href={`#${g.key}`} className="pill">{g.title} <small>{g.items.length}</small></a>)}
        <Link href="/laine-de-verre" className="pill">Toute la laine de verre</Link>
      </nav>
      {groups.map((g) => (
        <section key={g.key} id={g.key} className="section-tight kit-sec" aria-labelledby={`h-${g.key}`}>
          <div className="section-head">
            <div>
              <h2 id={`h-${g.key}`}>{g.title}</h2>
              <p className="section-sub">{g.text}</p>
            </div>
          </div>
          <div className="grid grid-row">{g.items.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        </section>
      ))}
      <section className="section-tight" aria-labelledby="usages">
        <h2 id="usages">Choisir sa laine de verre</h2>
        <UseTiles current="pose" kit={false} />
      </section>
    </div>
  );
}
