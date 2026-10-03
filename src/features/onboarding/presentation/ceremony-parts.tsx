import { Pressable, StyleSheet, View } from 'react-native';

import type { LevelId } from '@/content/schemas/curriculum-schema';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { ClassLevelArt } from '@/design-system/illustrations/scenes';
import { EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, depth, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Trois points de 12 dp, l'actif en pilule de 32 × 12 ; « Étape 2 sur 3 ». */
export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.dots} accessible accessibilityLabel={fr.profile.stepCount(step, total)}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index + 1 === step
              ? { width: 32, backgroundColor: colors.secondary }
              : {
                  backgroundColor:
                    index + 1 < step ? colors.secondaryFixedDim : colors.surfaceContainerHighest,
                },
          ]}
        />
      ))}
    </View>
  );
}

interface LevelCardProps {
  level: LevelId;
  selected: boolean;
  onSelect: () => void;
  width: number;
  height: number;
}

/**
 * Une grande carte de classe : le chiffre, la même pousse qui grandit (deux
 * feuilles en CP1, quatre et un bouton de fleur en CP2), « CP1 » et la glose
 * pour l'adulte. Choisie : anneau, coche, ombre et pot plus saturé.
 */
export function LevelCard({ level, selected, onSelect, width, height }: LevelCardProps) {
  const { scale } = useResponsive();
  const lift = scaled(depth.lg, scale);
  const check = scaled(30, scale);
  const art = Math.round(Math.min(width, height) * 0.42);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={fr.profile.levelLabelA11y[level]}
      accessibilityState={{ checked: selected, selected }}
      onPressIn={onSelect}
      onPress={onSelect}
      hitSlop={8}
      style={({ pressed }) => ({ width, transform: [{ scale: pressed ? 0.97 : 1 }] })}
    >
      <View style={{ paddingBottom: lift }}>
        <View
          style={[
            styles.levelEdge,
            {
              top: lift,
              borderRadius: radius.xl,
              backgroundColor: selected ? colors.secondaryShade : colors.cardEdge,
            },
          ]}
        />
        <View
          style={[
            styles.levelFace,
            {
              minHeight: height,
              borderRadius: radius.xl,
              borderWidth: selected ? 4 : 2,
              borderColor: selected ? colors.secondary : colors.cardEdge,
              backgroundColor: selected ? colors.secondaryFixed : colors.card,
              transform: [{ translateY: selected ? lift / 2 : 0 }],
            },
          ]}
        >
          <EcolnaText variant="displayGlyph" color={selected ? colors.secondary : colors.primary}>
            {level === 'CP1' ? '1' : '2'}
          </EcolnaText>
          <ClassLevelArt level={level} size={art} selected={selected} />
          <EcolnaText
            variant="headlineMd"
            color={selected ? colors.onSecondaryContainer : colors.textPrimary}
          >
            {level}
          </EcolnaText>
          <EcolnaText variant="labelMd" color={colors.textSecondary}>
            {fr.profile.levelGloss[level]}
          </EcolnaText>
          {selected ? (
            <View style={[styles.check, { borderRadius: check }]}>
              <EcolnaIcon name="check" size={check} mode="color" />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  levelEdge: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  levelFace: { alignItems: 'center', justifyContent: 'center', gap: 2, padding: spacing.md },
  check: { position: 'absolute', top: -10, right: -10, backgroundColor: colors.card, padding: 2 },
});
