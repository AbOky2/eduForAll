import { useContext, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { PHOSPHOR } from '@/design-system/icons/phosphor.generated';
import {
  AnswerVerdictContext,
  EcolnaAnswerCard,
  ExerciseSubjectContext,
  useExerciseMetrics,
  type AnswerCardState,
} from '@/design-system/primitives';
import {
  ExerciseAnchor,
  answersRoom,
  fitAnswerHeight,
} from '@/design-system/primitives/ecolna-exercise-layout';
import { scaled, useResponsive, useTypography } from '@/design-system/responsive';
import { a11y, colors, pairTints, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';
import { cardSound } from './card-sound';

type MatchStep = Extract<ExerciseStep, { type: 'match_pairs' }>;
type Side = 'left' | 'right';

/** Une carte du plateau : sa colonne et sa paire. */
interface CardRef {
  side: Side;
  id: string;
}

interface Point {
  x: number;
  y: number;
}

/** Un lien tiré par l'enfant ; `slot` numérote la paire et choisit sa teinte. */
export interface PairLink {
  pairId: string;
  matchedPairId: string;
  slot: number;
}

/** Filet d'une carte au repos, de chaque côté (voir `EcolnaAnswerCard`). */
const CARD_BORDER = 2;

/** Le choix en cours : le bleu du choix, comme toute réponse choisie. */
const SELECTING = {
  face: colors.brandTint,
  edge: colors.brandTintStrong,
  border: colors.brand,
  ink: colors.brandInk,
};

/**
 * Le bout de l'index de la main de démonstration (Phosphor `hand-pointing`,
 * repère 256) : c'est lui qui se pose sur le point d'accroche.
 */
const HAND_TIP = { x: 116 / 256, y: 28 / 256 };
/** La main attend que la consigne commence, comme la bille de l'ardoise. */
const DEMO_DELAY_MS = 700;
const DEMO_TRAVEL_MS = 1300;
/** Le disque d'appui sous le doigt de la main : le bleu du choix, à peine posé. */
const TOUCH_OPACITY = 0.2;

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

const keyOf = (card: CardRef) => `${card.side === 'left' ? 'l' : 'r'}-${card.id}`;

/**
 * Relier, en deux colonnes. On tire un trait d'une carte à sa partenaire de
 * l'autre colonne — ou on touche l'une puis l'autre —, dans un sens ou dans
 * l'autre. Chaque paire posée garde sa teinte et son numéro des deux côtés
 * (« ba, paire 1 ») : ce qui va avec quoi se lit sans la couleur. Entre les
 * colonnes, un point d'accroche est posé à cheval sur le filet de chaque
 * carte, et un trait de la teinte de la paire les relie — le geste « relier »
 * du cahier.
 *
 * Le geste se montre une fois, au premier affichage : une main glisse d'un
 * point à l'autre en tirant le trait (flèche fixe en mouvement réduit), et
 * s'efface au premier appui. Le trait qu'on tire est élastique : lâché sur une
 * carte de l'autre colonne, il relie ; lâché ailleurs, il se rétracte et la
 * carte de départ reste choisie.
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
  const subject = useContext(ExerciseSubjectContext);
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<CardRef | null>(null);
  const [links, setLinks] = useState<PairLink[]>([]);
  // Le trait qu'on tire, du point d'accroche de départ jusqu'au doigt.
  const [drag, setDrag] = useState<(CardRef & Point) | null>(null);
  // Lâché ailleurs : le trait revient à son point d'accroche.
  const [retract, setRetract] = useState<{ from: Point; to: Point } | null>(null);
  const [retractProgress] = useState(() => new Animated.Value(0));
  // La démonstration du geste : une seule fois, effacée au premier appui.
  const [demoDone, setDemoDone] = useState(false);
  const [demoProgress] = useState(() => new Animated.Value(0));
  const [demoOpacity] = useState(() => new Animated.Value(0));

  const total = step.pairs.length;
  const board = boardAfterVerdict(links, total, verdict);
  // La feuille « à revoir » est ouverte : les paires fausses le montrent.
  const reviewing = links.length === total && verdict === 'incorrect';
  const byLeft = new Map(board.map((link) => [link.pairId, link]));
  const byRight = new Map(board.map((link) => [link.matchedPairId, link]));
  const pairById = new Map(step.pairs.map((pair) => [pair.id, pair]));

  const metrics = useExerciseMetrics();
  const { splitPanes, isTablet, scale, contentMaxWidth } = useResponsive();
  // Le couloir où se tirent les traits : au moins cette largeur, et tout ce
  // que les cartes laissent — plafonnées, elles élargissent le geste.
  const link = Math.round(metrics.gap * (splitPanes ? 7 : isTablet ? 5 : 3));
  const cardMaxWidth = scaled(280, scale);
  // Le point d'accroche : ≈ 30 dp sur tablette, un anneau de 3 dp.
  const dot = scaled(11, scale);
  const ring = 3;
  const stroke = Math.max(4, scaled(5, scale));
  const handSize = scaled(72, scale);
  const touchSize = scaled(40, scale);
  // Les rangées tiennent au-dessus de la feuille de retour : le verdict de
  // chaque paire reste visible pendant qu'elle est ouverte. Trop bas (7"
  // couchée), l'écart se resserre, puis le glyphe passe à sa petite taille.
  const typography = useTypography();
  const room = answersRoom(metrics, false, 'max');
  const facePadding = scaled(spacing.xs, scale);
  const minGap = scaled(spacing.sm, scale);
  const glyphCard = (variant: typeof metrics.answerGlyph) =>
    (typography[variant].lineHeight ?? 0) + 2 * (facePadding + CARD_BORDER);
  const fits = (height: number) => !(room > 0) || total * height + (total - 1) * minGap <= room;
  const glyphVariant = fits(glyphCard(metrics.answerGlyph))
    ? metrics.answerGlyph
    : 'displayGlyphSmall';
  const cardHeight = Math.max(
    glyphCard(glyphVariant),
    fitAnswerHeight({
      preferred: splitPanes ? Math.round(metrics.answerHeight * 0.78) : metrics.answerHeight,
      room,
      rows: total,
      gap: minGap,
      min: scaled(a11y.childTouchTarget + 8, scale),
    }),
  );
  const rowGap =
    room > 0
      ? Math.max(
          minGap,
          Math.min(metrics.gap, Math.floor((room - total * cardHeight) / Math.max(1, total - 1))),
        )
      : metrics.gap;
  // Le milieu vertical (et la demi-hauteur) de chaque carte dans sa colonne :
  // les traits s'y accrochent, le doigt y est reconnu.
  const [cells, setCells] = useState<Record<string, { center: number; half: number }>>({});
  const [columnWidth, setColumnWidth] = useState(0);
  const [rowWidth, setRowWidth] = useState(0);
  const corridor = Math.max(link, rowWidth - 2 * columnWidth);
  const measure = (key: string) => (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const center = Math.round(y + height / 2);
    const half = Math.round(height / 2);
    setCells((current) =>
      current[key]?.center === center && current[key]?.half === half
        ? current
        : { ...current, [key]: { center, half } },
    );
  };

  // Les pastilles d'angle d'une carte (numéro de la paire, verdict) :
  // `EcolnaAnswerCard` les pose à `spacing.xs` du coin, dans un filet de 3 dp.
  // Une carte basse (7" couchée, téléphone) les approche du point d'accroche :
  // il s'écarte alors dans le couloir, juste assez pour ne pas les toucher.
  const badgeRadius = scaled(30, scale) / 2;
  const badgeInset = 3 + spacing.xs + badgeRadius;
  const halves = Object.values(cells).map((cell) => cell.half);
  const cardHalf = halves.length > 0 ? Math.min(...halves) : cardHeight / 2;
  const clearance = dot + ring / 2 + badgeRadius + 3;
  const rise = cardHalf - badgeInset;
  const push = Math.max(
    0,
    Math.ceil(Math.sqrt(Math.max(0, clearance ** 2 - rise ** 2)) - badgeInset + CARD_BORDER / 2),
  );
  // Abscisses, dans la rangée : le milieu du filet de 2 dp de chaque carte (le
  // point est à cheval sur le filet), écarté de `push` sur une carte basse.
  const leftX = columnWidth - CARD_BORDER / 2 + push;
  const rightX = columnWidth + corridor + CARD_BORDER / 2 - push;
  const dotOf = (card: CardRef): Point | null => {
    const cell = cells[keyOf(card)];
    return columnWidth > 0 && cell
      ? { x: card.side === 'left' ? leftX : rightX, y: cell.center }
      : null;
  };

  /**
   * La carte sous le doigt : sa colonne, le point d'accroche compris (un
   * diamètre de point de plus dans le couloir), puis la plus proche en hauteur.
   */
  const grab = Math.min(2 * dot + ring, corridor / 2);
  const cardAt = (x: number, y: number): CardRef | null => {
    if (columnWidth === 0) {
      return null;
    }
    const side: Side | null =
      x <= columnWidth + grab ? 'left' : x >= columnWidth + corridor - grab ? 'right' : null;
    if (!side) {
      return null;
    }
    let found: CardRef | null = null;
    let nearest = Infinity;
    for (const pair of step.pairs) {
      const cell = cells[keyOf({ side, id: pair.id })];
      const distance = cell ? Math.abs(y - cell.center) : Infinity;
      if (cell && distance <= cell.half + Math.max(rowGap, grab) / 2 && distance < nearest) {
        found = { side, id: pair.id };
        nearest = distance;
      }
    }
    return found;
  };

  const tintOf = (slot: number) => pairTints[(slot - 1) % pairTints.length] ?? SELECTING;
  const isWrong = (pairLink: PairLink | undefined) =>
    reviewing && pairLink !== undefined && !isRightLink(pairLink);
  const linkOf = (card: CardRef) => (card.side === 'left' ? byLeft : byRight).get(card.id);

  const say = (card: CardRef) => {
    const pair = pairById.get(card.id);
    const audioId = pair
      ? cardSound(
          card.side === 'left' ? 'son' : 'mot',
          card.side === 'left' ? pair.left : pair.right,
        )
      : null;
    if (audioId) {
      playAudio(audioId);
    }
  };

  const dismissDemo = () => {
    if (!demoDone) {
      setDemoDone(true);
    }
  };

  /** Pose le lien entre deux cartes de colonnes différentes. */
  const connect = (from: CardRef, to: CardRef) => {
    const drawn =
      to.side === 'left'
        ? { pairId: to.id, matchedPairId: from.id }
        : { pairId: from.id, matchedPairId: to.id };
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

  const press = (card: CardRef) => {
    if (!interactive) {
      return;
    }
    dismissDemo();
    say(card);
    // Une carte déjà reliée garde sa paire.
    if (linkOf(card)) {
      return;
    }
    // Premier appui, ou un autre choix du même côté : la carte est choisie.
    if (!selected || selected.side === card.side) {
      setSelected(card);
      return;
    }
    connect(selected, card);
  };

  /** Lâché hors d'une partenaire possible : le trait revient au point de départ. */
  const retractFrom = (from: CardRef, end: Point) => {
    const start = dotOf(from);
    if (!start || reducedMotion) {
      return;
    }
    setRetract({ from: start, to: end });
    retractProgress.setValue(1);
    Animated.timing(retractProgress, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setRetract(null);
      }
    });
  };

  // Le glisser. Il s'active sur un mouvement vers l'autre colonne (un simple
  // toucher reste un appui de carte, une page qui défile reste une page) ; le
  // départ et l'arrivée se lisent sur l'événement lui-même.
  const pan = Gesture.Pan()
    .withTestId('relier')
    .enabled(interactive)
    .activeOffsetX([-10, 10])
    .onBegin(() => dismissDemo())
    .onStart((event) => {
      const from = cardAt(event.x - event.translationX, event.y - event.translationY);
      if (!from) {
        return;
      }
      say(from);
      if (linkOf(from)) {
        return;
      }
      setSelected(from);
      setDrag({ ...from, x: event.x, y: event.y });
    })
    .onUpdate((event) => {
      setDrag((current) => (current ? { ...current, x: event.x, y: event.y } : current));
    })
    .onEnd((event, success) => {
      const from = cardAt(event.x - event.translationX, event.y - event.translationY);
      if (!success || !from || linkOf(from)) {
        return;
      }
      const to = cardAt(event.x, event.y);
      if (to && to.side !== from.side && !linkOf(to)) {
        say(to);
        connect(from, to);
      } else {
        retractFrom(from, { x: event.x, y: event.y });
      }
    })
    .onFinalize(() => setDrag(null))
    .runOnJS(true);

  // La partenaire sous le doigt : le trait s'y accroche déjà.
  const hovered = drag ? cardAt(drag.x, drag.y) : null;
  const target = drag && hovered && hovered.side !== drag.side && !linkOf(hovered) ? hovered : null;
  const dragFrom = drag ? dotOf(drag) : null;
  const dragTo = target ? dotOf(target) : drag;

  // La démonstration : la première paire, de sa carte à sa partenaire — le
  // modèle du maître au tableau (« je fais, puis tu fais »), jamais une
  // fausse association. Rien tant que le plateau n'est pas mesuré.
  const demoPair = step.pairs[0];
  const demoFrom = demoPair ? dotOf({ side: 'left', id: demoPair.id }) : null;
  const demoTo = demoPair ? dotOf({ side: 'right', id: demoPair.id }) : null;
  const demo =
    !demoDone && interactive && links.length === 0 && verdict === null && demoFrom && demoTo
      ? { from: demoFrom, to: demoTo }
      : null;
  const demoOn = demo !== null;

  useEffect(() => {
    if (!demoOn || reducedMotion) {
      return undefined;
    }
    demoProgress.setValue(0);
    demoOpacity.setValue(0);
    const run = Animated.sequence([
      Animated.delay(DEMO_DELAY_MS),
      Animated.timing(demoOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(demoProgress, {
        toValue: 1,
        duration: DEMO_TRAVEL_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(380),
      Animated.timing(demoOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]);
    run.start(({ finished }) => {
      if (finished) {
        setDemoDone(true);
      }
    });
    return () => run.stop();
  }, [demoOn, reducedMotion, demoProgress, demoOpacity]);

  const cardProps = (card: CardRef, text: string) => {
    const pairLink = linkOf(card);
    const choosing = selected?.side === card.side && selected.id === card.id;
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
      glyphVariant,
      state,
      tint: wrong ? undefined : pairLink ? tintOf(pairLink.slot) : SELECTING,
      mark: pairLink?.slot.toString(),
      accessibilityLabel: wrong
        ? fr.lesson.pairToReview(text)
        : pairLink
          ? fr.lesson.pairLabel(text, pairLink.slot)
          : text,
      contentStyle: { minHeight: cardHeight, paddingVertical: facePadding },
      onPress: () => press(card),
    };
  };

  // Le point d'accroche : au repos, un œillet blanc cerclé de la teinte
  // soutenue de la discipline (≥ 3:1 sur blanc, il se voit au soleil) ; bleu
  // au choix, sous le doigt et à revoir ; teinte de la paire une fois relié.
  const rest = {
    fill: colors.white,
    ring: subject ? subjectColors[subject].solid : colors.outline,
  };
  const dotLook = (card: CardRef) => {
    const pairLink = linkOf(card);
    const choosing =
      (selected?.side === card.side && selected.id === card.id) ||
      (target?.side === card.side && target.id === card.id);
    return isWrong(pairLink) || (choosing && !pairLink)
      ? { fill: colors.brand, ring: colors.white }
      : pairLink
        ? { fill: tintOf(pairLink.slot).border, ring: colors.white }
        : rest;
  };

  // En mouvement réduit, la démonstration est une flèche fixe, d'un point à l'autre.
  // Elle part sous la main et s'arrête à un souffle du point d'arrivée.
  const demoArrow =
    demo && reducedMotion
      ? arrowBetween(demo.from, demo.to, dot + ring + 6, dot + ring + scaled(10, scale))
      : null;

  return (
    // Ancré sous la consigne comme tout exercice (air 1:1,25, jamais sous la
    // feuille de retour) ; le corps y est mesuré.
    <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
      <ExerciseAnchor onLayout={metrics.onBodyLayout}>
        <GestureDetector gesture={pan}>
          <View
            style={[styles.columns, { gap: link }]}
            onLayout={(event) => setRowWidth(Math.round(event.nativeEvent.layout.width))}
          >
            <View
              style={[styles.column, { gap: rowGap, maxWidth: cardMaxWidth }]}
              onLayout={(event) => setColumnWidth(Math.round(event.nativeEvent.layout.width))}
            >
              {step.pairs.map((pair) => (
                <View key={pair.id} onLayout={measure(`l-${pair.id}`)}>
                  <EcolnaAnswerCard {...cardProps({ side: 'left', id: pair.id }, pair.left)} />
                </View>
              ))}
            </View>
            <View style={[styles.column, { gap: rowGap, maxWidth: cardMaxWidth }]}>
              {rightShuffled.map((pair) => (
                <View key={pair.id} onLayout={measure(`r-${pair.id}`)}>
                  <EcolnaAnswerCard {...cardProps({ side: 'right', id: pair.id }, pair.right)} />
                </View>
              ))}
            </View>

            {/* Sous les points d'accroche : le trait de la démonstration, et
                celui qui revient quand on lâche ailleurs. */}
            {demo && !reducedMotion ? (
              <ElasticTrail
                from={demo.from}
                to={demo.to}
                progress={demoProgress}
                opacity={demoOpacity}
                width={stroke}
              />
            ) : null}
            {retract ? (
              <ElasticTrail
                from={retract.from}
                to={retract.to}
                progress={retractProgress}
                opacity={1}
                width={stroke}
              />
            ) : null}

            {/* Les traits et les points d'accroche, par-dessus le bord des cartes. */}
            {columnWidth > 0 ? (
              <View pointerEvents="none" style={styles.overlay}>
                <Svg width="100%" height="100%">
                  {board.map((pairLink) => {
                    const from = dotOf({ side: 'left', id: pairLink.pairId });
                    const to = dotOf({ side: 'right', id: pairLink.matchedPairId });
                    const wrong = isWrong(pairLink);
                    return from && to ? (
                      <Line
                        key={pairLink.pairId}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={wrong ? colors.brand : tintOf(pairLink.slot).border}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        {...(wrong ? { strokeDasharray: [stroke * 1.6, stroke * 1.8] } : {})}
                      />
                    ) : null;
                  })}
                  {dragFrom && dragTo ? (
                    <Line
                      testID="relier-trait"
                      x1={dragFrom.x}
                      y1={dragFrom.y}
                      x2={dragTo.x}
                      y2={dragTo.y}
                      stroke={colors.brand}
                      strokeWidth={stroke}
                      strokeLinecap="round"
                    />
                  ) : null}
                  {demoArrow ? (
                    <Path
                      testID="relier-fleche"
                      d={demoArrow}
                      fill="none"
                      stroke={colors.brand}
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                  {(['left', 'right'] as const).flatMap((side) =>
                    step.pairs.map((pair) => {
                      const card = { side, id: pair.id };
                      const at = dotOf(card);
                      const look = dotLook(card);
                      return at ? (
                        <Circle
                          key={keyOf(card)}
                          cx={at.x}
                          cy={at.y}
                          r={dot}
                          fill={look.fill}
                          stroke={look.ring}
                          strokeWidth={ring}
                        />
                      ) : null;
                    }),
                  )}
                </Svg>
              </View>
            ) : null}

            {/* La main qui montre le geste : son index se pose sur le point, un
                disque d'appui translucide sous le doigt. */}
            {demo ? (
              <DemoGesture
                from={demo.from}
                to={demo.to}
                handSize={handSize}
                touchSize={touchSize}
                progress={reducedMotion ? null : demoProgress}
                opacity={reducedMotion ? null : demoOpacity}
              />
            ) : null}
          </View>
        </GestureDetector>
      </ExerciseAnchor>
    </View>
  );
}

/**
 * Une flèche fixe de `from` vers `to`, écartée des deux points d'accroche de
 * `fromInset` et `toInset` : le trait et sa pointe, en un seul tracé.
 */
function arrowBetween(from: Point, to: Point, fromInset: number, toInset: number): string | null {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length <= fromInset + toInset + 8) {
    return null;
  }
  const ux = (to.x - from.x) / length;
  const uy = (to.y - from.y) / length;
  const start = { x: from.x + ux * fromInset, y: from.y + uy * fromInset };
  const end = { x: to.x - ux * toInset, y: to.y - uy * toInset };
  const wing = Math.min(16, length / 6);
  const back = { x: end.x - ux * wing, y: end.y - uy * wing };
  return (
    `M${start.x} ${start.y}L${end.x} ${end.y}` +
    `M${back.x - uy * wing} ${back.y + ux * wing}L${end.x} ${end.y}L${back.x + uy * wing} ${back.y - ux * wing}`
  );
}

/**
 * Un trait bleu qui s'allonge de `from` vers `to` au fil de `progress` (0 → 1),
 * au pilote natif : une barre tournée vers la cible, étirée depuis son
 * origine, et un bout arrondi qui la suit. L'origine passe sous le point
 * d'accroche, dessiné par-dessus.
 */
function ElasticTrail({
  from,
  to,
  progress,
  opacity,
  width,
}: {
  from: Point;
  to: Point;
  progress: Animated.Value;
  opacity: Animated.Value | number;
  width: number;
}) {
  const length = Math.max(1, Math.hypot(to.x - from.x, to.y - from.y));
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.trail,
          {
            left: from.x,
            top: from.y - width / 2,
            width: length,
            height: width,
            opacity,
            transform: [
              { translateX: -length / 2 },
              { rotate: `${angle}rad` },
              { scaleX: progress.interpolate({ inputRange: [0, 1], outputRange: [0.001, 1] }) },
              { translateX: length / 2 },
            ],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.trail,
          {
            left: 0,
            top: 0,
            width,
            height: width,
            borderRadius: width / 2,
            opacity,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [from.x - width / 2, to.x - width / 2],
                }),
              },
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [from.y - width / 2, to.y - width / 2],
                }),
              },
            ],
          },
        ]}
      />
    </>
  );
}

