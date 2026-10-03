import { BadgeTile } from '@/design-system/components/badge-tile';
import { fr } from '@/localization/fr/strings';

import type { AchievementId } from '../domain/achievements';

interface AchievementBadgeProps {
  id: AchievementId;
  earned: boolean;
  size?: number | undefined;
  onDark?: boolean | undefined;
  /** Toute la largeur de sa cellule, deux lignes de nom réservées (étagère du profil). */
  fill?: boolean | undefined;
  /** `inline` : médaille et nom côte à côte (rangée compacte de la célébration). */
  layout?: 'stack' | 'inline' | undefined;
}

/** Un badge du domaine, dessiné par sa médaille (brief v2 § 9.2). */
export function AchievementBadge({
  id,
  earned,
  size,
  onDark,
  fill,
  layout,
}: AchievementBadgeProps) {
  return (
    <BadgeTile
      id={id}
      label={fr.achievements.labels[id]}
      description={fr.achievements.descriptions[id]}
      lockedHint={fr.achievements.lockedHint}
      earned={earned}
      size={size}
      onDark={onDark}
      fill={fill}
      layout={layout}
    />
  );
}

/**
 * L'étagère : les médailles gagnées d'abord, puis celles à gagner, chaque
 * groupe dans l'ordre du catalogue — ce qu'on a se voit en premier.
 */
export function shelfOrder(
  ids: readonly AchievementId[],
  earned: ReadonlySet<string>,
): AchievementId[] {
  return [...ids.filter((id) => earned.has(id)), ...ids.filter((id) => !earned.has(id))];
}
