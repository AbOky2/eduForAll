# Base de données

SQLite via expo-sqlite (WAL, foreign_keys ON). Connexion unique
(`src/database/connection/database.ts`), seam de test.

## Tables

| Table | Rôle | Notes |
|---|---|---|
| `child_profiles` | Profils enfants locaux | prénom ≤ 40, niveau CHECK CP1/CP2 |
| `curriculum_levels/worlds` | Index du contenu | ré-importables, upsert |
| `lessons`, `lesson_prerequisites`, `lesson_skills` | Index leçons | contenu réel dans le manifeste bundlé |
| `lesson_progress` | Statut/étoiles/étape courante | PK (profil, leçon) ; les étoiles ne régressent jamais (MAX) |
| `exercise_attempts` | Chaque réponse | alimente révision + parent |
| `skill_mastery` | Compteurs par compétence | mastery : discovering/practicing/mastered/needs_review |
| `revision_queue` | Notions à revoir | une entrée ouverte par compétence |
| `learning_sessions` | Sessions (durées) | temps « aujourd'hui » du parent |
| `achievements` | Badges (schéma prêt) | UI à venir |
| `app_settings` | Clé/valeur (profil actif, son, onboarding) | |
| `content_versions` | Versions de contenu importées | idempotence de l'import |
| `migration_history` | Migrations appliquées | gérée par le runner |

## Migrations (`docs/migrations.md` pour le détail)

- Registre ordonné `src/database/migrations/index.ts`, **append-only**.
- Chaque migration s'exécute dans une transaction exclusive ; échec = rollback
  de la migration fautive, les précédentes restent acquises.
- Jamais de DROP ni de mutation destructive en montée de version.

## Accès

L'UI ne voit jamais de SQL : repositories d'intention
(`ChildProfileRepository`, `ProgressRepository`, `SettingsRepository`) et
read models applicatifs (`home-summary`, `parent-dashboard`).
