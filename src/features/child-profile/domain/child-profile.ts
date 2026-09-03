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

export const AVATAR_IDS = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4'] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

/** Avatar drawing variant for an avatar id — one place, so screens agree. */
export function avatarVariant(avatarId: string): 1 | 2 | 3 | 4 {
  const index = AVATAR_IDS.indexOf(avatarId as AvatarId);
  return ((index < 0 ? 0 : index) + 1) as 1 | 2 | 3 | 4;
}

export function isValidFirstName(candidate: string): boolean {
  const trimmed = candidate.trim();
  return trimmed.length >= 1 && trimmed.length <= 40;
}
