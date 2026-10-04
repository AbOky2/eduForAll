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
 * Verrouillé ≠ caché : un badge non gagné garde sa forme, son pictogramme et
 * sa famille — mais la famille ne vit plus que dans son cœur pâle. Gagnée :
 * couronne teintée, cœur plein ; à gagner : couronne NEUTRE, cœur pâle,
 * pictogramme atténué, pastille cadenas. La différence se voit d'un coup
 * d'œil, même dans la famille soleil — et ce n'est jamais une grille grise.
 * Un badge est un objectif, jamais une boîte mystère.
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

/** `a` mêlé à `b` dans la proportion `t` (0 → b, 1 → a) — deux jetons `#rrggbb`. */
function mix(a: string, b: string, t: number): string {
  const channel = (hex: string, index: number) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
  const value = (index: number) =>
    Math.round(channel(a, index) * t + channel(b, index) * (1 - t))
      .toString(16)
      .padStart(2, '0');
  return `#${value(0)}${value(1)}${value(2)}`;
}

/**
 * La même famille, pas encore gagnée : la couronne neutre (`fill`), commune
 * à toutes les familles — la couleur ne vit plus que dans le cœur pâle (la
 * teinte soutenue) et dans le pictogramme atténué (`LOCKED_GLYPH_OPACITY`).
 * À côté d'une médaille gagnée (couronne teintée, cœur plein, pictogramme
 * blanc), le « pas encore » se lit sans hésiter.
 */
const LOCKED_RING = colors.fill;
const PALE = {
  success: { ring: LOCKED_RING, core: colors.feedbackCorrectShade, glyph: colors.success },
  brand: { ring: LOCKED_RING, core: colors.brandTintStrong, glyph: colors.brand },
  // Le soleil n'a pas de teinte soutenue : on la prend tout près de la teinte,
  // pour que le cœur pâle ne se lise plus comme un or (« Trois jours de suite »
  // gagnée à côté de « Cinq sans faute » à gagner).
  gold: { ring: LOCKED_RING, core: mix(colors.reward, colors.rewardTint, 0.12), glyph: colors.rewardDeep },
  // La nuit, en pâle, rejoint le bleu : un cœur nuit éclairci virerait au gris.
  night: { ring: LOCKED_RING, core: colors.brandTintStrong, glyph: colors.night },
  language: { ring: LOCKED_RING, core: subjectColors.language.tintStrong, glyph: subjectColors.language.solid },
  reading: { ring: LOCKED_RING, core: subjectColors.reading.tintStrong, glyph: subjectColors.reading.solid },
  writing: { ring: LOCKED_RING, core: subjectColors.writing.tintStrong, glyph: subjectColors.writing.solid },
  math: { ring: LOCKED_RING, core: subjectColors.math.tintStrong, glyph: subjectColors.math.solid },
} as const satisfies Record<keyof typeof FAMILY, Family>;

const LOCKED_GLYPH_OPACITY = 0.5;

/** Les couleurs d'une médaille, gagnée (pleine) ou à gagner (pâle, pictogramme atténué). */
export function badgeTone(id: BadgeArtId, earned: boolean): Family & { readonly glyphOpacity: number } {
  const family = BADGES[id].family;
  return earned
    ? { ...FAMILY[family], glyphOpacity: 1 }
    : { ...PALE[family], glyphOpacity: LOCKED_GLYPH_OPACITY };
}

const C = 48;
const RING_R = 46;
const CORE_R = 35;
const WEAVE_R = 30.5;
const GLYPH = 38;
/** Un point de palier se lit comme un point voulu, pas comme un pixel parasite. */
const PIP_R = 3.6;
/** En petit (une puce de la célébration), le point garde au moins ce rayon à l'écran, en dp… */
const PIP_MIN_DP = 2.6;
/** … sans jamais déborder de la couronne (11 unités de large). */
const PIP_MAX_R = 5;
const PIP_ORBIT = 40.5;
const PIP_STEP = 16;
/** Le centre de la pastille cadenas (bas droite). */
const LOCK_C = 81;

/** Le rayon d'un point de palier (repère 96) pour une médaille de `size` dp. */
export function pipRadius(size: number): number {
  return Math.min(PIP_MAX_R, Math.max(PIP_R, (PIP_MIN_DP * 96) / size));
}

/** Le pictogramme Phosphor (graisse pleine), centré dans le cœur. */
function Glyph({
  icon,
  color,
  size,
  cx,
  cy,
  opacity = 1,
}: {
  icon: IconName;
  color: string;
  size: number;
  cx: number;
  cy: number;
  opacity?: number;
}) {
  const k = size / 256;
  return (
    <G transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${k})`} opacity={opacity}>
      {PHOSPHOR[icon].fill.map((d) => (
        <Path key={d} d={d} fill={color} />
      ))}
    </G>
  );
}

/** Les points du palier, sur le bas de la couronne, centrés sur la verticale. */
function pips(count: number, r: number): { x: number; y: number }[] {
  // Des points plus gros s'écartent d'autant : toujours une demi-largeur d'air entre deux.
  const step = Math.max(PIP_STEP, ((2.6 * r) / PIP_ORBIT) * (180 / Math.PI));
  return Array.from({ length: count }, (_, index) => {
    const angle = ((90 + (index - (count - 1) / 2) * step) * Math.PI) / 180;
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
  const tone = badgeTone(id, earned);
  const pip = pipRadius(size);
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Circle cx={C} cy={C} r={RING_R} fill={tone.ring} />
      <Circle cx={C} cy={C} r={CORE_R} fill={tone.core} />
      {earned ? (
        <Circle cx={C} cy={C} r={WEAVE_R} fill="none" stroke={colors.onColorTrack} strokeWidth={1.5} />
      ) : null}
      <Glyph
        icon={badge.icon}
        color={tone.glyph}
        size={GLYPH}
        cx={C}
        cy={C}
        opacity={tone.glyphOpacity}
      />
      {badge.tier
        ? pips(badge.tier, pip).map((dot) =>
            earned ? (
              // Gagnée : le point plein de la famille, détaché de la couronne par un liseré blanc.
              <Circle key={`${dot.x}`} cx={dot.x} cy={dot.y} r={pip} fill={tone.core} stroke={colors.white} strokeWidth={1} />
            ) : (
              <Circle key={`${dot.x}`} cx={dot.x} cy={dot.y} r={pip} fill={tone.glyph} opacity={tone.glyphOpacity} />
            ),
          )
        : null}
      {earned ? null : (
        // La pastille cadenas, détachée par un liseré blanc, poussée dans le coin :
        // le quatrième point de « Cinquante leçons » reste visible à côté d'elle.
        <G>
          <Circle cx={LOCK_C} cy={LOCK_C} r={14} fill={colors.white} />
          <Circle cx={LOCK_C} cy={LOCK_C} r={11} fill={colors.fillStrong} />
          <Glyph icon="lock" color={colors.inkSecondary} size={14} cx={LOCK_C} cy={LOCK_C} />
        </G>
      )}
    </Svg>
  );
});
