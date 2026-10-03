import { useContext, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  AnswerVerdictContext,
  EcolnaAnswerCard,
  useExerciseMetrics,
  type AnswerCardState,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, pairTints, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';
import { cardSound } from './card-sound';

type MatchStep = Extract<ExerciseStep, { type: 'match_pairs' }>;
type Side = 'left' | 'right';

/** Un lien tiré par l'enfant ; `slot` numérote la paire et choisit sa teinte. */
export interface PairLink {
  pairId: string;
  matchedPairId: string;
  slot: number;
}

/** Le choix en cours : le bleu du choix, comme toute réponse choisie. */
const SELECTING = {
  face: colors.brandTint,
  edge: colors.brandTintStrong,
  border: colors.brand,
  ink: colors.brandInk,
};

/** Le critère de l'évaluateur (`evaluateAnswer`, match_pairs), lien par lien. */
export function isRightLink(link: Pick<PairLink, 'pairId' | 'matchedPairId'>): boolean {
  return link.pairId === link.matchedPairId;
}

/**
 * Ce qui reste sur le plateau. Tant que le verdict est affiché, tout ; une fois
 * la feuille « à revoir » fermée (plateau complet, plus de verdict), seules les
 * paires justes restent — l'enfant ne refait que ce qui était faux, et chaque
 * nouvel essai est soumis et compté par la machine de leçon comme le premier.
 */
export function boardAfterVerdict(
  links: readonly PairLink[],
  total: number,
  verdict: 'correct' | 'incorrect' | null,
): readonly PairLink[] {
  return links.length === total && verdict === null ? links.filter(isRightLink) : links;
}

/** Le plus petit numéro de paire libre : une paire juste garde le sien d'un essai à l'autre. */
export function nextSlot(links: readonly PairLink[]): number {
  const taken = new Set(links.map((link) => link.slot));
  let slot = 1;
  while (taken.has(slot)) {
    slot += 1;
  }
  return slot;
}

/**
 * Relier, en deux colonnes. On touche une carte d'un côté puis sa partenaire
 * de l'autre — dans un sens ou dans l'autre. Chaque paire posée garde sa
 * teinte et son numéro des deux côtés (« ba, paire 1 ») : ce qui va avec quoi
 * se lit sans la couleur. Entre les colonnes, un point d'accroche est posé à
 * cheval sur le filet de chaque carte, et un trait de la teinte de la paire
 * les relie — le geste « relier » rendu visible.
 *
 * Le verdict arrive plateau complet. « À revoir » ne vise que les paires
 * fausses (bleues, flèche de reprise, trait tireté — jamais de rouge) ; au
 * nouvel essai, elles seules s'effacent, les paires justes restent.
 */
export function MatchPairsExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
}: ExerciseRendererProps<MatchStep>) {
  const rightShuffled = useMemo(
    () =>
      [...step.pairs].sort(
        (a, b) =>
          ((a.id.charCodeAt(1) * 7) % 5) - ((b.id.charCodeAt(1) * 7) % 5) ||
          a.id.localeCompare(b.id),
      ),
    [step],
  );

  const verdict = useContext(AnswerVerdictContext);
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [links, setLinks] = useState<PairLink[]>([]);

  const total = step.pairs.length;
  const board = boardAfterVerdict(links, total, verdict);
  // La feuille « à revoir » est ouverte : les paires fausses le montrent.
  const reviewing = links.length === total && verdict === 'incorrect';
  const byLeft = new Map(board.map((link) => [link.pairId, link]));
  const byRight = new Map(board.map((link) => [link.matchedPairId, link]));

  const metrics = useExerciseMetrics();
  const { splitPanes, isTablet, scale, contentMaxWidth } = useResponsive();
  // La gouttière où se tirent les traits : assez large pour qu'un trait se lise comme un geste.
  const link = Math.round(metrics.gap * (splitPanes ? 7 : isTablet ? 5 : 3));
  const dot = scaled(8, scale);
  const ring = 2;
  // Le calque des traits déborde d'un point de chaque côté : les points
  // d'accroche sont à cheval sur le filet des cartes.
  const reach = dot + ring;
  const stroke = Math.max(4, scaled(5, scale));
  // Couchée, trois rangées tiennent au-dessus de la feuille de retour : le
  // verdict de chaque paire reste visible pendant qu'elle est ouverte.
  const cardHeight = splitPanes ? Math.round(metrics.answerHeight * 0.78) : metrics.answerHeight;
  // Le centre vertical de chaque carte (dans sa colonne), pour tirer les traits.
  const [centers, setCenters] = useState<Record<string, number>>({});
  const [columnWidth, setColumnWidth] = useState(0);
  const measure = (key: string) => (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const center = Math.round(y + height / 2);
    setCenters((current) => (current[key] === center ? current : { ...current, [key]: center }));
  };

  const tintOf = (slot: number) => pairTints[(slot - 1) % pairTints.length] ?? SELECTING;
  const isWrong = (pairLink: PairLink | undefined) =>
    reviewing && pairLink !== undefined && !isRightLink(pairLink);

  const say = (side: Side, text: string) => {
    const audioId = cardSound(side === 'left' ? 'son' : 'mot', text);
    if (audioId) {
      playAudio(audioId);
    }
  };

  const press = (side: Side, id: string, text: string) => {
    if (!interactive) {
      return;
    }
    say(side, text);
    // Une carte déjà reliée garde sa paire.
    if ((side === 'left' ? byLeft : byRight).has(id)) {
      return;
    }
    // Premier appui, ou un autre choix du même côté : la carte est choisie.
    if (!selected || selected.side === side) {
      setSelected({ side, id });
      return;
    }
    const drawn =
      side === 'left'
        ? { pairId: id, matchedPairId: selected.id }
        : { pairId: selected.id, matchedPairId: id };
    const next = [...board, { ...drawn, slot: nextSlot(board) }];
    setLinks(next);
    setSelected(null);
    if (next.length === total) {
      onSubmit({
        kind: 'pairs',
        matches: next.map(({ pairId, matchedPairId }) => ({ pairId, matchedPairId })),
      });
    }
  };

  const cardProps = (side: Side, id: string, text: string) => {
    const pairLink = (side === 'left' ? byLeft : byRight).get(id);
    const choosing = selected?.side === side && selected.id === id;
    const wrong = isWrong(pairLink);
    const state: AnswerCardState = wrong
      ? 'incorrect'
      : pairLink || choosing
        ? 'selected'
        : interactive
          ? 'default'
          : 'disabled';
    return {
      label: text,
      glyph: text.length <= 6,
      glyphVariant: metrics.answerGlyph,
      state,
      tint: wrong ? undefined : pairLink ? tintOf(pairLink.slot) : SELECTING,
      mark: pairLink?.slot.toString(),
      accessibilityLabel: wrong
        ? fr.lesson.pairToReview(text)
        : pairLink
          ? fr.lesson.pairLabel(text, pairLink.slot)
          : text,
      contentStyle: { minHeight: cardHeight, paddingVertical: scaled(spacing.xs, scale) },
      onPress: () => press(side, id, text),
    };
  };

  // Le point d'accroche : blanc et fileté au repos (le filet de la carte),
  // bleu au choix et à revoir, teinte de la paire une fois relié.
  const dotLook = (pairLink: PairLink | undefined, choosing: boolean) =>
    isWrong(pairLink) || (choosing && !pairLink)
      ? { fill: colors.brand, ring: colors.white }
      : pairLink
        ? { fill: tintOf(pairLink.slot).border, ring: colors.white }
        : { fill: colors.white, ring: colors.borderStrong };

  // Abscisses, dans le calque : le milieu du filet de 2 dp de chaque carte.
  const leftX = reach - 1;
  const rightX = reach + link + 1;

  return (
    // Ancré sous la consigne comme tout exercice : un tiers de l'air au-dessus,
    // deux tiers au-dessous (EcolnaExerciseLayout).
    <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
      <View style={styles.above} />
      <View style={[styles.columns, { gap: link }]}>
        <View
          style={[styles.column, { gap: metrics.gap }]}
          onLayout={(event) => setColumnWidth(Math.round(event.nativeEvent.layout.width))}
        >
          {step.pairs.map((pair) => (
            <View key={pair.id} onLayout={measure(`l-${pair.id}`)}>
              <EcolnaAnswerCard {...cardProps('left', pair.id, pair.left)} />
            </View>
          ))}
        </View>
        <View style={[styles.column, { gap: metrics.gap }]}>
          {rightShuffled.map((pair) => (
            <View key={pair.id} onLayout={measure(`r-${pair.id}`)}>
              <EcolnaAnswerCard {...cardProps('right', pair.id, pair.right)} />
            </View>
          ))}
        </View>
        {/* Les traits et les points d'accroche, par-dessus le bord des cartes. */}
        {columnWidth > 0 ? (
          <View
            pointerEvents="none"
            style={[styles.links, { left: columnWidth - reach, width: link + 2 * reach }]}
          >
            <Svg width="100%" height="100%">
              {board.map((pairLink) => {
                const from = centers[`l-${pairLink.pairId}`];
                const to = centers[`r-${pairLink.matchedPairId}`];
                const wrong = isWrong(pairLink);
                return from !== undefined && to !== undefined ? (
                  <Line
                    key={pairLink.pairId}
                    x1={leftX}
                    y1={from}
                    x2={rightX}
                    y2={to}
                    stroke={wrong ? colors.brand : tintOf(pairLink.slot).border}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    {...(wrong ? { strokeDasharray: [stroke * 1.6, stroke * 1.8] } : {})}
                  />
                ) : null;
              })}
              {step.pairs.flatMap((pair) => {
                const left = centers[`l-${pair.id}`];
                const right = centers[`r-${pair.id}`];
                const leftLook = dotLook(
                  byLeft.get(pair.id),
                  selected?.side === 'left' && selected.id === pair.id,
                );
                const rightLook = dotLook(
                  byRight.get(pair.id),
                  selected?.side === 'right' && selected.id === pair.id,
                );
                return [
                  left !== undefined ? (
                    <Circle
                      key={`l-${pair.id}`}
                      cx={leftX}
                      cy={left}
                      r={dot}
                      fill={leftLook.fill}
                      stroke={leftLook.ring}
                      strokeWidth={ring}
                    />
                  ) : null,
                  right !== undefined ? (
                    <Circle
                      key={`r-${pair.id}`}
                      cx={rightX}
                      cy={right}
                      r={dot}
                      fill={rightLook.fill}
                      stroke={rightLook.ring}
                      strokeWidth={ring}
                    />
                  ) : null,
                ];
              })}
            </Svg>
          </View>
        ) : null}
      </View>
      <View style={styles.below} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', alignSelf: 'center' },
  above: { flex: 1 },
  below: { flex: 2 },
  columns: { flexDirection: 'row' },
  links: { position: 'absolute', top: 0, bottom: 0 },
  column: { flex: 1 },
});
