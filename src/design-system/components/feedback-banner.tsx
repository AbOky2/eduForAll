import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { AlifaIcon } from '../icons/alifa-icon';
import { AlifaButton } from '../primitives/alifa-button';
import { AlifaText } from '../primitives/alifa-text';
import { colors, radius, shadows, spacing } from '../tokens';

interface FeedbackBannerProps {
  kind: 'correct' | 'incorrect';
  message: string;
  actionLabel: string;
  onAction: () => void;
}

/**
 * Kind bottom feedback sheet. Success is warm; errors are gentle (petrol
 * blue, encouraging copy — never a red cross, never a shaming sound).
 */
export function FeedbackBanner({ kind, message, actionLabel, onAction }: FeedbackBannerProps) {
  const reducedMotion = useReducedMotion();
  const [translate] = useState(() => new Animated.Value(120));

  useEffect(() => {
    if (reducedMotion) {
      translate.setValue(0);
      return;
    }
    Animated.spring(translate, {
      toValue: 0,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  }, [reducedMotion, translate]);

  const isCorrect = kind === 'correct';
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.sheet,
        shadows.raised,
        {
          backgroundColor: isCorrect ? colors.feedbackCorrectContainer : colors.secondaryFixed,
          transform: [{ translateY: translate }],
        },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: isCorrect ? colors.feedbackCorrect : colors.secondary },
          ]}
        >
          <AlifaIcon name={isCorrect ? 'check' : 'replay'} size={26} color={colors.card} />
        </View>
        <AlifaText
          variant="headlineSm"
          color={isCorrect ? colors.feedbackCorrect : colors.onSecondaryContainer}
          style={styles.message}
        >
          {message}
        </AlifaText>
      </View>
      <AlifaButton label={actionLabel} onPress={onAction} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { flex: 1 },
});
