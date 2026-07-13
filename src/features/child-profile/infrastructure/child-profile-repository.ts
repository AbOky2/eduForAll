import type { SQLiteDatabase } from 'expo-sqlite';

import { asId, newChildProfileId, type ChildProfileId } from '@/core/ids/ids';
import type { LevelId } from '@/content/schemas/curriculum-schema';

import type { AvatarId, ChildProfile } from '../domain/child-profile';

interface ChildProfileRow {
  id: string;
  first_name: string;
  avatar_id: string;
  level: string;
  created_at: string;
  updated_at: string;
}

function toDomain(row: ChildProfileRow): ChildProfile {
  return {
    id: asId<'ChildProfileId'>(row.id),
    firstName: row.first_name,
    avatarId: row.avatar_id as AvatarId,
    level: row.level as LevelId,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ChildProfileRepository {
  create(input: { firstName: string; avatarId: AvatarId; level: LevelId }): Promise<ChildProfile>;
  findAll(): Promise<ChildProfile[]>;
  findById(id: ChildProfileId): Promise<ChildProfile | null>;
  updateLevel(id: ChildProfileId, level: LevelId): Promise<void>;
  deleteWithProgress(id: ChildProfileId): Promise<void>;
}

export function createChildProfileRepository(db: SQLiteDatabase): ChildProfileRepository {
  return {
    async create(input) {
      const now = new Date().toISOString();
      const profile: ChildProfile = {
        id: newChildProfileId(),
        firstName: input.firstName.trim(),
        avatarId: input.avatarId,
        level: input.level,
        createdAt: now,
        updatedAt: now,
      };
      await db.runAsync(
        `INSERT INTO child_profiles (id, first_name, avatar_id, level, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        profile.id,
        profile.firstName,
        profile.avatarId,
        profile.level,
        profile.createdAt,
        profile.updatedAt,
      );
      return profile;
    },

    async findAll() {
      const rows = await db.getAllAsync<ChildProfileRow>(
        'SELECT * FROM child_profiles ORDER BY created_at',
      );
      return rows.map(toDomain);
    },

    async findById(id) {
      const row = await db.getFirstAsync<ChildProfileRow>(
        'SELECT * FROM child_profiles WHERE id = ?',
        id,
      );
      return row ? toDomain(row) : null;
    },

    async updateLevel(id, level) {
      await db.runAsync(
        'UPDATE child_profiles SET level = ?, updated_at = ? WHERE id = ?',
        level,
        new Date().toISOString(),
        id,
      );
    },

    /** Cascades to all progression tables via foreign keys. Parent-gated. */
    async deleteWithProgress(id) {
      await db.runAsync('DELETE FROM child_profiles WHERE id = ?', id);
    },
  };
}
