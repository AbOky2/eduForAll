import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
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
}

export const Orbit = memo(function Orbit({
  size,
  center,
  satellites = [],
  ringColor = colors.fillStrong,
  inner = 0.66,
}: OrbitProps) {
  // Les satellites restent dans le carré, quel que soit leur angle.
  const margin = Math.max(0, ...satellites.map((satellite) => satellite.size)) / 2 + 2;
  const outerR = size / 2 - margin;
  const radii = [outerR * inner, outerR] as const;
  return (
    <View style={{ width: size, height: size }} aria-hidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radii[1]} stroke={ringColor} strokeWidth={1.5} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radii[0]} stroke={ringColor} strokeWidth={1.5} fill="none" />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{center}</View>
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
