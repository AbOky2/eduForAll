import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaStimulus,
  EcolnaExerciseLayout,
  useExerciseMetrics,
  useAnswerCardState,
} from '@/design-system/primitives';
import { useAnswerEcho } from '@/design-system/primitives/ecolna-answer-card';
import { scaled, useResponsive } from '@/design-system/responsive';
import { illustration, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';
import { NUMBER_SOUNDS, cardSound } from './card-sound';

type MoneyStep = Extract<ExerciseStep, { type: 'count_money' }>;
type Coin = MoneyStep['coins'][number];

/**
 * Franc CFA d'Afrique centrale (XAF) — the currency in circulation in Chad.
 * Low denominations are brass, high ones nickel, as on the real coins, so
 * the child can sort them by look before reading the number.
 */
const COIN_STYLE: Record<Coin, (typeof illustration.coins)[keyof typeof illustration.coins]> = {
  5: illustration.coins.brass,
  10: illustration.coins.brass,
  25: illustration.coins.brassDeep,
  50: illustration.coins.nickel,
  100: illustration.coins.nickel,
  500: illustration.coins.nickelBright,
};

/** Une pièce, dessinée à 64 u et rendue à la taille demandée. */
function CoinFace({ value, size }: { value: Coin; size: number }) {
  const style = COIN_STYLE[value];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={33.5} r={29} fill={style.rim} />
      <Circle cx={32} cy={31} r={29} fill={style.face} stroke={style.rim} strokeWidth={2.5} />
      <Circle cx={32} cy={31} r={23} fill="none" stroke={style.ring} strokeWidth={1.5} />
      <SvgText
        x={32}
        y={37}
        fontSize={value >= 100 ? 18 : 20}
        fontWeight="bold"
        fill={style.ink}
        textAnchor="middle"
      >
        {String(value)}
      </SvgText>
      <SvgText x={32} y={50} fontSize={8} fill={style.ink} textAnchor="middle">
        F CFA
      </SvgText>
    </Svg>
  );
}

/**
 * « Les pièces de monnaie » (programme p. 59). The child adds up the coins
 * laid out on the mat — the first real-life use of addition at CP. The
 * instruction is said (and replayed) by the lesson header.
 */
export function MoneyExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
}: ExerciseRendererProps<MoneyStep>) {
  const [picked, setPicked] = useState<number | null>(null);
  const { scale, isTablet } = useResponsive();
  const metrics = useExerciseMetrics();
  const cardState = useAnswerCardState(interactive);
  const echo = useAnswerEcho(interactive);
  const coin = scaled(isTablet ? 84 : 64, scale);

  const prompt = (
    <EcolnaStimulus style={[styles.mat, { gap: metrics.gap, minHeight: coin * 2.6 }]}>
      <View style={[styles.coins, { gap: scaled(spacing.sm, scale) }]}>
        {step.coins.map((value, index) => (
          <CoinFace key={`${value}-${index}`} value={value} size={coin} />
        ))}
      </View>
    </EcolnaStimulus>
  );

  const answers = (
    <View style={[styles.options, { gap: metrics.gap }]}>
      {step.options.map((option) => (
        <EcolnaAnswerCard
          key={option}
          // Espace insécable : « 10 F » ne se coupe jamais en deux lignes.
          label={`${option}\u00a0F`}
          glyphVariant={isTablet ? 'displayGlyphSmall' : 'headlineLg'}
          state={cardState(picked === option)}
          onPress={() => {
            setPicked(option);
            onSubmit({ kind: 'number', value: option });
          }}
          // Retouchée pendant la reprise : elle redit sa somme, sans répondre.
          onEcho={echo(picked === option, () => {
            const sound = cardSound(NUMBER_SOUNDS, String(option));
            if (sound) {
              playAudio(sound);
            }
          })}
          style={[styles.optionCard, { maxWidth: metrics.tileWidth * 1.6 }]}
          contentStyle={{ minHeight: metrics.answerHeight }}
        />
      ))}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  mat: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg },
  coins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  optionCard: { flexGrow: 1, flexBasis: '28%' },
});
