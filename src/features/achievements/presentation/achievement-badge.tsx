import { BadgeTile } from '@/design-system/components/badge-tile';
import type { IconName } from '@/design-system/icons/alifa-icon';
import { colors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { AchievementId } from '../domain/achievements';

/** Badge → icône et couleur de médaille. */
const BADGE_ART: Record<AchievementId, { icon: IconName; tint: string; container: string }> = {
  'first-lesson': { icon: 'sparkle', tint: colors.onPrimaryContainer, container: colors.primaryContainer },
  'five-lessons': { icon: 'sparkle', tint: colors.onPrimaryContainer, container: colors.primaryContainer },
  'twenty-lessons': { icon: 'medal', tint: colors.onPrimaryContainer, container: colors.primaryFixedDim },
  'fifty-lessons': { icon: 'trophy', tint: colors.onPrimaryContainer, container: colors.primaryFixedDim },
  'first-perfect': { icon: 'star', tint: colors.starActive, container: colors.tertiaryFixed },
  'five-perfect': { icon: 'trophy', tint: colors.starActive, container: colors.tertiaryFixed },
  'first-world': { icon: 'leaf', tint: colors.onSecondaryContainer, container: colors.secondaryContainer },
  reader: { icon: 'book', tint: colors.onSecondaryContainer, container: colors.secondaryContainer },
  speaker: { icon: 'speech', tint: colors.onSecondaryContainer, container: colors.secondaryContainer },
  writer: { icon: 'pencil', tint: colors.onTertiaryContainer, container: colors.tertiaryFixed },
  counter: { icon: 'calculator', tint: colors.onSecondaryContainer, container: colors.secondaryContainer },
  'streak-three': { icon: 'flame', tint: colors.onPrimaryContainer, container: colors.primaryContainer },
  'streak-seven': { icon: 'flame', tint: colors.onPrimaryContainer, container: colors.primaryFixedDim },
  'star-collector': { icon: 'star', tint: colors.starActive, container: colors.tertiaryFixed },
};

interface AchievementBadgeProps {
  id: AchievementId;
  earned: boolean;
  size?: number | undefined;
}

export function AchievementBadge({ id, earned, size }: AchievementBadgeProps) {
  const art = BADGE_ART[id];
  return (
    <BadgeTile
      icon={art.icon}
      tint={art.tint}
      container={art.container}
      label={fr.achievements.labels[id]}
      description={fr.achievements.descriptions[id]}
      lockedHint={fr.achievements.lockedHint}
      earned={earned}
      size={size}
    />
  );
}
