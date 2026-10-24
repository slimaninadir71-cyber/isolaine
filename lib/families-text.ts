// Présentations courtes des familles (rédigées à partir des produits réellement présents au catalogue)
export const FAMILY_TEXT: Record<string, { short: string; intro: string }> = {
  isolants: {
    short: "Laine de verre, laine de roche, laine de bois, polystyrène et membranes.",
    intro: "Isolants pour les murs, les combles, les toitures et les façades : laines minérales et laine de bois, polystyrène expansé, extrudé et graphité, panneaux de toiture et de soubassement, kits d'isolation par l'extérieur, membranes et sous-couches.",
  },
  enduits: {
    short: "Colles, sous-enduits, treillis, primaires et enduits de finition.",
    intro: "Tout le système d'enduit pour l'isolation par l'extérieur et la rénovation : colles et sous-enduits de marouflage, armatures en fibre de verre, primaires d'accroche, enduits de finition, ragréages et chapes.",
  },
  "profiles-de-facade": {
    short: "Profilés de départ, de couronnement, cornières et profilés PVC.",
    intro: "Profilés aluminium et PVC pour la pose d'un système d'isolation par l'extérieur : rails de départ dans toutes les épaisseurs, profilés de couronnement, cornières d'angle, goutte d'eau et joints de dilatation.",
  },
  "decoration-de-facade": {
    short: "Contours de fenêtre, corniches, appuis et pierres de bossage.",
    intro: "Éléments de modénature pour habiller une façade isolée : contours et appuis de fenêtre, corniches sous toiture, moulures et pierres de bossage. Ces produits sont disponibles sur commande, avec un délai d'approvisionnement indiqué sur chaque fiche, et se retirent en magasin.",
  },
  quincaillerie: {
    short: "Chevilles d'isolation, fixations de volets, vis et fixations techniques.",
    intro: "Fixations adaptées aux isolants : chevilles à clou métal ou nylon, chevilles pour support plein, fixations de volets et de gonds sur isolation, vis à bois et fixations techniques.",
  },
  outillage: {
    short: "Platoirs, taloches, électroportatif, protection et consommables.",
    intro: "L'outillage du façadier et du plaquiste : platoirs, taloches et spatules, couteaux et scies, outillage électroportatif et accessoires, mesure, équipements de protection, bâches, adhésifs et consommables de chantier.",
  },
  "cloison-et-platrerie": {
    short: "Trappes de visite, plaques de plâtre et ossatures.",
    intro: "Produits pour les cloisons et l'isolation par l'intérieur : trappes de visite, plaques de plâtre et de ciment, montants, rails et fourrures.",
  },
  "energies-renouvelables": {
    short: "Poêles et chaudières à granulés, chauffe-eau et accessoires.",
    intro: "Équipements de chauffage et d'eau chaude : poêles et chaudières à granulés, chauffe-eau thermodynamiques et solaires, ainsi que les accessoires de raccordement et de sécurité.",
  },
  accessoires: {
    short: "Gouttières, descentes, anti-pigeons et accessoires.",
    intro: "Gouttières, descentes d'eaux pluviales, raccords et crochets, dispositifs anti-pigeons et accessoires divers.",
  },
};

export const familyShort = (slug: string) => FAMILY_TEXT[slug]?.short ?? "";
export const familyIntro = (slug: string) => FAMILY_TEXT[slug]?.intro ?? "";
