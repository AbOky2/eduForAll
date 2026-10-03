<!-- Inventaire des éléments tiers embarqués dans le bundle et de leur régime.
     Sert trois usages : la question « Content Rights » d'App Store Connect
     (voir store/app-store/content-rights.md), le §6 de
     store/shared/terms-draft-fr.md, et l'écran « À propos » de l'app.
     Limites de caractères : aucune, sauf le bloc « À propos » en fin de
     fichier, destiné à un écran de l'app. -->

# Licences des éléments tiers embarqués

ECOLNA n'appelle aucun service au runtime : tout ce qu'elle utilise est **dans
le bundle**. Les licences doivent donc voyager avec l'app, pas seulement avec
le dépôt.

Quatre familles d'éléments. Deux sont tierces et demandent une attribution ;
deux sont du travail du projet.

## 1. Polices de caractères — SIL Open Font License 1.1

Déclarées dans `app.config.ts` (plugin `expo-font`), embarquées depuis
`assets/fonts/` :

| Fichier | Famille | Licence |
|---|---|---|
| `Quicksand-Regular.ttf`, `-Medium`, `-SemiBold`, `-Bold` | Quicksand | SIL Open Font License 1.1 |
| `PlusJakartaSans-SemiBold.ttf` | Plus Jakarta Sans | SIL Open Font License 1.1 |

L'OFL 1.1 autorise l'embarquement dans une application, y compris distribuée
commercialement, et **exige que le texte de la licence accompagne les fichiers**
de police.

🔴 À FOURNIR : `assets/fonts/OFL.txt`, copié depuis la distribution amont de
chaque police (Google Fonts livre le fichier `OFL.txt` avec les `.ttf`). Ce
fichier porte la ligne de copyright exacte et le *Reserved Font Name* de chaque
famille — deux chaînes qui ne doivent pas être recopiées de mémoire. Si les deux
polices ont des notices différentes, deux fichiers :
`assets/fonts/OFL-Quicksand.txt` et `assets/fonts/OFL-PlusJakartaSans.txt`.

Tant que ce fichier manque, la condition d'attribution de l'OFL n'est pas
remplie, alors que les polices sont déjà dans le bundle.

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

🔴 À VÉRIFIER : l'**intitulé exact et la version** de la licence du jeu de
données SIWIS, sur sa page de distribution officielle, ainsi que la formule
d'attribution qu'elle impose. Le régime est une licence à attribution : une
attribution est donc **obligatoire**, et c'est l'objet du bloc « À propos » en
fin de fichier. Ne pas écrire une version de licence non vérifiée dans un
document qui répond à une question de store.

## 3. Programme officiel tchadien — citation d'une publication officielle

Source unique du contenu pédagogique, encodée dans
`src/content/curriculum/official-program.ts` :

> *Programmes Réactualisés de l'Enseignement Primaire*, République du Tchad,
> Ministère de l'Éducation Nationale — Centre National des Curricula (CNC),
> N'Djaména, septembre 2004, 161 p.

Régime : **citation**. Chaque leçon porte un `officialReference` qui cite le
contenu officiel et **sa page**. Le document n'est ni redistribué, ni reproduit
intégralement, ni republié : il est cité, et les exercices sont une création du
projet. Les seules décisions non citées sont les `teachingOrder`, isolées
exprès pour être soumises à un enseignant (`docs/pedagogical-validation.md`).

ECOLNA n'est **ni éditée, ni approuvée, ni cautionnée** par le ministère. La
formulation exacte à faire figurer sur les fiches est dans
`store/shared/mentions-programme-officiel.md` : citer une source officielle sans
cette mention est le scénario de refus pour affiliation implicite.

## 4. Illustrations, pictogrammes, icône — travail du projet

- Les **112 illustrations** du manifeste sont des pictogrammes vectoriels
  originaux, écrits dans `src/design-system/illustrations/`
  (`object-icons.tsx`, `curriculum-icons.tsx`, `scenes.tsx`) et rendus avec
  `react-native-svg`. Aucun jeu d'icônes tiers, aucune banque d'images, aucun
  élément importé : la planche de contact `docs/pictogrammes.html` montre
  exactement ce que l'app dessine.
- L'**icône** et les visuels de store sont rendus depuis leurs sources
  vectorielles du dépôt (`assets/icons/*.svg`, `npm run brand:assets`).
- Le **nom ECOLNA** et le logo du livre ouvert sont la marque du projet.

Aucun droit de tiers n'est en jeu sur cette famille.

## Bibliothèques logicielles

Les dépendances de `package.json` (Expo, React Native, Zod, Zustand,
react-native-svg…) sont des bibliothèques open source sous licences permissives
(MIT, Apache-2.0, BSD). Elles ne font pas l'objet d'une question de store :
aucune des deux consoles n'interroge sur les dépendances logicielles, et aucune
n'impose d'écran de licences pour elles. L'attribution des **polices** et de la
**voix**, elle, est exigée par les licences elles-mêmes.

## Bloc d'attribution pour l'écran « À propos »

La chaîne `settings.about` de `src/localization/fr/strings.ts` existe mais n'est
reliée à aucun écran. C'est l'emplacement naturel de l'attribution. Texte à
afficher, à la ligne près :

```
ECOLNA 1.0.0
© 2026 Issa Oki ABDRAMANE

Contenu pédagogique d'après les Programmes Réactualisés de
l'Enseignement Primaire, Ministère de l'Éducation Nationale —
Centre National des Curricula, N'Djaména, septembre 2004.
Publication indépendante, non validée par le ministère.

Polices Quicksand et Plus Jakarta Sans — SIL Open Font
License 1.1.

Voix de synthèse Kokoro (Apache-2.0) et Piper (MIT), locuteur
siwis. 🔴 attribution exacte du jeu de données SIWIS à compléter.

Illustrations originales du projet.
```

Si l'écran « À propos » n'est pas branché pour la 1.0.0, la même attribution
doit figurer dans la description de la fiche ou sur
`https://aboky2.github.io/eduForAll/support.html` : l'obligation vient des
licences, pas des stores, et elle ne disparaît pas faute d'écran.
