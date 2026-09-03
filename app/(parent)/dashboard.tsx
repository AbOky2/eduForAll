import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadParentDashboard,
  type ParentDashboardData,
} from '@/features/parent-space/application/parent-dashboard';
import { AlifaScreenHeader } from '@/design-system/components/alifa-screen-header';
import { AlifaStatCard } from '@/design-system/components/alifa-stat-card';
import {
  AlifaButton,
  AlifaCard,
  AlifaProgressBar,
  AlifaScreen,
  AlifaText,
} from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** Parent dashboard — mockup S18. Human sentences, no raw metrics. */
export default function ParentDashboardScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const profile = useActiveProfile((state) => state.profile);
  const data = useFocusedData<ParentDashboardData>(
    () => (profile ? loadParentDashboard(profile.id, profile.level, profile.firstName) : null),
    profile?.id ?? null,
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
      <AlifaScreenHeader
        onBack={goBack}
        title={fr.common.appName}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fr.settings.title}
            onPress={() => router.push('/(settings)')}
            hitSlop={8}
          >
            <AlifaIcon name="gear" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AlifaText variant="headlineLg">{fr.parent.dashboardTitle(profile.firstName)}</AlifaText>
        <AlifaText variant="bodyMd" color={colors.textSecondary}>
          {fr.parent.dashboardSubtitle}
        </AlifaText>

        {/* Stat cards */}
        <AlifaStatCard
          icon="sparkle"
          label={fr.parent.currentLevel}
          value={profile.level}
          container={colors.primaryContainer}
          tint={colors.onPrimaryContainer}
        />
        <AlifaStatCard
          icon="book"
          label={fr.parent.lessonsCompleted}
          value={`${data?.completedLessons ?? 0} / ${data?.totalLessons ?? 0}`}
          container={colors.secondaryContainer}
          tint={colors.onSecondaryContainer}
        >
          <AlifaProgressBar
            progress={data && data.totalLessons > 0 ? data.completedLessons / data.totalLessons : 0}
            tone="brown"
            height={8}
          />
        </AlifaStatCard>
        <AlifaStatCard
          icon="star"
          label={fr.parent.timeToday}
          value={fr.parent.minutes(data?.minutesToday ?? 0)}
          container={colors.tertiaryFixed}
          tint={colors.onTertiaryContainer}
        />

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
                <AlifaText
                  key={recommendation}
                  variant="bodyMd"
                  color={colors.onSecondaryContainer}
                >
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
  scroll: {
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
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
