import { memo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { EcolnaIcon, type IconName } from '../icons/ecolna-icon';
import { colors, shadows } from '../tokens';

/**
 * Les illustrations v4 « Épure » : une orbite. Deux cercles concentriques à
 * peine tracés — la vannerie vue de dessus, le motif de la carte du jour et de
 * la célébration —, un sujet au centre, et quelques satellites posés sur les
 * cercles. Ni décor, ni paysage : des personnes et des choses de l'école,
 * dans une composition nette qui se lit à toutes les tailles.
 */

export interface OrbitSatellite {
  /** Ce qui est posé : un pastille (`OrbitChip`), un avatar… */
  node: ReactNode;
  /** Diamètre du satellite en dp (pour le centrer sur son point). */
  size: number;
  /** Angle en degrés, 0 = à droite, 90 = en bas. */
  angle: number;
  /** Cercle intérieur (0) ou extérieur (1). */
  ring: 0 | 1;
}

interface OrbitProps {
  /** Côté du carré de l'illustration en dp. */
  size: number;
  /** Le sujet, centré. */
  center: ReactNode;
  satellites?: readonly OrbitSatellite[];
  /** Couleur des cercles (défaut : filet gris clair ; sur la nuit, un blanc voilé). */
  ringColor?: string;
  /** Rayon du cercle intérieur, en part du rayon extérieur (défaut 0,66). */
  inner?: number;
  /**
   * Diamètre du sujet central (dp). L'anneau intérieur s'en écarte : ses
   * satellites ne mordent jamais le sujet. Absent, le sujet est mesuré au
   * premier rendu (les satellites attendent la mesure pour paraître).
   */
  centerSize?: number;
}

/** L'air minimal entre le sujet central et un satellite de l'anneau intérieur (dp). */
export const ORBIT_CENTER_CLEARANCE = 8;

/**
 * Les rayons des deux cercles. L'anneau intérieur vaut `inner` × l'extérieur,
 * mais jamais moins que le rayon du sujet + le demi-satellite + 8 dp : un
 * satellite posé dessus ne touche pas le sujet. Il ne dépasse pas l'anneau
 * extérieur.
 */
export function orbitRadii({
  size,
  satellites,
  inner,
  centerSize,
}: {
  size: number;
  satellites: readonly Pick<OrbitSatellite, 'size' | 'ring'>[];
  inner: number;
  centerSize: number;
}): readonly [number, number] {
  // Les satellites restent dans le carré, quel que soit leur angle.
  const margin = Math.max(0, ...satellites.map((satellite) => satellite.size)) / 2 + 2;
  const outerR = size / 2 - margin;
  const innerSatellite = Math.max(
    0,
    ...satellites.filter((satellite) => satellite.ring === 0).map((satellite) => satellite.size),
  );
  const clearance =
    innerSatellite > 0 ? centerSize / 2 + innerSatellite / 2 + ORBIT_CENTER_CLEARANCE : 0;
  return [Math.min(outerR, Math.max(outerR * inner, clearance)), outerR] as const;
}

/**
 * L'air entre chaque bord du carré de l'orbite et ce qui y est peint
 * (satellites, sujet, cercle extérieur). Une mise en page s'en sert pour poser
 * le bord VISIBLE de l'image sur la gouttière, ou pour la centrer à l'œil.
 */
export function orbitInsets({
  size,
  satellites,
  inner = 0.66,
  centerSize,
}: {
  size: number;
  satellites: readonly Pick<OrbitSatellite, 'size' | 'ring' | 'angle'>[];
  inner?: number;
  centerSize: number;
}): { left: number; right: number; top: number; bottom: number } {
  const radii = orbitRadii({ size, satellites, inner, centerSize });
  const half = size / 2;
  // Jusqu'où l'image s'étend depuis son centre, de chaque côté : d'abord le
  // sujet et le cercle extérieur, puis chaque satellite.
  const disc = Math.max(centerSize / 2, radii[1]);
  let reach = { left: disc, right: disc, top: disc, bottom: disc };
  for (const satellite of satellites) {
    const radian = (satellite.angle * Math.PI) / 180;
    const r = radii[satellite.ring];
    const x = r * Math.cos(radian);
    const y = r * Math.sin(radian);
    const s = satellite.size / 2;
    reach = {
      left: Math.max(reach.left, s - x),
      right: Math.max(reach.right, x + s),
      top: Math.max(reach.top, s - y),
      bottom: Math.max(reach.bottom, y + s),
    };
  }
  return {
    left: Math.max(0, half - reach.left),
    right: Math.max(0, half - reach.right),
    top: Math.max(0, half - reach.top),
    bottom: Math.max(0, half - reach.bottom),
  };
}

export const Orbit = memo(function Orbit({
  size,
  center,
  satellites = [],
  ringColor = colors.fillStrong,
  inner = 0.66,
  centerSize,
}: OrbitProps) {
  const [measured, setMeasured] = useState(0);
  const onCenterLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const next = Math.round(Math.max(width, height));
    if (next !== measured) {
      setMeasured(next);
    }
  };
  const subject = centerSize ?? measured;
  // Sans diamètre donné, rien n'est posé sur l'anneau intérieur avant la mesure.
  const ready = centerSize !== undefined || measured > 0 || !satellites.some((satellite) => satellite.ring === 0);
  const radii = orbitRadii({ size, satellites, inner, centerSize: subject });
  return (
    <View style={{ width: size, height: size }} aria-hidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radii[1]} stroke={ringColor} strokeWidth={1.5} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radii[0]} stroke={ringColor} strokeWidth={1.5} fill="none" />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {centerSize === undefined ? <View onLayout={onCenterLayout}>{center}</View> : center}
      </View>
      {satellites.map((satellite, index) => {
        const radian = (satellite.angle * Math.PI) / 180;
        const r = radii[satellite.ring];
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: size / 2 + r * Math.cos(radian) - satellite.size / 2,
              top: size / 2 + r * Math.sin(radian) - satellite.size / 2,
              opacity: ready ? 1 : 0,
            }}
          >
            {satellite.node}
          </View>
        );
      })}
    </View>
  );
});

/** Une pastille d'orbite : un disque teinté, un pictogramme plein, une ombre douce. */
export function OrbitChip({
  icon,
  color,
  tint,
  size,
}: {
  icon: IconName;
  color: string;
  tint: string;
  size: number;
}) {
  return (
    <View
      style={[
        styles.chip,
        shadows.card,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tint },
      ]}
    >
      <EcolnaIcon name={icon} size={Math.round(size * 0.5)} color={color} filled />
    </View>
  );
}

/** Le sujet d'une orbite : un disque plein, un pictogramme blanc. */
export function OrbitTile({ icon, color, size }: { icon: IconName; color: string; size: number }) {
  return (
    <View
      style={[
        styles.chip,
        shadows.raised,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <EcolnaIcon name={icon} size={Math.round(size * 0.52)} color={colors.white} filled />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  chip: { alignItems: 'center', justifyContent: 'center', borderCurve: 'continuous' },
});
