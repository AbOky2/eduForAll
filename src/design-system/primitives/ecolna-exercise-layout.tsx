import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { fr } from '@/localization/fr/strings';
import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { EcolnaIcon } from '../icons/ecolna-icon';
import {
  a11y,
  colors,
  radius,
  shadows,
  spacing,
  subjectColors,
  type SubjectKey,
  type TypographyVariant,
} from '../tokens';
import { scaled, useResponsive } from '../responsive';
import { EcolnaCard } from './ecolna-card';
import { EcolnaGalet } from './ecolna-galet';

/** La discipline de la leçon en cours, fournie par l'écran de leçon. */
export const ExerciseSubjectContext = createContext<SubjectKey | null>(null);

/** Côte à côte, le stimulus prend la hauteur du bloc de réponses. */
const StimulusFillContext = createContext(false);

/**
 * L'air autour du bloc, au-dessus et au-dessous : presque le centre optique.
 * L'ancrage sous la consigne reste perceptible sans laisser un vide en bas.
 */
const AIR_ABOVE = 1;
const AIR_BELOW = 1.25;
/**
 * Le bloc vise cette part de la hauteur du corps — plafonné par `blockMax`,
 * jamais sous la feuille de retour.
 */
const BLOCK_SHARE = 0.7;
/** Dans la bande d'écoute (empilé), le disque se règle sur le bloc. */
const BAND_DISC_SHARE = 0.22;
/**
 * À côté des réponses, le pavé d'écoute est un peu plus étroit qu'une carte :
 * le disque et une marge d'air de chaque côté. Les réponses restent la vedette.
 */
const PANE_OVER_DISC = 1.42;
/**
 * Côte à côte, une rangée de réponses (et le pavé, qui prend sa hauteur) a la
 * silhouette d'une carte presque carrée, à peine plus haute que large — calée
 * sur trois réponses, le cas du programme. Jamais un bandeau couché.
 */
export const PANE_CARD_RATIO = 1.08;
/**
 * Empilé, une carte de grille (syllabe, nombre, forme) vise cette silhouette
 * dans la place mesurée : plus de bandeaux 2,4 : 1 sous la bande d'écoute.
 */
export const GRID_CARD_RATIO = 0.9;

/**
 * L'air entre le bas des réponses et la feuille de retour, en plus de la
 * morsure : la carte choisie ne touche jamais le bord de la feuille.
 */
const SHEET_AIR = spacing.xs;

/** L'écart entre les deux volets (stimulus et réponses). */
export function splitGapOf(splitPanes: boolean, scale: number): number {
  return scaled(splitPanes ? spacing.xxl : spacing.xl, scale);
}

/**
 * Ce que la feuille de retour (`FeedbackBanner`) recouvre du bas du corps, plus
 * un filet d'air de 8 : sur tablette, une rangée (rembourrage lg + portrait
 * 72, moins la marge basse lg du corps) ; au téléphone, le portrait 60 et le
 * bouton 60 s'empilent. L'écran garde déjà `spacing.md` sous son contenu
 * (`EcolnaScreen`). Une réponse ne passe jamais dessous.
 */
export function feedbackSheetBite(isTablet: boolean, scale: number): number {
  return scaled(isTablet ? 100 : 164, scale) - spacing.md;
}

/**
 * Ce que l'enfant regarde ou écoute (le stimulus) : une surface plate dans la
 * teinte de la discipline, sans filet ni ombre. Ce qu'il touche est blanc et
 * fileté — « regarder » et « toucher » ne se confondent jamais. Côte à côte,
 * elle s'étire à la hauteur des réponses : bords hauts et bas communs.
 */
export function EcolnaStimulus({
  children,
  padded = true,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string | undefined;
}) {
  const subject = useContext(ExerciseSubjectContext);
  const fill = useContext(StimulusFillContext);
  return (
    <EcolnaCard
      rounded="xl"
      padded={padded}
      backgroundColor={subject ? subjectColors[subject].tint : colors.fill}
      accessibilityLabel={accessibilityLabel}
      style={[style, fill && styles.grow]}
    >
      {children}
    </EcolnaCard>
  );
}

/**
 * Le disque « écouter » du pavé : celui d'`EcolnaAudioButton` (le disque
 * plein de la marque, son halo, l'onde qui s'élargit pendant le son — figée
 * en mouvement réduit), mais une simple image : c'est le pavé entier qui est
 * le bouton, et un bouton n'en contient pas un autre.
 */
