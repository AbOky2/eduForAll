# ALIFA — Plan d'implémentation

Application éducative CP1–CP2 offline-first pour le Tchad. Expo SDK 56, RN 0.85, TypeScript strict, New Architecture, Hermes.

## Tranches verticales

### Phase 1 — Ingestion et planification ✅
- [x] Récupération des 21 maquettes Stitch via MCP (`design/stitch/` : PNG + HTML + index.json)
- [x] `docs/design-audit.md`, `docs/design-traceability.md`, `docs/risk-register.md`, ce plan

### Phase 2 — Fondation
- [ ] Scaffold Expo SDK 56 (template default, expo-router), `app.config.ts`, tsconfig strict renforcé
- [ ] ESLint + Prettier + scripts qualité
- [ ] Design tokens extraits de Stitch (`src/design-system/tokens/`)
- [ ] Polices Quicksand + Plus Jakarta Sans embarquées (`assets/fonts/`)
- [ ] Connexion SQLite + runner de migrations versionnées + tables V1
- [ ] Hiérarchie d'erreurs (`src/core/errors`), Result type, logger local
- [ ] Bootstrap : init DB → migrations → import contenu → route initiale
- [ ] Tests unitaires fondation (migrations, result, erreurs)

### Phase 3 — Parcours enfant minimal complet
- [ ] Onboarding (3 écrans + création profil, S02–S05)
- [ ] Accueil enfant (S06), sélection module (S07), carte de progression (S08)
- [ ] Session de leçon : machine d'état + 3 premiers types d'exercices (listen, audio_multiple_choice, tap_letter)
- [ ] Sauvegarde progression + écran réussite (S16) + reprise après fermeture

### Phase 4 — Moteur complet
- [ ] Registry des 20 types d'exercices + renderers + validations pures + tests
- [ ] Service audio expo-audio (preload/play/replay/rate) + manifest audio
- [ ] Tracé de lettre (SVG + gesture + checkpoints)
- [ ] Scoring, étoiles, déverrouillage, moteur de révision déterministe (S17)

### Phase 5 — Contenu CP1 et CP2
- [ ] Schémas Zod des manifestes ; 25 leçons CP1 (5 mondes) ; 25 leçons CP2 (5 mondes)
- [ ] Scripts `validate:content` / `validate:audio` ; pipeline TTS temporaire documentée (gate release)

### Phase 6 — Parent et paramètres
- [ ] Parent gate PIN (secure-store + crypto), dashboard (S18), paramètres (S19), diagnostics, reset confirmé

### Phase 7 — Polissage AAA
- [ ] Animations (réussite, feedback, transitions), haptique, textures de fond, illustrations locales, responsive, accessibilité

### Phase 8 — Qualité
- [ ] Tests intégration + Maestro, audits offline/perf/a11y/sécurité, refactoring

### Phase 9 — Release
- [ ] eas.json (dev/preview/production), CI, docs store/, validate:release, documentation complète

## Décisions structurantes (ADR courtes)

1. **ADR-001 — SQLite source de vérité** : expo-sqlite + migrations versionnées ; Zustand limité à l'état de session. (§7, §8 du brief)
2. **ADR-002 — Contenu embarqué** : manifestes JSON versionnés validés Zod dans `src/content/`, importés/indexés en DB au premier lancement, transactionnel + idempotent. Progression jamais écrasée par une mise à jour de contenu.
3. **ADR-003 — Machine d'état leçon en reducer pur** : pas de lib externe (XState non justifié V1) ; états explicites, testés.
4. **ADR-004 — Registry d'exercices typé** : union discriminée `ExerciseStep`, un renderer par type, détection explicite des types inconnus.
5. **ADR-005 — Pas de react-navigation direct** : imports via `expo-router` uniquement.
6. **ADR-006 — Audio placeholder gated** : voix définitives absentes → pipeline TTS locale documentée, fichiers marqués `placeholder`, release gate bloquant.
7. **ADR-007 — Bottom nav claire partout** (l'écart S15 nav sombre est harmonisé — documenté dans design-decisions.md).
8. **ADR-008 — Polices en assets locaux** via expo-font (aucun fetch Google Fonts au runtime).

## Suivi

Le suivi fin est dans le gestionnaire de tâches de session ; ce fichier reflète l'état des phases à chaque jalon.
