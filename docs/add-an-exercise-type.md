# Ajouter un type d'exercice

Cinq points de passage, tous forcés par le compilateur (exhaustivité).

1. **Schéma** — `src/content/schemas/exercise-schema.ts` : ajouter la variante
   à `exerciseStepSchema` (union discriminée par `type`) et au tableau
   `EXERCISE_TYPES` (le `satisfies` échoue sinon).

2. **Réponse** — si aucune forme existante ne convient, étendre
   `ExerciseAnswer` (`src/features/exercises/domain/answer.ts`).

3. **Évaluation pure** — `evaluate-answer.ts` : ajouter le `case`. Le
   `default` avec `never` casse la compilation tant que le case manque.
   Écrire les tests (`evaluate-answer.test.ts`) : bonne réponse, mauvaise,
   réponse structurellement invalide.

4. **Renderer** — `src/features/exercises/presentation/renderers/` :
   composant recevant `ExerciseRendererProps<Step>` ; il **collecte** une
   réponse et appelle `onSubmit` — il ne décide jamais de la correction.
   État local réinitialisé par remontage (`key={step.id}` posé par la
   session), pas par effet.

5. **Registry** — `exercise-registry.tsx` : ajouter l'entrée. Le type
   `Record<ExerciseType, …>` échoue à compiler si elle manque.

Ensuite : builder dans `scripts/generate-content.ts` pour l'utiliser dans les
leçons, régénération, `npm run validate:content && npm test`.
