<!-- Inventaire des éléments tiers embarqués dans le bundle et de leur régime.
     Sert trois usages : la question « Content Rights » d'App Store Connect
     (voir store/app-store/content-rights.md), le §6 de
     store/shared/terms-draft-fr.md, et la section « Licences » de la page de
     support (support.html#licences), à laquelle renvoie la carte « À propos »
     de l'app. Aucune limite de caractères. -->

# Licences des éléments tiers embarqués

ECOLNA n'appelle aucun service au runtime : tout ce qu'elle utilise est **dans
le bundle**. Les licences doivent donc voyager avec l'app, pas seulement avec
le dépôt.

Quatre familles d'éléments. Deux sont tierces et demandent une attribution ;
deux sont du travail du projet.

## 1. Polices de caractères — SIL Open Font License 1.1

Chargées depuis `assets/fonts/` (plugin `expo-font` dans `app.config.ts`, et
`useFonts` au démarrage — aucun réseau) :

| Fichier | Famille | Origine | Licence | Notice |
|---|---|---|---|---|
| `EcolnaSans-Regular.ttf`, `-Medium`, `-SemiBold`, `-Bold`, `-ExtraBold` | Ecolna Sans | Figtree, © 2022 The Figtree Project Authors — **version modifiée** (« a » à un étage figé par défaut, renommée) | SIL Open Font License 1.1 | `OFL-Figtree.txt`, `FONTLOG-EcolnaSans.txt` |
| `Andika-Regular.ttf`, `Andika-Bold.ttf` | Andika | © 2004-2022 SIL International, noms réservés « Andika » et « SIL » — **non modifiée** | SIL Open Font License 1.1 | `OFL-Andika.txt` |

L'OFL 1.1 autorise l'embarquement dans une application, y compris distribuée
commercialement, et exige que le texte de la licence accompagne les fichiers :
les deux notices sont dans `assets/fonts/`. Une version modifiée ne peut pas
porter un nom réservé : Figtree n'en déclare aucun, et sa version modifiée est
tout de même renommée (« Ecolna Sans ») ; Andika, qui en déclare, est
embarquée telle quelle, sans sous-ensemble ni retouche.

## 1 bis. Pictogrammes d'interface — licence MIT

Les tracés des pictogrammes d'interface (`src/design-system/icons/phosphor.generated.ts`)
viennent de **Phosphor Icons** (https://phosphoricons.com), © 2023 Phosphor
Icons, licence MIT — la notice est en tête du fichier généré
(`scripts/icons/build-icons.mjs`). Ils sont embarqués comme données, sans
police d'icônes ni réseau.

## 2. Voix de synthèse — deux moteurs, un locuteur

Les 824 enregistrements d'`assets/audio/` sont produits **sur la machine de
build**, jamais sur l'appareil de l'enfant. `assets/audio/voice-provenance.json`
note, son par son, quel modèle l'a enregistré.

| Élément | Référence | Licence |
|---|---|---|
| Moteur de synthèse (phrases, mots, consignes — 665 sons) | Kokoro, voix `ff_siwis` | Apache-2.0 |
| Moteur de synthèse (sons isolés, syllabes, lettres, nombres — 159 sons) | Piper, modèle `fr_FR-siwis-medium` | MIT |
| Données vocales d'origine du locuteur `siwis` | jeu de données SIWIS (voix française) | licence à attribution |

Apache-2.0 et MIT sont relevées de `docs/audio-pipeline.md`, qui les documente
depuis le choix des moteurs.

🔴 À VÉRIFIER : l'**intitulé exact et la version** de la licence du jeu de
données SIWIS, sur sa page de distribution officielle, ainsi que la formule
d'attribution qu'elle impose. Le régime est une licence à attribution : une
attribution est donc **obligatoire**, et c'est l'objet de la section
« Licences » de la page de support (« Où l'attribution est visible », en fin de
fichier). Le dépôt de développement ne peut pas joindre la page amont : la
vérification reste à faire depuis un poste avec Internet. Ne pas écrire une version de licence non vérifiée dans un
document qui répond à une question de store.

## 3. Programme officiel tchadien — citation d'une publication officielle

Source unique du contenu pédagogique, encodée dans
`src/content/curriculum/official-program.ts` :

> *Programmes Réactualisés de l'Enseignement Primaire*, République du Tchad,
> Ministère de l'Éducation Nationale — Centre National des Curricula (CNC),
> N'Djaména, septembre 2004, 161 p.

Régime : **citation**. Chaque leçon porte un `officialReference` qui cite le
contenu officiel et **sa page**. Le document n'est ni redistribué, ni reproduit
intégralement, ni republié : il est cité, et les exercices sont une création du
projet. Les seules décisions non citées sont les `teachingOrder`, isolées
exprès pour être soumises à un enseignant (`docs/pedagogical-validation.md`).

ECOLNA n'est **ni éditée, ni approuvée, ni cautionnée** par le ministère. La
formulation exacte à faire figurer sur les fiches est dans
`store/shared/mentions-programme-officiel.md` : citer une source officielle sans
cette mention est le scénario de refus pour affiliation implicite.

## 4. Illustrations, pictogrammes, icône — travail du projet

- Les **112 illustrations** du manifeste sont des pictogrammes vectoriels
  originaux, écrits dans `src/design-system/illustrations/`
  (`object-icons.tsx`, `curriculum-icons.tsx`, `school-art.tsx`) et rendus
  avec `react-native-svg`. Aucune banque d'images, aucun élément importé : la
  planche de contact `docs/pictogrammes.html` montre exactement ce que l'app
  dessine. (Les pictogrammes d'**interface** — boutons, onglets, médailles —
  sont ceux de Phosphor, § 1 bis.)
- L'**icône** et les visuels de store sont rendus depuis leurs sources
  vectorielles du dépôt (`assets/icons/*.svg`, `npm run brand:assets`).
- Le **nom ECOLNA** et le logo du livre ouvert sont la marque du projet.

Aucun droit de tiers n'est en jeu sur cette famille.

## Bibliothèques logicielles

Les dépendances de `package.json` (Expo, React Native, Zod, Zustand,
react-native-svg…) sont des bibliothèques open source sous licences permissives
(MIT, Apache-2.0, BSD). Elles ne font pas l'objet d'une question de store :
aucune des deux consoles n'interroge sur les dépendances logicielles, et aucune
n'impose d'écran de licences pour elles. L'attribution des **polices** et de la
**voix**, elle, est exigée par les licences elles-mêmes.

## Où l'attribution est visible

La carte « À propos » des paramètres de l'app (derrière la porte parentale)
affiche la source du programme, la phrase d'indépendance, la version, puis
« Licences : polices, icônes et voix » suivi de l'adresse
`aboky2.github.io/eduForAll/support.html`, en texte simple : une app de la
catégorie Enfants ne contient aucun lien sortant (`fr.settings.aboutLicences`
et `aboutLicencesAddress` dans `src/localization/fr/strings.ts` ; un test
vérifie que l'adresse est celle de `coordonnees-fiches.md`).

L'attribution complète est donc publiée sur la **page de support**, section
« Licences » (`store/shared/privacy-policy/support.html#licences`) :

- Ecolna Sans (d'après Figtree, © 2022 The Figtree Project Authors) et
  Andika (© 2004-2022 SIL International, noms réservés « Andika » et
  « SIL ») — SIL Open Font License 1.1, avec le texte complet de la licence ;
- Phosphor Icons — licence MIT, avec sa ligne de copyright (« Copyright (c)
  2023 Phosphor Icons ») et le texte complet de la licence ;
- voix de synthèse Kokoro (Apache-2.0), voix `ff_siwis`, et Piper (MIT),
  modèle `fr_FR-siwis-medium` ;
- jeu de données SIWIS : licence à attribution, **marquée « en cours de
  vérification »** sur la page tant que l'intitulé exact n'est pas vérifié ;
- la citation du programme officiel et la phrase d'indépendance ;
- les illustrations, l'icône et le logo, créations du projet.

🔴 Reste à faire : vérifier l'attribution SIWIS (§ 2), puis la reporter mot
pour mot ici et dans `support.html`. La page doit aussi être publiée sur
`gh-pages` : l'obligation vient des licences, pas des stores, et elle ne
disparaît pas tant que la page renvoie 404.
