# Fiche projet : Iso-Laine

À lire avant toute modification. Ce dépôt concerne **uniquement Iso-Laine**.

| | |
|---|---|
| Site | https://iso-laine.com |
| Code | GitHub `slimaninadir71-cyber/isolaine` (privé) |
| Vercel | équipe `dokmai`, projet `isolaine-demo` |
| Base de données | Supabase `kquzvuhieiavbwtutpfi` (projet « isolaine ») |
| Activité | Laine de verre, isolants et matériaux, livraison en France métropolitaine et Belgique |

Règles :
- Ne jamais relier ce projet Vercel à un autre dépôt (ChaudBois, Maxi Market…).
- Toute modification passe d'abord par une branche et une version d'essai, puis seulement par la mise en ligne.
- Version de référence en ligne au 24 octobre 2026 : déploiement `isolaine-demo-dr8pwgs8g` (23 octobre 2026).

Construction :
- Le code source complet est dans ce dépôt (récupéré le 24 octobre 2026 depuis l'ancien stockage Supabase, empreintes vérifiées).
- Au moment du build, `scripts/fetch-catalog.mjs` lit le catalogue (produits, photos) dans Supabase.
- GitHub vérifie automatiquement que le site se construit à chaque envoi (onglet Actions).