function ListenDisc({ size, playing }: { size: number; playing: boolean }) {
  const reducedMotion = useReducedMotion();
  const [wave] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (playing && !reducedMotion) {
      wave.setValue(0);
      const loop = Animated.loop(
        Animated.timing(wave, { toValue: 1, duration: 1100, useNativeDriver: true }),
      );
      loop.start();
      return () => loop.stop();
    }
    wave.setValue(0);
    return undefined;
  }, [playing, wave, reducedMotion]);

  const round = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={styles.discWrap}>
      {playing && !reducedMotion ? (
        <Animated.View
          style={[
            styles.discRing,
            round,
            {
              opacity: wave.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] }),
              transform: [
                { scale: wave.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) },
              ],
            },
          ]}
        />
      ) : null}
      <View style={[styles.disc, shadows.glowBrand, round]}>
        <EcolnaIcon name="speaker" size={Math.round(size * 0.48)} color={colors.white} />
      </View>
    </View>
  );
}

/**
 * Le pavé d'écoute, quand le stimulus n'est qu'un son : l'aplat du stimulus
 * (sans filet — on y écoute, on n'y répond pas) dont toute la surface se
 * touche et s'enfonce comme un bouton. Le disque bleu reste le repère.
 */
function ListenPad({
  playing,
  onPress,
  disc,
  style,
}: {
  playing: boolean;
  onPress: () => void;
  disc: number;
  style?: StyleProp<ViewStyle>;
}) {
  const subject = useContext(ExerciseSubjectContext);
  return (
    <EcolnaGalet
      face={subject ? subjectColors[subject].tint : colors.fill}
      radius={radius.xl}
      onPress={onPress}
      accessibilityLabel={fr.common.listen}
      accessibilityHint={fr.common.listenHint}
      style={style}
      faceStyle={styles.pad}
      testID="exercise-listen-pad"
    >
      <ListenDisc size={disc} playing={playing} />
    </EcolnaGalet>
  );
}

/**
 * Les tailles communes à tous les exercices (direction v3 § 6) : une réponse
 * se vise sans viser. Sur tablette, ≥ 120 dp de haut et un glyphe de
 * 70 dp ; au téléphone, ≥ 72 dp. Un seul endroit, pour que les dix-huit
 * types d'exercice parlent la même langue.
 */
export interface ExerciseMetrics {
  /** Hauteur minimale d'une carte de réponse. */
  answerHeight: number;
  /** Largeur d'une carte-nombre ou d'une tuile de lettre. */
  tileWidth: number;
  /** Glyphe des réponses courtes (syllabes, nombres). */
  answerGlyph: TypographyVariant;
  /** Pictogramme dans une réponse en image. */
  objectSize: number;
  /** Le grand bouton « écouter » d'un exercice. */
  listenSize: number;
  /** Écart entre réponses. */
  gap: number;
  /**
   * La hauteur visée pour tout le bloc (stimulus et réponses) : ≈ 70 % du
   * corps mesuré, plafonnée par `blockMax` — le bloc ne passe jamais sous la
   * feuille de retour ; l'air restant se répartit au-dessus. 0 tant que le
   * corps n'est pas mesuré : les paliers ci-dessus suffisent.
   */
  block: number;
  /**
   * Le plafond du bloc, sur tout appareil dont le corps est mesuré : au-delà,
   * la feuille de retour recouvrirait les réponses. 0 tant qu'il ne l'est pas.
   */
  blockMax: number;
  /**
   * Écoute seule : la grammaire suit l'orientation, pas la taille de
   * l'appareil. Couché (deux volets), le pavé d'écoute se pose à côté des
   * réponses (`pane`) ; debout et au téléphone, une bande pleine largeur
   * au-dessus d'elles (`band`).
   */
  listenLayout: 'band' | 'pane';
  /**
   * Le pavé d'écoute a la même forme d'un exercice à l'autre : la hauteur de
   * la bande, ou la largeur du volet.
   */
  listenBand: number;
  /** Diamètre du disque dans le pavé d'écoute. */
  listenDisc: number;
  /** Côte à côte (`splitPanes`) : les réponses à côté du pavé tiennent sur une rangée. */
  wide: boolean;
  /** L'écart entre les deux volets (le pavé et les réponses). */
  splitGap: number;
  /** Largeur mesurée de la colonne de l'exercice (0 tant qu'elle ne l'est pas). */
  columnWidth: number;
  /**
   * À côté du pavé d'écoute, la hauteur de la rangée de réponses — donc du
   * pavé : une carte presque carrée (`PANE_CARD_RATIO`), la même d'un exercice
   * à l'autre, jamais au-delà du plafond. 0 empilé ou avant la mesure.
   */
  paneHeight: number;
  /** Mesure du corps : `EcolnaExerciseLayout` (prop `metrics`) ou `ExerciseAnchor` la branche. */
  onBodyLayout: (event: LayoutChangeEvent) => void;
}

