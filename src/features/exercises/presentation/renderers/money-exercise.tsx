import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  AlifaAnswerCard,
  AlifaAudioButton,
  AlifaCard,
  AlifaExerciseLayout,
  AlifaText,
} from '@/design-system/primitives';
import { colors, radius, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type MoneyStep = Extract<ExerciseStep, { type: 'count_money' }>;
type Coin = MoneyStep['coins'][number];

const COIN_SIZE = 64;

/**
 * Franc CFA d'Afrique centrale (XAF) — the currency in circulation in Chad.
 * Low denominations are brass, high ones nickel, as on the real coins, so
 * the child can sort them by look before reading the number.
 */
const COIN_STYLE: Record<Coin, { face: string; rim: string; ink: string }> = {
  5: { face: '#e0b877', rim: '#b58c48', ink: '#4a3410' },
  10: { face: '#e0b877', rim: '#b58c48', ink: '#4a3410' },
  25: { face: '#dcb26a', rim: '#ad8340', ink: '#4a3410' },
  50: { face: '#d7d9e4', rim: '#a9adbe', ink: '#2c3040' },
  100: { face: '#d7d9e4', rim: '#a9adbe', ink: '#2c3040' },
  500: { face: '#e6e8f0', rim: '#a9adbe', ink: '#2c3040' },
};

function CoinFace({ value }: { value: Coin }) {
  const style = COIN_STYLE[value];
  const r = COIN_SIZE / 2;
  return (
    <Svg width={COIN_SIZE} height={COIN_SIZE} viewBox={`0 0 ${COIN_SIZE} ${COIN_SIZE}`}>
      <Circle cx={r} cy={r} r={r - 2} fill={style.face} stroke={style.rim} strokeWidth={2.5} />
      <Circle
        cx={r}
        cy={r}
        r={r - 8}
        fill="none"
        stroke={style.rim}
        strokeWidth={1}
        opacity={0.6}
      />
      <SvgText
        x={r}
        y={r + 6}
        fontSize={value >= 100 ? 18 : 20}
        fontWeight="bold"
        fill={style.ink}
        textAnchor="middle"
      >
        {String(value)}
      </SvgText>
      <SvgText x={r} y={r + 19} fontSize={8} fill={style.ink} textAnchor="middle" opacity={0.8}>
        F CFA
      </SvgText>
    </Svg>
  );
}

/**
 * « Les pièces de monnaie » (programme p. 59). The child adds up the coins
 * laid out on the mat — the first real-life use of addition at CP.
 */
export function MoneyExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<MoneyStep>) {
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    playAudio(step.instruction.audioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const prompt = (
    <>
      <AlifaCard rounded="xl" style={styles.prompt}>
        <AlifaText variant="headlineMd" align="center">
          {step.instruction.text}
        </AlifaText>
        <AlifaAudioButton
          variant="sky"
          size={56}
          playing={playingAudioId === step.instruction.audioId}
          onPress={() => playAudio(step.instruction.audioId)}
        />
      </AlifaCard>

      <AlifaCard rounded="xl" style={styles.mat} backgroundColor={colors.surfaceContainerLow}>
        <View style={styles.coins}>
          {step.coins.map((coin, index) => (
            <CoinFace key={`${coin}-${index}`} value={coin} />
          ))}
        </View>
      </AlifaCard>
    </>
  );

  const answers = (
    <View style={styles.options}>
      {step.options.map((option) => (
        <AlifaAnswerCard
          key={option}
          label={`${option} F`}
          state={
            !interactive && picked !== option
              ? 'disabled'
              : picked === option
                ? 'selected'
                : 'default'
          }
          onPress={() => {
            setPicked(option);
            onSubmit({ kind: 'number', value: option });
          }}
          style={styles.optionCard}
        />
      ))}
    </View>
  );

  return <AlifaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  prompt: { alignItems: 'center', gap: spacing.md },
  mat: { paddingVertical: spacing.lg, borderRadius: radius.lg },
  coins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  optionCard: { flex: 1, maxWidth: 130 },
});
