import * as SQLite from 'expo-sqlite';

import { DatabaseInitializationError } from '@/core/errors/app-errors';
import { createLogger } from '@/core/logging/logger';

const DATABASE_NAME = 'alifa.db';
const log = createLogger('database');

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Single application database handle. SQLite is the source of truth for
 * profiles, curriculum index, progression and settings (Zustand only holds
 * transient session state — see docs/architecture.md).
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= open();
  return databasePromise;
}

async function open(): Promise<SQLite.SQLiteDatabase> {
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    // WAL keeps reads fast during lesson-progress writes on low-end devices.
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    log.info('database opened');
    return db;
  } catch (cause) {
    databasePromise = null;
    throw new DatabaseInitializationError('Failed to open SQLite database', cause);
  }
}

/** Test seam: swap in an in-memory database. */
export function setDatabaseForTesting(db: SQLite.SQLiteDatabase): void {
  databasePromise = Promise.resolve(db);
}

export function resetDatabaseHandleForTesting(): void {
  databasePromise = null;
}
