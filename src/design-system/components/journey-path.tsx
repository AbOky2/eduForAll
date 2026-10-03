import { memo, useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../tokens';

export interface JourneyPoint {
  readonly x: number;
  readonly y: number;
}

interface JourneyPathProps {
  width: number;
  height: number;
  points: readonly JourneyPoint[];
  /** Nombre d'étapes atteintes : le chemin est coloré jusqu'à la dernière. */
  reached: number;
  /** Couleur du chemin parcouru. */
  traveled: string;
  /** Épaisseur du trait en dp. */
  thickness: number;
}

const q = (value: number) => Math.round(value * 10) / 10;

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
 * Le fil du parcours (direction v4) : un trait net aux bouts ronds qui relie
 * les étapes en courbes tendues. Ce qui reste est gris clair ; le tronçon
 * parcouru prend la couleur de la réussite. Ni piste de sable, ni pas, ni
 * liseré : les étapes sont le sujet, le fil ne fait que les relier.
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
  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Path d={paths.all} stroke={colors.fillStrong} strokeWidth={thickness} strokeLinecap="round" fill="none" />
      {paths.done ? (
        <Path d={paths.done} stroke={traveled} strokeWidth={thickness} strokeLinecap="round" fill="none" />
      ) : null}
    </Svg>
  );
});
