<!-- Index de store/ : quel fichier remplit quel champ, de quelle console, et
     ce qu'il reste à produire. Les limites de caractères sont rappelées dans
     la colonne « limite » et répétées en tête de chaque fichier. -->

# store/ — quoi va où

Un fichier par champ de console, en français, prêt à copier-coller. Ce
document dit lequel va où, et ce qui manque encore.

Trois états : **prêt** (à coller tel quel), **🔴 propriétaire** (seul le
détenteur du compte peut le fournir), **🔴 à publier/saisir** (prêt dans le
dépôt, reste à mettre en ligne ou dans la console).

## App Store Connect

| Fichier | Champ exact de la console | Limite | État |
|---|---|---|---|
| `app-store/app-information.md` | *Informations sur l'app* : Nom, Langue principale, Bundle ID, SKU, Copyright, Catégories | Nom 30, SKU 100 | prêt |
| `app-store/description-fr.md` | *Sous-titre* et *Description* | 30 / 4 000 | prêt |
| `app-store/promotional-text-fr.md` | *Texte promotionnel* | 170 | prêt |
| `app-store/keywords-fr.md` | *Mots-clés* | 100 | prêt |
| `app-store/support-url.md` | *URL de support* | — | 🔴 à publier (`gh-pages`) |
| `app-store/content-rights.md` | *Droits sur le contenu* | — | prêt |
| `app-store/age-rating.md` | *Classification par âge* (questionnaire complet) | — | prêt |
| `app-store/privacy-answers.md` | *Confidentialité de l'app* (App Privacy) | — | prêt |
| `app-store/review-notes-fr.md` | *App Review Information* : Notes + bloc de contact | Notes 4 000 | 🔴 propriétaire (téléphone) |
| `app-store/screenshots/README.md` | *Captures d'écran* iPhone 6,9" et iPad 13" | 1320×2868 / 2752×2064 | 🔴 propriétaire |
| `shared/release-notes-1.0.0-fr.md` | *Nouveautés de cette version* | 4 000 | prêt |
| `app-store/screenshot-plan.md` | — (plan de tournage, pas un champ) | — | prêt |

## Play Console

| Fichier | Champ exact de la console | Limite | État |
|---|---|---|---|
| `google-play/title-fr.md` | *Fiche Play Store → Nom de l'application* | 30 | prêt |
| `google-play/short-description-fr.md` | *Description courte* | 80 | prêt |
| `google-play/full-description-fr.md` | *Description complète* | 4 000 | prêt |
| `google-play/store-settings.md` | *Paramètres de la fiche* : catégorie, tags | — | 🔴 à saisir (tags à confirmer) |
| `google-play/contact-details.md` | *Paramètres de la fiche → Coordonnées* | — | prêt |
| `google-play/graphics/icon-512.png` | *Icône de l'application* | 512×512 | prêt |
| `google-play/graphics/feature-graphic-1024x500.png` | *Image de mise en avant* | 1024×500 | prêt |
| `google-play/screenshots/README.md` | *Captures d'écran* téléphone, tablette 7" et 10" | 2 min. téléphone | 🔴 propriétaire |
| `google-play/declarations.md` | *Contenu de l'application* — index de toute la section | — | prêt |
| `google-play/app-access.md` | *Accès à l'application* | — | prêt |
| `google-play/app-content-declarations.md` | *Publicités*, *Actualités*, *Gouvernement*, *Finance*, *Santé*, *COVID-19* | — | prêt |
| `google-play/advertising-id.md` | *Identifiant publicitaire* | — | prêt |
| `google-play/content-rating-iarc.md` | *Classification du contenu* (questionnaire IARC) | — | prêt |
| `google-play/data-safety.md` | *Sécurité des données* | — | prêt |
| `google-play/target-audience.md` | *Public cible et contenu* | — | prêt |
| `google-play/families-checklist.md` | — (conditions du programme Familles) | — | prêt |
| `google-play/screenshot-plan.md` | — (plan de tournage, pas un champ) | — | prêt |

## Les deux consoles

| Fichier | Champ exact de la console | État |
|---|---|---|
| `shared/coordonnees-fiches.md` | source unique des URL, e-mail et téléphone des deux fiches | 🔴 propriétaire (téléphone) |
| `shared/contact-support.md` | décisions de support : page, adresse, délai annoncé | prêt |
| `shared/privacy-policy/index.html` | *URL de politique de confidentialité* (les deux) | 🔴 à publier |
| `shared/privacy-policy/support.html` | *URL de support* (Apple), page liée côté Play | 🔴 à publier |
| `shared/dsa-trader.md` | *Statut de professionnel* (DSA) — réponse retenue : non-professionnel | 🔴 à saisir |
| `shared/distribution.md` | *Pays et régions* (Play), *Prix et disponibilité* (Apple) | 🔴 à décider au-delà du Tchad et de la France |
| `shared/licences-tierces.md` | alimente *Content Rights* (Apple) et l'écran « À propos » | 🔴 `OFL.txt`, licence SIWIS |
| `shared/mentions-programme-officiel.md` | la mention d'indépendance exigée dans les deux descriptions | prêt |
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
│   ├── plan.json                 les 9 plans, leur ordre, leurs légendes
│   ├── raw/                      🔴 VIDE — captures brutes de l'app
│   └── out/                      app-store-iphone · app-store-ipad
│                                 play-telephone · play-tablette
└── shared/
    ├── contact-support.md        coordonnees-fiches.md  distribution.md
    ├── dsa-trader.md             licences-tierces.md
    ├── mentions-programme-officiel.md
    ├── privacy-policy-draft-fr.md  terms-draft-fr.md
    ├── release-notes-1.0.0-fr.md   release-notes-template-fr.md
    └── privacy-policy/           index.html · support.html · README.md
```

Les dossiers de captures ne contiennent **aucune image**, et c'est voulu :
`store/screenshots/` est la seule chaîne, pour les deux stores. Deux copies des
mêmes fichiers divergeraient au premier recadrage. Les deux `screenshots/README.md`
disent où regarder.

## Ce qui reste au propriétaire

| # | Manque | Bloquant | Fichier |
|---|---|---|---|
| 1 | Captures depuis l'app qui tourne : iPhone 6,9", iPad 13", téléphone et tablette Android | oui, les deux fiches | `*/screenshots/README.md` |
| 2 | Publier `index.html` et `support.html` sur `gh-pages`, vérifier les deux URL en 200 | oui, les deux fiches | `shared/privacy-policy/README.md` |
| 3 | Téléphone du contact de revue Apple (non publié) | oui, côté iOS | `shared/coordonnees-fiches.md` |
| 4 | Saisir la déclaration DSA (non-professionnel) dans les deux consoles | oui pour l'UE | `shared/dsa-trader.md` |
| 5 | `assets/fonts/OFL.txt` et l'attribution exacte du jeu de données SIWIS | non, mais c'est une obligation de licence | `shared/licences-tierces.md` |
| 6 | Territoires au-delà du Tchad et de la France | non | `shared/distribution.md` |
| 7 | Les cinq tags Play, à choisir dans la liste fermée de la console | non | `google-play/store-settings.md` |

Deux chantiers **de code** restent bloquants avant soumission, et ne sont pas
des métadonnées : le durcissement du portail parental
(`app-store/age-rating.md` §5, `app-store/review-notes-fr.md`) et l'état des
limitations connues (`docs/known-limitations.md`). L'avancement d'ensemble est
suivi dans `docs/store-readiness.md`, la marche à suivre dans
`docs/deploiement-v1.md`.
