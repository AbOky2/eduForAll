import { memo } from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { colors } from '../tokens';
import { PHOSPHOR, type IconName } from './phosphor.generated';

export type { IconName } from './phosphor.generated';

/**
 * `mono`  : le trait (graisse « bold »), dans `color` — l'état normal ;
 * `duo`   : un aplat à 20 % sous le trait — l'objet d'une illustration ;
 * `color` : plein, dans la couleur qui porte le sens de l'icône (étoile
 *           soleil, coche verte…) — l'état actif, la récompense.
 */
export type IconMode = 'mono' | 'duo' | 'color';

/** Modificateur posé en bas à droite (ex. l'onglet « Parents » : cadenas). */
export type IconModifier = 'lock';

export interface EcolnaIconProps {
  name: IconName;
  /** Taille en dp (défaut 24). */
  size?: number;
  /** Couleur du trait (défaut : encre secondaire) ; en `color`, remplace la couleur de sens. */
  color?: string | undefined;
  /** Rétrocompatible : équivaut à `mode="color"`. */
  filled?: boolean;
  mode?: IconMode;
  modifier?: IconModifier | undefined;
  /** Couleur du fond sous l'icône, pour détacher le modificateur (défaut blanc). */
  modifierBackdrop?: string;
}

/** La couleur qui porte le sens d'une icône pleine. */
const MEANING: Partial<Record<IconName, string>> = {
  star: colors.reward,
  sun: colors.reward,
  trophy: colors.reward,
  medal: colors.reward,
  sparkle: colors.reward,
  lightbulb: colors.reward,
  flame: '#ff6b2c',
  check: colors.success,
  sprout: colors.success,
  leaf: colors.success,
  lock: colors.inkDisabled,
  'offline-ok': colors.success,
};

/**
 * Icônes v4 « Épure » : la famille Phosphor (licence MIT), embarquée comme
 * données (`phosphor.generated.ts`) — aucune police d'icônes, aucun réseau.
 * Une seule famille, trois graisses : la cohérence d'un produit soigné. La
 * coche « couleur » est une pastille verte au trait blanc : la marque de la
 * réussite, partout la même.
 */
export const EcolnaIcon = memo(function EcolnaIcon({
  name,
  size = 24,
  color,
  filled = false,
  mode,
  modifier,
  modifierBackdrop = colors.card,
}: EcolnaIconProps) {
  const glyph = PHOSPHOR[name];
  const resolved: IconMode = mode ?? (filled ? 'color' : 'mono');
  const ink = color ?? (resolved === 'color' ? (MEANING[name] ?? colors.brand) : resolved === 'duo' ? colors.brand : colors.inkSecondary);

  let body;
  if (resolved === 'color' && name === 'check') {
    body = (
      <>
        <Circle cx={128} cy={128} r={120} fill={ink} />
        <G transform="translate(128 128) scale(0.56) translate(-128 -128)">
          {glyph.bold.map((d) => (
            <Path key={d} d={d} fill={colors.white} />
          ))}
        </G>
      </>
    );
  } else if (resolved === 'color' && name !== 'star-outline') {
    body = glyph.fill.map((d) => <Path key={d} d={d} fill={ink} />);
  } else if (resolved === 'duo') {
    body = (
      <>
        {glyph.duoBack.map((d) => (
          <Path key={`b${d}`} d={d} fill={ink} opacity={0.2} />
        ))}
        {glyph.duoFront.map((d) => (
          <Path key={d} d={d} fill={ink} />
        ))}
      </>
    );
  } else {
    body = glyph.bold.map((d) => <Path key={d} d={d} fill={ink} />);
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {body}
      {modifier === 'lock' ? (
        <G>
          <Circle cx={200} cy={200} r={60} fill={modifierBackdrop} />
          <G transform="translate(200 202) scale(0.34) translate(-128 -128)">
            {PHOSPHOR.lock.fill.map((d) => (
              <Path key={d} d={d} fill={ink} />
            ))}
          </G>
        </G>
      ) : null}
    </Svg>
  );
});
