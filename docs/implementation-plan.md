# ALIFA — Plan d'implémentation

Application éducative CP1–CP2 offline-first pour le Tchad. Expo SDK 56, RN 0.85, TypeScript strict, New Architecture, Hermes.

## Tranches verticales

### Phase 1 — Ingestion et planification ✅
- [x] Récupération des 21 maquettes Stitch via MCP (`design/stitch/` : PNG + HTML + index.json)
- [x] `docs/design-audit.md`, `docs/design-traceability.md`, `docs/risk-register.md`, ce plan

### Phase 2 — Fondation ✅
- [x] Scaffold Expo SDK 56, `app.config.ts`, tsconfig strict renforcé (expo-doctor 21/21)
- [x] ESLint + Prettier + scripts qualité
- [x] Design tokens extraits de Stitch, polices embarquées, icônes générées
- [x] SQLite + runner de migrations + 14 tables V1
- [x] Erreurs typées, Result, logger local, bootstrap transactionnel idempotent

### Phase 3 — Parcours enfant minimal complet ✅
- [x] Onboarding (S02–S05), accueil (S06), modules (S07), carte (S08/S09)
- [x] Session de leçon (machine d'état) + résultat (S16) + reprise après fermeture

### Phase 4 — Moteur complet ✅
- [x] Registry 27 types + renderers + évaluation pure + tests
- [x] Service audio expo-audio + registre généré ; tracé de lettre (gesture + checkpoints)
- [x] Scoring/étoiles, révision déterministe (S17)

### Phase 5 — Contenu CP1 et CP2 ✅
- [x] 147 leçons CP1 + 161 CP2 (générateur déterministe, Zod), 1 625 exercices,
      calqués sur le programme officiel tchadien (couverture vérifiée au build)
- [x] validate:content/assets/audio ; pipeline TTS placeholder + gate release

### Phase 6 — Parent et paramètres ✅
- [x] Parent gate, dashboard (S18), paramètres (S19), confidentialité, diagnostics, reset double confirmation

### Phase 7 — Polissage AAA 🔶 (partiel)
- [x] Feedback animé interrompable, haptique légère, réduction de mouvement, responsive de base
- [ ] Fresque carte CP2, drag-and-drop composition, QA visuelle on-device (docs/visual-qa.md)

### Phase 8 — Qualité 🔶 (partiel)
- [x] 33 tests (domaine + composants + manifeste), lint/tsc 0 erreur, export Metro 7,8 Mo
- [ ] Tests intégration SQLite on-device, audits perf/a11y sur appareil réel

### Phase 9 — Release 🔶 (prêt hors gates externes)
- [x] eas.json (3 profils), CI GitHub Actions, docs store/, validate:release (8/9 gates vertes)
- [ ] Voix définitives (gate bloquante), identifiants légaux stores (propriétaire)

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
