# Modèle de contenu

## Manifeste

`src/content/manifests/curriculum-v1.json` — généré, validé par
`curriculumManifestSchema` (Zod) :

```
CurriculumManifest
├─ schemaVersion: 1
├─ contentVersion: "1.0.0"       (semver ; nouvelle version = nouvel import)
├─ generatedAt
├─ levels[2]: CP1 | CP2
│   └─ worlds[5]                  (id, titre, sous-titre, subject)
│       └─ lessons[]              (3–10 steps, prérequis, compétences,
│                                  completionRule, revisionStrategy)
│           └─ steps[]            (union discriminée des 20 types)
└─ assets[]                       (audio | illustration, placeholder flag)
```

## Les 20 types d'exercices

listen · audio_multiple_choice · text_multiple_choice · image_multiple_choice ·
match_pairs · tap_letter · tap_syllable · compose_syllable · compose_word ·
fill_missing_letter · order_words · trace_letter · count_objects ·
number_sequence · compare_numbers · simple_addition · simple_subtraction ·
visual_word_problem · listen_and_repeat · mini_story_question

Chaque type : schéma Zod + évaluation pure + renderer + entrée de registry
(exhaustivité compilateur, voir `docs/add-an-exercise-type.md`).

## Identifiants

- `lessonId` : `cp1-syllabes-b`, `cp2-son-ou`… — stables à vie.
- `skillId` : `skill-son-ba`, `skill-lettre-b`, `skill-nombre-11-20`,
  `skill-lecture-phrase` — unité du moteur de révision et du dashboard parent.
- `audioId` : `<genre>-<slug>` (`syllabe-ba`, `instr-ecoute-bien`,
  `mot-tomate`, `nombre-17`, `phrase-…`, `histoire-…`, `hint-…`).
- Illustrations : `icon-<objet>` → composant dans `object-icons.tsx`.

## Étoiles et révision

- `completionRule` : 3★ si ≥ 85 % premier essai sans indice ; 2★ si ≥ 60 %
  résolu en ≤ 2 essais ; sinon 1★ (jamais 0).
- Compétences en difficulté (≥ 2 essais ou indice) → `revision_queue` →
  écran Révision + recommandations parent.
