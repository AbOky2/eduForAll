# ALIFA — Apprendre partout, même sans internet

Application éducative **CP1–CP2 offline-first** pour les enfants du Tchad,
**conçue pour tablette**. Langage, lecture, écriture et calcul — l'année
scolaire complète du programme national, entièrement utilisable **sans
connexion**, sans compte, sans publicité, sans collecte de données.

Le contenu n'est pas une progression CP générique : il est construit à partir
des *Programmes Réactualisés de l'Enseignement Primaire* (République du Tchad,
Ministère de l'Éducation Nationale / Centre National des Curricula, N'Djaména,
septembre 2004). Chaque leçon cite le contenu officiel auquel elle répond et
sa page — voir [docs/couverture-programme.md](docs/couverture-programme.md).

| | |
|---|---|
| Stack | Expo SDK 56 · React Native 0.85 · React 19.2 · TypeScript 6 strict · Hermes · New Architecture |
| Contenu | 308 leçons (147 CP1 + 161 CP2) sur 30 semaines, 1 625 exercices, 27 types, 821 audios, 113 pictogrammes |
| Programme | Grille horaire officielle du CP respectée : lecture 7 h 40, langage 6 h, maths 3 h 30, écriture 2 h 45 |
| Base | SQLite (expo-sqlite), migrations versionnées, progression locale |
| Design | Design system « Premium Sahelian » extrait des maquettes Stitch (`design/stitch/`) |

## Démarrage

Prérequis : Node.js ≥ 20.19.4, npm, Xcode et/ou Android Studio pour les builds natifs.

```bash
npm ci                    # installation verrouillée
npm run typecheck         # TypeScript strict
npm test                  # tests Jest
npm run validate:content  # cohérence du contenu pédagogique
```

### Development build (recommandé)

```bash
npx expo prebuild                    # génère ios/ et android/
npx expo run:android                 # ou run:ios
# ensuite : npm start pour le serveur Metro
```

Expo Go ne suffit pas pour tout tester (SQLite, audio) — utilisez un dev build.

## Scripts

| Script | Rôle |
|---|---|
| `npm run lint` / `lint:fix` | ESLint (config Expo + règles projet) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `test:coverage` | Tests unitaires + composants |
| `npm run test:e2e` | Flows Maestro (`maestro/`) |
| `npm run validate:content` | Schémas Zod + cohérence des 308 leçons |
| `npm run validate:assets` | Polices, icônes, registre d'illustrations |
| `npm run validate:audio` | 156 fichiers audio vs manifeste |
| `npm run validate:release` | **Toutes les release gates** automatisables |
| `npm run doctor` | expo-doctor |
| `npm run build:preview` / `build:production` | EAS Build |

## Ajouter une leçon

Le contenu est **généré** par `scripts/generate-content.ts` (leçons, manifeste
validé Zod, registre audio, carte TTS). Voir `docs/add-a-lesson.md` :

1. ajouter la leçon dans le générateur (builders `lesson()`, `audioMcqStep()`, …) ;
2. `npx tsx scripts/generate-content.ts` ;
3. `./scripts/generate-placeholder-audio.sh` (nouvelles voix placeholder) ;
4. `npm run validate:content && npm test`.

## Ajouter un type d'exercice

Voir `docs/add-an-exercise-type.md` : schéma Zod (union discriminée) →
évaluation pure dans `evaluate-answer.ts` → renderer → entrée du registry →
tests. Le compilateur force l'exhaustivité à chaque étape.

## Architecture

```
app/                    routes Expo Router (groupes onboarding/child/parent/settings/dev)
src/core/               erreurs, result, ids branded, horloge, logger local
src/design-system/      tokens Stitch, primitives Alifa*, icônes et illustrations SVG
src/features/<f>/       domain / application / infrastructure / presentation
src/database/           connexion SQLite, migrations versionnées
src/content/            manifestes générés + schémas Zod + registre audio
assets/                 polices, icônes, 820 audios m4a
design/stitch/          les 21 maquettes source de vérité (PNG + HTML)
docs/                   audits, décisions, guides
store/                  métadonnées App Store / Google Play (brouillons)
```

Détails : `docs/architecture.md`, décisions : `docs/architecture-decisions/`.

## Limites connues et release

- **Voix TTS placeholder** : les 820 audios sont générés par synthèse vocale et
  marqués `placeholder`. `npm run validate:release` **bloque la production**
  tant que de vraies voix enregistrées ne les remplacent pas
  (`docs/audio-pipeline.md`).
- Contenu pédagogique original **non encore validé** par des enseignants
  tchadiens (`docs/pedagogical-validation.md`).
- Identifiants stores définitifs à fournir par le propriétaire
  (`docs/store-readiness.md`).

Toutes les limites : `docs/known-limitations.md`. Processus complet :
`docs/release-process.md`.
