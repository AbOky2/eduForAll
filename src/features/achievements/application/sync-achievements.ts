import { getDatabase } from '@/database/connection/database';
import type { ChildProfileId } from '@/core/ids/ids';

import { earnedAchievements, type AchievementId } from '../domain/achievements';
import { createAchievementsRepository } from '../infrastructure/achievements-repository';

/**
 * Recomputes the badges from the progression and stores the missing ones.
 * Returns only the badges unlocked by this call — what the result screen
 * celebrates. Recomputing (rather than incrementing) keeps badges correct
 * even after a reset or a content update.
 */
export async function syncAchievements(
  childProfileId: ChildProfileId,
): Promise<AchievementId[]> {
  const db = await getDatabase();
  const repository = createAchievementsRepository(db);
  const stats = await repository.loadStats(childProfileId);
  return repository.award(childProfileId, earnedAchievements(stats));
}

/** Read model for the child profile screen: every badge, earned or not. */
export async function loadAchievementBoard(childProfileId: ChildProfileId): Promise<{
  earned: AchievementId[];
  stats: Awaited<ReturnType<ReturnType<typeof createAchievementsRepository>['loadStats']>>;
}> {
  const db = await getDatabase();
  const repository = createAchievementsRepository(db);
  const [earned, stats] = await Promise.all([
    repository.findEarned(childProfileId),
    repository.loadStats(childProfileId),
  ]);
  return { earned, stats };
}
