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
  /** Nombre d'étapes atteintes : le chemin est plein jusqu'à la dernière, pointillé ensuite. */
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
 * Les deux tronçons du fil : le parcouru (de la première étape à la dernière
 * atteinte) et ce qui reste (de la dernière atteinte à la fin). Ils se
 * touchent à l'étape du jour ; le pointillé part donc de son centre, caché
 * sous son disque, et ses points tombent au même endroit à chaque rendu.
 */
export function journeySegments(
  points: readonly JourneyPoint[],
  reached: number,
): { done: string; rest: string } {
  const count = Math.max(0, Math.min(points.length, reached));
  const done = points.slice(0, count);
  const rest = points.slice(Math.max(0, count - 1));
  return {
    done: done.length > 1 ? pathThrough(done) : '',
    rest: rest.length > 1 ? pathThrough(rest) : '',
  };
}

/**
 * Le fil du parcours (direction v4) : un trait aux bouts ronds qui relie les
 * étapes en courbes tendues. Le tronçon parcouru est plein, à la couleur de
 * la réussite ; ce qui reste est un pointillé de points ronds sur la piste
 * neutre (`track`) : la forme dit « pas encore » même quand le soleil mange
 * le contraste. Ni piste de sable, ni pas, ni liseré : les étapes sont le
 * sujet, le fil ne fait que les relier.
 */
export const JourneyPath = memo(function JourneyPath({
  width,
  height,
  points,
  reached,
  traveled,
  thickness,
}: JourneyPathProps) {
  const paths = useMemo(() => journeySegments(points, reached), [points, reached]);
  return (
    <Svg width={width} height={height} pointerEvents="none">
      {paths.rest ? (
        // Des points ronds d'un diamètre égal à l'épaisseur, espacés d'autant.
        <Path
          d={paths.rest}
          stroke={colors.track}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`0 ${thickness * 2}`}
          fill="none"
        />
      ) : null}
      {paths.done ? (
        <Path d={paths.done} stroke={traveled} strokeWidth={thickness} strokeLinecap="round" fill="none" />
      ) : null}
    </Svg>
  );
});
