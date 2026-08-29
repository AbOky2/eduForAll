# Le programme officiel tchadien — source et traçabilité

## Le document

> **Programmes Réactualisés de l'Enseignement Primaire**
> République du Tchad — Ministère de l'Éducation Nationale
> Centre National des Curricula (CNC)
> N'Djaména, septembre 2004 — 161 pages

Document public, portant l'arrêté ministériel qui fixe les programmes (p. 5-6),
élaboré par une équipe du CNC sous la direction de M. Nomaye Madana.

Téléchargeable depuis Tchad Éducation :

```bash
curl -L -A "Mozilla/5.0" \
  "https://tchadeducation.com/download/tchad-programmes-reactualises-de-lenseignement-primaire/?wpdmdl=7662" \
  -o programmes-primaire-tchad-2004.pdf
```

Le PDF n'est pas versionné (4 Mo) : il est cité, pas redistribué. Toutes les
données qui en sont tirées sont dans
`src/content/curriculum/official-program.ts`, avec la page d'origine.

## Ce que le document fixe, et où c'est encodé

| Passage | Contenu | Encodé dans |
|---|---|---|
| p. 15 | Organisation du cycle : CP1/CP2, CE1/CE2, CM1/CM2 | `SCHOOL_YEAR` |
| p. 18-19 | Langage/Élocution CP : objectifs, 18 thèmes, structures | `LANGUAGE_THEMES`, `LANGUAGE_STRUCTURES` |
| p. 23-24 | Lecture CP : voyelles, nasales, semi-voyelles, 22 consonnes, autres sons, 14 groupes, 18 syllabes inverses, équivalences | `READING_INVENTORY` |
| p. 25-26 | Écriture CP : graphisme préparatoire puis lettres, chiffres, majuscules, copie | `WRITING_PROGRESSION` |
| p. 27 | Familles graphiques de lettres | `LETTER_FAMILIES`, `UPPERCASE_FAMILIES` |
| p. 58-59 | Activités mathématiques CP : 21 contenus | `MATH_CONTENTS` |
| p. 65 | Calcul mental CP | `MENTAL_MATH_CONTENTS` |
| p. 126 | Année scolaire (1er oct. – 30 juin), 28 h/sem, séances CP de 10-20 mn | `SCHOOL_YEAR` |
| p. 128 | Grille horaire hebdomadaire du CP | `WEEKLY_TIMETABLE_CP` |

## La règle

Le fichier `official-program.ts` **n'invente rien**. Les champs `official`
sont des citations ; les champs `teachingOrder` sont les seules décisions
pédagogiques d'ALIFA, isolées et signalées comme telles pour être soumises à
un enseignant (`docs/pedagogical-validation.md`).

Chaque leçon générée porte un `officialReference` qui cite le contenu et sa
page. `docs/couverture-programme.md` — régénéré à chaque build — croise
l'inventaire officiel et les leçons produites, et signale tout contenu non
couvert.

## Hors périmètre

L'application couvre les quatre disciplines instrumentales du CP
(lecture 7 h 40, langage 6 h, mathématiques 3 h 30, écriture 2 h 45 = 71 % du
temps de classe). Les autres disciplines de la grille — morale et hygiène,
dessin, chant, récitation, exercices physiques — supposent un encadrement
collectif qu'une tablette ne remplace pas.
