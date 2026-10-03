import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  worldsForLevel,
  type WorldSummary,
} from '@/features/curriculum/application/curriculum-catalog';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import type { Subject } from '@/content/schemas/curriculum-schema';
import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { JourneyPath, type JourneyPoint } from '@/design-system/components/journey-path';
import { NudgeRing } from '@/design-system/components/nudge-ring';
import { StarRow } from '@/design-system/components/star-row';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { SubjectArt } from '@/design-system/icons/subject-art';
import {
  EcolnaGalet,
  EcolnaIconButton,
  EcolnaProgressRing,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, shadows, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

type WorldNodeState = 'completed' | 'current' | 'locked';

interface LessonRow {
  id: string;
  title: string;
  done: boolean;
  stars: number;
}

interface WorldNode {
  world: WorldSummary;
  state: WorldNodeState;
  stars: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonId: string | null;
  /** La prochaine leçon est déjà entamée : « Continuer », comme l'accueil. */
  nextLessonStarted: boolean;
  lessons: LessonRow[];
}

const SUBJECT_LABELS: Record<Subject, string> = {
  language: fr.subjects.language,
  reading: fr.subjects.reading,
  writing: fr.subjects.writing,
  math: fr.subjects.math,
};

/** Hauteur du fondu qui termine une liste qui défile (avant mise à l'échelle). */
const FADE = 40;
/** Le fondu du bord haut, une fois la liste défilée : plus court, il ne voile que l'arête. */
const FADE_TOP = 20;

/** Étoiles moyennes d'un monde, arrondies, sur trois. */
function averageStars(node: WorldNode): number {
  if (node.completedLessons === 0) {
    return 0;
  }
  return Math.min(3, Math.max(1, Math.round(node.stars / node.completedLessons)));
}

/**
 * Le parcours (direction v4) : un fil net relie les mondes en courbes
 * tendues. Ce qui est fait est vert et coché ; le monde du jour porte
 * l'emblème de sa discipline, l'anneau de ses leçons faites et, sous son
 * nom, le bouton « Commencer » ; ce qui reste est fermé mais visible. Aucune fraction :
 * l'anneau et les étoiles disent où en est l'enfant. L'écran s'ouvre déjà
 * centré sur l'étape du jour.
 *
 * Couché, deux volets : à gauche le chemin, resserré (disques plus petits,
 * zigzag court, noms toujours à droite, sans sous-titre) pour montrer quatre
 * à cinq mondes ; à droite, le monde du jour ouvert comme un sommaire. Une
 * liste qui défile se termine toujours par un fondu, jamais par une rangée
 * tranchée net.
 */
export default function LevelMapScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const profile = useActiveProfile((state) => state.profile);
  const { isTablet, scale, screenPadding, splitPanes } = useResponsive();
  const [nodes, setNodes] = useState<WorldNode[]>([]);
  const [width, setWidth] = useState(0);
  const [explained, setExplained] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrolledFor = useRef<string | null>(null);
  // Où en est le chemin : sa hauteur visible et son défilement (pour amener
  // une explication au-dessus du fondu, et fondre le bord haut une fois défilé).
  const pathView = useRef({ offset: 0, height: 0 });
  const [pathScrolled, setPathScrolled] = useState(false);

  const subjectId = (subject ?? null) as Subject | null;

  const worlds = useMemo(() => {
    if (!profile) {
      return [];
    }
    const all = worldsForLevel(profile.level);
    return subjectId ? all.filter((world) => world.subject === subjectId) : all;
  }, [profile, subjectId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!profile) {
        return undefined;
      }
      void (async () => {
        const db = await getDatabase();
        const progress = createProgressRepository(db);
        const allProgress = await progress.findAllProgress(profile.id);
        const byLesson = new Map(allProgress.map((entry) => [entry.lessonId as string, entry]));

        let previousDone = true;
        const built: WorldNode[] = worlds.map((world) => {
          const lessons = world.lessons;
          const completed = lessons.filter(
            (lesson) => byLesson.get(lesson.id)?.status === 'completed',
          );
          const stars = completed.reduce(
            (sum, lesson) => sum + (byLesson.get(lesson.id)?.stars ?? 0),
            0,
          );
          const done = completed.length === lessons.length;
          const state: WorldNodeState = done ? 'completed' : previousDone ? 'current' : 'locked';
          previousDone = done;
          const nextLesson =
            lessons.find((lesson) => byLesson.get(lesson.id)?.status !== 'completed') ?? null;
          return {
            world,
            state,
            stars,
            totalLessons: lessons.length,
            completedLessons: completed.length,
            nextLessonId: nextLesson?.id ?? null,
            nextLessonStarted: nextLesson ? byLesson.get(nextLesson.id)?.status === 'in_progress' : false,
            lessons: lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              done: byLesson.get(lesson.id)?.status === 'completed',
              stars: byLesson.get(lesson.id)?.stars ?? 0,
            })),
          };
        });
        if (!cancelled) {
          setNodes(built);
          // Une explication d'hier n'a plus lieu d'être au retour sur la carte.
          setExplained(null);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile, worlds]),
  );

  // Géométrie du chemin : une étape tous les `step` dp, en zigzag doux.
  // Couché, le chemin partage l'écran avec le volet : tout se resserre.
  const node = scaled(splitPanes ? 68 : isTablet ? 92 : 80, scale);
  const ringStroke = scaled(splitPanes ? 6 : isTablet ? 7 : 6, scale);
  const ringGap = scaled(splitPanes ? 4 : 5, scale);
  const currentNode = Math.round(node * 1.12);
  const currentOuter = currentNode + 2 * (ringGap + ringStroke);
  const step = scaled(splitPanes ? 118 : isTablet ? 176 : 160, scale);
  const bubble = scaled(isTablet ? 48 : 44, scale);
  const top = Math.round(currentOuter / 2 + scaled(splitPanes ? spacing.md : spacing.xl, scale));
  // Couché : un zigzag court collé à la gouttière, chaque nom à droite de son
  // disque. Tablette debout : gauche, centre, droite, centre ; téléphone :
  // gauche, droite — le nom du côté libre.
  const amplitude = splitPanes
    ? scaled(28, scale)
    : isTablet
      ? Math.min(width * 0.2, scaled(190, scale))
      : width * 0.22;
  // Couché, les disques de gauche posent leur bord sur la gouttière (sous le
  // bouton retour) ; l'anneau du monde du jour, plus grand, déborde un peu.
  const axis = splitPanes ? screenPadding + node / 2 + amplitude : width / 2;
  const pattern = isTablet && !splitPanes ? [-1, 0, 1, 0] : [-1, 1];
  const points: JourneyPoint[] = useMemo(
    () =>
      nodes.map((_, index) => ({
        x: axis + (pattern[index % pattern.length] ?? 0) * amplitude,
        y: top + index * step,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, axis, amplitude, top, step, isTablet, splitPanes],
  );
  const fade = scaled(FADE, scale);
  const edgeFade = scaled(FADE_TOP, scale);
  // Sous la dernière étape : son nom, ses étoiles, puis le fondu.
  const contentHeight =
    top + Math.max(0, nodes.length - 1) * step + currentOuter / 2 + fade + scaled(spacing.xl, scale);
  const currentIndex = nodes.findIndex((entry) => entry.state === 'current');
  const reached = currentIndex === -1 ? nodes.length : currentIndex + 1;

  // Ouvrir la carte sur l'étape du jour, une seule fois par monde affiché.
  useEffect(() => {
    const target = points[currentIndex];
    const key = `${subjectId ?? 'all'}:${currentIndex}:${width}`;
    if (!target || width === 0 || scrolledFor.current === key) {
      return;
    }
    scrolledFor.current = key;
    // L'étape du jour au tiers haut, l'étape d'avant entière au-dessus :
    // l'enfant voit d'où il vient avant de voir où il va.
    scrollRef.current?.scrollTo({
      y: Math.max(0, target.y - step - currentOuter / 2 - scaled(spacing.md, scale)),
      animated: false,
    });
  }, [points, currentIndex, subjectId, width, scale, step, currentOuter]);

  if (!profile) {
    return null;
  }

  const onLayout = (event: LayoutChangeEvent) => {
    pathView.current.height = event.nativeEvent.layout.height;
    const next = Math.round(event.nativeEvent.layout.width);
    if (next !== width) {
      setWidth(next);
    }
  };

  const onPathScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    pathView.current.offset = offset;
    if (offset > 1 !== pathScrolled) {
      setPathScrolled(offset > 1);
    }
  };

  const open = (entry: WorldNode, index: number) => {
    if (entry.state === 'locked') {
      setExplained(entry.world.id);
      AccessibilityInfo.announceForAccessibility(fr.learn.lockedHint);
      // L'explication s'écrit sous le nom : on l'amène au-dessus du fondu.
      const point = points[index];
      const { offset, height } = pathView.current;
      if (point && height > 0) {
        const bottom = point.y + scaled(84, scale) + fade;
        if (bottom > offset + height) {
          scrollRef.current?.scrollTo({ y: bottom - height, animated: true });
        }
      }
      return;
    }
    // Un monde terminé se rejoue depuis sa première leçon.
    const lessonId = entry.nextLessonId ?? entry.world.lessons[0]?.id;
    if (lessonId) {
      router.push(`/(child)/lesson/${lessonId}`);
    }
  };

  const labelMax = scaled(isTablet ? 300 : 240, scale);
  const labelGap = scaled(splitPanes ? spacing.sm : spacing.md, scale);
  // Le bord droit d'une étiquette : la gouttière seule, ou, couché, le volet
  // voisin (l'écart entre les volets est déjà là).
  const labelEdge = splitPanes ? scaled(spacing.xs, scale) : screenPadding;
  const starSize = scaled(22, scale);

  return (
    <EcolnaScreen background="default">
      <View
        style={[
          styles.header,
          { paddingHorizontal: screenPadding, gap: scaled(spacing.md, scale) },
        ]}
      >
        <EcolnaIconButton icon="arrow-back" accessibilityLabel={fr.common.back} onPress={goBack} />
        {subjectId ? (
          <SubjectArt subject={subjectId} size={scaled(isTablet ? 52 : 44, scale)} />
        ) : null}
        <View style={styles.headerText}>
          <EcolnaText variant={isTablet ? 'headlineLg' : 'headlineMd'} numberOfLines={1}>
            {subjectId
              ? `${SUBJECT_LABELS[subjectId]} · ${profile.level}`
              : fr.learn.levelTitle(profile.level)}
          </EcolnaText>
          <EcolnaText variant="bodyMd" color={colors.textSecondary} numberOfLines={1}>
            {profile.level === 'CP1' ? fr.learn.cp1Motto : fr.learn.cp2Motto}
          </EcolnaText>
        </View>
      </View>

      <View
        style={
          splitPanes
            ? [styles.panes, { paddingRight: screenPadding, gap: scaled(spacing.lg, scale) }]
            : styles.flex
        }
      >
        <View style={styles.flex}>
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            onLayout={onLayout}
            onScroll={onPathScroll}
            scrollEventThrottle={32}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ height: contentHeight }}
          >
            {width > 0 && points.length > 0 ? (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <JourneyPath
                  width={width}
                  height={contentHeight}
                  points={points}
                  reached={reached}
                  traveled={colors.success}
                  thickness={scaled(isTablet ? 8 : 7, scale)}
                />
              </View>
            ) : null}

            {width > 0
              ? nodes.map((entry, index) => {
                  const point = points[index];
                  if (!point) {
                    return null;
                  }
                  const offset = pattern[index % pattern.length] ?? 0;
                  // L'étiquette va du côté où il y a de la place ; couché, toujours à droite.
                  const labelOnRight =
                    splitPanes || offset < 0 || (offset === 0 && index % 4 === 1);
                  const outer = entry.state === 'current' ? currentOuter : node;
                  // L'étiquette prend la place libre de son côté, sans déborder.
                  const room = labelOnRight
                    ? width - (point.x + outer / 2 + labelGap) - labelEdge
                    : point.x - outer / 2 - labelGap - screenPadding;
                  const labelWidth = Math.max(0, Math.min(labelMax, room));
                  const labelLeft = labelOnRight
                    ? point.x + outer / 2 + labelGap
                    : point.x - outer / 2 - labelGap - labelWidth;
                  const nodeSubject = subjectId ?? entry.world.subject;
                  const action = entry.nextLessonStarted ? fr.common.continue : fr.common.start;
                  const align = labelOnRight ? 'left' : 'right';
                  const showExplanation = explained === entry.world.id;
                  return (
                    <View
                      key={entry.world.id}
                      style={StyleSheet.absoluteFill}
                      pointerEvents="box-none"
                    >
                      <JourneyNode
                        entry={entry}
                        subject={nodeSubject}
                        size={entry.state === 'current' ? currentNode : node}
                        ring={{ gap: ringGap, stroke: ringStroke }}
                        style={{
                          position: 'absolute',
                          left: point.x - outer / 2,
                          top: point.y - outer / 2,
                        }}
                        onPress={() => open(entry, index)}
                      />
                      <View
                        pointerEvents="box-none"
                        style={[
                          styles.label,
                          { left: labelLeft, width: labelWidth },
                          splitPanes
                            ? // Couché : le nom (et ses étoiles) centré sur son disque.
                              {
                                top: point.y - outer / 2,
                                minHeight: outer,
                                justifyContent: 'center',
                                gap: scaled(spacing.xxs, scale),
                              }
                            : {
                                top:
                                  point.y -
                                  scaled(isTablet ? 30 : 28, scale) -
                                  (entry.state === 'current' ? bubble / 2 : 0),
                              },
                          { alignItems: labelOnRight ? 'flex-start' : 'flex-end' },
                        ]}
                      >
                        <EcolnaText
                          variant="headlineSm"
                          align={align}
                          color={colors.textPrimary}
                          numberOfLines={2}
                        >
                          {entry.world.title}
                        </EcolnaText>
                        {showExplanation ? (
                          <EcolnaText
                            variant={splitPanes ? 'bodyMd' : 'bodyLg'}
                            color={colors.brandInk}
                            align={align}
                            numberOfLines={3}
                            accessibilityLiveRegion="polite"
                          >
                            {fr.learn.lockedHint}
                          </EcolnaText>
                        ) : splitPanes ? null : (
                          // Debout, le sous-titre ; couché, le volet le porte.
                          <EcolnaText
                            variant="bodySm"
                            color={colors.textSecondary}
                            align={align}
                            numberOfLines={2}
                          >
                            {entry.world.subtitle}
                          </EcolnaText>
                        )}
                        {entry.state === 'completed' ? (
                          <View style={splitPanes ? undefined : { marginTop: scaled(spacing.xxs, scale) }}>
                            <StarRow
                              earned={averageStars(entry)}
                              size={starSize}
                              gap={scaled(spacing.xxs, scale)}
                              flat
                            />
                          </View>
                        ) : null}
                        {/* Couché, l'action vit dans le volet : une seule action soleil par écran. */}
                        {entry.state === 'current' && !splitPanes ? (
                          <StartButton
                            label={action}
                            height={bubble}
                            onPress={() => open(entry, index)}
                            accessibilityLabel={`${action} : ${entry.world.title}`}
                          />
                        ) : null}
                      </View>
                    </View>
                  );
                })
              : null}
          </ScrollView>
          {pathScrolled ? (
            <ScrollFade id="ecolna-fade-path-top" edge="top" color={colors.background} height={edgeFade} />
          ) : null}
          <ScrollFade id="ecolna-fade-path" edge="bottom" color={colors.background} height={fade} />
        </View>
        {splitPanes && currentIndex >= 0 && nodes[currentIndex] ? (
          <WorldPanel
            key={nodes[currentIndex].world.id}
            entry={nodes[currentIndex]}
            subject={subjectId ?? nodes[currentIndex].world.subject}
            onOpen={(lessonId) => router.push(`/(child)/lesson/${lessonId}`)}
          />
        ) : null}
      </View>
    </EcolnaScreen>
  );
}

