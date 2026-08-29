import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadHomeSummary,
  type HomeSummary,
} from '@/features/learning-path/application/home-summary';
import type { Subject } from '@/content/schemas/curriculum-schema';
import { AlifaCard, AlifaProgressBar, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon, type IconName } from '@/design-system/icons/alifa-icon';
import { AvatarFace } from '@/design-system/illustrations/scenes';
import { colors, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

const SUBJECT_META: Record<
  Subject,
  { label: string; icon: IconName; tile: string; tint: string; bar: 'sand' | 'brown' | 'blue' }
> = {
  language: {
    label: fr.subjects.language,
    icon: 'speech',
    tile: colors.secondary,
    tint: colors.onSecondary,
    bar: 'blue',
  },
  reading: {
    label: fr.subjects.reading,
    icon: 'book',
    tile: colors.primaryFixedDim,
    tint: colors.onPrimaryContainer,
    bar: 'brown',
  },
  writing: {
    label: fr.subjects.writing,
    icon: 'pencil',
    tile: colors.tertiaryFixed,
    tint: colors.onTertiaryContainer,
    bar: 'sand',
  },
  math: {
    label: fr.subjects.math,
    icon: 'calculator',
    tile: colors.secondaryContainer,
    tint: colors.onSecondaryContainer,
    bar: 'blue',
  },
};

/** Child home — mockup S06. */
export default function ChildHomeScreen() {
  const router = useRouter();
  const profile = useActiveProfile((state) => state.profile);
  const [summary, setSummary] = useState<HomeSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (profile) {
        void loadHomeSummary(profile.id, profile.level).then((result) => {
          if (!cancelled) {
            setSummary(result);
          }
        });
      }
      return () => {
        cancelled = true;
      };
    }, [profile]),
  );

  if (!profile) {
    return null;
  }
  const recommendation = summary?.recommendation ?? null;
  const avatarVariant = (Math.max(1, Number(profile.avatarId.split('-')[1] ?? '1')) % 4 || 4) as
    1 | 2 | 3 | 4;

  return (
    <AlifaScreen background="default" withBottomInset={false}>
      {/* Header: avatar — ALIFA — offline badge */}
      <View style={styles.header}>
        <AvatarFace variant={avatarVariant} size={40} />
        <AlifaText variant="headlineSm" color={colors.primary}>
          {fr.common.appName}
        </AlifaText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fr.offline.badge}
          onPress={() => router.push('/(child)/offline-info')}
          hitSlop={8}
        >
          <AlifaIcon name="cloud-off" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <AlifaText variant="headlineLg">{fr.home.greeting(profile.firstName)}</AlifaText>
            <AlifaText variant="bodyLg" color={colors.textSecondary}>
              {fr.home.readyToLearnGeneric}
            </AlifaText>
          </View>
        </View>

        {/* Continue lesson hero card */}
        {recommendation ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${fr.home.continueLesson} : ${recommendation.title}`}
            onPress={() => router.push(`/(child)/lesson/${recommendation.lessonId}`)}
            style={({ pressed }) => [
              styles.hero,
              shadows.raised,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={styles.heroBadge}>
              <AlifaText variant="labelSm" color={colors.primaryFixed}>
                {recommendation.reason === 'resume' ? fr.home.inProgress : fr.home.newBadge}
              </AlifaText>
            </View>
            <AlifaText variant="headlineMd" color={colors.onPrimary}>
              {recommendation.reason === 'resume' ? fr.home.continueLesson : fr.home.startLesson}
            </AlifaText>
            <AlifaText variant="bodyMd" color={colors.primaryFixed}>
              {recommendation.title}
            </AlifaText>
            <View style={styles.heroPlay}>
              <AlifaIcon name="play" size={26} color={colors.primary} />
            </View>
          </Pressable>
        ) : null}

        {/* Activities grid */}
        <View style={styles.sectionTitle}>
          <AlifaIcon name="star-outline" size={18} color={colors.primary} />
          <AlifaText variant="headlineSm">{fr.home.activities}</AlifaText>
        </View>
        <View style={styles.grid}>
          {(summary?.subjects ?? []).map((subject) => {
            const meta = SUBJECT_META[subject.subject];
            const progress = subject.total === 0 ? 0 : subject.completed / subject.total;
            return (
              <AlifaCard
                key={subject.subject}
                onPress={subject.locked ? undefined : () => router.push('/(child)/(tabs)/learn')}
                accessibilityLabel={`${meta.label}${subject.locked ? ', verrouillé' : ''}`}
                style={StyleSheet.flatten([
                  styles.activityCard,
                  subject.locked && styles.lockedCard,
                ])}
              >
                <View style={styles.activityHeader}>
                  <View
                    style={[
                      styles.activityTile,
                      { backgroundColor: subject.locked ? colors.lockedContainer : meta.tile },
                    ]}
                  >
                    <AlifaIcon
                      name={meta.icon}
                      size={22}
                      color={subject.locked ? colors.locked : meta.tint}
                    />
                  </View>
                  {subject.locked ? (
                    <AlifaIcon name="lock" size={16} color={colors.locked} />
                  ) : null}
                </View>
                <AlifaText
                  variant="labelLg"
                  color={subject.locked ? colors.locked : colors.textPrimary}
                >
                  {meta.label}
                </AlifaText>
                <AlifaProgressBar
                  progress={progress}
                  tone={meta.bar}
                  height={8}
                  accessibilityLabel={`${meta.label} : ${subject.completed} sur ${subject.total}`}
                />
              </AlifaCard>
            );
          })}
        </View>
      </ScrollView>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  greetingText: { flex: 1, gap: spacing.xxs },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  heroPlay: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  activityCard: {
    width: '47%',
    flexGrow: 1,
    gap: spacing.sm,
  },
  lockedCard: { opacity: 0.75 },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
