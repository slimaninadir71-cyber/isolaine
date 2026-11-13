# Fiche projet : Iso-Laine

À lire avant toute modification. Ce dépôt concerne **uniquement Iso-Laine**.

| | |
|---|---|
| Site | https://iso-laine.com |
| Code | GitHub `slimaninadir71-cyber/isolaine` (privé), **branche unique de référence : `main`** (identique à la version en ligne `isolaine-miqqdjgy0`). Toute modification part de `main`, dans une branche courte, puis revient dans `main` après la mise en ligne. Les anciennes branches sont archivées en étiquettes `archive/<nom>`. |
| Vercel | équipe `dokmai`, projet **`isolaine`** (`prj_vJ88qLd3yLYANjMIHiaR5IVFvSQ1`), non relié à GitHub |
| Base de données | Supabase **`farcbnukknieppsxnzga`** (« isolaine-boutique », variable `NEXT_PUBLIC_SUPABASE_URL` sur Vercel). `kquzvuhieiavbwtutpfi` (projet Supabase encore nommé « isolaine ») est la base de **Destocklaine** : ne pas y toucher. |
| Paiement | CAWL, carte bancaire avec 3-D Secure (clés dans les variables d'environnement Vercel) |
| Activité | Isolants, ossature, matériel de pose, outillage ; livraison en France métropolitaine et Belgique |

Règles :
- **Ne jamais toucher au paiement** (`lib/cawl.ts`, `app/api/cawl/*`, `app/api/commande`, `app/commande/*`, `lib/reconcile.ts`) sans demande explicite : le site encaisse.
- Ne jamais relier ce projet Vercel à un autre dépôt. L'ancien projet `isolaine-demo` a été renommé `destocklaine` et sert destocklaine.com : ne jamais y déployer Iso-Laine.
- Toute modification passe d'abord par une branche et une version d'essai (aperçu Vercel), puis seulement par la mise en ligne.
- Mise en ligne : créer un déploiement de production du projet `isolaine` depuis la branche GitHub (source Git, cible production), puis ramener cette branche dans `main` (avance rapide) pour que `main` reste égale à la version en ligne.
- Un seul intervenant à la fois sur le site (Claude Code ou Claude), toujours à partir de `main` à jour.

Versions en ligne :
- 13 novembre 2026, 10 h 40 : déploiement `isolaine-miqqdjgy0` (commit `c3239f5`, branche `suivi-confirmation`) — colonnes `orders.customer_mail_at` et `orders.customer_mail_error` (créées dans farcb le 13/11 avant la mise en ligne) ; la confirmation client est tracée après chaque paiement ; onglet Clients : colonne « Confirmation client » et bouton « Renvoyer la confirmation ».
- 13 novembre 2026, 10 h 30 : déploiement `isolaine-g77zyoizo` (commit `a0ae201`, branche `ecrire-au-client`) — onglet « Clients » dans /admin : messages reçus (Répondre), commandes (Écrire), formulaire libre ; envoi depuis commandes@iso-laine.com, reply-to et copie cachée vers ORDER_EMAIL_TO. Paiement et e-mails automatiques inchangés.
- 13 novembre 2026, 10 h 20 : colonne `orders.billing` (jsonb) ajoutée dans la base Iso-Laine `farcbnukknieppsxnzga`. Elle manquait depuis la mise en ligne de l'adresse de facturation (12/11, 23 h 46) : le paiement par carte et les commandes avec adresse de facturation échouaient. Toute nouvelle colonne doit être créée dans **farcb** AVANT la mise en ligne.
- 13 novembre 2026, 10 h 08 : déploiement `isolaine-asevjkwef` (commit `1ce4848`, branche `correctif-mail-guide`) — clé anti-doublon des e-mails du guide propre à iso-laine.com (`iso-laine.com-campagne-…`). Le compte Resend est partagé avec Destocklaine : l'ancienne clé `isolaine-…` entrait en conflit (erreur 409, guide non reçu par le prospect n°2 du 12/11). Rien d'autre de modifié.
- 12 novembre 2026, nuit : déploiement `isolaine-fgfnzkby8` (commit `821cf4b`, branche `adresse-facturation`) — case « Adresse de facturation différente » à la commande ; adresse enregistrée dans `orders.billing` (jsonb, colonne ajoutée le 12/11 dans la base `farcbnukknieppsxnzga`), reprise dans les e-mails client et équipe, et transmise à CAWL pour le 3-D Secure quand elle existe. Montants inchangés. Retour en arrière : `isolaine-csfptnk98` (la colonne peut rester).
- 12 novembre 2026, nuit : déploiement `isolaine-csfptnk98` (commit `f5d1275`, branche `logo-et-guide`) — nouveau logo Isolaine (fichiers dans `public/img/logo`) dans l'en-tête, le pied de page, le menu mobile, les icônes et l'en-tête des e-mails. Guide PDF repeint aux couleurs du site avec le logo : `docs/guide-isolation-isolaine.pdf`, à envoyer depuis l'administration (le PDF servi aux clients est stocké dans Supabase, pas dans le code). Retour en arrière : `isolaine-ias7ei8ah`.
- 12 novembre 2026, soir : déploiement `isolaine-ias7ei8ah` (commit `9f4fd5d`, branche `correctif-fiches-mobile`, créée depuis `habillage-mails-vert`) — fiches produit lisibles sur téléphone : cartes verticales dans les rangées qui défilent, étiquettes « −20 % » et « Palette » côte à côte, prix payé en grand puis prix barré et prix au m². Affichage seulement ; prix, remise et paiement inchangés. Retour en arrière : `isolaine-og2icvbj6`.
- 12 novembre 2026, 21 h 25 : déploiement `isolaine-og2icvbj6` (commit `91997c0`, branche `habillage-mails-vert`) — e-mails clients et e-mail équipe aux couleurs du site (vert foncé #173D32, vert clair #A8CD38, fond lin #F7F7F2). Habillage seulement, textes et paiement inchangés.
- 12 novembre 2026 : déploiement `isolaine-38vqd7lws` (commit `222ffe5`) — refonte « vitrine » : 5 rayons (Isolation, Fixation & ossature, Matériel de pose, Outillage, Autres produits), carrousels, tri « Les plus demandés », palette vert foncé / vert clair ; remise −20 %, paiement CAWL, guide et BIENVENUE10 inchangés.
- Retour en arrière possible vers `isolaine-rm7u1cbzd` (version du 12 novembre au matin, construite depuis les paquets Supabase).

Construction :
- Le code complet est dans ce dépôt. L'étiquette `archive/site-en-ligne` est la copie fidèle du site au 12 novembre 2026, reconstituée depuis les paquets Supabase `site-a` … `site-ap` (les paquets `site-aq` et suivants concernent Destocklaine). Ces paquets ne sont plus la source de vérité : ne plus déployer par ce moyen, sous peine d'effacer la refonte.
- Au moment du build, `scripts/fetch-catalog.mjs` lit le catalogue (produits, photos) dans Supabase et applique la remise de 20 % (prix facturé = prix remisé).
- L'ordre « Les plus demandés » est calculé dans `lib/score.ts` (commandes reçues + demande du marché) ; les rayons sont définis dans `lib/rayons.ts`.
