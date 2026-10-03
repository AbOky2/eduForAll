import { memo, useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../tokens';
import { q } from '../illustrations/scene-geometry';

export interface JourneyPoint {
  readonly x: number;
  readonly y: number;
}

interface JourneyPathProps {
  width: number;
  height: number;
  points: readonly JourneyPoint[];
  /** Nombre d'étapes atteintes : la piste est teintée jusqu'à la dernière. */
  reached: number;
  /** Teinte du chemin parcouru (la tranche de la discipline). */
  traveled: string;
  /** Épaisseur de la piste en dp. */
  thickness: number;
}

/** Courbe tendue d'une étape à l'autre : départ et arrivée verticaux. */
function segment(a: JourneyPoint, b: JourneyPoint): string {
  const k = (b.y - a.y) * 0.55;
  return `C${q(a.x)} ${q(a.y + k)} ${q(b.x)} ${q(b.y - k)} ${q(b.x)} ${q(b.y)}`;
}

function pathThrough(points: readonly JourneyPoint[]): string {
  const [first, ...rest] = points;
  if (!first) {
    return '';
  }
  let d = `M${q(first.x)} ${q(first.y)}`;
  let previous = first;
  for (const point of rest) {
    d += segment(previous, point);
    previous = point;
  }
  return d;
}

/**
 * La piste de la carte de progression : un chemin de sable qui serpente
 * d'une étape à l'autre, bordé d'un liseré plus sombre, avec des pas blancs
 * au milieu. Le tronçon déjà parcouru prend la couleur de la discipline —
 * l'enfant voit d'où il vient avant de voir où il va.
 */
export const JourneyPath = memo(function JourneyPath({
  width,
  height,
  points,
  reached,
  traveled,
  thickness,
}: JourneyPathProps) {
  const paths = useMemo(() => {
    const done = points.slice(0, Math.max(0, Math.min(points.length, reached)));
    return { all: pathThrough(points), done: done.length > 1 ? pathThrough(done) : '' };
  }, [points, reached]);
  const dash = Math.round(thickness * 0.5);
  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Path
        d={paths.all}
        stroke={colors.surfaceContainerHighest}
        strokeWidth={thickness + 6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={paths.all}
        stroke={colors.surfaceContainerHigh}
        strokeWidth={thickness}
        strokeLinecap="round"
        fill="none"
      />
      {paths.done ? (
        <Path d={paths.done} stroke={traveled} strokeWidth={thickness} strokeLinecap="round" fill="none" />
      ) : null}
      <Path
        d={paths.all}
        stroke={colors.card}
        strokeWidth={Math.max(3, Math.round(thickness * 0.18))}
        strokeDasharray={`${dash} ${Math.round(dash * 1.6)}`}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
});
