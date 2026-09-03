import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ObjectIcon } from '../illustrations/object-icons';
import { colors, radius, spacing } from '../tokens';

/** Comptage par cinq : la rangée de cinq est l'unité que l'œil saisit d'un coup. */
const PER_ROW = 5;

interface QuantityGroupProps {
  count: number;
  /** Objet concret ; absent, la quantité s'affiche en jetons. */
  illustrationId?: string | undefined;
  /** Les N derniers éléments sont barrés — « on en enlève trois ». */
  removed?: number | undefined;
  size?: number | undefined;
  accessibilityLabel?: string | undefined;
}

function chunk(total: number): number[][] {
  const rows: number[][] = [];
  for (let start = 0; start < total; start += PER_ROW) {
    rows.push(Array.from({ length: Math.min(PER_ROW, total - start) }, (_, i) => start + i));
  }
  return rows;
}

/**
 * Une quantité rendue comptable : des objets rangés par cinq, éventuellement
 * barrés pour montrer ce qu'on retire.
 *
 * Le programme veut que le calcul parte du concret (p. 58) : un enfant de CP
 * additionne des chèvres bien avant d'additionner des nombres. Les jetons ne
 * servent que de repli quand la scène n'a pas d'objet.
 */
export const QuantityGroup = memo(function QuantityGroup({
  count,
  illustrationId,
  removed = 0,
  size = 40,
  accessibilityLabel,
}: QuantityGroupProps) {
  const firstRemoved = Math.max(0, count - removed);
  const rows = useMemo(() => chunk(count), [count]);
  const slotStyle = useMemo(() => ({ width: size, height: size }), [size]);
  const tokenStyle = useMemo(
    () => ({
      width: size * 0.62,
      height: size * 0.62,
      borderRadius: size * 0.31,
      margin: size * 0.19,
    }),
    [size],
  );
  return (
    <View
      style={styles.group}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? String(count)}
    >
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((index) => {
            const isRemoved = index >= firstRemoved;
            return (
              <View key={index} style={[styles.slot, slotStyle]}>
                <View style={isRemoved ? styles.removed : undefined}>
                  {illustrationId ? (
                    <ObjectIcon id={illustrationId} size={size} />
                  ) : (
                    <View style={[styles.token, tokenStyle]} />
                  )}
                </View>
                {/* Le trait barré est une simple vue tournée : pas un SVG par objet. */}
                {isRemoved ? <View style={[styles.strike, { width: size * 0.9 }]} /> : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
});

/** The same collection framed as one addend / one share. */
export function QuantityCard(props: QuantityGroupProps) {
  return (
    <View style={styles.card}>
      <QuantityGroup {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xxs, alignItems: 'center' },
  row: { flexDirection: 'row', gap: spacing.xxs },
  slot: { alignItems: 'center', justifyContent: 'center' },
  removed: { opacity: 0.45 },
  strike: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.onSurfaceVariant,
    transform: [{ rotate: '45deg' }],
  },
  token: { backgroundColor: colors.tertiaryContainer },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
});
