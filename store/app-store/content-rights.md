<!-- Réponse à la question « Content Rights » d'App Store Connect
     (Informations sur l'app → Droits sur le contenu) : « Votre app
     contient-elle, affiche-t-elle ou utilise-t-elle du contenu de tiers ? »
     Champ à deux réponses possibles, sans texte libre : aucune limite de
     caractères. L'inventaire détaillé, source unique, est
     store/shared/licences-tierces.md ; ce fichier n'en garde que ce qui
     décide de la réponse. -->

# Droits sur le contenu (Content Rights)

## Réponse à cocher : **Oui**

« Cette app contient, affiche ou utilise du contenu de tiers » — et l'éditeur
dispose des droits nécessaires pour chacun.

Répondre **Non** serait inexact : des polices, des pictogrammes et des voix de
synthèse tiers sont embarqués dans le bundle, et l'app cite une publication
officielle. Apple ne demande pas la liste dans ce champ ; cocher « Oui »
engage à pouvoir la produire sur demande, et à respecter chaque licence.
C'est l'objet de ce fichier.

**Où les attributions sont visibles** : sur la page de support,
`https://aboky2.github.io/eduForAll/support.html#licences` (section
« Licences », avec le texte complet de l'OFL et de la licence MIT de
Phosphor), à laquelle renvoie la carte « À propos » des paramètres de l'app
(« Licences : polices, icônes et voix », suivie de l'adresse, en texte simple
— aucun lien sortant dans une app de la catégorie Enfants). La page doit être
publiée sur `gh-pages` avant de cocher « Oui » (`../shared/privacy-policy/README.md`).

## Les sources tierces, et leur régime

Détail, fichiers et notices : `../shared/licences-tierces.md`.

| Source | Ce qui est embarqué | Licence | Obligation | État |
|---|---|---|---|---|
| **Polices** | Ecolna Sans (5 graisses), version modifiée et renommée de **Figtree** (© 2022 The Figtree Project Authors) ; **Andika** (© 2004-2022 SIL International, noms réservés « Andika » et « SIL »), non modifiée | SIL Open Font License 1.1 | le texte de la licence et les mentions de copyright accompagnent les polices ; une version modifiée ne porte pas de nom réservé | ✅ notices livrées dans `assets/fonts/` (`OFL-Figtree.txt`, `OFL-Andika.txt`, `FONTLOG-EcolnaSans.txt`) et publiées sur `support.html#licences` |
| **Pictogrammes d'interface** | tracés de **Phosphor Icons** (boutons, onglets, médailles), embarqués comme données dans `src/design-system/icons/phosphor.generated.ts` | MIT, « Copyright (c) 2023 Phosphor Icons » | la mention de copyright et la licence accompagnent les copies ; la minification la retire du binaire, d'où sa publication | ✅ texte MIT complet sur `support.html#licences` ; notice en tête du fichier généré (`scripts/icons/build-icons.mjs`) |
| **Voix de synthèse** | 824 sons produits **sur la machine de build** : **Kokoro**, voix `ff_siwis` (665 sons), et **Piper**, modèle `fr_FR-siwis-medium` (159 sons) — `assets/audio/voice-provenance.json` | Kokoro : Apache-2.0 ; Piper : MIT (`docs/audio-pipeline.md`) | ni l'un ni l'autre moteur n'est redistribué : seuls les sons le sont ; crédit donné sur la page de support | ✅ crédités sur `support.html#licences` |
| **Jeu de données SIWIS** | voix française d'origine du locuteur `siwis` des deux modèles | licence **à attribution** | une attribution doit figurer dans l'app ou sur la fiche | 🔴 **À VÉRIFIER** : intitulé exact, version et formule d'attribution, sur la page de distribution du jeu de données. La page de support le dit « en cours de vérification » ; ne pas inscrire une version de licence non vérifiée |
| **Programme national tchadien** | citations de *Programmes Réactualisés de l'Enseignement Primaire*, MEN — CNC, N'Djaména, septembre 2004, 161 p. (`src/content/curriculum/official-program.ts`) | citation sourcée | citer la source et ne pas laisser croire à une caution | ✅ chaque leçon porte son `officialReference` (contenu et page) ; phrase d'indépendance sur les deux fiches, dans l'app (carte « À propos ») et sur la page de support |

Le programme officiel n'est ni reproduit intégralement, ni redistribué, ni
republié : les 308 leçons et les 1 625 exercices sont une création du projet,
construite sur un référentiel public cité. ECOLNA n'est ni éditée, ni
approuvée, ni cautionnée par le ministère (`../shared/mentions-programme-officiel.md`) :
c'est la mention qui sépare « app adossée à un programme officiel » de « app
officielle », et la seconde serait un refus au titre de la règle 5.2.3.

## Ce qui n'est pas du contenu tiers

Les **112 illustrations** du contenu (`src/design-system/illustrations/`),
l'icône, le logo et les visuels de store (`assets/icons/*.svg`) sont des
créations du projet. Aucune banque d'images, aucun élément importé ; la
planche de contact `docs/pictogrammes.html` montre exactement ce que l'app
dessine. Seuls les pictogrammes d'**interface** viennent de Phosphor (ci-dessus).

Les bibliothèques logicielles (Expo, React Native, Zod, Zustand…) sont sous
licences permissives ; aucune console ne pose de question à leur sujet
(`../shared/licences-tierces.md`, « Bibliothèques logicielles »).

## Ce qu'il reste à faire avant de cocher « Oui »

1. Publier `support.html` sur `gh-pages` et vérifier
   `https://aboky2.github.io/eduForAll/support.html` en 200.
2. Vérifier l'attribution du jeu de données SIWIS, puis la reporter mot pour
   mot dans `../shared/licences-tierces.md` et dans la section « Licences » de
   `support.html`, à la place de la mention « en cours de vérification ».
