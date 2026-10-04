import { BadgeTile, type BadgeLabelVariant } from '@/design-system/components/badge-tile';
import { fr } from '@/localization/fr/strings';

import type { AchievementId } from '../domain/achievements';

interface AchievementBadgeProps {
  id: AchievementId;
  earned: boolean;
  size?: number | undefined;
  onDark?: boolean | undefined;
  /** Toute la largeur de sa cellule, deux lignes de nom réservées (étagère du profil). */
  fill?: boolean | undefined;
  /** La taille du nom : petit sur l'étagère, grand sur la célébration. */
  labelVariant?: BadgeLabelVariant | undefined;
  /** Une largeur imposée (la case d'une rangée de médailles). */
  width?: number | undefined;
}

/** Un badge du domaine, dessiné par sa médaille (brief v2 § 9.2). */
export function AchievementBadge({
  id,
  earned,
  size,
  onDark,
  fill,
  labelVariant,
  width,
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
      labelVariant={labelVariant}
      width={width}
    />
  );
}

/**
 * L'étagère en deux rayons : les médailles gagnées d'abord, puis celles à
 * gagner (sous leur titre), chaque rayon dans l'ordre du catalogue — ce
 * qu'on a se voit en premier.
 */
export function shelfGroups(
  ids: readonly AchievementId[],
  earned: ReadonlySet<string>,
): { earned: AchievementId[]; toEarn: AchievementId[] } {
  return {
    earned: ids.filter((id) => earned.has(id)),
    toEarn: ids.filter((id) => !earned.has(id)),
  };
}
