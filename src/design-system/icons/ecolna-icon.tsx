import { memo, type ReactElement } from 'react';
import Svg, { G, Path } from 'react-native-svg';

import { colors } from '../tokens';
import { M_GLYPHS, renderMGlyph, type IconMode } from './glyphs-m';
import { S_GLYPHS, renderSGlyph, type IconName } from './glyphs-s';

export type { IconName } from './glyphs-s';
export type { IconMode } from './glyphs-m';

/** Modificateur posé en bas à droite (ex. l'onglet « Parents » : cadenas). */
export type IconModifier = 'lock';

export interface EcolnaIconProps {
  name: IconName;
  /** Taille en dp (défaut 24). À partir de 32, le dessin du palier M s'il existe. */
  size?: number;
  /** Couleur du mode `mono` (défaut `colors.onSurfaceVariant`). */
  color?: string;
  /** Rétrocompatible : mode `color` (palier M) ou jumeau plein (palier S). */
  filled?: boolean;
  /** Mode de rendu du palier M (défaut : `filled` ? 'color' : 'mono'). */
  mode?: IconMode;
  /** Petit cadenas en bas à droite, détaché par un liseré de `modifierBackdrop`. */
  modifier?: IconModifier;
  /** Couleur du fond sous l'icône, pour détacher le modificateur (défaut `colors.card`). */
  modifierBackdrop?: string;
}

/** Taille à partir de laquelle le dessin du palier M remplace celui du palier S (§ 6.1). */
export const M_TIER_MIN_SIZE = 32;

/**
 * Le palier dessiné. Optique, pas homothétie : un dessin 24 n'est jamais
 * agrandi quand son jumeau 48 existe. Le palier S n'a que `mono` et le
 * jumeau plein : un mode `duo` ou `color` demandé explicitement prend le
 * dessin M même en petit, puisque c'est lui qui porte la couleur.
 */
export function iconTier(name: IconName, size: number, mode?: IconMode): 'S' | 'M' {
  if (M_GLYPHS[name] === undefined) {
    return 'S';
  }
  return size >= M_TIER_MIN_SIZE || mode === 'duo' || mode === 'color' ? 'M' : 'S';
}

// Cadenas modificateur, grille 48 : le même cadenas rond que le glyphe, plein,
// détaché du dessin par un liseré de 3 u couleur du fond.
const MOD_SHACKLE = 'M35.5 36V33A3 3 0 0 1 41.5 33V36';
const MOD_BODY = 'M44 39A5.5 5.5 0 1 1 33 39A5.5 5.5 0 1 1 44 39Z';
const ROUND = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function lockModifier(color: string, backdrop: string): ReactElement[] {
  return [
    <Path key="m1" d={MOD_SHACKLE} fill="none" stroke={backdrop} strokeWidth={9} {...ROUND} />,
    <Path key="m2" d={MOD_BODY} fill={backdrop} stroke={backdrop} strokeWidth={6} {...ROUND} />,
    <Path key="m3" d={MOD_SHACKLE} fill="none" stroke={color} strokeWidth={3} {...ROUND} />,
    <Path key="m4" d={MOD_BODY} fill={color} />,
  ];
}

/**
 * Les éléments d'une icône sont immuables pour un même (nom, palier, mode,
 * couleur, modificateur) : on les garde au lieu de réallouer la liste à
 * chaque rendu. Les modes `duo` et `color` ne dépendent pas de `color`.
 */
const cache = new Map<string, ReactElement[]>();
const CACHE_LIMIT = 512;

function iconElements(
  name: IconName,
  tier: 'S' | 'M',
  mode: IconMode,
  color: string,
  solidTwin: boolean,
  modifier: IconModifier | undefined,
  backdrop: string,
): ReactElement[] {
  const ink = tier === 'S' || mode === 'mono' || modifier !== undefined ? color : '';
  const variant = tier === 'M' ? mode : solidTwin ? 'plein' : 'contour';
  const key = `${tier}|${name}|${variant}|${ink}|${modifier ?? ''}|${modifier ? backdrop : ''}`;
  const hit = cache.get(key);
  if (hit) {
    return hit;
  }
  const m = tier === 'M' ? M_GLYPHS[name] : undefined;
  const elements = m
    ? renderMGlyph(m, mode, color)
    : renderSGlyph(S_GLYPHS[name], color, solidTwin);
  if (modifier === 'lock') {
    const lock = lockModifier(color, backdrop);
    // Le cadenas est dessiné sur la grille 48 ; le palier S le ramène à 24.
    elements.push(
      tier === 'M' ? (
        <G key="mod">{lock}</G>
      ) : (
        <G key="mod" transform="scale(0.5)">
          {lock}
        </G>
      ),
    );
  }
  if (cache.size >= CACHE_LIMIT) {
    cache.clear();
  }
  cache.set(key, elements);
  return elements;
}

/**
 * Icônes ECOLNA v2 « Galets & craie » (design/brief-identite-v2.md § 6) :
 * glyphes d'interface (palier S, 24 u, trait 2) et pictogrammes enfant
 * (palier M, 48 u, trait 4, modes mono / duo / couleur). Aucun réseau,
 * aucune police d'icônes : tout est dessiné ici.
 */
export const EcolnaIcon = memo(function EcolnaIcon({
  name,
  size = 24,
  color = colors.onSurfaceVariant,
  filled = false,
  mode,
  modifier,
  modifierBackdrop = colors.card,
}: EcolnaIconProps) {
  const resolvedMode: IconMode = mode ?? (filled ? 'color' : 'mono');
  const tier = iconTier(name, size, mode);
  // Le jumeau plein du palier S répond à `filled` comme à un mode coloré demandé.
  const solidTwin = filled || resolvedMode !== 'mono';
  const grid = tier === 'M' ? 48 : 24;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${grid} ${grid}`}>
      {iconElements(name, tier, resolvedMode, color, solidTwin, modifier, modifierBackdrop)}
    </Svg>
  );
});
