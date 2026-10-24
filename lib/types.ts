// Types partagés (serveur et navigateur)
export type Card = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  sku: string;
  family: string;
  familyName: string;
  sub: string;
  subName: string;
  image: string;
  w: number;
  h: number;
  price: number | null;
  priceMax: number | null;
  variable: boolean;
  nvar: number;
  buyId: string;
  buyLabel: string;
  pack: string;
  thickness: number | null;
  pickup: boolean;
  position: number;
  /** Résistance thermique R (m².K/W), lue sur la fiche */
  r?: number;
  /** Laine de verre : usage (combles, murs, souffler), revêtement, mode de vente */
  use?: string;
  facing?: string;
  sale?: string;
  /** Surface couverte par unité de vente (m²), unité de vente et prix au m² calculé */
  m2?: number;
  cu?: string;
  ppm2?: number;
};

export type SubFamily = { slug: string; name: string; count: number; image: string };
export type Family = { key: string; slug: string; name: string; count: number; image: string; subs: SubFamily[] };
export type NavFamily = { slug: string; name: string; count: number; subs: { slug: string; name: string; count: number }[] };

export type Variant = { id: string; label: string; price: number; sku: string };
export type Photo = { src: string; sm: string; w: number; h: number };
export type Detail = {
  short: string;
  desc: string;
  images: Photo[];
  attrs: { name: string; values: string[] }[];
  variants: Variant[];
  lead: string;
  cats: string[];
  cover?: Cover;
};
export type Cover = { m2: number; unit: string; inner: { n: number; m2: number; kind: string } | null };