/**
 * Les mesures d'un exercice, à appeler une fois par exercice. La hauteur réelle
 * du corps (sous la consigne) est mesurée par la mise en page que l'exercice
 * rend : elle ne dépend pas du contenu tant que celui-ci tient sous le
 * plafond (`blockMax`), si bien que la mesure ne boucle pas.
 */
export function useExerciseMetrics(): ExerciseMetrics {
  const { isTablet, scale, height, splitPanes } = useResponsive();
  const [body, setBody] = useState({ width: 0, height: 0 });
  // Une grande tablette (≥ 780 dp de haut) a la place de réponses plus
  // grandes : la largeur seule laissait l'exercice tassé au milieu du blanc.
  const roomy = isTablet && height >= 780;
  const listenSize = scaled(roomy ? 116 : isTablet ? 100 : 88, scale);
  const gap = scaled(isTablet ? spacing.lg : spacing.md, scale);
  const splitGap = splitGapOf(splitPanes, scale);
  const bite = feedbackSheetBite(isTablet, scale);

  const blockMax =
    body.height > 0 ? Math.max(0, body.height - bite - scaled(spacing.lg, scale)) : 0;
  // Le bas du bloc ne descend jamais sous la feuille : l'ancre garde la
  // morsure sous lui (`ExerciseAnchor`), la mise en page un filet d'air
  // (`SHEET_AIR`) ; l'air du dessus cède d'abord.
  const sheetAir = scaled(SHEET_AIR, scale);
  const block =
    body.height > 0
      ? Math.max(0, Math.min(Math.round(body.height * BLOCK_SHARE), blockMax - sheetAir))
      : 0;

  const listenLayout = splitPanes ? 'pane' : 'band';
  // Le disque du volet a une taille fixe, sous celle du bouton d'écoute : le
  // pavé reste plus étroit qu'une carte. Dans la bande, il se règle sur le
  // bloc : la place va aux réponses.
  const listenDisc =
    listenLayout === 'pane'
      ? Math.min(listenSize, scaled(92, scale))
      : block > 0
        ? Math.min(listenSize, Math.max(scaled(84, scale), Math.round(block * BAND_DISC_SHARE)))
        : listenSize;
  const listenBand =
    listenLayout === 'pane'
      ? Math.round(listenDisc * PANE_OVER_DISC)
      : listenDisc + 2 * scaled(spacing.sm, scale);
  // Trois réponses à côté du pavé : la largeur d'une case fixe la hauteur
  // de la rangée (et du pavé) pour tous les exercices d'écoute — sous le bloc
  // visé, un peu d'air restant sous la consigne d'une tablette basse (7").
  const paneCell =
    listenLayout === 'pane' && body.width > 0
      ? (body.width - listenBand - splitGap - 2 * gap) / 3
      : 0;
  const paneHeight =
    paneCell > 0
      ? Math.max(
          scaled(a11y.childTouchTarget + 8, scale),
          Math.min(
            block > 0 ? block - scaled(spacing.xs, scale) : Infinity,
            Math.round(paneCell * PANE_CARD_RATIO),
          ),
        )
      : 0;

  return {
    answerHeight: scaled(roomy ? 124 : isTablet ? 96 : 72, scale),
    tileWidth: scaled(roomy ? 148 : isTablet ? 120 : 88, scale),
    answerGlyph: isTablet ? 'displayGlyph' : 'displayGlyphSmall',
    objectSize: scaled(roomy ? 118 : isTablet ? 96 : 72, scale),
    listenSize,
    gap,
    block,
    blockMax,
    listenLayout,
    listenBand,
    listenDisc,
    wide: splitPanes,
    splitGap,
    columnWidth: body.width,
    paneHeight,
    onBodyLayout: (event: LayoutChangeEvent) => {
      const next = {
        width: Math.round(event.nativeEvent.layout.width),
        height: Math.round(event.nativeEvent.layout.height),
      };
      setBody((current) =>
        Math.abs(current.width - next.width) < 1 && Math.abs(current.height - next.height) < 1
          ? current
          : next,
      );
    },
  };
}

/**
 * La hauteur que les réponses peuvent prendre — sous la bande d'écoute quand
 * l'exercice n'est qu'une écoute : la hauteur visée (ou, `limit: 'max'`, le
 * plafond). 0 : inconnue, les paliers s'appliquent.
 */
