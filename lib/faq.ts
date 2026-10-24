// Questions fréquentes : réponses reprises de la page Livraison et retours, des CGV et des informations de l'exploitant.
// Ne rien ajouter qui n'y figure pas.
export type Faq = { q: string; a: string; link?: { href: string; label: string } };

export const FAQ: Faq[] = [
  { q: "Où livrez-vous ?",
    a: "En France métropolitaine et en Belgique. La livraison est offerte quel que soit le montant de la commande, pour tous les produits livrables. Les produits signalés « Retrait en magasin uniquement » ne sont pas livrés." },
  { q: "Quand ma commande part-elle ?",
    a: "La marchandise est expédiée sous 24 h après réception du règlement. Certains produits approvisionnés sur commande portent un délai d'approvisionnement, affiché sur leur fiche." },
  { q: "Dois-je payer en ligne ?",
    a: "Non. Aucun paiement n'est demandé à l'envoi de la commande. Nous vérifions la disponibilité, puis nous vous confirmons la livraison et les modalités de règlement." },
  { q: "Combien de rouleaux ou de palettes faut-il ?",
    a: "Chaque fiche produit affiche le prix au m² et un calculateur qui indique la quantité nécessaire pour votre surface." },
  { q: "Je commande pour un chantier, plusieurs palettes : comment faire ?",
    a: "Demandez un devis en indiquant les références, les quantités, l'adresse de livraison et le délai souhaité.",
    link: { href: "/contact?type=devis", label: "Demander un devis" } },
  { q: "Puis-je retourner un produit ?",
    a: "Si vous êtes un particulier, vous disposez de quatorze jours après réception pour vous rétracter. Les produits sont à retourner complets et dans leur état d'origine, les frais de retour restant à votre charge.",
    link: { href: "/livraison-retours", label: "Livraison et retours" } },
  { q: "Les produits sont-ils garantis ?",
    a: "Oui : garantie légale de conformité (deux ans à compter de la livraison pour les particuliers) et garantie contre les vices cachés.",
    link: { href: "/cgv", label: "Conditions générales de vente" } },
];

/** Questions reprises sur les fiches produit (livraison, paiement, retours). */
export const FAQ_PRODUCT = [FAQ[1], FAQ[0], FAQ[2], FAQ[5]];
