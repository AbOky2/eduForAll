<!-- Réponse à la question « Content Rights » d'App Store Connect
     (Informations sur l'app → Droits sur le contenu) : « Votre app
     contient-elle, affiche-t-elle ou utilise-t-elle du contenu de tiers ? »
     Champ à deux réponses possibles, sans texte libre : aucune limite de
     caractères. L'inventaire détaillé est dans
     store/shared/licences-tierces.md. -->

# Droits sur le contenu (Content Rights)

## Réponse à cocher : **Oui**

« Cette app contient, affiche ou utilise du contenu de tiers » — et l'éditeur
dispose des droits nécessaires pour chacun.

Répondre **Non** serait inexact : trois éléments tiers sont embarqués dans le
bundle, dont des citations d'une publication officielle, qui sont du contenu
affiché à l'utilisateur. Apple ne demande pas la liste dans ce champ ; en
cocher « Oui » engage seulement à pouvoir la produire sur demande. C'est
l'objet de ce fichier.

## Les trois sources tierces, et leur régime

### 1. Programme national tchadien — citation d'une publication officielle

> *Programmes Réactualisés de l'Enseignement Primaire*, République du Tchad,
> Ministère de l'Éducation Nationale — Centre National des Curricula (CNC),
> N'Djaména, septembre 2004, 161 p.

Encodé dans `src/content/curriculum/official-program.ts`. Régime : **citation
sourcée**. Chaque leçon porte un `officialReference` qui cite le contenu
officiel **et sa page**. Le document n'est ni reproduit intégralement, ni
redistribué, ni republié : les 308 leçons et les 1 625 exercices sont une
création du projet, construite sur un référentiel public cité.

ECOLNA n'est ni éditée, ni approuvée, ni cautionnée par le ministère, et les
deux fiches le disent explicitement
(`store/shared/mentions-programme-officiel.md`). Point à ne pas sous-estimer :
c'est la mention qui sépare « app adossée à un programme officiel » de
« app officielle », et la seconde serait un refus au titre de la règle 5.2.3.

### 2. Voix de synthèse — Kokoro et Piper, locuteur `siwis`

Les 824 enregistrements d'`assets/audio/` sont produits **sur la machine de
build**, jamais sur l'appareil de l'enfant, et `voice-provenance.json` note
quel modèle a enregistré quel son.

| Élément | Licence |
|---|---|
| Kokoro, voix `ff_siwis` — 665 sons (phrases, mots, consignes) | Apache-2.0 |
| Piper, modèle `fr_FR-siwis-medium` — 159 sons (sons isolés, syllabes, lettres, nombres) | MIT |
| Jeu de données SIWIS, à l'origine du locuteur | licence **à attribution** |

Apache-2.0 et MIT autorisent l'usage commercial et la redistribution des
sorties. La licence du jeu de données SIWIS impose en revanche une
**attribution** : elle doit figurer dans l'app ou sur la fiche.
🔴 À VÉRIFIER : l'intitulé exact, la version et la formule d'attribution
imposée, sur la page de distribution du jeu de données — ne pas inscrire une
version de licence non vérifiée dans une réponse de store.

### 3. Polices — SIL Open Font License 1.1

Quicksand (4 graisses) et Plus Jakarta Sans SemiBold, déclarées dans
`app.config.ts` et embarquées depuis `assets/fonts/`. L'OFL 1.1 autorise
l'embarquement dans une app distribuée, y compris commercialement, et exige que
**le texte de la licence accompagne les fichiers**.

🔴 À FOURNIR : `assets/fonts/OFL.txt`, copié depuis la distribution amont de
chaque police. Tant qu'il manque, la condition d'attribution n'est pas remplie
alors que les polices sont déjà dans le bundle — c'est une obligation de
licence, indépendante de la question d'Apple.

## Ce qui n'est pas du contenu tiers

Les **112 illustrations**, les pictogrammes, l'icône et le logo sont des
créations du projet (`src/design-system/illustrations/`, `assets/icons/*.svg`).
Aucune banque d'images, aucun jeu d'icônes tiers, aucun élément importé. La
planche de contact `docs/pictogrammes.html` montre exactement ce que l'app
dessine.

## Conséquence pour la fiche

Deux attributions sont **obligatoires** et doivent être visibles : la licence
OFL des polices et l'attribution du jeu de données SIWIS. Elles tiennent dans
le bloc prêt à coller de `store/shared/licences-tierces.md`, destiné à l'écran
« À propos » — et, si cet écran n'est pas branché pour la 1.0.0, à la page
`https://aboky2.github.io/eduForAll/support.html`.
