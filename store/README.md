<!-- Index de store/ : quel fichier remplit quel champ, de quelle console, et
     ce qu'il reste à produire. Les limites de caractères sont rappelées dans
     la colonne « limite » et répétées en tête de chaque fichier. -->

# store/ — quoi va où

Un fichier par champ de console, en français, prêt à copier-coller. Ce
document dit lequel va où, et ce qui manque encore.

Trois états : **prêt** (à coller tel quel), **🔴 propriétaire** (seul le
détenteur du compte peut le fournir), **🔴 à publier/saisir/vérifier** (prêt
dans le dépôt, reste à mettre en ligne, à saisir dans la console ou à
contrôler sur l'app installée).

Contenu décrit par ces fiches : version de contenu **2.1.1**, soit 308 leçons
(147 en CP1, 161 en CP2), 1 625 exercices et 824 sons, chiffres relevés par
`npm run validate:content` et dans `src/content/manifests/curriculum-v1.json`.

## App Store Connect

| Fichier | Champ exact de la console | Limite | État |
|---|---|---|---|
| `app-store/app-information.md` | *Informations sur l'app* : Nom, Langue principale, Bundle ID, SKU, Copyright, Catégories | Nom 30, SKU 100 | prêt |
| `app-store/description-fr.md` | *Sous-titre* et *Description* | 30 / 4 000 | prêt |
| `app-store/promotional-text-fr.md` | *Texte promotionnel* | 170 | prêt |
| `app-store/keywords-fr.md` | *Mots-clés* | 100 | prêt |
| `app-store/support-url.md` | *URL de support* | — | 🔴 à publier (`gh-pages`) |
| `app-store/content-rights.md` | *Droits sur le contenu* | — | prêt (« Oui » ; attributions sur `support.html#licences`, à publier ; SIWIS 🔴 à vérifier) |
| `app-store/age-rating.md` | *Classification par âge* (questionnaire 2025 complet, « Made for Kids » 6–8 ans) | — | prêt |
| `app-store/privacy-answers.md` | *Confidentialité de l'app* (App Privacy) : « Non, nous ne collectons pas de données » | — | prêt |
| `app-store/review-notes-fr.md` | *App Review Information* : Notes + bloc de contact | Notes 4 000 | 🔴 propriétaire (téléphone) |
| `app-store/screenshots/README.md` → `screenshots/out/app-store-iphone/` et `…/app-store-ipad/` | *Captures d'écran* iPhone 6,9" et iPad 13" | 1320×2868 / 2752×2064 | produites (10 + 10) ; 🔴 à vérifier sur l'app installée par TestFlight |
| `shared/release-notes-1.0.0-fr.md` | *Nouveautés de cette version* (Apple ne l'affiche en principe qu'à partir de la 2ᵉ version) | 4 000 | prêt |
| `app-store/screenshot-plan.md` | — (plan de tournage, pas un champ) | — | prêt |

## Play Console

| Fichier | Champ exact de la console | Limite | État |
|---|---|---|---|
| `google-play/title-fr.md` | *Fiche Play Store → Nom de l'application* | 30 | prêt |
| `google-play/short-description-fr.md` | *Description courte* | 80 | prêt |
| `google-play/full-description-fr.md` | *Description complète* | 4 000 | prêt |
| `google-play/store-settings.md` | *Paramètres de la fiche* : catégorie, tags | — | 🔴 à saisir (tags à confirmer) |
| `google-play/contact-details.md` | *Paramètres de la fiche → Coordonnées* | — | prêt |
| `google-play/graphics/icon-512.png` | *Icône de l'application* | 512×512 | prêt |
| `google-play/graphics/feature-graphic-1024x500.png` | *Image de mise en avant* | 1024×500 | prêt |
| `google-play/screenshots/README.md` → `screenshots/out/play-telephone/` et `…/play-tablette/` | *Captures d'écran* téléphone, tablette 7" et 10" (même jeu tablette dans les deux) | 2 min. téléphone, 8 max. ; tablette 16:9 | produites (8 en 1080 × 1920 + 8 en 1920 × 1080, depuis une capture de tablette Android) ; 🔴 à vérifier sur l'app installée par test interne |
| `shared/release-notes-1.0.0-fr.md` | *Version → Notes de version*, balise `<fr-FR>` | 500 | prêt (477 car.) |
| `google-play/declarations.md` | *Contenu de l'application* — index de toute la section | — | prêt |
| `google-play/app-access.md` | *Accès à l'application* | — | prêt |
| `google-play/app-content-declarations.md` | *Publicités*, *Actualités*, *Gouvernement*, *Finance*, *Santé*, *COVID-19* | — | prêt |
| `google-play/advertising-id.md` | *Identifiant publicitaire* | — | prêt |
| `google-play/content-rating-iarc.md` | *Classification du contenu* (questionnaire IARC) | — | prêt |
| `google-play/data-safety.md` | *Sécurité des données* : « Non » à la question de collecte ou de partage, le formulaire s'arrête là | — | prêt |
| `google-play/target-audience.md` | *Public cible et contenu* : 6-8 ans seulement, politique Familles d'office | — | prêt |
| `google-play/families-checklist.md` | — (exigences de la politique Familles) | — | prêt ; 🔴 autorisations du premier AAB à contrôler |
| `google-play/screenshot-plan.md` | — (plan de tournage, pas un champ) | — | prêt |

## Les deux consoles

| Fichier | Champ exact de la console | État |
|---|---|---|
| `shared/coordonnees-fiches.md` | source unique des URL, e-mail et téléphone des deux fiches | 🔴 propriétaire (téléphone) |
| `shared/contact-support.md` | décisions de support : page, adresse, délai annoncé | prêt |
| `shared/privacy-policy/index.html` | *URL de politique de confidentialité* (les deux) | 🔴 à republier : `gh-pages` porte la version du 5 septembre, sans la sauvegarde Android coupée ni la sauvegarde iCloud des iPhone et iPad (version du 4 octobre) |
| `shared/privacy-policy/support.html` | *URL de support* (Apple), page liée côté Play ; section « Licences » (`#licences`) à laquelle renvoie la carte « À propos » de l'app | 🔴 à publier : absent de `gh-pages` au 4 octobre |
| `shared/dsa-trader.md` | *Statut de professionnel* (DSA) — réponse retenue : non-professionnel | 🔴 à saisir |
| `shared/distribution.md` | *Pays et régions* (Play), *Prix et disponibilité* (Apple) | 🔴 à décider au-delà du Tchad et de la France |
| `shared/licences-tierces.md` | alimente *Content Rights* (Apple) et la section « Licences » de `support.html` | 🔴 attribution exacte du jeu de données SIWIS (les licences OFL sont livrées dans `assets/fonts/`, la licence MIT de Phosphor est publiée sur `support.html`) |
| `shared/mentions-programme-officiel.md` | la mention d'indépendance exigée dans les deux descriptions, l'app (carte « À propos ») et la page de support | prêt |
| `shared/terms-draft-fr.md` | hors console — CGU, à faire relire juridiquement | brouillon |
| `shared/privacy-policy-draft-fr.md` | hors console — renvoi vers la page en vigueur | prêt |
| `shared/release-notes-template-fr.md` | hors console — gabarit des versions suivantes | prêt |

## Arborescence

```
store/
├── README.md                     ← ce fichier
├── app-store/
│   ├── age-rating.md             app-information.md     content-rights.md
│   ├── description-fr.md         keywords-fr.md         privacy-answers.md
│   ├── promotional-text-fr.md    review-notes-fr.md     support-url.md
│   ├── screenshot-plan.md
│   └── screenshots/README.md     ← les images vivent dans store/screenshots/out/
├── google-play/
│   ├── advertising-id.md         app-access.md
│   ├── app-content-declarations.md  content-rating-iarc.md
│   ├── contact-details.md        data-safety.md         declarations.md
│   ├── families-checklist.md     full-description-fr.md short-description-fr.md
│   ├── store-settings.md         target-audience.md     title-fr.md
│   ├── screenshot-plan.md
│   ├── graphics/                 icon-512.png · feature-graphic-1024x500.png (+ .svg)
│   └── screenshots/README.md     ← les images vivent dans store/screenshots/out/
├── screenshots/                  ← la chaîne, commune aux deux stores
│   ├── plan.json                 les 10 plans, leur ordre, leurs légendes
│   ├── raw/                      28 captures brutes : <id>.png (iPhone 6,9"),
│   │                             <id>@tablette.png (iPad 13" paysage) et
│   │                             <id>@tablette-android.png (tablette 10")
│   └── out/                      36 images à téléverser : app-store-iphone (10)
│                                 app-store-ipad (10) · play-telephone (8)
│                                 play-tablette (8)
└── shared/
    ├── contact-support.md        coordonnees-fiches.md  distribution.md
    ├── dsa-trader.md             licences-tierces.md
    ├── mentions-programme-officiel.md
    ├── privacy-policy-draft-fr.md  terms-draft-fr.md
    ├── release-notes-1.0.0-fr.md   release-notes-template-fr.md
    └── privacy-policy/           index.html · support.html · README.md
```

Les dossiers `app-store/screenshots/` et `google-play/screenshots/` ne
contiennent **aucune image**, et c'est voulu : `store/screenshots/` est la
seule chaîne, pour les deux stores. Deux copies des mêmes fichiers
divergeraient au premier recadrage. Les deux `screenshots/README.md` disent où
regarder.

**Ce que sont les captures.** `raw/` est le rendu du vrai code de l'app par le
banc web (react-native-web), aux résolutions exactes de l'iPhone 6,9", de
l'iPad 13" et d'une tablette Android 10", avec le profil fictif « Amina »
(badges calculés par les règles de l'app) : aucun pixel dessiné ni retouché.
`scripts/tools/capture-store-screenshots.sh` les reproduit à l’identique.
Ce ne sont pas des captures d'appareil : avant de soumettre en revue, les
comparer à l'app installée par TestFlight et par le test interne Play, et
remplacer par une capture d'appareil tout écran qui diffère
(`screenshots/README.md`, « La règle d'abord »).

## Ce qui reste au propriétaire

Par ordre d'exécution. Les quatre premiers bloquent les **builds** ; les
suivants bloquent la **soumission en revue**. Marche à suivre détaillée :
`docs/deploiement-v1.md`.

| # | Manque | Bloque | Où |
|---|---|---|---|
| 1 | Confirmer **`td.ecolna.app`** comme identifiant définitif, sur Android comme sur iOS. Le nom de paquet Play ne change plus jamais après le premier envoi. | tout | `app.config.ts` le dit encore provisoire |
| 2 | Un accès EAS utilisable : un jeton `EXPO_TOKEN` (de préférence celui d'un utilisateur robot du compte `okimy`). Le plus simple : l'enregistrer comme secret `EXPO_TOKEN` du dépôt GitHub, puis lancer *Actions → Release EAS → Run workflow* (les runners de GitHub joignent expo.dev) | les builds | `docs/deploiement-v1.md` § 1.2 et § 2.4 |
| 3 | App Store Connect : créer la fiche (bundle `td.ecolna.app`), reporter son *Apple ID* numérique dans `eas.json` (`ascAppId`), enregistrer une clé API App Store Connect dans EAS | l'envoi iOS | `docs/deploiement-v1.md` § 1.3 |
| 4 | Play Console : créer l'app, créer un compte de service Google Cloud (API Google Play Android Developer activée, invité dans la Play Console avec le droit de publier en test), enregistrer son JSON dans EAS, créer la liste de testeurs internes | l'envoi Android | `docs/deploiement-v1.md` § 1.3 |
| 4 bis | Play Console : regarder si le tableau de bord de l'app affiche la tâche « Demander l'accès à la production ». Si oui (compte personnel créé après le 13 novembre 2023), un test fermé d'au moins 12 testeurs pendant 14 jours consécutifs est exigé avant la production | la production Play (pas le test interne) | `docs/deploiement-v1.md` § 0 |
| 5 | Republier `index.html` et publier `support.html` sur `gh-pages`, puis vérifier que les deux URL répondent en 200 | les deux fiches | `shared/privacy-policy/README.md` |
| 6 | Installer par TestFlight et par test interne, passer les gates manuelles sur appareil : l'app n'a encore **jamais tourné sur un appareil** | la revue | `docs/release-process.md` |
| 7 | Comparer chaque capture de `screenshots/out/` à l'app installée, remplacer celles qui diffèrent | la revue | `screenshots/README.md` |
| 8 | Téléphone du contact de revue Apple (non publié) | la revue iOS | `shared/coordonnees-fiches.md` |
| 9 | Saisir la déclaration DSA (non-professionnel) dans les deux consoles | la diffusion dans l'UE | `shared/dsa-trader.md` |
| 10 | Attribution exacte du jeu de données SIWIS | non, mais c'est une obligation de licence | `shared/licences-tierces.md` |
| 11 | Territoires au-delà du Tchad et de la France | non | `shared/distribution.md` |
| 12 | Les cinq tags Play, à choisir dans la liste fermée de la console | non | `google-play/store-settings.md` |

Côté code, plus rien ne bloque les métadonnées : la porte parentale pose une
multiplication tirée au hasard, saisie au clavier numérique, une autre après
chaque erreur, et les écrans de l'espace parent et des paramètres renvoient à
la porte tant qu'elle n'est pas franchie, lien profond compris
(`app-store/age-rating.md` § 1) ; la carte « À propos » cite le programme sans
le dire « conforme » et porte la phrase d'indépendance ; l'option de langue
« bientôt disponible » est retirée ; la rubrique « Classe » permet de passer du
CP1 au CP2 ; `ACCESS_NETWORK_STATE` est bloquée comme `INTERNET`. La seule
exception de release acceptée est la régression mémoire d'Hermes (SDK 56, à
lever en 1.1.0, `release-acceptances.json`), déjà reprise dans les notes de
version.

Builds et envoi en test : `scripts/tools/eas-release.sh`, qui vérifie tout
avant de construire et n'envoie jamais en revue — en local, ou depuis GitHub
par le workflow manuel « Release EAS » (`.github/workflows/release-eas.yml`). L'avancement d'ensemble est
suivi dans `docs/store-readiness.md`.
