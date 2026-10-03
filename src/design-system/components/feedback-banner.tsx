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
 * La feuille de retour (v4) : elle monte du bas, sur toute la largeur, dans
 * la teinte du verdict ; son contenu reste borné à la colonne de lecture.
 * Juste : vert, une coche blanche dans un disque, le soleil « Continuer ». À
 * revoir : le bleu calme de la marque, une flèche de reprise, « Réessayer » —
 * jamais une croix rouge, jamais un son qui gronde. Elle monte d'un ressort
 * court (instantanée en mouvement réduit).
 */
export function FeedbackBanner({ kind, message, actionLabel, onAction }: FeedbackBannerProps) {
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { scale, isTablet, contentMaxWidth, screenPadding } = useResponsive();
  const [translate] = useState(() => new Animated.Value(reducedMotion ? 0 : 220));

  useEffect(() => {
    if (reducedMotion) {
      translate.setValue(0);
      return;
    }
    Animated.spring(translate, {
      toValue: 0,
      useNativeDriver: true,
      speed: 16,
      bounciness: 5,
    }).start();
  }, [reducedMotion, translate]);

  const isCorrect = kind === 'correct';
  const disc = scaled(isTablet ? 56 : 48, scale);
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.sheet,
        shadows.floating,
        {
          paddingHorizontal: screenPadding,
          paddingTop: scaled(spacing.lg, scale),
          paddingBottom: Math.max(insets.bottom, 0) + scaled(spacing.lg, scale),
          backgroundColor: isCorrect ? colors.successTint : colors.brandTint,
          transform: [{ translateY: translate }],
        },
      ]}
    >
      <View
        style={[
          styles.content,
          {
            maxWidth: contentMaxWidth,
            gap: scaled(spacing.md, scale),
            flexDirection: isTablet ? 'row' : 'column',
            alignItems: isTablet ? 'center' : 'stretch',
          },
        ]}
      >
        <View style={[styles.row, { gap: scaled(spacing.md, scale) }, isTablet && styles.flex]}>
          <View
            style={[
              styles.disc,
              {
                width: disc,
                height: disc,
                borderRadius: disc / 2,
                backgroundColor: isCorrect ? colors.success : colors.brand,
              },
            ]}
          >
            <EcolnaIcon name={isCorrect ? 'check' : 'replay'} size={Math.round(disc * 0.56)} color={colors.white} />
          </View>
          <EcolnaText
            variant={isTablet ? 'headlineLg' : 'headlineMd'}
            color={isCorrect ? colors.successInk : colors.brandInk}
            style={styles.flex}
          >
            {message}
          </EcolnaText>
        </View>
        <EcolnaButton
          label={actionLabel}
          variant={isCorrect ? 'primary' : 'accent'}
          // Un pictogramme pour qui ne lit pas encore : avancer, ou recommencer.
          icon={
            <EcolnaIcon
              name={isCorrect ? 'play' : 'replay'}
              size={scaled(20, scale)}
              color={isCorrect ? colors.onReward : colors.white}
              filled={isCorrect}
            />
          }
          onPress={onAction}
          style={isTablet ? styles.tabletButton : undefined}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  content: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
  disc: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  tabletButton: { minWidth: 240 },
});
