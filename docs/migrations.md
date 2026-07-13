# Migrations

## Règles

1. **Append-only** : une migration livrée ne se modifie jamais ; on en ajoute
   une nouvelle (`002-…`, `003-…`).
2. Version entière strictement croissante, jamais réutilisée.
3. Additif d'abord : `ALTER TABLE ADD COLUMN`, nouvelles tables, nouveaux
   index. Pas de DROP, pas de renommage destructif.
4. Si une transformation de données est nécessaire : copier vers une nouvelle
   table, migrer les lignes, garder l'ancienne jusqu'à la version N+2.
5. Toute migration a un test (voir `tests/integration` à étoffer avec un
   harnais SQLite in-memory).

## Écrire une migration

```ts
// src/database/migrations/002-add-xyz.ts
export const addXyz: Migration = {
  version: 2,
  name: 'add-xyz',
  up: async (db) => {
    await db.execAsync(`ALTER TABLE lesson_progress ADD COLUMN xyz TEXT;`);
  },
};
```

Puis l'ajouter à `migrations` dans `index.ts`. Le runner
(`runner.ts`) l'appliquera en transaction exclusive au prochain démarrage et
l'inscrira dans `migration_history`.
