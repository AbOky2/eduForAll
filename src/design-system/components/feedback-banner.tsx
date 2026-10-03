import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { EcolnaButton } from '../primitives/ecolna-button';
import { EcolnaText } from '../primitives/ecolna-text';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, shadows, spacing } from '../tokens';

interface FeedbackBannerProps {
  kind: 'correct' | 'incorrect';
  message: string;
  actionLabel: string;
  onAction: () => void;
}

/**
 * La feuille de retour, posée sur l'exercice. Juste : vert, une coche dans
 * un disque, le soleil « Continuer ». À revoir : pétrole, une flèche de
 * reprise, « Réessayer » — jamais une croix rouge, jamais un son qui gronde.
 * Elle monte d'un ressort court (instantanée en mouvement réduit) et reste
 * bornée en largeur sur tablette : un bandeau de 1 200 dp ne se lit pas.
 */
export function FeedbackBanner({ kind, message, actionLabel, onAction }: FeedbackBannerProps) {
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { scale, isTablet, contentMaxWidth, screenPadding } = useResponsive();
  const [translate] = useState(() => new Animated.Value(reducedMotion ? 0 : 160));

  useEffect(() => {
    if (reducedMotion) {
      translate.setValue(0);
      return;
    }
    Animated.spring(translate, {
      toValue: 0,
      useNativeDriver: true,
      speed: 16,
      bounciness: 7,
    }).start();
  }, [reducedMotion, translate]);

  const isCorrect = kind === 'correct';
  const disc = scaled(isTablet ? 64 : 52, scale);
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.dock,
        { paddingHorizontal: screenPadding, paddingBottom: Math.max(insets.bottom, spacing.md) },
      ]}
    >
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[
          styles.sheet,
          shadows.floating,
          {
            maxWidth: contentMaxWidth,
            padding: scaled(spacing.lg, scale),
            gap: scaled(spacing.md, scale),
            backgroundColor: isCorrect ? colors.feedbackCorrectContainer : colors.secondaryFixed,
            borderColor: isCorrect ? colors.feedbackCorrectShade : colors.secondaryFixedDim,
            flexDirection: isTablet ? 'row' : 'column',
            alignItems: isTablet ? 'center' : 'stretch',
            transform: [{ translateY: translate }],
          },
        ]}
      >
        <View style={[styles.row, isTablet && styles.flex]}>
          {/* Pictogrammes du palier M en mode couleur : la coche dans son disque
              vert, la flèche de reprise sur son disque ciel. */}
          <EcolnaIcon name={isCorrect ? 'check' : 'replay'} size={disc} mode="color" />
          <EcolnaText
            variant={isTablet ? 'headlineLg' : 'headlineMd'}
            color={isCorrect ? colors.feedbackCorrect : colors.onSecondaryContainer}
            style={styles.flex}
          >
            {message}
          </EcolnaText>
        </View>
        <EcolnaButton
          label={actionLabel}
          variant={isCorrect ? 'primary' : 'accent'}
          onPress={onAction}
          style={isTablet ? styles.tabletButton : undefined}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  sheet: { width: '100%', borderRadius: radius.xl, borderWidth: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  tabletButton: { minWidth: 220 },
});
