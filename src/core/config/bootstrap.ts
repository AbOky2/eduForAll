import { asId } from '@/core/ids/ids';
import { toAppError, type AppError } from '@/core/errors/app-errors';
import { createLogger } from '@/core/logging/logger';
import { getDatabase } from '@/database/connection/database';
import { migrations } from '@/database/migrations';
import { runMigrations } from '@/database/migrations/runner';
import { loadCurriculum } from '@/features/curriculum/application/curriculum-catalog';
import { importCurriculum } from '@/features/curriculum/infrastructure/curriculum-import';
import { createChildProfileRepository } from '@/features/child-profile/infrastructure/child-profile-repository';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { createSettingsRepository } from '@/features/settings/infrastructure/settings-repository';
import { useSettings } from '@/features/settings/application/settings-store';

const log = createLogger('bootstrap');

export type BootstrapOutcome =
  | { status: 'ready'; initialRoute: '/(onboarding)' | '/(child)/(tabs)' }
  | { status: 'failed'; error: AppError };

/**
 * First-launch and every-launch initialization. Fully offline, transactional,
 * idempotent and resumable: a crash mid-import leaves a consistent database
 * and the next launch picks up where it left off.
 */
export async function bootstrapApp(): Promise<BootstrapOutcome> {
  try {
    const db = await getDatabase();
    await runMigrations(db, migrations);

    const manifest = loadCurriculum();
    await importCurriculum(db, manifest);

    const settings = createSettingsRepository(db);
    const soundEnabled = (await settings.get('sound_enabled')) !== 'false';
    useSettings.getState().setSoundEnabled(soundEnabled);

    const activeProfileId = await settings.get('active_profile_id');
    if (activeProfileId) {
      const profiles = createChildProfileRepository(db);
      const profile = await profiles.findById(asId(activeProfileId));
      if (profile) {
        useActiveProfile.getState().setProfile(profile);
        log.info('bootstrap complete — returning child');
        return { status: 'ready', initialRoute: '/(child)/(tabs)' };
      }
      await settings.remove('active_profile_id');
    }

    log.info('bootstrap complete — onboarding');
    return { status: 'ready', initialRoute: '/(onboarding)' };
  } catch (cause) {
    const error = toAppError(cause, 'Bootstrap failed');
    log.error('bootstrap failed', error);
    return { status: 'failed', error };
  }
}
