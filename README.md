# ALIFA — Apprendre partout, même sans internet

Application éducative **CP1–CP2 offline-first** pour les enfants du Tchad.
Lecture, écriture, dictée et calcul — entièrement utilisable **sans connexion**,
sans compte, sans publicité, sans collecte de données.

| | |
|---|---|
| Stack | Expo SDK 56 · React Native 0.85 · React 19.2 · TypeScript 6 strict · Hermes · New Architecture |
| Contenu | 54 leçons (28 CP1 + 26 CP2), 258 étapes, 20 types d'exercices, 156 audios embarqués |
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
| `npm run validate:content` | Schémas Zod + cohérence des 54 leçons |
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
assets/                 polices, icônes, 156 audios m4a
design/stitch/          les 21 maquettes source de vérité (PNG + HTML)
docs/                   audits, décisions, guides
store/                  métadonnées App Store / Google Play (brouillons)
```

Détails : `docs/architecture.md`, décisions : `docs/architecture-decisions/`.

## Limites connues et release

- **Voix TTS placeholder** : les 156 audios sont générés par synthèse vocale et
  marqués `placeholder`. `npm run validate:release` **bloque la production**
  tant que de vraies voix enregistrées ne les remplacent pas
  (`docs/audio-pipeline.md`).
- Contenu pédagogique original **non encore validé** par des enseignants
  tchadiens (`docs/pedagogical-validation.md`).
- Identifiants stores définitifs à fournir par le propriétaire
  (`docs/store-readiness.md`).

Toutes les limites : `docs/known-limitations.md`. Processus complet :
`docs/release-process.md`.
