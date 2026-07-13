import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaAudioButton, AlifaButton, AlifaText } from '@/design-system/primitives';
import { colors, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type OrderStep = Extract<ExerciseStep, { type: 'order_words' }>;

interface Chip {
  key: string;
  word: string;
}

/** Deterministic shuffle so the same step always shows the same tray order. */
function shuffled(words: readonly string[]): Chip[] {
  const chips = words.map((word, index) => ({ key: `${word}-${index}`, word }));
  return [...chips].sort((a, b) => {
    const ha = hash(a.key);
    const hb = hash(b.key);
    return ha - hb || a.key.localeCompare(b.key);
  });
}

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 9973;
  }
  return result;
}

/** Rebuild a sentence word by word (CP2 — order_words). */
export function OrderWordsExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<OrderStep>) {
  const tray = useMemo(() => shuffled([...step.sentence, ...step.distractors]), [step]);
  const [chosen, setChosen] = useState<Chip[]>([]);

  useEffect(() => {
    setChosen([]);
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const available = tray.filter((chip) => !chosen.some((c) => c.key === chip.key));

  return (
    <View style={styles.container}>
      <View style={styles.promptRow}>
        {step.audioId ? (
          <AlifaAudioButton
            variant="sky"
            size={52}
            playing={playingAudioId === step.audioId}
            onPress={() => step.audioId && playAudio(step.audioId)}
          />
        ) : null}
        <AlifaText variant="headlineMd" style={styles.promptText}>
          {step.instruction.text}
        </AlifaText>
      </View>

      {/* Sentence under construction */}
      <View style={styles.sentenceZone}>
        {chosen.length === 0 ? (
          <AlifaText variant="bodyMd" color={colors.textSecondary} align="center">
            Touche les mots dans l’ordre.
          </AlifaText>
        ) : (
          <View style={styles.chipsRow}>
            {chosen.map((chip) => (
              <Pressable
                key={chip.key}
                accessibilityRole="button"
                accessibilityLabel={`Retirer ${chip.word}`}
                onPress={() =>
                  interactive &&
                  setChosen((current) => current.filter((c) => c.key !== chip.key))
                }
                style={[styles.chip, styles.chipChosen, shadows.card]}
              >
                <AlifaText variant="headlineSm" color={colors.onPrimaryContainer}>
                  {chip.word}
                </AlifaText>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Word tray */}
      <View style={styles.chipsRow}>
        {available.map((chip) => (
          <Pressable
            key={chip.key}
            accessibilityRole="button"
            accessibilityLabel={chip.word}
            disabled={!interactive}
            onPress={() => setChosen((current) => [...current, chip])}
            style={({ pressed }) => [
              styles.chip,
              shadows.card,
              { opacity: interactive ? 1 : 0.5, transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <AlifaText variant="headlineSm">{chip.word}</AlifaText>
          </Pressable>
        ))}
      </View>

      <AlifaButton
        label={fr.common.verify}
        disabled={!interactive || chosen.length === 0}
        onPress={() => onSubmit({ kind: 'sequence', values: chosen.map((chip) => chip.word) })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.lg, justifyContent: 'center' },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  promptText: { flex: 1 },
  sentenceZone: {
    minHeight: 96,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: 'center',
    backgroundColor: 'rgba(212,163,115,0.06)',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    minHeight: 48,
    justifyContent: 'center',
  },
  chipChosen: { backgroundColor: colors.primaryContainer },
});
