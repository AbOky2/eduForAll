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
/** Sur grande tablette, le bloc vise cette part de la hauteur du corps. */
const BLOCK_SHARE = 0.6;

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
   * La hauteur visée pour tout le bloc (stimulus et réponses) : ≈ 60 % du
   * corps mesuré sur grande tablette, l'air restant réparti 1:1,25 au-dessus
   * de la feuille de retour. 0 ailleurs, ou tant que le corps n'est pas
   * mesuré : les paliers ci-dessus suffisent.
   */
  block: number;
  /**
   * Le plafond du bloc, sur tout appareil dont le corps est mesuré : au-delà,
   * la feuille de retour recouvrirait les réponses. 0 tant qu'il ne l'est pas.
   */
  blockMax: number;
  /**
   * Écoute seule : une bande pleine largeur au-dessus des réponses (`band`),
   * ou un volet à côté d'elles (`pane`, tablette 7" couchée, trop basse).
   */
  listenLayout: 'band' | 'pane';
  /**
   * Le pavé d'écoute a la même forme d'un exercice à l'autre : la hauteur de
   * la bande, ou la largeur du volet.
   */
  listenBand: number;
  /** Diamètre du disque dans le pavé d'écoute. */
  listenDisc: number;
  /** Côte à côte (`splitPanes`) : les réponses sous la bande tiennent sur une rangée. */
  wide: boolean;
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
  const [bodyHeight, setBodyHeight] = useState(0);
  // Une grande tablette (≥ 780 dp de haut) a la place de réponses plus
  // grandes : la largeur seule laissait l'exercice tassé au milieu du blanc.
  const roomy = isTablet && height >= 780;
  const listenSize = scaled(roomy ? 116 : isTablet ? 100 : 88, scale);
  const bite = feedbackSheetBite(isTablet, scale);

  const blockMax = bodyHeight > 0 ? Math.max(0, bodyHeight - bite - scaled(spacing.lg, scale)) : 0;
  // Le bas du bloc tombe à (corps − bloc) × 1/2,25 + bloc : il reste au-dessus
  // de la feuille tant que bloc ≤ corps − 2,25/1,25 × morsure.
  const block =
    roomy && bodyHeight > 0
      ? Math.max(
          0,
          Math.round(
            Math.min(
              bodyHeight * BLOCK_SHARE,
              bodyHeight - ((AIR_ABOVE + AIR_BELOW) / AIR_BELOW) * bite,
            ),
          ),
        )
      : 0;

  const listenLayout = splitPanes && !roomy ? 'pane' : 'band';
  // Dans la bande, le disque se règle sur le bloc : la place va aux réponses.
  const listenDisc =
    block > 0
      ? Math.min(listenSize, Math.max(scaled(84, scale), Math.round(block * 0.28)))
      : listenSize;
  const listenBand =
    listenLayout === 'pane'
      ? Math.round(listenSize * 1.8)
      : listenDisc + 2 * scaled(spacing.sm, scale);

  return {
    answerHeight: scaled(roomy ? 124 : isTablet ? 96 : 72, scale),
    tileWidth: scaled(roomy ? 148 : isTablet ? 120 : 88, scale),
    answerGlyph: isTablet ? 'displayGlyph' : 'displayGlyphSmall',
    objectSize: scaled(roomy ? 118 : isTablet ? 96 : 72, scale),
    listenSize,
    gap: scaled(isTablet ? spacing.lg : spacing.md, scale),
    block,
    blockMax,
    listenLayout,
    listenBand,
    listenDisc,
    wide: splitPanes,
    onBodyLayout: (event: LayoutChangeEvent) => {
      const next = Math.round(event.nativeEvent.layout.height);
      setBodyHeight((current) => (Math.abs(current - next) < 1 ? current : next));
    },
  };
}

/**
 * La hauteur que les réponses peuvent prendre — sous la bande d'écoute quand
 * l'exercice n'est qu'une écoute : la hauteur visée sur grande tablette,
 * ailleurs (ou `limit: 'max'`) le plafond. 0 : inconnue, les paliers
 * s'appliquent.
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
 * (0 : pas de borne, la taille voulue). `grow` : une rangée unique sous la
 * bande d'écoute prend exactement la place ; sinon, les cartes se resserrent
 * seulement. Jamais sous `min` (la cible tactile).
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
 * Une écoute seule n'a pas de volet : sur grande tablette et partout où l'on
 * empile, une bande d'écoute pleine largeur au-dessus de réponses qui
 * prennent toute la colonne ; sur une tablette 7" couchée, un volet étroit de
 * largeur fixe à côté d'elles.
 */
export function EcolnaExerciseLayout({
  prompt = null,
  answers,
  promptWeight = 1,
  listen,
  metrics,
}: EcolnaExerciseLayoutProps) {
  const { splitPanes, scale } = useResponsive();
  const gap = scaled(splitPanes ? spacing.xxl : spacing.xl, scale);
  const paneGap = scaled(spacing.md, scale);
  const onLayout = metrics?.onBodyLayout;

  if (listen) {
    const disc = metrics?.listenDisc ?? scaled(100, scale);
    const band = metrics?.listenBand ?? disc + 2 * scaled(spacing.sm, scale);
    const pad = (style: StyleProp<ViewStyle>) => (
      <ListenPad playing={listen.playing} onPress={listen.onPress} disc={disc} style={style} />
    );
    if (metrics?.listenLayout === 'pane') {
      return (
        <ExerciseAnchor onLayout={onLayout}>
          <View style={[styles.split, { gap }]}>
            <View style={{ width: band }}>{pad(styles.grow)}</View>
            <View style={[styles.pane, { gap: paneGap }]}>{answers}</View>
          </View>
        </ExerciseAnchor>
      );
    }
    return (
      <ExerciseAnchor onLayout={onLayout}>
        <View style={{ gap: metrics?.gap ?? paneGap }}>
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
        <View style={styles.alone}>{answers}</View>
      </ExerciseAnchor>
    );
  }

  if (!splitPanes) {
    return (
      <ExerciseAnchor onLayout={onLayout}>
        <View style={{ gap }}>
          {prompt}
          {answers}
        </View>
      </ExerciseAnchor>
    );
  }

  return (
    <ExerciseAnchor onLayout={onLayout}>
      <View style={[styles.split, { gap }]}>
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
