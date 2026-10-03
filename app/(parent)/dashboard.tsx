import { useRouter } from 'expo-router';
import { ScrollView, Share, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadHomeSummary,
  type HomeSummary,
} from '@/features/learning-path/application/home-summary';
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
import { SubjectArt } from '@/design-system/icons/subject-art';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * Tableau de bord parent — direction v4. Le registre d'un carnet de liaison,
 * sobre et précis : quatre chiffres, une ligne par discipline du programme
 * (ses leçons faites, sa barre), puis des phrases humaines plutôt que des
 * métriques brutes, et le partage. Couché : les chiffres à gauche, la
 * lecture à droite.
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

  const summary = useFocusedData<HomeSummary>(
    () => (profile ? loadHomeSummary(profile.id, profile.level) : null),
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
      container={colors.brandTint}
      tint={colors.brandInk}
      style={styles.flex}
    />,
    <EcolnaStatCard
      key="lessons"
      icon="book"
      label={fr.parent.lessonsCompleted}
      value={`${data?.completedLessons ?? 0} / ${data?.totalLessons ?? 0}`}
      container={colors.brandTint}
      tint={colors.brand}
      style={styles.flex}
    >
      <EcolnaProgressBar
        progress={data && data.totalLessons > 0 ? data.completedLessons / data.totalLessons : 0}
        fill={colors.brand}
        height={8}
      />
    </EcolnaStatCard>,
    <EcolnaStatCard
      key="mastered"
      icon="target"
      label={fr.parent.masteredSkills}
      value={String(data?.masteredSkills ?? 0)}
      container={colors.successTint}
      tint={colors.successInk}
      style={styles.flex}
    />,
    <EcolnaStatCard
      key="time"
      icon="clock"
      label={fr.parent.timeToday}
      value={fr.parent.minutes(data?.minutesToday ?? 0)}
      container={colors.rewardTint}
      tint={colors.rewardInk}
      style={styles.flex}
    />,
  ];
  const statRows: (typeof stats)[] = [];
  for (let start = 0; start < stats.length; start += statColumns) {
    statRows.push(stats.slice(start, start + statColumns));
  }

  // Une ligne par discipline : son emblème, ses leçons faites, sa barre.
  const subjects = (
    <EcolnaCard rounded="xl" style={styles.subjectsCard}>
      <View style={styles.analysisHeader}>
        <EcolnaIcon name="learn" size={24} color={colors.brand} />
        <EcolnaText variant="headlineSm">{fr.parent.bySubject}</EcolnaText>
      </View>
      {(summary?.subjects ?? []).map((entry) => {
        const ratio = entry.total > 0 ? entry.completed / entry.total : 0;
        const label = fr.subjects[entry.subject];
        return (
          <View
            key={entry.subject}
            style={[styles.subjectRow, { gap: scaled(spacing.md, scale) }]}
            accessible
            accessibilityLabel={`${label} : ${fr.parent.subjectLessons(entry.completed, entry.total)}`}
          >
            <SubjectArt subject={entry.subject} size={scaled(40, scale)} />
            <View style={styles.flex}>
              <View style={styles.subjectLine}>
                <EcolnaText variant="labelLg">{label}</EcolnaText>
                <EcolnaText variant="labelMd" color={colors.textSecondary}>
                  {fr.parent.subjectLessons(entry.completed, entry.total)}
                </EcolnaText>
              </View>
              <EcolnaProgressBar progress={ratio} fill={subjectColors[entry.subject].solid} height={8} />
            </View>
            <EcolnaText variant="labelLg" style={styles.percent} align="right">
              {fr.parent.percent(Math.round(ratio * 100))}
            </EcolnaText>
          </View>
        );
      })}
    </EcolnaCard>
  );

  const analysis = (
    <EcolnaCard rounded="xl" style={styles.analysisCard}>
      <View style={styles.analysisHeader}>
        <EcolnaIcon name="insight" size={24} color={colors.brand} />
        <EcolnaText variant="headlineSm">{fr.parent.progressAnalysis}</EcolnaText>
      </View>
      {(data?.analysis ?? []).map((sentence) => (
        <EcolnaText key={sentence} variant="bodyLg">
          {sentence}
        </EcolnaText>
      ))}
      {data && data.recommendations.length > 0 ? (
        <View style={styles.recommendationBox}>
          <EcolnaText variant="tag" color={colors.brandInk}>
            {fr.parent.recommendation}
          </EcolnaText>
          {data.recommendations.map((recommendation) => (
            <EcolnaText key={recommendation} variant="bodyMd" color={colors.brandInk}>
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
    <EcolnaCard rounded="xl" style={styles.shareCard}>
      <EcolnaIcon name="share" size={scaled(32, scale)} color={colors.brand} />
      <EcolnaText variant="headlineSm" align="center">
        {fr.parent.proudTitle}
      </EcolnaText>
      <EcolnaButton
        label={fr.parent.share}
        variant="secondary"
        size="md"
        icon={<EcolnaIcon name="share" size={20} color={colors.brand} />}
        onPress={share}
        style={styles.stretch}
      />
    </EcolnaCard>
  );

  return (
    <EcolnaScreen background="plain" fullWidth={splitPanes}>
      <EcolnaScreenHeader
        onBack={goBack}
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

        {splitPanes ? (
          // Couché : les chiffres et les disciplines à gauche, la lecture à droite.
          <View style={[styles.row, { gap }]}>
            <View style={[styles.flex2, { gap }]}>
              {statRows.map((row, index) => (
                <View key={index} style={[styles.row, { gap }]}>
                  {row}
                </View>
              ))}
              {subjects}
            </View>
            <View style={[styles.flex, { gap }]}>
              {analysis}
              <View style={styles.grow}>{shareCard}</View>
            </View>
          </View>
        ) : (
          <>
            {statRows.map((row, index) => (
              <View key={index} style={[styles.row, { gap }]}>
                {row}
              </View>
            ))}
            {subjects}
            {analysis}
            {shareCard}
          </>
        )}
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
  subjectsCard: { gap: spacing.md },
  subjectRow: { flexDirection: 'row', alignItems: 'center' },
  subjectLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.xxs },
  percent: { minWidth: 52 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recommendationBox: {
    backgroundColor: colors.brandTint,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  shareCard: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, flexGrow: 1 },
  grow: { flexGrow: 1 },
});
