# Tests

## Pyramide

1. **Unitaires (domaine pur)** — `src/**/*.test.ts` : évaluation des 27 types
   de réponses, machine d'état (double tap, retry bienveillant, indices,
   reprise bornée), scoring des étoiles, moteur de révision (déterminisme,
   paires de confusion, priorités). Sans natif, < 2 s.
2. **Composants** — RNTL (jest-expo) : à étoffer sur les primitives
   (AnswerCard états, FeedbackBanner) et renderers clés.
3. **Intégration** — import de contenu + migrations sur SQLite : nécessite un
   harnais natif (better-sqlite3 adaptateur dev ou device) — voir backlog.
4. **E2E Maestro** — `maestro/` : parcours critiques sur build réelle
   (`npm run test:e2e` avec un dev build installé).

## Commandes

```bash
npm test                 # tout
npm run test:coverage    # couverture (cible : règles métier à 100 %)
npm run test:e2e         # Maestro (appareil/émulateur requis)
```

## Philosophie

La couverture n'est pas une métrique décorative : priorité aux règles métier
(scoring, déverrouillage, révision, machine d'état, migrations). Pas de tests
triviaux de rendu pour gonfler le pourcentage. Chaque bug corrigé ajoute
d'abord son test.