export function answersRoom(
  metrics: Pick<ExerciseMetrics, 'block' | 'blockMax' | 'listenLayout' | 'listenBand' | 'gap'>,
  listenOnly: boolean,
  limit: 'target' | 'max' = 'target',
): number {
  // `block` (visé) est toujours sous `blockMax` (plafond).
  const total = limit === 'target' && metrics.block > 0 ? metrics.block : metrics.blockMax;
  if (total <= 0) {
    return 0;
  }
  const band = listenOnly && metrics.listenLayout === 'band' ? metrics.listenBand + metrics.gap : 0;
  return Math.max(0, total - band);
}

/**
 * La hauteur d'une carte de réponse dans `rows` rangées tenant dans `room`
 * (0 : pas de borne, la taille voulue). `grow` : les rangées prennent
 * exactement la place ; sinon, les cartes se resserrent seulement. Jamais
 * sous `min` (la cible tactile).
 */
export function fitAnswerHeight({
  preferred,
  room,
  rows,
  gap,
  grow = false,
  min,
}: {
  preferred: number;
  room: number;
  rows: number;
  gap: number;
  grow?: boolean;
  min: number;
}): number {
  if (!(room > 0)) {
    return preferred;
  }
  const perRow = Math.floor((room - gap * (Math.max(1, rows) - 1)) / Math.max(1, rows));
  return Math.max(min, grow ? perRow : Math.min(preferred, perRow));
}

/**
 * La largeur d'une case dans une rangée de `columns` réponses d'une écoute
 * seule : toute la colonne mesurée sous la bande, ce qui reste à côté du
 * pavé (`beside`). 0 tant que la colonne n'est pas mesurée.
 */
export function listenCellWidth(
  metrics: Pick<ExerciseMetrics, 'columnWidth' | 'listenBand' | 'splitGap' | 'gap'>,
  columns: number,
  beside: boolean,
): number {
  if (!(metrics.columnWidth > 0)) {
    return 0;
  }
  const count = Math.max(1, columns);
  const row = metrics.columnWidth - (beside ? metrics.listenBand + metrics.splitGap : 0);
  return Math.max(0, Math.floor((row - metrics.gap * (count - 1)) / count));
}

/**
 * La hauteur d'une carte de réponse d'une écoute seule (syllabes, nombres,
 * formes, scènes). À côté du pavé, sur une rangée : la hauteur commune du pavé
 * (`paneHeight`), presque carrée. Empilé : la silhouette `ratio` × largeur de
 * case (0 : la taille voulue seule), dans la place mesurée sous la bande —
 * jamais sous la feuille de retour, jamais sous `min`.
 */
export function listenAnswerHeight(
  metrics: Pick<
    ExerciseMetrics,
    | 'block'
    | 'blockMax'
    | 'listenLayout'
    | 'listenBand'
    | 'gap'
    | 'splitGap'
    | 'columnWidth'
    | 'paneHeight'
  >,
  {
    columns,
    rows,
    preferred,
    min,
    ratio = GRID_CARD_RATIO,
  }: { columns: number; rows: number; preferred: number; min: number; ratio?: number },
): number {
  const beside = metrics.listenLayout === 'pane';
  if (beside && rows === 1 && metrics.paneHeight > 0) {
    return metrics.paneHeight;
  }
  const cell = ratio > 0 ? listenCellWidth(metrics, columns, beside) : 0;
  return fitAnswerHeight({
    preferred: cell > 0 ? Math.max(preferred, Math.round(cell * ratio)) : preferred,
    room: answersRoom(metrics, true),
    rows,
    gap: metrics.gap,
    min,
  });
}

/**
 * Le contenu s'ancre près de la consigne : l'air se répartit 1:1,25 au-dessus
 * et au-dessous, et jamais assez peu dessous pour que la feuille de retour
 * recouvre les réponses — le bloc remonte alors juste ce qu'il faut. La
 * hauteur du corps est mesurée ici (`onLayout`).
 */
export function ExerciseAnchor({
  children,
  onLayout,
}: {
  children: ReactNode;
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
}) {
  const { isTablet, scale } = useResponsive();
  return (
    <View style={styles.anchored} onLayout={onLayout} testID="exercise-anchor">
      <View style={styles.above} />
      {children}
      <View style={[styles.below, { minHeight: feedbackSheetBite(isTablet, scale) }]} />
    </View>
  );
}