/**
 * Le bord d'une liste qui défile : un fondu vers le fond, posé sur la liste.
 * Ce qui continue plus bas (ou a défilé plus haut) s'efface au lieu d'être
 * tranché net.
 */
function ScrollFade({
  id,
  edge,
  color,
  height,
}: {
  id: string;
  edge: 'top' | 'bottom';
  color: string;
  height: number;
}) {
  const bottom = edge === 'bottom';
  return (
    <View pointerEvents="none" style={[styles.fade, bottom ? styles.fadeBottom : styles.fadeTop, { height }]}>
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id={id} x1="0" y1={bottom ? '0' : '1'} x2="0" y2={bottom ? '1' : '0'}>
            <Stop offset="0" stopColor={color} stopOpacity={0} />
            <Stop offset="0.55" stopColor={color} stopOpacity={0.72} />
            <Stop offset="1" stopColor={color} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height={height} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * L'action du monde du jour, sous son nom : une pilule soleil. Elle respire
 * doucement pour attirer l'œil — immobile si le système demande moins de
 * mouvement.
 */
function StartButton({
  label,
  height,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  height: number;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { scale } = useResponsive();
  const reducedMotion = useReducedMotion();
  const [breath] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reducedMotion) {
      breath.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath, reducedMotion]);
  const scaleValue = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  return (
    <Animated.View
      style={[{ marginTop: scaled(spacing.sm, scale), transform: [{ scale: scaleValue }] }]}
    >
      <EcolnaGalet
        face={colors.reward}
        radius={radius.pill}
        shadow={shadows.glowReward}
        haptic="light"
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        faceStyle={[styles.startFace, { height, paddingHorizontal: scaled(spacing.lg, scale) }]}
      >
        <EcolnaIcon name="play" size={scaled(18, scale)} color={colors.onReward} filled />
        <EcolnaText variant="buttonSm" color={colors.onReward}>
          {label}
        </EcolnaText>
      </EcolnaGalet>
    </Animated.View>
  );
}

/**
 * La pilule soleil de la leçon du jour, dans le volet. Remontée (par `key`)
 * à chaque appui sur une leçon à venir, elle se balance un instant sous
 * l'anneau qui pulse : « c'est par ici ». Immobile en mouvement réduit —
 * l'anneau, lui, reste allumé deux secondes.
 */
function NextPill({
  label,
  nudged,
  height,
}: {
  label: string;
  nudged: boolean;
  height: number;
}) {
  const { scale } = useResponsive();
  const reducedMotion = useReducedMotion();
  const [swing] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!nudged || reducedMotion) {
      return undefined;
    }
    const sway = Animated.sequence(
      [1, -1, 0.6, -0.4, 0].map((toValue) =>
        Animated.timing(swing, {
          toValue,
          duration: 110,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ),
    );
    sway.start();
    return () => sway.stop();
  }, [nudged, reducedMotion, swing]);
  const rotate = swing.interpolate({ inputRange: [-1, 1], outputRange: ['-5deg', '5deg'] });
  return (
    <NudgeRing
      active={nudged}
      radius={height / 2}
      announcement={fr.learn.lessonLockedHint}
      style={styles.selfStart}
    >
      <Animated.View
        style={[
          styles.nextPill,
          shadows.glowReward,
          {
            height,
            paddingHorizontal: scaled(spacing.md, scale),
            transform: [{ rotate }],
          },
        ]}
      >
        <EcolnaIcon name="play" size={scaled(16, scale)} color={colors.onReward} filled />
        <EcolnaText variant="buttonSm" color={colors.onReward}>
          {label}
        </EcolnaText>
      </Animated.View>
    </NudgeRing>
  );
}

