<!-- Mention d'indépendance vis-à-vis du ministère tchadien, à faire figurer
     sur les deux fiches. COMPTE RÉEL de la phrase : 156 caractères (vérifié
     par script), identique dans les deux descriptions (App Store 3 299 / 4 000,
     Play 3 407 / 4 000). -->

# Citer le programme officiel sans se faire passer pour le ministère

## Le risque

Les deux descriptions invoquent le programme officiel et sa grille horaire.
C'est exact, et c'est l'argument central du produit — mais sans mention
d'indépendance, un lecteur, et donc un examinateur, peut comprendre que l'app
est une publication du ministère. Les deux plateformes refusent une fiche qui
laisse croire à une affiliation officielle inexistante (règle Apple 5.2.3 sur
l'usurpation et l'affiliation, règles Play sur la représentation trompeuse).
Une app pour enfants adossée à un programme national est précisément le cas
qu'un examinateur regarde.

## La source, citée exactement

> *Programmes Réactualisés de l'Enseignement Primaire*, République du Tchad,
> Ministère de l'Éducation Nationale — Centre National des Curricula (CNC),
> N'Djaména, septembre 2004, 161 p.

C'est la citation de `src/content/curriculum/official-program.ts` et de
`docs/couverture-programme.md`. Ne pas l'abréger en « programme du
ministère tchadien » dans un contexte où elle sert de référence : la source est
datée et paginée, c'est ce qui rend l'affirmation vérifiable.

## La phrase à faire figurer — 156 caractères

Une seule phrase, **la même sur les deux fiches**, en fin du paragraphe
« Pour l'enseignant » de `store/app-store/description-fr.md` et de
`store/google-play/full-description-fr.md` :

```
ECOLNA est une publication indépendante. Elle n’est ni éditée ni validée par le Ministère de l’Éducation Nationale du Tchad, auquel elle n’est pas affiliée.
```

Elle nie les trois choses qu'un lecteur pourrait supposer : l'**édition**
(« ni éditée »), l'**approbation** (« ni validée ») et l'**affiliation**
(« pas affiliée »). Les deux anciennes formulations n'en niaient chacune que
deux ; elles sont remplacées. Si la phrase doit être réécrite, elle doit
continuer à nier au moins l'affiliation **et** la validation : une phrase qui
ne dirait que « indépendante » laisserait croire à un contenu approuvé.

Elle ne dévalue pas l'argument : le contenu reste tiré du programme officiel,
cité leçon par leçon, page comprise.

## Où elle doit apparaître

Règle : **tout champ qui nomme le ministère ou dit « officiel » porte la
phrase**. Un champ trop court pour la porter ne dit ni l'un ni l'autre.

| Champ | Fichier | État |
|---|---|---|
| App Store — description | `store/app-store/description-fr.md` | ✅ présente, fin de « Pour l'enseignant » |
| Play — description complète | `store/google-play/full-description-fr.md` | ✅ présente, même emplacement |
| App Store — nom, sous-titre, texte promotionnel, mots-clés | `store/app-store/*.md` | ✅ sans objet : ni « officiel » ni « ministère » |
| Play — titre, description courte | `store/google-play/title-fr.md`, `short-description-fr.md` | ✅ sans objet : ni « officiel » ni « ministère » |
| Notes de version | `store/shared/release-notes-1.0.0-fr.md` | ✅ sans objet : « d'après le programme de l'enseignement primaire du Tchad », sans « officiel » |
| Légendes des captures | `store/screenshots/plan.json` | ✅ sans objet : aucune ne dit « officiel » (l'ancienne légende du plan 1 le disait) |
| Image de mise en avant Play | `store/google-play/graphics/feature-graphic-src.svg` | 🔴 **à corriger** : sa ligne « Le programme officiel du CP. » dit « officiel » sans pouvoir porter la phrase. Proposition, alignée sur le sous-titre et la première légende : « Le CP tchadien, même sans internet. » |
| Notes pour l'examen Apple | `store/app-store/review-notes-fr.md` | ✅ dit « publication indépendante, sans lien avec le ministère » (non publié) |

## Ce qu'il ne faut pas faire

- Ne pas utiliser les armoiries, le sceau, le logo ou le nom du ministère comme
  élément graphique : ni dans l'icône, ni dans la bannière, ni dans les
  captures.
- Ne pas écrire « approuvé par », « agréé », « conforme », « officiel » accolé
  au nom d'ECOLNA. « Le programme officiel » qualifie le programme, pas l'app —
  c'est la nuance que la phrase d'indépendance vient sécuriser.
- Ne pas promettre une conformité pédagogique validée : sept décisions
  attendent la relecture d'un enseignant (`docs/pedagogical-validation.md`).
