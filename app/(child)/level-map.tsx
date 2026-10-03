import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  worldsForLevel,
  type WorldSummary,
} from '@/features/curriculum/application/curriculum-catalog';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import type { Subject } from '@/content/schemas/curriculum-schema';
import { EcolnaPill } from '@/design-system/components/ecolna-pill';
import { JourneyPath, type JourneyPoint } from '@/design-system/components/journey-path';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { SubjectArt } from '@/design-system/icons/subject-art';
import {
  EcolnaGalet,
  EcolnaIconButton,
  EcolnaProgressBar,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

type WorldNodeState = 'completed' | 'current' | 'locked';

interface WorldNode {
  world: WorldSummary;
  state: WorldNodeState;
  stars: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonId: string | null;
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
 * Carte de progression (direction v3) : un vrai chemin. Une piste de sable
 * serpente d'un monde à l'autre ; ce qui est fait est vert et coché, le monde
 * en cours porte l'objet de sa discipline et une bulle « Commencer », ce qui
 * reste est fermé mais visible. Le chemin parcouru prend la couleur de la
 * discipline, et l'écran s'ouvre déjà centré sur l'étape du jour.
 */
export default function LevelMapScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const profile = useActiveProfile((state) => state.profile);
  const { isTablet, scale, screenPadding } = useResponsive();
  const [nodes, setNodes] = useState<WorldNode[]>([]);
  const [width, setWidth] = useState(0);
  const [explained, setExplained] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrolledFor = useRef<string | null>(null);

  const subjectId = (subject ?? null) as Subject | null;
  const family = subjectColors[subjectId ?? 'reading'];

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
          };
        });
        if (!cancelled) {
          setNodes(built);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile, worlds]),
  );

  // Géométrie du chemin : une étape tous les `step` dp, en zigzag.
  const node = scaled(isTablet ? 104 : 88, scale);
  const currentNode = Math.round(node * 1.18);
  const step = scaled(isTablet ? 190 : 170, scale);
  const top = scaled(isTablet ? 96 : 80, scale);
  const amplitude = isTablet ? Math.min(width * 0.24, scaled(220, scale)) : width * 0.25;
  // Tablette : gauche, centre, droite, centre ; téléphone : gauche, droite.
  const pattern = isTablet ? [-1, 0, 1, 0] : [-1, 1];
  const points: JourneyPoint[] = useMemo(
    () =>
      nodes.map((_, index) => ({
        x: width / 2 + (pattern[index % pattern.length] ?? 0) * amplitude,
        y: top + index * step,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, width, amplitude, top, step, isTablet],
  );
  const contentHeight = top + Math.max(0, nodes.length - 1) * step + scaled(160, scale);
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
    scrollRef.current?.scrollTo({ y: Math.max(0, target.y - step - scaled(110, scale)), animated: false });
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
    if (entry.state === 'locked' || !entry.nextLessonId) {
      setExplained(entry.world.id);
      return;
    }
    router.push(`/(child)/lesson/${entry.nextLessonId}`);
  };

  const labelWidth = Math.min(scaled(isTablet ? 300 : 220, scale), width / 2 - node / 2 - 24);

  return (
    <EcolnaScreen background="default">
      <View style={[styles.header, { paddingHorizontal: screenPadding, gap: scaled(spacing.md, scale) }]}>
        <EcolnaIconButton icon="arrow-back" accessibilityLabel={fr.common.back} onPress={goBack} />
        <View style={styles.headerText}>
          <EcolnaText variant={isTablet ? 'headlineLg' : 'headlineMd'} color={subjectId ? family.ink : colors.textPrimary}>
            {subjectId
              ? `${SUBJECT_LABELS[subjectId]} · ${profile.level}`
              : fr.learn.levelTitle(profile.level)}
          </EcolnaText>
          <EcolnaText variant="bodyMd" color={colors.textSecondary}>
            {profile.level === 'CP1' ? fr.learn.cp1Motto : fr.learn.cp2Motto}
          </EcolnaText>
        </View>
        {subjectId ? <SubjectArt subject={subjectId} size={scaled(isTablet ? 64 : 52, scale)} /> : null}
      </View>

      <ScrollView
        ref={scrollRef}
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
              traveled={family.edge}
              thickness={scaled(isTablet ? 26 : 22, scale)}
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
              const size = entry.state === 'current' ? currentNode : node;
              const labelLeft = labelOnRight
                ? point.x + size / 2 + scaled(spacing.md, scale)
                : point.x - size / 2 - scaled(spacing.md, scale) - labelWidth;
              return (
                <View key={entry.world.id} style={StyleSheet.absoluteFill} pointerEvents="box-none">
                  {entry.state === 'current' ? (
                    <View
                      style={[
                        styles.bubbleWrap,
                        { left: point.x - 100, top: point.y - size / 2 - scaled(58, scale) },
                      ]}
                    >
                      <EcolnaPill
                        tone="sun"
                        variant="buttonSm"
                        label={entry.completedLessons > 0 ? fr.common.continue : fr.common.start}
                        onPress={() => open(entry)}
                        accessibilityLabel={`${entry.completedLessons > 0 ? fr.common.continue : fr.common.start} : ${entry.world.title}`}
                        icon={<EcolnaIcon name="play" size={scaled(16, scale)} color={colors.onTertiaryContainer} />}
                        style={styles.bubble}
                      />
                    </View>
                  ) : null}
                  <JourneyNode
                    entry={entry}
                    subject={subjectId ?? entry.world.subject}
                    size={size}
                    style={{ position: 'absolute', left: point.x - size / 2, top: point.y - size / 2 }}
                    onPress={() => open(entry)}
                  />
                  <View
                    style={[
                      styles.label,
                      {
                        left: labelLeft,
                        width: labelWidth,
                        top: point.y - scaled(isTablet ? 44 : 40, scale),
                        alignItems: labelOnRight ? 'flex-start' : 'flex-end',
                      },
                    ]}
                  >
                    <EcolnaText
                      variant="headlineSm"
                      align={labelOnRight ? 'left' : 'right'}
                      color={entry.state === 'locked' ? colors.locked : colors.textPrimary}
                      numberOfLines={2}
                    >
                      {entry.world.title}
                    </EcolnaText>
                    <EcolnaText
                      variant="bodySm"
                      color={colors.textSecondary}
                      align={labelOnRight ? 'left' : 'right'}
                      numberOfLines={2}
                    >
                      {explained === entry.world.id ? fr.learn.lockedHint : entry.world.subtitle}
                    </EcolnaText>
                    {entry.state !== 'locked' ? (
                      <View style={[styles.labelProgress, { width: Math.min(labelWidth, scaled(160, scale)) }]}>
                        <View style={styles.flex}>
                          <EcolnaProgressBar
                            progress={entry.completedLessons / Math.max(1, entry.totalLessons)}
                            fill={entry.state === 'completed' ? colors.feedbackCorrect : family.deep}
                            height={8}
                            accessibilityLabel={`${entry.world.title} : ${entry.completedLessons} sur ${entry.totalLessons}`}
                          />
                        </View>
                        <EcolnaText variant="labelSm" color={colors.textSecondary}>
                          {`${entry.completedLessons}/${entry.totalLessons}`}
                        </EcolnaText>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })
          : null}
      </ScrollView>
    </EcolnaScreen>
  );
}

