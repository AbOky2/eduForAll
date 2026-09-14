import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadParentDashboard,
  type ParentDashboardData,
} from '@/features/parent-space/application/parent-dashboard';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { EcolnaStatCard } from '@/design-system/components/ecolna-stat-card';
import {
  EcolnaButton,
  EcolnaCard,
  EcolnaProgressBar,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
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
        `${profile.firstName} apprend avec ECOLNA !\n` +
        `Leçons terminées : ${data?.completedLessons ?? 0}/${data?.totalLessons ?? 0} (${profile.level}).\n` +
        'Apprendre partout, même sans internet.',
    });
  };

  return (
    <EcolnaScreen background="default">
      <EcolnaScreenHeader
        onBack={goBack}
        title={fr.common.appName}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fr.settings.title}
            onPress={() => router.push('/(settings)')}
            hitSlop={8}
          >
            <EcolnaIcon name="gear" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <EcolnaText variant="headlineLg">{fr.parent.dashboardTitle(profile.firstName)}</EcolnaText>
        <EcolnaText variant="bodyMd" color={colors.textSecondary}>
          {fr.parent.dashboardSubtitle}
        </EcolnaText>

        {/* Stat cards */}
        <EcolnaStatCard
          icon="sparkle"
          label={fr.parent.currentLevel}
          value={profile.level}
          container={colors.primaryContainer}
          tint={colors.onPrimaryContainer}
        />
        <EcolnaStatCard
          icon="book"
          label={fr.parent.lessonsCompleted}
          value={`${data?.completedLessons ?? 0} / ${data?.totalLessons ?? 0}`}
          container={colors.secondaryContainer}
          tint={colors.onSecondaryContainer}
        >
          <EcolnaProgressBar
            progress={data && data.totalLessons > 0 ? data.completedLessons / data.totalLessons : 0}
            tone="brown"
            height={8}
          />
        </EcolnaStatCard>
        <EcolnaStatCard
          icon="sparkle"
          label={fr.parent.masteredSkills}
          value={String(data?.masteredSkills ?? 0)}
          container={colors.feedbackCorrectContainer}
          tint={colors.feedbackCorrect}
        />
        <EcolnaStatCard
          icon="star"
          label={fr.parent.timeToday}
          value={fr.parent.minutes(data?.minutesToday ?? 0)}
          container={colors.tertiaryFixed}
          tint={colors.onTertiaryContainer}
        />

        {/* Analysis */}
        <EcolnaCard rounded="xl" style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <EcolnaIcon name="sparkle" size={20} color={colors.secondary} />
            <EcolnaText variant="headlineSm">{fr.parent.progressAnalysis}</EcolnaText>
          </View>
          {(data?.analysis ?? []).map((sentence) => (
            <EcolnaText key={sentence} variant="bodyLg">
              {sentence}
            </EcolnaText>
          ))}
          {data && data.recommendations.length > 0 ? (
            <View style={styles.recommendationBox}>
              <EcolnaText variant="labelSm" color={colors.onSecondaryContainer}>
                {fr.parent.recommendation}
              </EcolnaText>
              {data.recommendations.map((recommendation) => (
                <EcolnaText
                  key={recommendation}
                  variant="bodyMd"
                  color={colors.onSecondaryContainer}
                >
                  {recommendation}
                </EcolnaText>
              ))}
            </View>
          ) : (
            <EcolnaText variant="bodyMd" color={colors.textSecondary}>
              {fr.parent.nothingToReview}
            </EcolnaText>
          )}
        </EcolnaCard>

        {/* Share */}
        <EcolnaCard rounded="xl" style={styles.shareCard}>
          <EcolnaIcon name="share" size={24} color={colors.primary} />
          <EcolnaText variant="headlineSm" align="center">
            {fr.parent.proudTitle}
          </EcolnaText>
          <EcolnaButton label={fr.parent.share} onPress={share} />
        </EcolnaCard>
      </ScrollView>
    </EcolnaScreen>
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
