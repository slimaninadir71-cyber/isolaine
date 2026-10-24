// Informations de l'enseigne et de l'entreprise exploitante (vérifiées au registre national des entreprises)
export const SITE = {
  name: "Isolaine",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://iso-laine.com",
  domain: "iso-laine.com",
  tagline: "Laine de verre, isolants et matériaux de façade",
  delivery: "Livraison offerte en France métropolitaine et en Belgique",
};

export const COMPANY = {
  legalName: "GDS CREATIV",
  form: "Société par actions simplifiée (SAS)",
  siren: "539 967 158",
  siret: "539 967 158 00038",
  rcs: "RCS Bobigny 539 967 158",
  vat: "FR31539967158",
  address: "135 rue Diderot, 93700 Drancy, France",
  director: "Le Président de la société GDS CREATIV",
};

export const HOST = {
  name: "Vercel Inc.",
  address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  site: "vercel.com",
};

export const DATA_HOST = {
  name: "Supabase Inc.",
  detail: "base de données hébergée dans l’Union européenne (région Paris, France)",
  site: "supabase.com",
};
