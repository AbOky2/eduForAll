# ECOLNA — Matrice de traçabilité design ↔ code

| # | Maquette Stitch (`design/stitch/`) | Route Expo Router | Composant écran | Composants DS clés | États implémentés | Fidélité | Tests |
|---|---|---|---|---|---|---|---|
| S01 | `splash-screen` | Splash natif + `app/index.tsx` (bootstrap) | `BootstrapScreen` | EcolnaScreen, EcolnaIllustration | loading, erreur init, récupération | à valider | — |
| S02 | `onboarding-1` | `(onboarding)/index` | `OnboardingWelcomeScreen` | EcolnaButton, PageDots | pagination, skip | à valider | — |
| S03 | `onboarding-2` | `(onboarding)/subjects` | `OnboardingSubjectsScreen` | SubjectTile ×4 | pagination, skip | à valider | — |
| S04 | `onboarding-3` | `(onboarding)/offline` | `OnboardingOfflineScreen` | EcolnaButton | pagination | à valider | — |
| S05 | `creation-profil-enfant` | `(onboarding)/create-profile` | `CreateProfileScreen` | AvatarPicker, LevelToggle, EcolnaTextField | avatar/niveau sélection, champ, validation | à valider | unit + composant |
| S06 | `accueil-enfant` | `(child)/(tabs)/index` | `ChildHomeScreen` | ContinueLessonCard, ActivityCard, EcolnaTabBar | leçon en cours/absente, module verrouillé, offline | à valider | composant |
| S07 | `selection-de-module` | `(child)/(tabs)/learn` | `ModuleSelectionScreen` | ModuleCard | badges progression, nouveau, verrouillé | à valider | composant |
| S08 | `carte-de-progression-cp1` | `(child)/level-map` (CP1) | `LevelMapScreen` | WorldNode, PathConnector | terminé/courant/verrouillé + étoiles | à valider | composant |
| S09 | `carte-de-progression-cp2` | `(child)/level-map` (CP2) | `LevelMapScreen` (variante fond) | WorldNode, fond illustré | idem | à valider | composant |
| S10 | `lecon-ecoute` | `(child)/lesson/[lessonId]` (step listen) | `ListenExercise` | EcolnaAudioButton, ProgressBar | lecture, replay, désactivé | à valider | unit + composant |
| S11 | `exercice-choix-multiple` | idem (step audio_multiple_choice) | `AudioMultipleChoiceExercise` | EcolnaAnswerCard | default/pressed/correct/incorrect/disabled | à valider | unit + composant |
| S12 | `ecran-dictee` | dictée = exercice d’écriture, pas une discipline | `ChoiceExercise` (grille 2×2) | EcolnaAnswerCard | idem | à valider | unit + composant |
| S13 | `exercice-former-une-syllabe` | idem (step compose_syllable) | `ComposeSyllableExercise` | LetterTile, DropSlot, HintButton | vide/rempli/correct/incorrect/indice | à valider | unit + composant |
| S14 | `calcul-cp1` | idem (step count_objects) | `CountObjectsExercise` | EcolnaAnswerCard, EcolnaIllustration | sélection/vérification | à valider | unit + composant |
| S15 | `calcul-cp2` | idem (step simple_addition) | `SimpleAdditionExercise` | QuantityCard, EcolnaAnswerCard | sélection/vérification | à valider | unit + composant |
| S16 | `ecran-reussite` | `(child)/lesson/[lessonId]/result` | `LessonResultScreen` | StarRow, EcolnaButton | 1/2/3 étoiles | à valider | composant |
| S17 | `ecran-revision` | `(child)/revision` | `RevisionScreen` | NotionCard | liste notions, vide | à valider | composant |
| S18 | `espace-parent` | `(parent)/dashboard` | `ParentDashboardScreen` | StatCard, InsightCard | données réelles, vide | à valider | composant |
| S19 | `parametres` | `(settings)/index` | `SettingsScreen` | SettingsRow, EcolnaSwitch, DangerButton | switch, radio, confirmation reset | à valider | composant |
| S20 | `etat-hors-connexion` | `(child)/offline-info` (modal) | `OfflineInfoScreen` | Badge, EcolnaButton | statique | à valider | — |
| S21 | `ecolna-logo` | icône app + splash | assets `assets/icons/` | — | — | à valider | — |

## Écrans complémentaires (même langage visuel, non maquettés)

| Écran | Route | Justification |
|---|---|---|
| Parent gate (PIN) | `(parent)/gate` | Exigence stores enfants |
| Sélection de profil | `(onboarding)/select-profile` | Multi-enfants |
| Pause / reprise leçon | overlay dans `lesson/[lessonId]` | Résilience session |
| Tracé de lettre | step `trace_letter` | Type d'exercice requis |
| Récompenses | `(child)/rewards` | Gamification responsable |
| Diagnostic | `(parent)/diagnostics` | Export parent |
| Erreur récupérable | `RecoveryScreen` global | Résilience |
| Galerie DS (dev) | `(dev)/design-system` | Outillage |

Statuts de fidélité : `à valider` → `conforme` / `écart documenté` après la passe de QA visuelle (`docs/visual-qa.md`).
