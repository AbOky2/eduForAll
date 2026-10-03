import { StyleSheet, View, type TextStyle } from 'react-native';

import type { LevelId } from '@/content/schemas/curriculum-schema';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { ClassLevelArt } from '@/design-system/illustrations/school-art';
import { EcolnaGalet, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, fontFamilies, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/**
 * Le grand titre de l'entrée à l'école (onboarding, bienvenue) : ≈ 1,4 ×
 * `displayHero` sur tablette (62 dp sur une grande tablette), serré ;
 * `displayHero` au téléphone.
 */
export function heroTitleStyle(isTablet: boolean, scale: number): TextStyle {
  const base = isTablet ? 48 : 34;
  return {
    fontFamily: fontFamilies.extraBold,
    fontSize: scaled(base, scale),
    lineHeight: scaled(Math.round(base * 1.1), scale),
    letterSpacing: -(isTablet ? 1.1 : 0.7) * scale,
  };
}

/** Trois points de 10 dp, l'actif en pilule de 28 × 10 ; « Étape 2 sur 3 ». */
export function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.dots} accessible accessibilityLabel={fr.profile.stepCount(step, total)}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index + 1 === step
              ? { width: 28, backgroundColor: colors.brand }
              : { backgroundColor: index + 1 < step ? colors.brandTintStrong : colors.fillStrong },
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
 * pour l'adulte. Choisie : filet bleu, fond bleuté, pastille cochée.
 */
export function LevelCard({ level, selected, onSelect, width, height }: LevelCardProps) {
  const { scale } = useResponsive();
  const check = scaled(32, scale);
  const art = Math.round(Math.min(width, height) * 0.42);
  return (
    <EcolnaGalet
      face={selected ? colors.brandTint : colors.white}
      border={selected ? colors.brand : colors.border}
      borderWidth={selected ? 3 : 2}
      radius={radius.xl}
      shadow={selected ? undefined : shadows.card}
      haptic="selection"
      onPressIn={onSelect}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityLabel={fr.profile.levelLabelA11y[level]}
      accessibilityState={{ checked: selected, selected }}
      hitSlop={8}
      style={{ width }}
      faceStyle={[styles.levelFace, { minHeight: height }]}
    >
      <EcolnaText variant="displayGlyph" color={selected ? colors.brand : colors.ink}>
        {level === 'CP1' ? '1' : '2'}
      </EcolnaText>
      <ClassLevelArt
        level={level}
        size={art}
        selected={selected}
        groundShade={selected ? colors.brandTintStrong : colors.fill}
      />
      <EcolnaText variant="headlineMd" color={selected ? colors.brandInk : colors.textPrimary}>
        {level}
      </EcolnaText>
      <EcolnaText variant="labelMd" color={colors.textSecondary}>
        {fr.profile.levelGloss[level]}
      </EcolnaText>
      {selected ? (
        <View style={[styles.check, { width: check, height: check, borderRadius: check / 2 }]}>
          <EcolnaIcon name="check" size={Math.round(check * 0.56)} color={colors.white} />
        </View>
      ) : null}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  levelFace: { alignItems: 'center', justifyContent: 'center', gap: 2, padding: spacing.md },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    // Le bleu du choix ; le vert reste au verdict « juste ».
    backgroundColor: colors.brand,
    borderWidth: 3,
    borderColor: colors.white,
  },
});
