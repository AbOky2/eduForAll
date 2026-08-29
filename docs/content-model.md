# Modèle de contenu

## Source de vérité

`src/content/curriculum/official-program.ts` — le programme national tchadien
encodé, chaque entrée portant sa page (`docs/programme-officiel-tchad.md`).
Rien de pédagogique n'est décidé ailleurs.

## Manifeste

`src/content/manifests/curriculum-v1.json` — **généré**, validé par
`curriculumManifestSchema` (Zod) :

```
CurriculumManifest
├─ schemaVersion: 1
├─ contentVersion: "2.0.0"        (semver ; nouvelle version = nouvel import)
├─ generatedAt
├─ levels[2]: CP1 | CP2
│   └─ worlds[]                    (id, titre, sous-titre, subject)
│       └─ lessons[]               (3–10 steps, term, week, officialReference,
│                                   prérequis, compétences, completionRule)
│           └─ steps[]             (union discriminée des 27 types)
└─ assets[]                        (audio | illustration, placeholder flag)
```

Volume : **308 leçons, 1 625 exercices, 821 audios, 112 illustrations.**

## Les quatre disciplines

Celles de la grille horaire officielle du CP (p. 128), et rien d'autre :

| `subject` | Discipline | Horaire officiel | Leçons |
|---|---|---|---|
| `reading` | Lecture | 7 h 40 | 112 |
| `language` | Langage/Élocution | 6 h 00 | 99 |
| `math` | Mathématiques | 3 h 30 | 55 |
| `writing` | Écriture | 2 h 45 | 42 |

**La dictée n'est pas une discipline du CP.** C'est une famille d'exercices de
l'écriture — « copie de mots et de phrases tirés de la lecture » (p. 26).

## Progression annuelle

Chaque leçon porte `term` (1-3) et `week` (1-30) : l'année scolaire tchadienne
va du 1er octobre au 30 juin (p. 126). Les quatre disciplines tournent en
parallèle dès la semaine 1 — comme dans une classe réelle. Aucune discipline
n'est verrouillée ; la progression est portée par les prérequis de leçon à
leçon, et `home-summary` calcule le verrouillage à partir des prérequis, pas
d'une règle codée en dur.

## Les 27 types d'exercices

**Lecture / langage** : listen · audio_multiple_choice · text_multiple_choice ·
image_multiple_choice · match_pairs · tap_letter · tap_syllable ·
compose_syllable · compose_word · fill_missing_letter · order_words ·
sound_position · listen_and_repeat · mini_story_question

**Écriture** : trace_graphism · trace_letter

**Mathématiques** : count_objects · number_sequence · compare_numbers ·
simple_addition · simple_subtraction · simple_multiplication ·
simple_division · visual_word_problem · attribute_choice · spatial_position ·
count_money

Chaque type : schéma Zod + évaluation pure + renderer + entrée de registry
(exhaustivité vérifiée par le compilateur, voir `docs/add-an-exercise-type.md`).
Un test vérifie que **tous** les types sont réellement utilisés par le contenu.

Les sept derniers types ont été ajoutés pour couvrir des contenus officiels
qu'aucun exercice ne traitait : les tailles/couleurs/formes/quantités
(`attribute_choice`), les repères spatiaux (`spatial_position`), la
multiplication et la division par 2 et par 5, les pièces de monnaie en francs
CFA (`count_money`), le graphisme préparatoire (`trace_graphism`) et la
localisation d'un son dans un mot (`sound_position`).

## Identifiants

- `lessonId` : `cp1-lecture-l-1`, `cp2-calcul-monnaie`, `cp1-langage-ecole-2`…
  — stables à vie.
- `skillId` : `skill-son-l`, `skill-lettre-b`, `skill-nombre-11-20`,
  `skill-langage-marche`, `skill-calcul-retenue` — unité du moteur de révision
  et du dashboard parent.
- `audioId` : `<genre>-<slug>` (`syllabe-ba`, `instr-e1coute-bien`,
  `mot-tomate`, `nombre-17`, `monnaie-100`, `graphisme-les-ronds`…).
  Les accents sont encodés (`é` → `e1`) : « le son é » et « le son e » ne
  doivent pas partager un enregistrement.
- Illustrations : `icon-<objet>` → composant dans
  `object-icons.tsx` / `curriculum-icons.tsx`.

## Génération

```bash
npx tsx scripts/generate-content.ts     # manifeste + registre audio + carte TTS + rapport
./scripts/generate-placeholder-audio.sh # les audios manquants
npm run validate:content                # cohérence, réponses, références
```

Le contenu se modifie dans `scripts/content/data/` (progressions de lecture,
18 thèmes de vocabulaire, données mathématiques), jamais dans le manifeste.

Le générateur échoue bruyamment sur : identifiant en double, prérequis
introuvable, collision d'identifiant audio, phrase trop longue pour un
exercice de remise en ordre, réponse absente de ses propres options, division
non exacte.

## Étoiles et révision

- `completionRule` : 3★ si ≥ 85 % au premier essai sans indice ; 2★ si ≥ 60 %
  résolu en ≤ 2 essais ; sinon 1★ (jamais 0).
- Compétences en difficulté (≥ 2 essais ou indice) → `revision_queue` →
  écran Révision + recommandations parent.