/**
 * Couché, le second volet : le monde du jour ouvert comme un sommaire. Son
 * emblème dans l'anneau de ses leçons, son nom, puis chaque leçon — faite
 * (coche verte, étoiles), la prochaine (son titre entier, la pilule soleil
 * dessous), les suivantes (fermées, la même grammaire que les mondes fermés).
 * Toucher une leçon à venir n'est jamais un appui mort : la pilule du jour se
 * balance pour montrer où commencer.
 */
function WorldPanel({
  entry,
  subject,
  onOpen,
}: {
  entry: WorldNode;
  subject: Subject;
  onOpen: (lessonId: string) => void;
}) {
  const { scale } = useResponsive();
  const family = subjectColors[subject];
  const action = entry.nextLessonStarted ? fr.common.continue : fr.common.start;
  const disc = scaled(36, scale);
  const fade = scaled(FADE, scale);
  const edgeFade = scaled(FADE_TOP, scale);
  const pill = scaled(40, scale);
  const [listScrolled, setListScrolled] = useState(false);
  // Combien de fois l'enfant a touché une leçon à venir : chaque appui
  // remonte la pilule du jour, qui se balance de nouveau.
  const [nudges, setNudges] = useState(0);
  const listRef = useRef<ScrollView>(null);
  const rowTops = useRef<number[]>([]);
  const nextBox = useRef<{ y: number; height: number } | null>(null);
  const viewport = useRef({ offset: 0, height: 0 });
  const opened = useRef(false);
  const nextIndex = entry.lessons.findIndex((lesson) => lesson.id === entry.nextLessonId);

  const showNext = (animated: boolean) => {
    const box = nextBox.current;
    if (!box) {
      return;
    }
    const { offset, height } = viewport.current;
    if (box.y >= offset && box.y + box.height <= offset + height - fade) {
      return;
    }
    // La leçon d'avant reste visible au-dessus : d'où l'on vient, où l'on va.
    const previous = nextIndex > 0 ? rowTops.current[nextIndex - 1] : undefined;
    listRef.current?.scrollTo({ y: Math.max(0, previous ?? box.y), animated });
  };

  const nudge = () => {
    setNudges((count) => count + 1);
    showNext(true);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    viewport.current.offset = offset;
    if (offset > 1 !== listScrolled) {
      setListScrolled(offset > 1);
    }
  };

  return (
    <View
      style={[
        styles.panel,
        shadows.card,
        { padding: scaled(spacing.lg, scale), gap: scaled(spacing.md, scale) },
      ]}
    >
      <View style={[styles.panelHead, { gap: scaled(spacing.md, scale) }]}>
        <EcolnaProgressRing
          progress={entry.completedLessons / Math.max(1, entry.totalLessons)}
          size={scaled(64, scale)}
          stroke={scaled(5, scale)}
          color={family.solid}
          track={family.tintStrong}
        >
          <SubjectArt subject={subject} size={scaled(44, scale)} />
        </EcolnaProgressRing>
        <View style={styles.headerText}>
          <EcolnaText variant="tag" color={family.ink}>
            {fr.learn.worldLessons}
          </EcolnaText>
          <EcolnaText variant="headlineMd" numberOfLines={2}>
            {entry.world.title}
          </EcolnaText>
        </View>
      </View>
      <View style={styles.flex}>
        <ScrollView
          ref={listRef}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          onLayout={(event) => {
            viewport.current.height = event.nativeEvent.layout.height;
            if (!opened.current && nextBox.current) {
              opened.current = true;
              showNext(false);
            }
          }}
          contentContainerStyle={{ gap: scaled(spacing.xs, scale), paddingBottom: fade }}
        >
          {entry.lessons.map((lesson, index) => {
            const next = lesson.id === entry.nextLessonId;
            const upcoming = !lesson.done && !next;
            const discView = (
              <View
                style={[
                  styles.lessonDisc,
                  {
                    width: disc,
                    height: disc,
                    borderRadius: disc / 2,
                    backgroundColor: lesson.done
                      ? colors.success
                      : next
                        ? family.solid
                        : colors.white,
                    // À venir : la grammaire du monde fermé — disque blanc,
                    // anneau de la discipline, cadenas à son encre.
                    borderWidth: upcoming ? scaled(3, scale) : 0,
                    borderColor: family.tintStrong,
                  },
                ]}
              >
                {lesson.done ? (
                  <EcolnaIcon name="check" size={Math.round(disc * 0.56)} color={colors.white} />
                ) : next ? (
                  <EcolnaText variant="labelLg" color={colors.white}>
                    {String(index + 1)}
                  </EcolnaText>
                ) : (
                  <EcolnaIcon name="lock" size={Math.round(disc * 0.42)} color={family.ink} filled />
                )}
              </View>
            );
            return (
              <View
                key={lesson.id}
                onLayout={(event) => {
                  const { y, height } = event.nativeEvent.layout;
                  rowTops.current[index] = y;
                  if (next) {
                    nextBox.current = { y, height };
                    if (!opened.current && viewport.current.height > 0) {
                      opened.current = true;
                      showNext(false);
                    }
                  }
                }}
              >
                <EcolnaGalet
                  face={next ? family.tint : colors.white}
                  radius={radius.lg}
                  // Faite : se rejoue ; la prochaine : s'ouvre ; à venir : montre la prochaine.
                  haptic="selection"
                  onPress={upcoming ? nudge : () => onOpen(lesson.id)}
                  accessibilityLabel={
                    next
                      ? `${action} : ${lesson.title}`
                      : upcoming
                        ? `${lesson.title}, ${fr.a11y.locked}`
                        : lesson.title
                  }
                  accessibilityHint={upcoming ? fr.learn.lockedA11yHint : undefined}
                  faceStyle={[
                    styles.lessonRow,
                    {
                      gap: scaled(spacing.sm, scale),
                      minHeight: scaled(56, scale),
                      paddingHorizontal: scaled(spacing.sm, scale),
                      paddingVertical: scaled(next ? spacing.sm : spacing.xs, scale),
                    },
                  ]}
                >
                  {discView}
                  <View style={[styles.headerText, next && { gap: scaled(spacing.xs, scale) }]}>
                    <EcolnaText
                      variant="labelLg"
                      numberOfLines={2}
                      color={upcoming ? colors.inkSecondary : colors.ink}
                    >
                      {lesson.title}
                    </EcolnaText>
                    {lesson.done ? (
                      <View style={styles.selfStart}>
                        <StarRow
                          earned={lesson.stars}
                          size={scaled(18, scale)}
                          gap={scaled(2, scale)}
                          flat
                        />
                      </View>
                    ) : null}
                    {next ? <NextPill key={nudges} label={action} nudged={nudges > 0} height={pill} /> : null}
                  </View>
                </EcolnaGalet>
              </View>
            );
          })}
        </ScrollView>
        {listScrolled ? (
          <ScrollFade id="ecolna-fade-panel-top" edge="top" color={colors.white} height={edgeFade} />
        ) : null}
        <ScrollFade id="ecolna-fade-panel" edge="bottom" color={colors.white} height={fade} />
      </View>
    </View>
  );
}

