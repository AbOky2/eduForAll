import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { avatarVariant } from '@/features/child-profile/domain/child-profile';
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
import { useFocusedData } from '@/shared/hooks/use-focused-data';

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
  const summary = useFocusedData<HomeSummary>(
    () => (profile ? loadHomeSummary(profile.id, profile.level) : null),
    profile?.id ?? null,
  );
  // Discipline verrouillée dont l'enfant vient de demander pourquoi.
  const [explained, setExplained] = useState<Subject | null>(null);

  if (!profile) {
    return null;
  }
  const recommendation = summary?.recommendation ?? null;
  const lessonsToday = summary?.lessonsToday ?? 0;
  const streakDays = summary?.streakDays ?? 0;
  const revisionCount = summary?.revisionCount ?? 0;
  const todayLine = fr.home.today(lessonsToday);

  return (
    <AlifaScreen background="default" withBottomInset={false}>
      {/* Header: avatar — ALIFA — offline badge */}
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fr.childProfile.title}
          onPress={() => router.push('/(child)/profile')}
          hitSlop={8}
        >
          <AvatarFace variant={avatarVariant(profile.avatarId)} size={40} />
        </Pressable>
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
              {todayLine}
            </AlifaText>
          </View>
          {streakDays > 0 ? (
            <View
              style={styles.streak}
              accessibilityRole="text"
              accessibilityLabel={fr.home.streak(streakDays)}
            >
              <AlifaIcon name="flame" size={18} color={colors.onPrimaryContainer} filled />
              <AlifaText variant="labelMd" color={colors.onPrimaryContainer}>
                {String(streakDays)}
              </AlifaText>
            </View>
          ) : null}
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

        {/* Revision workshop — only when something is actually waiting */}
        {revisionCount > 0 ? (
          <AlifaCard
            rounded="xl"
            onPress={() => router.push('/(child)/revision')}
            accessibilityLabel={`${fr.home.reviseTitle} ${fr.home.reviseCount(revisionCount)}`}
            style={styles.revision}
          >
            <View style={styles.revisionBadge}>
              <AlifaIcon name="leaf" size={22} color={colors.onTertiaryContainer} />
            </View>
            <View style={styles.revisionText}>
              <AlifaText variant="labelLg">{fr.home.reviseTitle}</AlifaText>
              <AlifaText variant="bodyMd" color={colors.textSecondary}>
                {fr.home.reviseCount(revisionCount)}
              </AlifaText>
            </View>
            <AlifaIcon name="chevron-right" size={22} color={colors.onSurfaceVariant} />
          </AlifaCard>
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
                onPress={
                  subject.locked
                    ? // A dead tap tells a six-year-old nothing: explain, in place.
                      () => setExplained(subject.subject)
                    : () => router.push(`/(child)/level-map?subject=${subject.subject}`)
                }
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
                {explained === subject.subject ? (
                  <AlifaText variant="bodySm" color={colors.textSecondary}>
                    {fr.home.lockedExplain}
                  </AlifaText>
                ) : null}
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
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  revision: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  revisionBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revisionText: { flex: 1, gap: 2 },
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
