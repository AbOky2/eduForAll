import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { worldsForLevel } from '@/features/curriculum/application/curriculum-catalog';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import type { Subject, World } from '@/content/schemas/curriculum-schema';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { AlifaScreen, AlifaText } from '@/design-system/primitives';
import { colors, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

type WorldNodeState = 'completed' | 'current' | 'locked';

interface WorldNode {
  world: World;
  state: WorldNodeState;
  stars: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonId: string | null;
}

/**
 * Progress map — mockups S08 (CP1) and S09 (CP2). A winding vertical path of
 * world nodes: completed (check), current (sparkle + stars), locked (padlock).
 */
export default function LevelMapScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  const profile = useActiveProfile((state) => state.profile);
  const [nodes, setNodes] = useState<WorldNode[]>([]);

  const worlds = useMemo(() => {
    if (!profile) {
      return [];
    }
    const all = worldsForLevel(profile.level);
    return subject ? all.filter((world) => world.subject === (subject as Subject)) : all;
  }, [profile, subject]);

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

  if (!profile) {
    return null;
  }

  return (
    <AlifaScreen background="default">
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fr.common.back}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AlifaIcon name="arrow-back" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
        <View style={styles.headerText}>
          <AlifaText variant="headlineLg" align="center">
            {fr.learn.levelTitle(profile.level)}
          </AlifaText>
          <AlifaText variant="bodyMd" color={colors.textSecondary} align="center">
            {profile.level === 'CP1' ? fr.learn.cp1Motto : fr.learn.cp2Motto}
          </AlifaText>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.path} showsVerticalScrollIndicator={false}>
        {nodes.map((node, index) => {
          const alignLeft = index % 2 === 0;
          return (
            <View key={node.world.id} style={styles.nodeRow}>
              {index > 0 ? (
                <Svg width={2} height={44} style={[styles.connector, alignLeft ? styles.connectorLeft : styles.connectorRight]}>
                  <Line x1={1} y1={0} x2={1} y2={44} stroke={colors.primaryContainer} strokeWidth={2.5} strokeDasharray="2 8" strokeLinecap="round" />
                </Svg>
              ) : null}
              <View style={[styles.nodeWrap, alignLeft ? styles.nodeLeft : styles.nodeRight]}>
                {node.state === 'current' && node.stars > 0 ? (
                  <View style={styles.starsRow} accessibilityLabel={`${node.stars} étoiles`}>
                    {Array.from({ length: Math.min(3, Math.max(1, Math.round(node.stars / Math.max(1, node.completedLessons)))) }, (_, i) => (
                      <AlifaIcon key={i} name="star" size={16} color={colors.starActive} />
                    ))}
                  </View>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${node.world.title} : ${node.world.subtitle}${node.state === 'locked' ? `. ${fr.learn.lockedHint}` : ''}`}
                  disabled={node.state === 'locked' || !node.nextLessonId}
                  onPress={() =>
                    node.nextLessonId
                      ? router.push(`/(child)/lesson/${node.nextLessonId}`)
                      : undefined
                  }
                  style={[
                    styles.node,
                    shadows.card,
                    node.state === 'current' && styles.nodeCurrent,
                    node.state === 'locked' && styles.nodeLocked,
                    node.state === 'completed' && styles.nodeCompleted,
                  ]}
                >
                  {node.state === 'locked' ? (
                    <AlifaIcon name="lock" size={26} color={colors.locked} />
                  ) : node.state === 'completed' ? (
                    <AlifaIcon name="check" size={30} color={colors.onSecondaryContainer} />
                  ) : (
                    <AlifaIcon name="sparkle" size={30} color={colors.tertiaryContainer} />
                  )}
                </Pressable>
                <View style={styles.nodeLabel}>
                  <AlifaText variant="labelLg" align="center">
                    {node.world.title}
                  </AlifaText>
                  <AlifaText variant="bodySm" color={colors.textSecondary} align="center">
                    {node.world.subtitle}
                  </AlifaText>
                  {node.state !== 'locked' ? (
                    <AlifaText variant="bodySm" color={colors.outline} align="center">
                      {node.completedLessons}/{node.totalLessons}
                    </AlifaText>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </AlifaScreen>
  );
}

const NODE_SIZE = 84;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 2 },
  path: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  nodeRow: { alignItems: 'stretch' },
  connector: { alignSelf: 'center', marginVertical: spacing.xxs },
  connectorLeft: { marginRight: '30%' },
  connectorRight: { marginLeft: '30%' },
  nodeWrap: { alignItems: 'center', gap: spacing.xs },
  nodeLeft: { alignSelf: 'flex-start', marginLeft: '8%' },
  nodeRight: { alignSelf: 'flex-end', marginRight: '8%' },
  starsRow: { flexDirection: 'row', gap: 2 },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  nodeCurrent: { borderColor: colors.tertiaryContainer },
  nodeCompleted: { backgroundColor: colors.secondaryContainer },
  nodeLocked: { backgroundColor: colors.lockedContainer },
  nodeLabel: { maxWidth: 160, gap: 1 },
});
