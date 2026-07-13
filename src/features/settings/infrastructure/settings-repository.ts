import type { SQLiteDatabase } from 'expo-sqlite';

export type SettingKey = 'active_profile_id' | 'sound_enabled' | 'onboarding_done';

export interface SettingsRepository {
  get(key: SettingKey): Promise<string | null>;
  set(key: SettingKey, value: string): Promise<void>;
  remove(key: SettingKey): Promise<void>;
}

export function createSettingsRepository(db: SQLiteDatabase): SettingsRepository {
  return {
    async get(key) {
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM app_settings WHERE key = ?',
        key,
      );
      return row?.value ?? null;
    },
    async set(key, value) {
      await db.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        key,
        value,
        new Date().toISOString(),
      );
    },
    async remove(key) {
      await db.runAsync('DELETE FROM app_settings WHERE key = ?', key);
    },
  };
}
