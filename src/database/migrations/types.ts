import type { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
  /** Monotonically increasing, never reused, never edited once shipped. */
  readonly version: number;
  readonly name: string;
  readonly up: (db: SQLiteDatabase) => Promise<void>;
}
