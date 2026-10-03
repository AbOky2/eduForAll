import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { LetterTile } from '@/design-system/components/letter-tile';
import { NudgeRing } from '@/design-system/components/nudge-ring';
import { EcolnaAudioButton, EcolnaButton, useExerciseMetrics } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing } from '@/design-system/tokens';
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

/**
 * Rebuild a sentence word by word (CP2 — order_words). The sentence grows on
 * a sand board, the words wait as pebbles; touching a placed word sends it
 * back. The instruction is said once, by the lesson header.
 */
export function OrderWordsExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<OrderStep>) {
  const { scale, isTablet, isLandscape } = useResponsive();
  const metrics = useExerciseMetrics();
  const tray = useMemo(() => shuffled([...step.sentence, ...step.distractors]), [step]);
  const [chosen, setChosen] = useState<Chip[]>([]);
  // « Vérifier » sans mot posé : l'anneau d'aide entoure la phrase à bâtir.
  const [nudge, setNudge] = useState(0);

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const available = tray.filter((chip) => !chosen.some((c) => c.key === chip.key));
  const listenSize = scaled(isTablet ? 64 : 56, scale);
  // Une cible d'enfant : 64 dp au moins, davantage sur tablette.
  const chipHeight = scaled(isTablet ? 76 : 64, scale);
  const chipWidth = scaled(isTablet ? 96 : 72, scale);

  const verify = () => {
    if (!interactive) {
      return;
    }
    if (chosen.length === 0) {
      setNudge((count) => count + 1);
      if (step.audioId) {
        playAudio(step.audioId);
      }
      return;
    }
    onSubmit({ kind: 'sequence', values: chosen.map((chip) => chip.word) });
  };
  const variant = isTablet ? 'headlineLg' : 'headlineMd';

  return (
    <View style={[styles.container, { gap: metrics.gap }]}>
      <NudgeRing key={`n-${nudge}`} active={nudge > 0} announcement={fr.lesson.nudgeWords}>
        {/* Couché, l'écoute se pose à gauche des creux : la hauteur manque, pas la largeur. */}
        <View
          style={[
            styles.board,
            isLandscape && styles.boardRow,
            { padding: metrics.gap, gap: metrics.gap },
          ]}
        >
          {step.audioId ? (
            <EcolnaAudioButton
              size={listenSize}
              playing={playingAudioId === step.audioId}
              onPress={() => step.audioId && playAudio(step.audioId)}
            />
          ) : null}
          <View
            style={[
              styles.chipsRow,
              styles.sentence,
              { minHeight: chipHeight + 8, gap: scaled(spacing.sm, scale) },
            ]}
          >
            {chosen.length === 0
              ? // La phrase à venir : un creux par mot, la forme avant le contenu.
                step.sentence.map((word, index) => (
                  <View
                    key={`hollow-${index}`}
                    style={[styles.hollow, { minWidth: chipWidth, height: chipHeight }]}
                  />
                ))
              : chosen.map((chip) => (
                  <LetterTile
                    key={chip.key}
                    tone="placed"
                    label={chip.word}
                    accessibilityLabel={fr.lesson.removeTile(chip.word)}
                    onPress={() =>
                      interactive &&
                      setChosen((current) => current.filter((c) => c.key !== chip.key))
                    }
                    variant={variant}
                    minWidth={chipWidth}
                    height={chipHeight}
                  />
                ))}
          </View>
          {/* Le pendant invisible de l'écoute : la phrase reste centrée sur la planche. */}
          {isLandscape && step.audioId ? <View style={{ width: listenSize }} /> : null}
        </View>
      </NudgeRing>

      <View style={[styles.chipsRow, { gap: scaled(spacing.sm, scale) }]}>
        {available.map((chip) => (
          <LetterTile
            key={chip.key}
            tone="tray"
            label={chip.word}
            onPress={() => interactive && setChosen((current) => [...current, chip])}
            variant={variant}
            minWidth={chipWidth}
            height={chipHeight}
          />
        ))}
      </View>

      <EcolnaButton label={fr.common.verify} onPress={verify} style={styles.verify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  board: {
    alignItems: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: colors.surfaceContainerHighest,
  },
  boardRow: { flexDirection: 'row' },
  sentence: { alignSelf: 'stretch', alignItems: 'center', flexGrow: 1, flexShrink: 1 },
  hollow: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  verify: { alignSelf: 'center', minWidth: 260 },
});
