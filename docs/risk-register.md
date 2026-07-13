# ALIFA — Registre des risques

| ID | Risque | Impact | Prob. | Mitigation | Statut |
|---|---|---|---|---|---|
| R01 | **Voix françaises définitives absentes** (aucun enregistrement fourni) | Bloquant release (audio = cœur pédagogique) | Certain | Pipeline TTS locale reproductible (say/espeak → aiff→m4a), fichiers marqués placeholder, release gate bloquant, manifest complet prêt pour ré-enregistrement | Ouvert |
| R02 | Illustrations picturales Stitch (rasters IA) non exportables en assets propres | Fidélité visuelle réduite (S01, S09, S14, S20) | Élevée | Réutiliser les captures comme référence, produire des SVG originaux sobres + dégradés ; documenter écarts | Ouvert |
| R03 | Contenu pédagogique non validé par des enseignants tchadiens | Qualité pédagogique | Certain (V1) | Contenu original aligné progression CP1/CP2 francophone ; `docs/pedagogical-validation.md` liste ce qui doit être validé | Ouvert |
| R04 | Compatibilité SDK 56 (récent) de certaines libs (reanimated, gesture-handler, svg) | Instabilité build | Moyenne | `npx expo install` uniquement, expo-doctor à chaque phase, pas de lib native hors périmètre Expo sans vérification | Ouvert |
| R05 | Performance Android bas de gamme (3 Go RAM) | UX dégradée | Moyenne | Pas d'animations permanentes, textures légères, listes virtualisées, mesures documentées | Ouvert |
| R06 | Taille de l'app (50 leçons + audio embarqué) | Refus install sur stockage limité | Moyenne | Audio mono 48-64 kbps AAC, images optimisées, budget taille dans performance-budget.md | Ouvert |
| R07 | Migration DB destructrice lors d'une mise à jour | Perte de progression enfant | Faible | Migrations versionnées additives, tests de migration, jamais de DROP en montée de version | Ouvert |
| R08 | Credentials stores / identité légale absents | Soumission impossible (hors périmètre technique) | Certain | Documenter précisément ce que le propriétaire doit fournir (`docs/store-readiness.md`) ; ne rien inventer | Accepté |
| R09 | Interruption pendant leçon (kill, batterie) | Progression fantôme / double comptage | Moyenne | Sauvegarde par étape transactionnelle, reprise explicite, tests dédiés | Ouvert |
| R10 | Quota/limites de la session de développement IA | Travail incomplet | Moyenne | Travail par tranches verticales committées, notes persistantes, docs à jour à chaque jalon | Actif |
