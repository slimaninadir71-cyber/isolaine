import Link from "next/link";
import type { NavFamily, NavRayon } from "@/lib/types";
import { COMPANY, SITE } from "@/lib/site";
import { LV_USES } from "@/lib/lv-labels";
import { Logo } from "./Logo";
import { LeadCapture } from "./LeadCapture";

export default function Footer({ families, rayons }: { families: NavFamily[]; rayons: NavRayon[] }) {
  return (
    <footer className="ftr">
      <div className="wrap"><LeadCapture source="pied-de-page" variant="footer" /></div>
      <div className="wrap ftr-grid">
        <div className="ftr-brand">
          <Logo light />
          <p>Isolants, ossature, matériel de pose et outillage pour les particuliers et les professionnels du bâtiment. Prix au m² affiché, vente à l'unité ou à la palette, livraison offerte.</p>
          <p className="ftr-small">Site édité par {COMPANY.legalName}, {COMPANY.form.split(" (")[0].toLowerCase()} – SIREN {COMPANY.siren}.</p>
        </div>
        <nav aria-label="Isolation">
          <p className="ftr-h">Isolation</p>
          <ul>
            <li><Link href="/laine-de-verre">Laine de verre</Link></li>
            {LV_USES.map((u) => <li key={u.key}><Link href={`/laine-de-verre/${u.slug}`}>{u.title}</Link></li>)}
            <li><Link href="/categorie/isolants/laine-de-roche">Laine de roche</Link></li>
            <li><Link href="/laine-de-verre?vente=palette&tri=m2">Palettes</Link></li>
          </ul>
        </nav>
        <nav aria-label="Rayons">
          <p className="ftr-h">Rayons</p>
          <ul>
            {rayons.map((r) => <li key={r.key}><Link href={`/${r.slug}`}>{r.title}</Link></li>)}
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
        <span>Prix en euros. Paiement sécurisé par carte, livraison offerte.</span>
      </div>
    </footer>
  );
}
