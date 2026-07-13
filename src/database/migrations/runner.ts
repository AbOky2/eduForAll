import type { SQLiteDatabase } from 'expo-sqlite';

import { MigrationError } from '@/core/errors/app-errors';
import { createLogger } from '@/core/logging/logger';

import type { Migration } from './types';

const log = createLogger('migrations');

/**
 * Applies pending migrations in order, each inside its own transaction.
 * `migration_history` records what ran; a failure rolls back the failing
 * migration and aborts, leaving previously applied versions intact.
 */
export async function runMigrations(
  db: SQLiteDatabase,
  allMigrations: readonly Migration[],
): Promise<{ appliedVersions: number[] }> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migration_history (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM migration_history ORDER BY version',
  );
  const appliedSet = new Set(applied.map((row) => row.version));

  const sorted = [...allMigrations].sort((a, b) => a.version - b.version);
  const appliedVersions: number[] = [];

  for (const migration of sorted) {
    if (appliedSet.has(migration.version)) {
      continue;
    }
    try {
      await db.withExclusiveTransactionAsync(async (txn) => {
        await migration.up(txn);
        await txn.runAsync(
          'INSERT INTO migration_history (version, name, applied_at) VALUES (?, ?, ?)',
          migration.version,
          migration.name,
          new Date().toISOString(),
        );
      });
      appliedVersions.push(migration.version);
      log.info(`applied migration ${migration.version} (${migration.name})`);
    } catch (cause) {
      throw new MigrationError(
        `Migration ${migration.version} (${migration.name}) failed`,
        cause,
      );
    }
  }

  return { appliedVersions };
}
