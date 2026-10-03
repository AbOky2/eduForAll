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
} from 'react-native';

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
  const node = scaled(isTablet ? 92 : 80, scale);
  const ringStroke = scaled(isTablet ? 7 : 6, scale);
  const ringGap = scaled(5, scale);
  const currentNode = Math.round(node * 1.12);
  const currentOuter = currentNode + 2 * (ringGap + ringStroke);
  const step = scaled(isTablet ? 176 : 160, scale);
  const bubble = scaled(isTablet ? 48 : 44, scale);
  const top = Math.round(currentOuter / 2 + scaled(spacing.xl, scale));
  // Couché, le volet du monde prend la droite : le chemin zigzague en deux
  // temps, chaque étiquette du côté libre. Tablette debout : gauche, centre,
  // droite, centre ; téléphone : gauche, droite.
  const amplitude = splitPanes
    ? width * 0.24
    : isTablet
      ? Math.min(width * 0.2, scaled(190, scale))
      : width * 0.22;
  const pattern = isTablet && !splitPanes ? [-1, 0, 1, 0] : [-1, 1];
  const points: JourneyPoint[] = useMemo(
    () =>
      nodes.map((_, index) => ({
        x: width / 2 + (pattern[index % pattern.length] ?? 0) * amplitude,
        y: top + index * step,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, width, amplitude, top, step, isTablet, splitPanes],
  );
  const contentHeight = top + Math.max(0, nodes.length - 1) * step + scaled(140, scale);
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
      y: Math.max(0, target.y - step - scaled(110, scale)),
      animated: false,
    });
  }, [points, currentIndex, subjectId, width, scale, step]);

  if (!profile) {
    return null;
  }

  const onLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next !== width) {
      setWidth(next);
    }
  };

  const open = (entry: WorldNode) => {
    if (entry.state === 'locked') {
      setExplained(entry.world.id);
      AccessibilityInfo.announceForAccessibility(fr.learn.lockedHint);
      return;
    }
    // Un monde terminé se rejoue depuis sa première leçon.
    const lessonId = entry.nextLessonId ?? entry.world.lessons[0]?.id;
    if (lessonId) {
      router.push(`/(child)/lesson/${lessonId}`);
    }
  };

  const labelMax = scaled(isTablet ? 300 : 240, scale);
  const labelGap = scaled(spacing.md, scale);

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
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          onLayout={onLayout}
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
                // L'étiquette va du côté où il y a de la place.
                const labelOnRight = offset < 0 || (offset === 0 && index % 4 === 1);
                const outer = entry.state === 'current' ? currentOuter : node;
                // L'étiquette prend la place libre de son côté, sans déborder de l'écran.
                const room = labelOnRight
                  ? width - (point.x + outer / 2 + labelGap) - screenPadding
                  : point.x - outer / 2 - labelGap - screenPadding;
                const labelWidth = Math.max(0, Math.min(labelMax, room));
                const labelLeft = labelOnRight
                  ? point.x + outer / 2 + labelGap
                  : point.x - outer / 2 - labelGap - labelWidth;
                const nodeSubject = subjectId ?? entry.world.subject;
                const action = entry.nextLessonStarted ? fr.common.continue : fr.common.start;
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
                      onPress={() => open(entry)}
                    />
                    <View
                      style={[
                        styles.label,
                        {
                          left: labelLeft,
                          width: labelWidth,
                          top:
                            point.y -
                            scaled(isTablet ? 30 : 28, scale) -
                            (entry.state === 'current' ? bubble / 2 : 0),
                          alignItems: labelOnRight ? 'flex-start' : 'flex-end',
                        },
                      ]}
                    >
                      <EcolnaText
                        variant="headlineSm"
                        align={labelOnRight ? 'left' : 'right'}
                        color={colors.textPrimary}
                        numberOfLines={2}
                      >
                        {entry.world.title}
                      </EcolnaText>
                      {explained === entry.world.id ? (
                        <EcolnaText
                          variant="bodyLg"
                          color={colors.brandInk}
                          align={labelOnRight ? 'left' : 'right'}
                          numberOfLines={3}
                          accessibilityLiveRegion="polite"
                        >
                          {fr.learn.lockedHint}
                        </EcolnaText>
                      ) : (
                        <EcolnaText
                          variant="bodySm"
                          color={colors.textSecondary}
                          align={labelOnRight ? 'left' : 'right'}
                          numberOfLines={2}
                        >
                          {entry.world.subtitle}
                        </EcolnaText>
                      )}
                      {entry.state === 'completed' ? (
                        <StarLine stars={averageStars(entry)} />
                      ) : null}
                      {/* Couché, l'action vit dans le volet : une seule action soleil par écran. */}
                      {entry.state === 'current' && !splitPanes ? (
                        <StartButton
                          label={action}
                          height={bubble}
                          onPress={() => open(entry)}
                          accessibilityLabel={`${action} : ${entry.world.title}`}
                        />
                      ) : null}
                    </View>
                  </View>
                );
              })
            : null}
        </ScrollView>
        {splitPanes && currentIndex >= 0 && nodes[currentIndex] ? (
          <WorldPanel
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

/** Les étoiles d'un monde fini, sous son nom : pleines au soleil, vides en gris. */
function StarLine({ stars }: { stars: number }) {
  const { scale } = useResponsive();
  return (
    <View
      style={[styles.stars, { marginTop: scaled(spacing.xxs, scale) }]}
      accessibilityLabel={fr.a11y.stars(stars, 3)}
    >
      {[0, 1, 2].map((index) => (
        <EcolnaIcon
          key={index}
          name="star"
          filled
          size={scaled(18, scale)}
          color={index < stars ? colors.reward : colors.fillStrong}
        />
      ))}
    </View>
  );
}

/**
 * Couché, le second volet : le monde du jour ouvert comme un sommaire. Son
 * emblème dans l'anneau de ses leçons, son nom, puis chaque leçon — faite
 * (coche verte, étoiles), la prochaine (bouton soleil), les suivantes
 * (leur numéro, simplement). L'enfant voit ce que contient le monde avant d'y
 * entrer.
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: scaled(spacing.xs, scale) }}
      >
        {entry.lessons.map((lesson, index) => {
          const next = lesson.id === entry.nextLessonId;
          const row = (
            <View
              style={[
                styles.lessonRow,
                { gap: scaled(spacing.sm, scale), minHeight: scaled(56, scale) },
              ]}
            >
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
                    // À venir : la grammaire du monde fermé, jamais un gris.
                    borderWidth: lesson.done || next ? 0 : 2,
                    borderColor: family.tintStrong,
                  },
                ]}
              >
                {lesson.done ? (
                  <EcolnaIcon name="check" size={Math.round(disc * 0.56)} color={colors.white} />
                ) : (
                  <EcolnaText variant="labelLg" color={next ? colors.white : family.ink}>
                    {String(index + 1)}
                  </EcolnaText>
                )}
              </View>
              <View style={styles.headerText}>
                <EcolnaText
                  variant="labelLg"
                  numberOfLines={2}
                  color={colors.ink}
                >
                  {lesson.title}
                </EcolnaText>
                {lesson.done ? (
                  <View style={styles.rowStars}>
                    {[0, 1, 2].map((star) => (
                      <EcolnaIcon
                        key={star}
                        name="star"
                        filled
                        size={scaled(14, scale)}
                        color={star < lesson.stars ? colors.reward : colors.fillStrong}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
              {next ? (
                <View
                  style={[
                    styles.nextPill,
                    shadows.glowReward,
                    { height: scaled(40, scale), paddingHorizontal: scaled(spacing.md, scale) },
                  ]}
                >
                  <EcolnaIcon name="play" size={scaled(16, scale)} color={colors.onReward} filled />
                  <EcolnaText variant="buttonSm" color={colors.onReward}>
                    {action}
                  </EcolnaText>
                </View>
              ) : null}
            </View>
          );
          // Une leçon faite se rejoue, la prochaine s'ouvre ; les suivantes attendent.
          return lesson.done || next ? (
            <EcolnaGalet
              key={lesson.id}
              face={next ? family.tint : colors.white}
              radius={radius.lg}
              haptic="selection"
              onPress={() => onOpen(lesson.id)}
              accessibilityLabel={next ? `${action} : ${lesson.title}` : lesson.title}
              faceStyle={{ paddingHorizontal: scaled(spacing.sm, scale) }}
            >
              {row}
            </EcolnaGalet>
          ) : (
            <View key={lesson.id} style={{ paddingHorizontal: scaled(spacing.sm, scale) }}>
              {row}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/**
 * Une étape du chemin : un disque plat. Fait : vert, la coche blanche (ses
 * étoiles vont sous son nom). En cours : l'emblème blanc sur la couleur de la
 * discipline, plus grand, cerclé de l'anneau des leçons faites. Fermé : un
 * disque blanc cerclé de gris, un cadenas — visible, jamais caché.
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
  const a11y = `${entry.world.title} : ${entry.world.subtitle}${entry.state === 'locked' ? `. ${fr.learn.lockedHint}` : ''}`;
  const disc = (
    <EcolnaGalet
      face={entry.state === 'completed' ? colors.success : current ? family.solid : colors.white}
      border={entry.state === 'locked' ? family.tintStrong : undefined}
      borderWidth={scaled(3, scale)}
      radius={size / 2}
      shadow={current ? shadows.raised : entry.state === 'completed' ? shadows.card : shadows.none}
      haptic={entry.state === 'locked' ? undefined : 'light'}
      onPress={onPress}
      accessibilityLabel={a11y}
      accessibilityHint={entry.state === 'locked' ? fr.learn.lockedA11yHint : undefined}
      faceStyle={[styles.nodeFace, { width: size, height: size }]}
    >
      {entry.state === 'completed' ? (
        <EcolnaIcon name="check" size={Math.round(size * 0.46)} color={colors.white} />
      ) : current ? (
        <SubjectArt subject={subject} size={Math.round(size * 0.74)} variant="glyph" />
      ) : (
        // Fermé, mais déjà de sa discipline : l'enfant sait ce qui l'attend.
        <EcolnaIcon name="lock" size={Math.round(size * 0.34)} color={family.solid} filled />
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
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 2 },
  ringBed: { position: 'absolute', backgroundColor: colors.background },
  flex: { flex: 1 },
  panes: { flex: 1, flexDirection: 'row', paddingBottom: spacing.md },
  panel: {
    flex: 0.85,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    marginTop: spacing.sm,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center' },
  lessonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  lessonDisc: { alignItems: 'center', justifyContent: 'center' },
  rowStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.reward,
  },
});
