import Link from "next/link";
import type { NavFamily } from "@/lib/types";
import { COMPANY, SITE } from "@/lib/site";
import { LV_USES } from "@/lib/lv-labels";
import { Logo } from "./Logo";

export default function Footer({ families }: { families: NavFamily[] }) {
  return (
    <footer className="ftr">
      <div className="wrap ftr-grid">
        <div className="ftr-brand">
          <Logo light />
          <p>{SITE.tagline} pour les particuliers et les professionnels du bâtiment. Prix au m² affiché, vente à l'unité ou à la palette, livraison offerte.</p>
          <p className="ftr-small">Site édité par {COMPANY.legalName}, {COMPANY.form.split(" (")[0].toLowerCase()} – SIREN {COMPANY.siren}.</p>
        </div>
        <nav aria-label="Familles de produits">
          <p className="ftr-h">Nos produits</p>
          <ul>
            <li><Link href="/laine-de-verre">Laine de verre</Link></li>
            {LV_USES.map((u) => <li key={u.key}><Link href={`/laine-de-verre/${u.slug}`}>{u.title}</Link></li>)}
            <li><Link href="/laine-de-verre/materiel-de-pose">Matériel de pose</Link></li>
            <li><Link href="/categorie/isolants">Autres isolants</Link></li>
            <li><Link href="/boutique">Tout le catalogue ({families.reduce((n, f) => n + f.count, 0)})</Link></li>
          </ul>
        </nav>
        <nav aria-label="Aide">
          <p className="ftr-h">Commander</p>
          <ul>
            <li><Link href="/livraison-retours#commande">Comment commander</Link></li>
            <li><Link href="/contact?type=devis">Demander un devis</Link></li>
            <li><Link href="/livraison-retours">Livraison et retours</Link></li>
            <li><Link href="/contact">Nous contacter</Link></li>
          </ul>
        </nav>
        <nav aria-label="Informations légales">
          <p className="ftr-h">Informations</p>
          <ul>
            <li><Link href="/mentions-legales">Mentions légales</Link></li>
            <li><Link href="/cgv">Conditions générales de vente</Link></li>
            <li><Link href="/confidentialite">Données personnelles</Link></li>
            <li><Link href="/cookies">Cookies</Link></li>
          </ul>
        </nav>
      </div>
      <div className="wrap ftr-bottom">
        <span>© {new Date().getFullYear()} {SITE.name} – {SITE.domain}</span>
        <span>Prix en euros. Règlement après confirmation de la commande.</span>
      </div>
    </footer>
  );
}
