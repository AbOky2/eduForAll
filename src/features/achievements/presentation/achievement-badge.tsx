import { BadgeTile } from '@/design-system/components/badge-tile';
import { fr } from '@/localization/fr/strings';

import type { AchievementId } from '../domain/achievements';

interface AchievementBadgeProps {
  id: AchievementId;
  earned: boolean;
  size?: number | undefined;
  onDark?: boolean | undefined;
}

/** Un badge du domaine, dessiné par sa médaille (brief v2 § 9.2). */
export function AchievementBadge({ id, earned, size, onDark }: AchievementBadgeProps) {
  return (
    <BadgeTile
      id={id}
      label={fr.achievements.labels[id]}
      description={fr.achievements.descriptions[id]}
      lockedHint={fr.achievements.lockedHint}
      earned={earned}
      size={size}
      onDark={onDark}
    />
  );
}
