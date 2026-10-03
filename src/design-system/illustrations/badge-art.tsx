import { memo } from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { PHOSPHOR, type IconName } from '../icons/phosphor.generated';
import { colors, subjectColors } from '../tokens';

/**
 * Les médailles ECOLNA v4 « Épure » (design/direction-v4-epure.md).
 *
 * Une seule famille, dessinée comme le reste de l'app : plate, nette, sans
 * feston, sans reflet. Un médaillon en deux disques — la couronne claire, le
 * cœur plein — cerclé d'un filet blanc à peine visible (le motif de vannerie
 * de la carte du jour), et UN pictogramme de la famille d'icônes de l'app,
 * qu'un enfant de six ans nomme tout de suite : des pas, un chemin, un
 * cartable, une coupe, un livre, des bulles, un crayon, une couronne…
 *
 * Les quatre jalons de leçons (1 / 5 / 20 / 50) portent en plus 1 à 4 points
 * sur le bas de la couronne : le palier se lit à la forme, pas seulement à la
 * couleur.
 *
 * Verrouillé ≠ caché : un badge non gagné garde sa forme et son pictogramme,
 * en gris, avec une pastille cadenas. Un badge est un objectif, jamais une
 * boîte mystère.
 *
 * Grille 96 × 96. N'importe que react, react-native-svg et les jetons : la
 * planche le rend hors appareil.
 */

export const BADGE_ART_IDS = [
  'first-lesson',
  'five-lessons',
  'twenty-lessons',
  'fifty-lessons',
  'first-perfect',
  'five-perfect',
  'first-world',
  'reader',
  'speaker',
  'writer',
  'counter',
  'streak-three',
  'streak-seven',
  'star-collector',
] as const;

/** Les quatorze `AchievementId` (src/features/achievements/domain/achievements.ts). */
export type BadgeArtId = (typeof BADGE_ART_IDS)[number];

interface Family {
  /** La couronne. */
  readonly ring: string;
  /** Le cœur. */
  readonly core: string;
  /** Le pictogramme. */
  readonly glyph: string;
}

/**
 * Les familles de couleur : celles de l'app, rien d'autre. L'or porte un
 * pictogramme ambre foncé (un blanc sur l'or ne se lirait pas) ; la nuit
 * porte le soleil, comme la carte du jour.
 */
const FAMILY = {
  success: { ring: colors.successTint, core: colors.success, glyph: colors.white },
  brand: { ring: colors.brandTint, core: colors.brand, glyph: colors.white },
  gold: { ring: colors.rewardTint, core: colors.reward, glyph: colors.rewardInk },
  night: { ring: colors.brandTintStrong, core: colors.night, glyph: colors.reward },
  language: { ring: subjectColors.language.tint, core: subjectColors.language.solid, glyph: colors.white },
  reading: { ring: subjectColors.reading.tint, core: subjectColors.reading.solid, glyph: colors.white },
  writing: { ring: subjectColors.writing.tint, core: subjectColors.writing.solid, glyph: colors.white },
  math: { ring: subjectColors.math.tint, core: subjectColors.math.solid, glyph: colors.white },
} as const satisfies Record<string, Family>;

const BADGES: Record<BadgeArtId, { icon: IconName; family: keyof typeof FAMILY; tier?: number }> = {
  'first-lesson': { icon: 'footprints', family: 'success', tier: 1 },
  'five-lessons': { icon: 'path', family: 'brand', tier: 2 },
  'twenty-lessons': { icon: 'learn', family: 'brand', tier: 3 },
  'fifty-lessons': { icon: 'trophy', family: 'gold', tier: 4 },
  'first-perfect': { icon: 'seal-check', family: 'success' },
  'five-perfect': { icon: 'medal', family: 'gold' },
  'first-world': { icon: 'flag-banner', family: 'night' },
  reader: { icon: 'book', family: 'reading' },
  speaker: { icon: 'speech', family: 'language' },
  writer: { icon: 'pencil', family: 'writing' },
  counter: { icon: 'crown', family: 'math' },
  'streak-three': { icon: 'sun', family: 'gold' },
  'streak-seven': { icon: 'calendar-check', family: 'brand' },
  'star-collector': { icon: 'star', family: 'gold' },
};

const LOCKED: Family = { ring: colors.fill, core: colors.fillStrong, glyph: colors.inkDisabled };

const C = 48;
const RING_R = 46;
const CORE_R = 35;
const WEAVE_R = 30.5;
const GLYPH = 38;
const PIP_R = 2.6;
const PIP_ORBIT = 40.5;
const PIP_STEP = 13;

/** Le pictogramme Phosphor (graisse pleine), centré dans le cœur. */
function Glyph({ icon, color, size, cx, cy }: { icon: IconName; color: string; size: number; cx: number; cy: number }) {
  const k = size / 256;
  return (
    <G transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${k})`}>
      {PHOSPHOR[icon].fill.map((d) => (
        <Path key={d} d={d} fill={color} />
      ))}
    </G>
  );
}

/** Les points du palier, sur le bas de la couronne, centrés sur la verticale. */
function pips(count: number): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = ((90 + (index - (count - 1) / 2) * PIP_STEP) * Math.PI) / 180;
    return { x: C + PIP_ORBIT * Math.cos(angle), y: C + PIP_ORBIT * Math.sin(angle) };
  });
}

interface BadgeArtProps {
  id: BadgeArtId;
  earned: boolean;
  /** Côté en dp. */
  size: number;
}

export const BadgeArt = memo(function BadgeArt({ id, earned, size }: BadgeArtProps) {
  const badge = BADGES[id];
  const tone = earned ? FAMILY[badge.family] : LOCKED;
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Circle cx={C} cy={C} r={RING_R} fill={tone.ring} />
      <Circle cx={C} cy={C} r={CORE_R} fill={tone.core} />
      {earned ? (
        <Circle cx={C} cy={C} r={WEAVE_R} fill="none" stroke={colors.onColorTrack} strokeWidth={1.5} />
      ) : null}
      <Glyph icon={badge.icon} color={tone.glyph} size={GLYPH} cx={C} cy={C} />
      {badge.tier
        ? pips(badge.tier).map((pip) => (
            <Circle key={`${pip.x}`} cx={pip.x} cy={pip.y} r={PIP_R} fill={earned ? tone.core : colors.inkDisabled} />
          ))
        : null}
      {earned ? null : (
        // La pastille cadenas, détachée par un liseré blanc.
        <G>
          <Circle cx={76} cy={76} r={14} fill={colors.white} />
          <Circle cx={76} cy={76} r={11} fill={colors.fillStrong} />
          <Glyph icon="lock" color={colors.inkSecondary} size={13} cx={76} cy={76} />
        </G>
      )}
    </Svg>
  );
});
