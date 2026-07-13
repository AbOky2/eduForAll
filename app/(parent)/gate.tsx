import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AlifaCard, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { a11y, colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

interface GateChallenge {
  question: string;
  answer: number;
  options: number[];
}

/**
 * Parent gate: a multiplication a young child cannot yet solve. Blocks the
 * child flow from reaching parent-only actions (reset, sharing, diagnostics).
 * A local PIN can be layered on top later without changing callers.
 */
const CHALLENGES: GateChallenge[] = [
  { question: '7 × 6', answer: 42, options: [36, 42, 48] },
  { question: '8 × 7', answer: 56, options: [54, 56, 64] },
  { question: '9 × 6', answer: 54, options: [48, 54, 56] },
  { question: '7 × 8', answer: 56, options: [49, 56, 63] },
  { question: '6 × 8', answer: 48, options: [42, 48, 54] },
];

export default function ParentGateScreen() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [wrong, setWrong] = useState(false);
  const challenge = useMemo(() => CHALLENGES[attempt % CHALLENGES.length]!, [attempt]);

  const choose = (value: number) => {
    if (value === challenge.answer) {
      router.replace('/(parent)/dashboard');
    } else {
      setWrong(true);
      setAttempt((current) => current + 1);
    }
  };

  return (
    <AlifaScreen background="default">
      <View style={styles.container}>
        <View style={styles.badge}>
          <AlifaIcon name="parents" size={34} color={colors.onSecondaryContainer} />
        </View>
        <AlifaText variant="headlineLg" align="center">
          {fr.parent.gateTitle}
        </AlifaText>
        <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.parent.gateSubtitle}
        </AlifaText>

        <AlifaCard rounded="xl" style={styles.card}>
          <AlifaText variant="bodyMd" color={colors.textSecondary} align="center">
            {fr.parent.gateQuestion}
          </AlifaText>
          <AlifaText variant="displayGlyphSmall" align="center">
            {challenge.question} = ?
          </AlifaText>
          {wrong ? (
            <AlifaText variant="bodyMd" color={colors.secondary} align="center">
              {fr.parent.gateWrong}
            </AlifaText>
          ) : null}
          <View style={styles.options}>
            {challenge.options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={String(option)}
                onPress={() => choose(option)}
                style={({ pressed }) => [styles.option, pressed && { opacity: 0.8 }]}
              >
                <AlifaText variant="headlineSm">{String(option)}</AlifaText>
              </Pressable>
            ))}
          </View>
        </AlifaCard>

        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <AlifaText variant="labelMd" color={colors.textSecondary} align="center">
            {fr.common.back}
          </AlifaText>
        </Pressable>
      </View>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.screenMargin,
    gap: spacing.lg,
  },
  badge: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { gap: spacing.md },
  options: { flexDirection: 'row', gap: spacing.md },
  option: {
    flex: 1,
    minHeight: a11y.minTouchTarget + 8,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
  },
});
