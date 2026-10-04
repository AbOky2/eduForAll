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

/**
 * Les deux volets de l'entrée à l'école, couchés sur grande tablette
 * (onboarding, puis création de profil) : la scène à gauche, sur 44 % de la
 * largeur ; à droite, la colonne des mots et du pied, de la marge propre de
 * la scène jusqu'à la gouttière de l'écran. Les points et le bouton tombent
 * ainsi au même endroit d'un écran à l'autre — mêmes bords, même largeur.
 * (Les valeurs de `create-profile.tsx` : `stageWidth`, `panelPadLeft`,
 * `panelInner`.)
 */
export function ceremonyColumns(width: number, scale: number, screenPadding: number) {
  const stage = Math.round(width * 0.44);
  const left = stage + scaled(spacing.xl, scale);
  return { stage, left, width: Math.max(0, Math.min(width - left - screenPadding, 760)) };
}

/** Le bas du pied des deux volets, au-dessus du bord de l'écran (création de profil comprise). */
export function ceremonyFooterBottom(insetBottom: number): number {
  return Math.max(insetBottom, spacing.md) + spacing.xs;
}

/**
 * L'indicateur d'étapes, le même dans l'onboarding et la création de profil :
 * des points de ≈ 10 dp, l'actif en pilule bleue de ≈ 28 dp. Les autres sont
 * en `inkDisabled` (2,2:1 sur la toile) — un adulte voit combien d'étapes
 * restent, même au soleil. Lu « Étape 2 sur 3 » (ou le libellé donné).
 */
export function StepDots({
  step,
  total,
  accessibilityLabel,
}: {
  step: number;
  total: number;
  accessibilityLabel?: string | undefined;
}) {
  const { scale } = useResponsive();
  const dot = scaled(10, scale);
  return (
    <View
      style={[styles.dots, { gap: scaled(spacing.xs, scale) }]}
      accessible
      accessibilityLabel={accessibilityLabel ?? fr.profile.stepCount(step, total)}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          testID={index + 1 === step ? 'step-dot-active' : 'step-dot'}
          style={{
            height: dot,
            borderRadius: dot / 2,
            width: index + 1 === step ? scaled(28, scale) : dot,
            backgroundColor: index + 1 === step ? colors.brand : colors.inkDisabled,
          }}
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
 * feuilles en CP1, quatre et un bouton de fleur en CP2) et « CP1 » — le
 * niveau dit deux fois, pas trois. Choisie : filet bleu, fond bleuté,
 * pastille cochée.
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
      {selected ? (
        <View style={[styles.check, { width: check, height: check, borderRadius: check / 2 }]}>
          <EcolnaIcon name="check" size={Math.round(check * 0.56)} color={colors.white} />
        </View>
      ) : null}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', alignItems: 'center' },
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
