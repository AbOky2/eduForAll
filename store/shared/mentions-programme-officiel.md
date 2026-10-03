<!-- Mention d'indépendance vis-à-vis du ministère tchadien, à faire figurer
     sur les deux fiches. Les phrases en place pèsent 101 caractères (App
     Store) et 91 (Play) : elles entrent largement dans les 4 000 de chaque
     description. Limites de caractères : voir chaque fichier de description. -->

# Citer le programme officiel sans se faire passer pour le ministère

## Le risque

Les deux descriptions invoquent le programme officiel et « les proportions
horaires fixées par le ministère ». C'est exact, et c'est l'argument central du
produit — mais sans mention d'indépendance, un lecteur, et donc un examinateur,
peut comprendre que l'app est une publication du ministère. Les deux
plateformes refusent une fiche qui laisse croire à une affiliation officielle
inexistante (règle Apple 5.2.3 sur l'usurpation et l'affiliation, règles Play
sur la représentation trompeuse). Une app pour enfants adossée à un programme
national est précisément le cas qu'un examinateur regarde.

## La source, citée exactement

> *Programmes Réactualisés de l'Enseignement Primaire*, République du Tchad,
> Ministère de l'Éducation Nationale — Centre National des Curricula (CNC),
> N'Djaména, septembre 2004, 161 p.

C'est la citation de `src/content/curriculum/official-program.ts` et de
`docs/couverture-programme.md`. Ne pas l'abréger en « programme du
ministère tchadien » dans un contexte où elle sert de référence : la source est
datée et paginée, c'est ce qui rend l'affirmation vérifiable.

## La phrase à faire figurer

Chaque fiche qui nomme le ministère porte une phrase d'indépendance. Les deux
fiches en portent déjà une, et ce sont ces chaînes exactes qui doivent rester :

**App Store** — `store/app-store/description-fr.md`, fin du paragraphe « Pour
l'enseignant » (101 caractères) :

```
ECOLNA est une publication indépendante, non affiliée au Ministère de l’Éducation Nationale du Tchad.
```

**Play** — `store/google-play/full-description-fr.md`, même emplacement
(91 caractères) :

```
ECOLNA est une publication indépendante : elle n’est ni éditée ni validée par le ministère.
```

Les deux formulations disent la même chose de deux manières : pas d'affiliation
(« indépendante », « non affiliée ») et pas d'approbation (« ni éditée ni
validée »). Les garder telles quelles ; si l'une doit être réécrite, elle doit
continuer à nier **les deux** choses — l'affiliation et la validation. Une
phrase qui ne dirait que « indépendante » laisserait croire à un contenu
approuvé par le ministère.

Aucune des deux ne dévalue l'argument : le contenu reste tiré du programme
officiel, cité page par page.

## Où elle doit apparaître

| Fiche | Fichier | État |
|---|---|---|
| Play — description complète | `store/google-play/full-description-fr.md` | ✅ présente, en fin de paragraphe « Pour l'enseignant » |
| App Store — description | `store/app-store/description-fr.md` | ✅ présente, en fin de description |
| App Store — texte promotionnel | `store/app-store/promotional-text-fr.md` | sans objet : 170 caractères, aucune mention du ministère |
| Play — description courte | `store/google-play/short-description-fr.md` | sans objet : 80 caractères, aucune mention du ministère |

Règle : **toute fiche qui nomme le ministère porte la phrase**. Si une retouche
future ajoute « officiel » ou « ministère » à un champ court, la mention doit
suivre, ou la référence doit sortir du champ court.

## Ce qu'il ne faut pas faire

- Ne pas utiliser les armoiries, le sceau, le logo ou le nom du ministère comme
  élément graphique : ni dans l'icône, ni dans la bannière, ni dans les
  captures.
- Ne pas écrire « approuvé par », « agréé », « officiel » accolé au nom
  d'ECOLNA. « Le programme officiel » qualifie le programme, pas l'app — c'est
  la nuance que la phrase d'indépendance vient sécuriser.
- Ne pas promettre une conformité pédagogique validée : l'atelier avec un
  enseignant est prévu après la mise en ligne
  (`docs/pedagogical-validation.md`).
