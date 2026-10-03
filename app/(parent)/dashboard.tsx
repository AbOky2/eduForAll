import { useRouter } from 'expo-router';
import { ScrollView, Share, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadParentDashboard,
  type ParentDashboardData,
} from '@/features/parent-space/application/parent-dashboard';
import { EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { EcolnaStatCard } from '@/design-system/components/ecolna-stat-card';
import {
  EcolnaButton,
  EcolnaCard,
  EcolnaIconButton,
  EcolnaProgressBar,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * Tableau de bord parent — mockup S18, direction v3. Des phrases humaines
 * plutôt que des métriques brutes ; le registre est celui d'un carnet de
 * liaison, sobre. Quatre chiffres (en ligne sur tablette en paysage, deux par
 * deux ailleurs), l'analyse, puis le partage.
 */
export default function ParentDashboardScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { scale, isTablet, splitPanes, screenPadding } = useResponsive();
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

  const gap = scaled(spacing.md, scale);
  const statColumns = isTablet ? 2 : 1;
  const stats = [
    <EcolnaStatCard
      key="level"
      icon="level"
      label={fr.parent.currentLevel}
      value={profile.level}
      container={colors.primaryFixed}
      tint={colors.onPrimaryContainer}
      style={styles.flex}
    />,
    <EcolnaStatCard
      key="lessons"
      icon="book"
      label={fr.parent.lessonsCompleted}
      value={`${data?.completedLessons ?? 0} / ${data?.totalLessons ?? 0}`}
      container={colors.secondaryFixed}
      tint={colors.secondary}
      style={styles.flex}
    >
      <EcolnaProgressBar
        progress={data && data.totalLessons > 0 ? data.completedLessons / data.totalLessons : 0}
        tone="blue"
        height={8}
      />
    </EcolnaStatCard>,
    <EcolnaStatCard
      key="mastered"
      icon="target"
      label={fr.parent.masteredSkills}
      value={String(data?.masteredSkills ?? 0)}
      container={colors.feedbackCorrectContainer}
      tint={colors.feedbackCorrect}
      style={styles.flex}
    />,
    <EcolnaStatCard
      key="time"
      icon="clock"
      label={fr.parent.timeToday}
      value={fr.parent.minutes(data?.minutesToday ?? 0)}
      container={colors.tertiaryFixed}
      tint={colors.onTertiaryContainer}
      style={styles.flex}
    />,
  ];
  const statRows: (typeof stats)[] = [];
  for (let start = 0; start < stats.length; start += statColumns) {
    statRows.push(stats.slice(start, start + statColumns));
  }

  const analysis = (
    <EcolnaCard rounded="xl" style={[styles.analysisCard, splitPanes && styles.flex2]}>
      <View style={styles.analysisHeader}>
        <EcolnaIcon name="insight" size={24} color={colors.secondary} />
        <EcolnaText variant="headlineSm">{fr.parent.progressAnalysis}</EcolnaText>
      </View>
      {(data?.analysis ?? []).map((sentence) => (
        <EcolnaText key={sentence} variant="bodyLg">
          {sentence}
        </EcolnaText>
      ))}
      {data && data.recommendations.length > 0 ? (
        <View style={styles.recommendationBox}>
          <EcolnaText variant="tag" color={colors.onSecondaryContainer}>
            {fr.parent.recommendation}
          </EcolnaText>
          {data.recommendations.map((recommendation) => (
            <EcolnaText key={recommendation} variant="bodyMd" color={colors.onSecondaryContainer}>
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
  );

  const shareCard = (
    <EcolnaCard rounded="xl" style={[styles.shareCard, splitPanes && styles.flex]}>
      <EcolnaAvatar avatarId={profile.avatarId} size={scaled(72, scale)} expression="joy" />
      <EcolnaText variant="headlineSm" align="center">
        {fr.parent.proudTitle}
      </EcolnaText>
      <EcolnaButton
        label={fr.parent.share}
        variant="secondary"
        size="md"
        icon={<EcolnaIcon name="share" size={20} color={colors.secondary} />}
        onPress={share}
        style={styles.stretch}
      />
    </EcolnaCard>
  );

  return (
    <EcolnaScreen background="plain" fullWidth={splitPanes}>
      <EcolnaScreenHeader
        onBack={goBack}
        title={fr.common.appName}
        titleColor={colors.primary}
        right={
          <EcolnaIconButton
            icon="gear"
            accessibilityLabel={fr.settings.title}
            onPress={() => router.push('/(settings)')}
          />
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: screenPadding, gap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.titleRow, { gap }]}>
          <EcolnaAvatar avatarId={profile.avatarId} size={scaled(56, scale)} />
          <View style={styles.flex}>
            <EcolnaText variant="headlineLg">{fr.parent.dashboardTitle(profile.firstName)}</EcolnaText>
            <EcolnaText variant="bodyMd" color={colors.textSecondary}>
              {fr.parent.dashboardSubtitle}
            </EcolnaText>
          </View>
        </View>

        {statRows.map((row, index) => (
          <View key={index} style={[styles.row, { gap }]}>
            {row}
          </View>
        ))}

        <View style={[splitPanes && styles.row, { gap }]}>
          {analysis}
          {shareCard}
        </View>
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl, paddingTop: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  flex: { flex: 1 },
  flex2: { flex: 1.6 },
  stretch: { alignSelf: 'stretch' },
  analysisCard: { gap: spacing.sm },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recommendationBox: {
    backgroundColor: colors.secondaryFixed,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  shareCard: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
