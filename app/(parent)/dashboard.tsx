import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadParentDashboard,
  type ParentDashboardData,
} from '@/features/parent-space/application/parent-dashboard';
import { AlifaButton, AlifaCard, AlifaProgressBar, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Parent dashboard — mockup S18. Human sentences, no raw metrics. */
export default function ParentDashboardScreen() {
  const router = useRouter();
  const profile = useActiveProfile((state) => state.profile);
  const [data, setData] = useState<ParentDashboardData | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (profile) {
        void loadParentDashboard(profile.id, profile.level, profile.firstName).then((result) => {
          if (!cancelled) {
            setData(result);
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

  const share = () => {
    // Local OS share sheet with a text summary — the app itself sends nothing.
    void Share.share({
      message:
        `${profile.firstName} apprend avec ALIFA !\n` +
        `Leçons terminées : ${data?.completedLessons ?? 0}/${data?.totalLessons ?? 0} (${profile.level}).\n` +
        'Apprendre partout, même sans internet.',
    });
  };

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
        <AlifaText variant="headlineSm" color={colors.primary}>
          {fr.common.appName}
        </AlifaText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fr.settings.title}
          onPress={() => router.push('/(settings)')}
          style={styles.backButton}
        >
          <AlifaIcon name="gear" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AlifaText variant="headlineLg">{fr.parent.dashboardTitle(profile.firstName)}</AlifaText>
        <AlifaText variant="bodyMd" color={colors.textSecondary}>
          {fr.parent.dashboardSubtitle}
        </AlifaText>

        {/* Stat cards */}
        <AlifaCard style={styles.statCard}>
          <View style={styles.statIcon}>
            <AlifaIcon name="sparkle" size={22} color={colors.onPrimaryContainer} />
          </View>
          <View style={styles.statText}>
            <AlifaText variant="labelMd" color={colors.textSecondary}>
              {fr.parent.currentLevel}
            </AlifaText>
            <AlifaText variant="headlineMd">{profile.level}</AlifaText>
          </View>
        </AlifaCard>

        <AlifaCard style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.secondaryContainer }]}>
            <AlifaIcon name="book" size={22} color={colors.onSecondaryContainer} />
          </View>
          <View style={styles.statText}>
            <AlifaText variant="labelMd" color={colors.textSecondary}>
              {fr.parent.lessonsCompleted}
            </AlifaText>
            <AlifaText variant="headlineMd">
              {data?.completedLessons ?? 0}
              <AlifaText variant="bodyMd" color={colors.textSecondary}>
                {' '}
                / {data?.totalLessons ?? 0}
              </AlifaText>
            </AlifaText>
            <AlifaProgressBar
              progress={data && data.totalLessons > 0 ? data.completedLessons / data.totalLessons : 0}
              tone="brown"
              height={8}
            />
          </View>
        </AlifaCard>

        <AlifaCard style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.tertiaryFixed }]}>
            <AlifaIcon name="star" size={22} color={colors.onTertiaryContainer} />
          </View>
          <View style={styles.statText}>
            <AlifaText variant="labelMd" color={colors.textSecondary}>
              {fr.parent.timeToday}
            </AlifaText>
            <AlifaText variant="headlineMd">{fr.parent.minutes(data?.minutesToday ?? 0)}</AlifaText>
          </View>
        </AlifaCard>

        {/* Analysis */}
        <AlifaCard rounded="xl" style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <AlifaIcon name="sparkle" size={20} color={colors.secondary} />
            <AlifaText variant="headlineSm">{fr.parent.progressAnalysis}</AlifaText>
          </View>
          {(data?.analysis ?? []).map((sentence) => (
            <AlifaText key={sentence} variant="bodyLg">
              {sentence}
            </AlifaText>
          ))}
          {data && data.recommendations.length > 0 ? (
            <View style={styles.recommendationBox}>
              <AlifaText variant="labelSm" color={colors.onSecondaryContainer}>
                {fr.parent.recommendation}
              </AlifaText>
              {data.recommendations.map((recommendation) => (
                <AlifaText key={recommendation} variant="bodyMd" color={colors.onSecondaryContainer}>
                  {recommendation}
                </AlifaText>
              ))}
            </View>
          ) : (
            <AlifaText variant="bodyMd" color={colors.textSecondary}>
              {fr.parent.nothingToReview}
            </AlifaText>
          )}
        </AlifaCard>

        {/* Share */}
        <AlifaCard rounded="xl" style={styles.shareCard}>
          <AlifaIcon name="share" size={24} color={colors.primary} />
          <AlifaText variant="headlineSm" align="center">
            {fr.parent.proudTitle}
          </AlifaText>
          <AlifaButton label={fr.parent.share} onPress={share} />
        </AlifaCard>
      </ScrollView>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primaryFixedDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: { flex: 1, gap: spacing.xxs },
  analysisCard: { gap: spacing.sm },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recommendationBox: {
    backgroundColor: colors.secondaryFixed,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  shareCard: { alignItems: 'center', gap: spacing.sm },
});
