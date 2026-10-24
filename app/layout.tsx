import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./lv.css";
import { CartProvider } from "@/lib/cart";
import { navFamilies } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Isolaine – Laine de verre et isolants, livraison offerte", template: "%s | Isolaine" },
  description: "Laine de verre Isover et Ursa pour combles, murs et soufflage, avec le prix au m² et la livraison offerte en France métropolitaine et en Belgique. Vente à l'unité ou à la palette, devis pour les chantiers.",
  applicationName: SITE.name,
  openGraph: { type: "website", siteName: SITE.name, locale: "fr_FR" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#0f2233", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <CartProvider>
          <Header families={navFamilies} />
          <main id="contenu" tabIndex={-1}>{children}</main>
          <Footer families={navFamilies} />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