/**
 * Une étape du chemin : un galet rond. Fait : vert, coché, ses étoiles
 * dessous. En cours : l'objet de la discipline sur sa couleur, plus grand.
 * Fermé : gris chaud et cadenas — visible, jamais caché.
 */
function JourneyNode({
  entry,
  subject,
  size,
  style,
  onPress,
}: {
  entry: WorldNode;
  subject: Subject;
  size: number;
  style: object;
  onPress: () => void;
}) {
  const { scale } = useResponsive();
  const family = subjectColors[subject];
  const look =
    entry.state === 'completed'
      ? { face: colors.feedbackCorrectContainer, edge: colors.feedbackCorrectShade }
      : entry.state === 'current'
        ? { face: family.face, edge: family.deep }
        : { face: colors.lockedContainer, edge: colors.lockedEdge };
  const stars = averageStars(entry);
  return (
    <View style={style}>
      <EcolnaGalet
        face={look.face}
        edge={look.edge}
        border={entry.state === 'current' ? colors.card : undefined}
        borderWidth={4}
        radius={size / 2}
        depth="lg"
        onPress={onPress}
        accessibilityLabel={`${entry.world.title} : ${entry.world.subtitle}${entry.state === 'locked' ? `. ${fr.learn.lockedHint}` : ''}`}
        faceStyle={[styles.nodeFace, { width: size, height: size }]}
      >
        {entry.state === 'completed' ? (
          <EcolnaIcon name="check" size={Math.round(size * 0.56)} mode="color" />
        ) : entry.state === 'current' ? (
          <SubjectArt subject={subject} size={Math.round(size * 0.8)} />
        ) : (
          <EcolnaIcon name="lock" size={Math.round(size * 0.42)} color={colors.locked} />
        )}
      </EcolnaGalet>
      {entry.state === 'completed' ? (
        <View style={[styles.stars, { marginTop: -scaled(10, scale) }]} accessibilityLabel={`${stars} étoiles sur 3`}>
          {[0, 1, 2].map((index) => (
            <EcolnaIcon
              key={index}
              name={index < stars ? 'star' : 'star-outline'}
              size={scaled(index === 1 ? 26 : 22, scale)}
              mode={index < stars ? 'color' : 'mono'}
              color={colors.starInactive}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  headerText: { flex: 1, gap: 2 },
  bubbleWrap: { position: 'absolute', width: 200, alignItems: 'center' },
  bubble: { alignSelf: 'center' },
  label: { position: 'absolute', gap: 2 },
  labelProgress: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxs },
  flex: { flex: 1 },
  nodeFace: { alignItems: 'center', justifyContent: 'center' },
  stars: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' },
});
