# Fiche projet : Iso-Laine

À lire avant toute modification. Ce dépôt concerne **uniquement Iso-Laine**.

| | |
|---|---|
| Site | https://iso-laine.com |
| Code | GitHub `slimaninadir71-cyber/isolaine` (privé), branche de référence `adresse-facturation` (= `logo-et-guide` + adresse de facturation différente) |
| Vercel | équipe `dokmai`, projet **`isolaine`** (`prj_vJ88qLd3yLYANjMIHiaR5IVFvSQ1`), non relié à GitHub |
| Base de données | Supabase **`farcbnukknieppsxnzga`** (« isolaine-boutique », variable `NEXT_PUBLIC_SUPABASE_URL` sur Vercel). `kquzvuhieiavbwtutpfi` (projet Supabase encore nommé « isolaine ») est la base de **Destocklaine** : ne pas y toucher. |
| Paiement | CAWL, carte bancaire avec 3-D Secure (clés dans les variables d'environnement Vercel) |
| Activité | Isolants, ossature, matériel de pose, outillage ; livraison en France métropolitaine et Belgique |

Règles :
- **Ne jamais toucher au paiement** (`lib/cawl.ts`, `app/api/cawl/*`, `app/api/commande`, `app/commande/*`, `lib/reconcile.ts`) sans demande explicite : le site encaisse.
- Ne jamais relier ce projet Vercel à un autre dépôt. L'ancien projet `isolaine-demo` a été renommé `destocklaine` et sert destocklaine.com : ne jamais y déployer Iso-Laine.
- Toute modification passe d'abord par une branche et une version d'essai (aperçu Vercel), puis seulement par la mise en ligne.
- Mise en ligne : créer un déploiement de production du projet `isolaine` depuis la branche GitHub (source Git, cible production).

Versions en ligne :
- 12 novembre 2026, nuit : déploiement `isolaine-fgfnzkby8` (commit `821cf4b`, branche `adresse-facturation`) — case « Adresse de facturation différente » à la commande ; adresse enregistrée dans `orders.billing` (jsonb, colonne ajoutée le 12/11 dans la base `farcbnukknieppsxnzga`), reprise dans les e-mails client et équipe, et transmise à CAWL pour le 3-D Secure quand elle existe. Montants inchangés. Retour en arrière : `isolaine-csfptnk98` (la colonne peut rester).
- 12 novembre 2026, nuit : déploiement `isolaine-csfptnk98` (commit `f5d1275`, branche `logo-et-guide`) — nouveau logo Isolaine (fichiers dans `public/img/logo`) dans l'en-tête, le pied de page, le menu mobile, les icônes et l'en-tête des e-mails. Guide PDF repeint aux couleurs du site avec le logo : `docs/guide-isolation-isolaine.pdf`, à envoyer depuis l'administration (le PDF servi aux clients est stocké dans Supabase, pas dans le code). Retour en arrière : `isolaine-ias7ei8ah`.
- 12 novembre 2026, soir : déploiement `isolaine-ias7ei8ah` (commit `9f4fd5d`, branche `correctif-fiches-mobile`, créée depuis `habillage-mails-vert`) — fiches produit lisibles sur téléphone : cartes verticales dans les rangées qui défilent, étiquettes « −20 % » et « Palette » côte à côte, prix payé en grand puis prix barré et prix au m². Affichage seulement ; prix, remise et paiement inchangés. Retour en arrière : `isolaine-og2icvbj6`.
- 12 novembre 2026, 21 h 25 : déploiement `isolaine-og2icvbj6` (commit `91997c0`, branche `habillage-mails-vert`) — e-mails clients et e-mail équipe aux couleurs du site (vert foncé #173D32, vert clair #A8CD38, fond lin #F7F7F2). Habillage seulement, textes et paiement inchangés.
- 12 novembre 2026 : déploiement `isolaine-38vqd7lws` (commit `222ffe5`) — refonte « vitrine » : 5 rayons (Isolation, Fixation & ossature, Matériel de pose, Outillage, Autres produits), carrousels, tri « Les plus demandés », palette vert foncé / vert clair ; remise −20 %, paiement CAWL, guide et BIENVENUE10 inchangés.
- Retour en arrière possible vers `isolaine-rm7u1cbzd` (version du 12 novembre au matin, construite depuis les paquets Supabase).

Construction :
- Le code complet est dans ce dépôt. La branche `site-en-ligne` est la copie fidèle du site au 12 novembre 2026, reconstituée depuis les paquets Supabase `site-a` … `site-ap` (les paquets `site-aq` et suivants concernent Destocklaine). Ces paquets ne sont plus la source de vérité : ne plus déployer par ce moyen, sous peine d'effacer la refonte.
- Au moment du build, `scripts/fetch-catalog.mjs` lit le catalogue (produits, photos) dans Supabase et applique la remise de 20 % (prix facturé = prix remisé).
- L'ordre « Les plus demandés » est calculé dans `lib/score.ts` (commandes reçues + demande du marché) ; les rayons sont définis dans `lib/rayons.ts`.
