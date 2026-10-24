import Link from "next/link";
import { families } from "@/lib/catalog";
import { SearchBox } from "@/components/SearchBox";

export default function NotFound() {
  return (
    <div className="wrap page narrow">
      <div className="empty notfound">
        <p className="nf-code">404</p>
        <h1>Cette page n'existe pas ou plus</h1>
        <p className="muted">Le produit a peut-être changé d'adresse. Recherchez-le ou parcourez nos familles.</p>
        <div className="cat-search"><SearchBox /></div>
        <div className="sub-pills">
          {families.map((f) => <Link key={f.slug} href={`/categorie/${f.slug}`} className="pill">{f.name}</Link>)}
        </div>
        <Link href="/" className="btn btn-primary">Retour à l'accueil</Link>
      </div>
    </div>
  );
}