interface EcolnaExerciseLayoutProps {
  /** What the child looks at: question, board, scene. */
  prompt?: ReactNode | null;
  /** What the child touches to answer. */
  answers: ReactNode;
  /** Give the prompt more room than the answers (illustrations, boards). */
  promptWeight?: number;
  /**
   * Le stimulus n'est qu'un son : la mise en page pose elle-même le pavé
   * d'écoute, de la même forme d'un exercice à l'autre.
   */
  listen?: { playing: boolean; onPress: () => void } | undefined;
  /** Les mesures de l'exercice (`useExerciseMetrics`) : le corps est mesuré ici. */
  metrics?: ExerciseMetrics | undefined;
}

/**
 * The two halves of every exercise: the stimulus and the answers.
 *
 * Stacked on a phone, side by side on a tablet held in landscape. That split
 * is not cosmetic — stacked on a wide short window, the answer cards fall
 * below the fold and a six-year-old has to scroll to find them, which is
 * exactly the moment an exercise stops being about reading.
 *
 * Une écoute seule n'a pas d'image à montrer : couchée (deux volets), quelle
 * que soit la tablette, le pavé d'écoute se pose à côté des réponses, à la
 * hauteur de leur rangée ; debout et au téléphone, une bande pleine largeur
 * au-dessus d'elles. Une seule grammaire, réglée par l'orientation.
 */
export function EcolnaExerciseLayout({
  prompt = null,
  answers,
  promptWeight = 1,
  listen,
  metrics,
}: EcolnaExerciseLayoutProps) {
  const { splitPanes, scale } = useResponsive();
  const gap = splitGapOf(splitPanes, scale);
  const paneGap = scaled(spacing.md, scale);
  const onLayout = metrics?.onBodyLayout;
  // Le filet d'air au-dessus de la feuille de retour (voir `useExerciseMetrics`).
  const settle = { marginBottom: scaled(SHEET_AIR, scale) };

  if (listen) {
    const disc = metrics?.listenDisc ?? scaled(100, scale);
    const band = metrics?.listenBand ?? disc + 2 * scaled(spacing.sm, scale);
    const pad = (style: StyleProp<ViewStyle>) => (
      <ListenPad playing={listen.playing} onPress={listen.onPress} disc={disc} style={style} />
    );
    if (metrics?.listenLayout === 'pane') {
      return (
        <ExerciseAnchor onLayout={onLayout}>
          <View style={[styles.split, settle, { gap }]}>
            <View style={{ width: band }}>{pad(styles.grow)}</View>
            <View style={[styles.pane, { gap: paneGap }]}>{answers}</View>
          </View>
        </ExerciseAnchor>
      );
    }
    return (
      <ExerciseAnchor onLayout={onLayout}>
        <View style={[settle, { gap: metrics?.gap ?? paneGap }]}>
          {pad({ minHeight: band })}
          {answers}
        </View>
      </ExerciseAnchor>
    );
  }

  // Sans stimulus à montrer (la consigne suffit), les réponses se centrent :
  // un volet vide à gauche ferait croire qu'une image n'a pas chargé.
  if (!prompt) {
    return (
      <ExerciseAnchor onLayout={onLayout}>
        <View style={[styles.alone, settle]}>{answers}</View>
      </ExerciseAnchor>
    );
  }

  if (!splitPanes) {
    return (
      <ExerciseAnchor onLayout={onLayout}>
        <View style={[settle, { gap }]}>
          {prompt}
          {answers}
        </View>
      </ExerciseAnchor>
    );
  }

  return (
    <ExerciseAnchor onLayout={onLayout}>
      <View style={[styles.split, settle, { gap }]}>
        <View style={[styles.pane, { flex: promptWeight, gap: paneGap }]}>
          <StimulusFillContext.Provider value>{prompt}</StimulusFillContext.Provider>
        </View>
        <View style={[styles.pane, { gap: paneGap }]}>{answers}</View>
      </View>
    </ExerciseAnchor>
  );
}

const styles = StyleSheet.create({
  anchored: { flex: 1 },
  above: { flexGrow: AIR_ABOVE, flexBasis: 0 },
  below: { flexGrow: AIR_BELOW, flexBasis: 0 },
  alone: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  // Les deux volets prennent la hauteur du plus grand : bords communs.
  split: { flexDirection: 'row', alignItems: 'stretch' },
  pane: { flex: 1, justifyContent: 'center' },
  grow: { flexGrow: 1 },
  pad: { alignItems: 'center', justifyContent: 'center' },
  discWrap: { alignItems: 'center', justifyContent: 'center' },
  disc: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand },
  discRing: { position: 'absolute', borderWidth: 6, borderColor: colors.brandTintStrong },
});
