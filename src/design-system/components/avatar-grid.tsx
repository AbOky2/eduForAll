import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

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
    Animated.spring(grow, {
      toValue: target,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
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

/**
 * Combien de colonnes, et quelle taille d'avatar, pour une largeur donnée : le
 * plus de colonnes possible (douze se rangent en 6, 4, 3 ou 2) sans qu'un
 * personnage passe sous `minAvatar` ; jamais au-dessus de `maxAvatar`.
 * Exporté pour les tests : la grille ne doit déborder d'aucune fenêtre.
 */
export function avatarGridLayout(
  width: number,
  count: number,
  scale: number,
  minAvatar: number,
  maxAvatar: number,
): { columns: number; avatarSize: number } {
  const gap = scaled(spacing.md, scale);
  const ring = scaled(4, scale);
  // Anneau + marge intérieure, de chaque côté de l'avatar.
  const extra = 2 * (2 * ring + 2);
  const candidates = [6, 4, 3, 2].filter((columns) => columns <= count);
  const sizeFor = (columns: number) => Math.floor((width - (columns - 1) * gap) / columns - extra);
  const columns =
    candidates.find((option) => sizeFor(option) >= scaled(minAvatar, scale)) ??
    candidates[candidates.length - 1] ??
    1;
  return {
    columns,
    avatarSize: Math.max(0, Math.min(sizeFor(columns), scaled(maxAvatar, scale))),
  };
}

interface AvatarGridProps {
  avatarIds: readonly string[];
  selectedId: string | null;
  onSelect: (avatarId: string) => void;
  /** Plus petit diamètre acceptable, en dp de maquette (mis à l'échelle ici). */
  minAvatar: number;
  /** Plus grand diamètre, en dp de maquette. */
  maxAvatar: number;
  /** Libellé lu par le lecteur d'écran : « Avatar 3 : garçon en jalabiya verte ». */
  labelFor: (avatarId: string, index: number) => string;
  /** Nom du groupe de boutons radio. */
  accessibilityLabel: string;
}

/**
 * La grille des douze enfants (profil, création de profil). Elle mesure la
 * largeur qu'on lui donne et en déduit ses colonnes : jamais de rangée qui
 * déborde, ni de personnages minuscules sur une tablette en portrait.
 */
export function AvatarGrid({
  avatarIds,
  selectedId,
  onSelect,
  minAvatar,
  maxAvatar,
  labelFor,
  accessibilityLabel,
}: AvatarGridProps) {
  const { scale } = useResponsive();
  const [width, setWidth] = useState(0);
  const gap = scaled(spacing.md, scale);
  const onLayout = (event: LayoutChangeEvent) => {
    const measured = event.nativeEvent.layout.width;
    if (Math.abs(measured - width) > 1) {
      setWidth(measured);
    }
  };
  const { columns, avatarSize } = avatarGridLayout(
    width,
    avatarIds.length,
    scale,
    minAvatar,
    maxAvatar,
  );
  const rows: string[][] = [];
  for (let start = 0; start < avatarIds.length; start += columns) {
    rows.push(avatarIds.slice(start, start + columns));
  }
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{ gap }}
      onLayout={onLayout}
    >
      {width > 0
        ? rows.map((row, rowIndex) => (
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
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: colors.card },
  check: { position: 'absolute', top: -8, right: -8, backgroundColor: colors.card, padding: 2 },
  row: { flexDirection: 'row', justifyContent: 'center' },
});
