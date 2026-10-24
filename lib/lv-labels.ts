// Libellés de la laine de verre partagés avec les composants navigateur (sans dépendance au catalogue)
export const LV_USES = [
  { key: "combles", slug: "combles", nav: "Combles", title: "Combles et planchers" },
  { key: "murs", slug: "murs", nav: "Murs", title: "Murs" },
  { key: "souffler", slug: "laine-a-souffler", nav: "Laine à souffler", title: "Laine à souffler" },
];
export const USE_LABEL: Record<string, string> = Object.fromEntries(LV_USES.map((u) => [u.key, u.title]));
export const SALE_LABEL: Record<string, string> = { unite: "À l'unité", palette: "À la palette" };
// Résistance thermique R regroupée par tranches (m².K/W)
export const rBucket = (r?: number) => (r == null ? null : r < 3 ? "0" : r < 5 ? "3" : r < 7 ? "5" : "7");
export const R_LABEL: Record<string, string> = { "0": "Moins de 3", "3": "De 3 à 4,9", "5": "De 5 à 6,9", "7": "7 et plus" };