/**
 * La main de démonstration, son disque d'appui et leur trajet de `from` à
 * `to` au fil de `progress` (pilote natif). En mouvement réduit (`progress`
 * nul), la main reste posée sur le point de départ.
 */
function DemoGesture({
  from,
  to,
  handSize,
  touchSize,
  progress,
  opacity,
}: {
  from: Point;
  to: Point;
  handSize: number;
  touchSize: number;
  progress: Animated.Value | null;
  opacity: Animated.Value | null;
}) {
  // Le bout du doigt, au départ et à l'arrivée ; la main et le disque le suivent.
  const along = (offsetX: number, offsetY: number) =>
    progress
      ? [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [from.x - offsetX, to.x - offsetX],
            }),
          },
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [from.y - offsetY, to.y - offsetY],
            }),
          },
        ]
      : [{ translateX: from.x - offsetX }, { translateY: from.y - offsetY }];
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.touch,
          {
            width: touchSize,
            height: touchSize,
            borderRadius: touchSize / 2,
            opacity: opacity
              ? opacity.interpolate({ inputRange: [0, 1], outputRange: [0, TOUCH_OPACITY] })
              : TOUCH_OPACITY,
            transform: along(touchSize / 2, touchSize / 2),
          },
        ]}
      />
      <Animated.View
        testID="relier-demo"
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.hand,
          {
            width: handSize,
            height: handSize,
            opacity: opacity ?? 1,
            transform: [
              ...along(HAND_TIP.x * handSize, HAND_TIP.y * handSize),
              // Elle se pose : un léger appui en apparaissant.
              ...(opacity
                ? [{ scale: opacity.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] }) }]
                : []),
            ],
          },
        ]}
      >
        <DemoHand size={handSize} />
      </Animated.View>
    </>
  );
}

/** La main de démonstration : blanche, cernée d'encre (Phosphor `hand-pointing`). */
function DemoHand({ size }: { size: number }) {
  const glyph = PHOSPHOR['hand-pointing'];
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Son ombre portée, douce : la main flotte au-dessus de la page. */}
      {glyph.duoBack.map((d) => (
        <Path
          key={`s${d}`}
          d={d}
          fill={colors.shadow}
          stroke={colors.shadow}
          strokeWidth={16}
          strokeLinejoin="round"
          opacity={0.14}
          transform="translate(8 12)"
        />
      ))}
      {glyph.duoBack.map((d) => (
        <Path key={`b${d}`} d={d} fill={colors.white} />
      ))}
      {glyph.duoFront.map((d) => (
        <Path key={d} d={d} fill={colors.ink} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', alignSelf: 'center' },
  // Les cartes plafonnées partent des bords : le couloir prend le reste.
  columns: { flexDirection: 'row', justifyContent: 'space-between' },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  column: { flex: 1 },
  trail: { position: 'absolute', backgroundColor: colors.brand },
  hand: { position: 'absolute', left: 0, top: 0 },
  touch: { position: 'absolute', left: 0, top: 0, backgroundColor: colors.brand },
});
