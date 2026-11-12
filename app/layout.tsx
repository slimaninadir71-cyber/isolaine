import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./lv.css";
import "./vitrine.css";
import { CartProvider } from "@/lib/cart";
import { navFamilies } from "@/lib/catalog";
import { RAYONS, rayonLinks, rayonProducts } from "@/lib/rayons";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AskButton } from "@/components/AskButton";

const head = Archivo({ subsets: ["latin"], display: "swap", variable: "--font-head", axes: ["wdth"] });
const body = Source_Sans_3({ subsets: ["latin"], display: "swap", variable: "--font-body" });

// Menu des rayons (données simples, transmises à l'en-tête et au pied de page)
const NAV = RAYONS.map((r) => ({ key: r.key, slug: r.slug, title: r.title, short: r.short, total: rayonProducts(r).length, links: rayonLinks(r) }));

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Isolaine – Laine de verre et isolants, livraison offerte", template: "%s | Isolaine" },
  description: "Laine de verre Isover et Ursa pour combles, murs et soufflage, avec le prix au m² et la livraison offerte en France métropolitaine et en Belgique. Vente à l'unité ou à la palette, devis pour les chantiers.",
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, locale: "fr_FR" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#173D32", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${head.variable} ${body.variable}`}>
      <body>
        <CartProvider>
          <Header families={navFamilies} rayons={NAV} />
          <main id="contenu" tabIndex={-1}>{children}</main>
          <Footer families={navFamilies} rayons={NAV} />
          <AskButton />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
