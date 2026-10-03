import type { ChildProfileId } from '@/core/ids/ids';
import type { LevelId } from '@/content/schemas/curriculum-schema';

/** Locally stored child identity — first name and avatar never leave the device. */
export interface ChildProfile {
  readonly id: ChildProfileId;
  readonly firstName: string;
  readonly avatarId: AvatarId;
  readonly level: LevelId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * The twelve children of design/brief-identite-v2.md § 8.3. The first four are
 * unchanged (profiles created before v2 keep a close child: same gender, same
 * dominant colour); `avatar_id` has no CHECK constraint, so no migration.
 * Must stay equal to `AVATAR_ART_IDS` (src/design-system/avatars).
 */
export const AVATAR_IDS = [
  'avatar-1',
  'avatar-2',
  'avatar-3',
  'avatar-4',
  'avatar-5',
  'avatar-6',
  'avatar-7',
  'avatar-8',
  'avatar-9',
  'avatar-10',
  'avatar-11',
  'avatar-12',
] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

/**
 * Legacy `AvatarFace` variant (1–4) for an avatar id, clamped: screens still
 * draw the old face until they switch to `EcolnaAvatar`. Removed at
 * integration (brief § 14.3).
 */
export function avatarVariant(avatarId: string): 1 | 2 | 3 | 4 {
  const index = AVATAR_IDS.indexOf(avatarId as AvatarId);
  return (Math.min(Math.max(index, 0), 3) + 1) as 1 | 2 | 3 | 4;
}

export function isValidFirstName(candidate: string): boolean {
  const trimmed = candidate.trim();
  return trimmed.length >= 1 && trimmed.length <= 40;
}
