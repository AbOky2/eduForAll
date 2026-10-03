import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { EcolnaAvatar } from '../avatars';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, spacing } from '../tokens';

interface AvatarTileProps {
  avatarId: string;
  selected: boolean;
  size: number;
  label: string;
  onSelect: () => void;
}

/**
 * Une tuile de personnage. Choisie : anneau pétrole, coche ronde, petit
 * ressort ×1,06 et sourire — quatre indices, jamais la couleur seule
 * (brief v2 § 12.3). Aucune tuile n'est grisée.
 */
function AvatarTile({ avatarId, selected, size, label, onSelect }: AvatarTileProps) {
  const reducedMotion = useReducedMotion();
  const { scale } = useResponsive();
  const [grow] = useState(() => new Animated.Value(selected ? 1.06 : 1));
  useEffect(() => {
    const target = selected ? 1.06 : 1;
    if (reducedMotion) {
      grow.setValue(target);
      return;
    }
    Animated.spring(grow, { toValue: target, useNativeDriver: true, speed: 20, bounciness: 10 }).start();
  }, [selected, grow, reducedMotion]);

  const check = scaled(30, scale);
  const ring = scaled(4, scale);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, selected }}
      onPress={onSelect}
      hitSlop={6}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            padding: ring + 2,
            borderRadius: radius.xl,
            borderWidth: ring,
            borderColor: selected ? colors.secondary : colors.cardEdge,
            transform: [{ scale: grow }],
          },
        ]}
      >
        <EcolnaAvatar avatarId={avatarId} size={size} expression={selected ? 'joy' : 'calm'} />
        {selected ? (
          <View style={[styles.check, { borderRadius: check }]}>
            <EcolnaIcon name="check" size={check} mode="color" />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

interface AvatarGridProps {
  avatarIds: readonly string[];
  selectedId: string | null;
  onSelect: (avatarId: string) => void;
  columns: number;
  /** Diamètre de l'avatar dans sa tuile, en dp déjà mis à l'échelle. */
  avatarSize: number;
  /** Libellé lu par le lecteur d'écran : « Avatar 3 : garçon en jalabiya verte ». */
  labelFor: (avatarId: string, index: number) => string;
  /** Nom du groupe de boutons radio. */
  accessibilityLabel: string;
}

/** La grille des douze enfants (profil, création de profil). */
export function AvatarGrid({
  avatarIds,
  selectedId,
  onSelect,
  columns,
  avatarSize,
  labelFor,
  accessibilityLabel,
}: AvatarGridProps) {
  const { scale } = useResponsive();
  const gap = scaled(spacing.md, scale);
  const rows: string[][] = [];
  for (let start = 0; start < avatarIds.length; start += columns) {
    rows.push(avatarIds.slice(start, start + columns));
  }
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={{ gap }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap }]}>
          {row.map((avatarId, index) => (
            <AvatarTile
              key={avatarId}
              avatarId={avatarId}
              selected={avatarId === selectedId}
              size={avatarSize}
              label={labelFor(avatarId, rowIndex * columns + index)}
              onSelect={() => onSelect(avatarId)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: colors.card },
  check: { position: 'absolute', top: -8, right: -8, backgroundColor: colors.card, padding: 2 },
  row: { flexDirection: 'row', justifyContent: 'center' },
});