/**
 * Une étape du chemin : un disque plat. Fait : vert, la coche blanche (ses
 * étoiles vont sous son nom). En cours : l'emblème blanc sur la couleur de la
 * discipline, plus grand, cerclé de l'anneau des leçons faites. Fermé : un
 * disque blanc cerclé de l'anneau de sa discipline, un grand cadenas à son
 * encre — visible, contrasté, jamais un gris.
 */
function JourneyNode({
  entry,
  subject,
  size,
  ring,
  style,
  onPress,
}: {
  entry: WorldNode;
  subject: Subject;
  size: number;
  ring: { gap: number; stroke: number };
  style: object;
  onPress: () => void;
}) {
  const { scale } = useResponsive();
  const family = subjectColors[subject];
  const current = entry.state === 'current';
  const locked = entry.state === 'locked';
  const a11y = `${entry.world.title} : ${entry.world.subtitle}${locked ? `. ${fr.learn.lockedHint}` : ''}`;
  const disc = (
    <EcolnaGalet
      face={entry.state === 'completed' ? colors.success : current ? family.solid : colors.white}
      border={locked ? family.tintStrong : undefined}
      borderWidth={scaled(4, scale)}
      radius={size / 2}
      shadow={current ? shadows.raised : entry.state === 'completed' ? shadows.card : shadows.none}
      // Fermé : un retour discret, la phrase s'affiche à côté.
      haptic={locked ? 'selection' : 'light'}
      onPress={onPress}
      accessibilityLabel={a11y}
      accessibilityHint={locked ? fr.learn.lockedA11yHint : undefined}
      faceStyle={[styles.nodeFace, { width: size, height: size }]}
    >
      {entry.state === 'completed' ? (
        <EcolnaIcon name="check" size={Math.round(size * 0.46)} color={colors.white} />
      ) : current ? (
        <SubjectArt subject={subject} size={Math.round(size * 0.74)} variant="glyph" />
      ) : (
        // Fermé, mais déjà de sa discipline : l'enfant sait ce qui l'attend.
        <EcolnaIcon name="lock" size={Math.round(size * 0.4)} color={family.ink} filled />
      )}
    </EcolnaGalet>
  );
  if (current) {
    const outer = size + 2 * (ring.gap + ring.stroke);
    return (
      <View style={[style, { width: outer, height: outer }]}>
        {/* Un disque de toile sous l'anneau : le fil s'arrête à son bord. */}
        <View style={[styles.ringBed, { width: outer, height: outer, borderRadius: outer / 2 }]} />
        <EcolnaProgressRing
          progress={entry.completedLessons / Math.max(1, entry.totalLessons)}
          size={outer}
          stroke={ring.stroke}
          color={family.solid}
          track={family.tintStrong}
          accessibilityLabel={fr.a11y.progress(
            entry.world.title,
            entry.completedLessons,
            entry.totalLessons,
          )}
        >
          {disc}
        </EcolnaProgressRing>
      </View>
    );
  }
  return <View style={style}>{disc}</View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  headerText: { flex: 1, gap: 2 },
  startFace: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { position: 'absolute', gap: 2 },
  nodeFace: { alignItems: 'center', justifyContent: 'center' },
  ringBed: { position: 'absolute', backgroundColor: colors.background },
  flex: { flex: 1 },
  fade: { position: 'absolute', left: 0, right: 0 },
  fadeBottom: { bottom: 0 },
  fadeTop: { top: 0 },
  panes: { flex: 1, flexDirection: 'row', paddingBottom: spacing.md },
  panel: {
    flex: 0.72,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    marginTop: spacing.sm,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center' },
  lessonRow: { flexDirection: 'row', alignItems: 'center' },
  lessonDisc: { alignItems: 'center', justifyContent: 'center' },
  selfStart: { alignSelf: 'flex-start' },
  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.reward,
  },
});
