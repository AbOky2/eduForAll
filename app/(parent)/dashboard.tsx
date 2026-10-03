import { useRouter } from 'expo-router';
import { ScrollView, Share, StyleSheet, View } from 'react-native';

import { localDay } from '@/core/time/day';
import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadHomeSummary,
  type HomeSummary,
} from '@/features/learning-path/application/home-summary';
import {
  loadParentDashboard,
  type ParentDashboardData,
} from '@/features/parent-space/application/parent-dashboard';
import { currentWeek, mondayOf, type WeekDay } from '@/features/progress/domain/week';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import { EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { EcolnaStatCard } from '@/design-system/components/ecolna-stat-card';
import {
  EcolnaCard,
  EcolnaIconButton,
  EcolnaProgressBar,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { EcolnaIcon, type IconName } from '@/design-system/icons/ecolna-icon';
import { SubjectArt } from '@/design-system/icons/subject-art';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** La barre des leçons terminées, en dp avant mise à l'échelle. */
const BAR = 8;
/** La plus haute colonne de la semaine, en dp avant mise à l'échelle. */
const WEEK_HEIGHT = 80;
/** Sous ce total, la colonne la plus haute ne monte pas jusqu'en haut : 2 min ne font pas une journée pleine. */
const WEEK_FLOOR_MINUTES = 15;

/** L'en-tête d'une carte : son pictogramme et son titre, puis, dessous, un fait court. */
function CardHeader({ icon, title, detail }: { icon: IconName; title: string; detail?: string | undefined }) {
  const { scale } = useResponsive();
  return (
    <View>
      <View style={styles.cardHeader}>
        <EcolnaIcon name={icon} size={scaled(22, scale)} color={colors.brand} />
        <EcolnaText variant="headlineSm" style={styles.flex} numberOfLines={1}>
          {title}
        </EcolnaText>
      </View>
      {detail ? (
        <EcolnaText
          variant="bodyMd"
          color={colors.textSecondary}
          style={{ marginLeft: scaled(22, scale) + spacing.xs }}
        >
          {detail}
        </EcolnaText>
      ) : null}
    </View>
  );
}

/**
 * Cette semaine : sept colonnes, du lundi au dimanche, à la hauteur des
 * minutes passées à apprendre. Le jour même en bleu plein, les autres en bleu
 * clair, leurs minutes au-dessus ; un jour sans séance ne laisse que la ligne
 * de base. Ce que cherche d'abord un parent : est-ce qu'il apprend, et quand.
 */
function WeekChart({ week }: { week: WeekDay[] }) {
  const { scale } = useResponsive();
  const chart = scaled(WEEK_HEIGHT, scale);
  const column = scaled(28, scale);
  const peak = Math.max(WEEK_FLOOR_MINUTES, ...week.map((entry) => entry.minutes));
  const total = week.reduce((sum, entry) => sum + entry.minutes, 0);
  return (
    <EcolnaCard rounded="xl" style={styles.cardGap}>
      <CardHeader icon="calendar-check" title={fr.parent.weekTitle} detail={fr.parent.weekTotal(total)} />
      <View style={[styles.weekRow, { marginTop: scaled(spacing.xs, scale) }]}>
        {week.map((entry, index) => {
          const name = fr.parent.weekDays[index] ?? '';
          const bar = entry.minutes > 0 ? Math.max(column / 2, Math.round((chart * entry.minutes) / peak)) : 0;
          return (
            <View
              key={entry.day}
              style={styles.weekColumn}
              accessible
              accessibilityLabel={fr.parent.weekDayLabel(name, entry.minutes)}
            >
              <View style={[styles.weekPlot, { height: chart + scaled(22, scale) }]}>
                {entry.minutes > 0 ? (
                  <EcolnaText
                    variant="labelSm"
                    color={entry.today ? colors.brandInk : colors.textSecondary}
                    align="center"
                  >
                    {String(entry.minutes)}
                  </EcolnaText>
                ) : null}
                {bar > 0 ? (
                  <View
                    style={{
                      width: column,
                      height: bar,
                      marginTop: scaled(spacing.xxs, scale),
                      // Arrondie en haut, posée à plat sur la ligne de base.
                      borderTopLeftRadius: Math.min(radius.sm, column / 2),
                      borderTopRightRadius: Math.min(radius.sm, column / 2),
                      backgroundColor: entry.today ? colors.brand : colors.brandTintStrong,
                    }}
                  />
                ) : null}
              </View>
              {/* La ligne de base, la piste commune des sept jours. */}
              <View style={[styles.baseline, { height: scaled(2, scale) }]} />
              <EcolnaText
                variant="labelMd"
                color={entry.today ? colors.brandInk : colors.textSecondary}
                style={styles.weekLabel}
              >
                {fr.parent.weekDaysShort[index] ?? ''}
              </EcolnaText>
            </View>
          );
        })}
      </View>
    </EcolnaCard>
  );
}

/**
 * Tableau de bord parent — direction v4. Le registre d'un carnet de liaison,
 * sobre et précis : un en-tête d'une seule rangée (l'enfant, partager,
 * paramètres), quatre chiffres de même hauteur, une ligne par discipline du
 * programme, la semaine en sept colonnes, puis des phrases humaines plutôt
 * que des métriques brutes. Couché : les chiffres et les disciplines à
 * gauche, la semaine et la lecture à droite.
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

  const week = useFocusedData<WeekDay[]>(
    () =>
      profile
        ? getDatabase()
            .then((db) =>
              createProgressRepository(db).findMinutesByDay(profile.id, localDay(mondayOf(new Date()))),
            )
            .then((entries) => currentWeek(entries))
        : null,
    profile?.id ?? null,
  );

  if (!profile) {
    return null;
  }

  const share = () => {
    // Local OS share sheet with a text summary — the app itself sends nothing.
    void Share.share({
      message: fr.parent.shareMessage(
        profile.firstName,
        data?.completedLessons ?? 0,
        data?.totalLessons ?? 0,
        profile.level,
      ),
    });
  };

  const gap = scaled(spacing.md, scale);
  const statColumns = isTablet ? 2 : 1;
  // La barre des leçons et sa marge : la place que les trois autres cartes réservent.
  const barSlot = scaled(BAR, scale) + scaled(spacing.xxs, scale);
  const stats = [
    <EcolnaStatCard
      key="level"
      icon="level"
      label={fr.parent.currentLevel}
      value={profile.level}
      container={colors.brandTint}
      tint={colors.brandInk}
      footerReserve={barSlot}
      style={styles.flex}
    />,
    <EcolnaStatCard
      key="lessons"
      icon="book"
      label={fr.parent.lessonsCompleted}
      value={`${data?.completedLessons ?? 0} / ${data?.totalLessons ?? 0}`}
      container={colors.brandTint}
      tint={colors.brandInk}
      style={styles.flex}
    >
      <View style={{ marginTop: scaled(spacing.xxs, scale) }}>
        <EcolnaProgressBar
          progress={data && data.totalLessons > 0 ? data.completedLessons / data.totalLessons : 0}
          fill={colors.brand}
          height={BAR}
        />
      </View>
    </EcolnaStatCard>,
    <EcolnaStatCard
      key="mastered"
      icon="target"
      label={fr.parent.masteredSkills}
      value={String(data?.masteredSkills ?? 0)}
      container={colors.successTint}
      tint={colors.successInk}
      footerReserve={barSlot}
      style={styles.flex}
    />,
    <EcolnaStatCard
      key="time"
      icon="clock"
      label={fr.parent.timeToday}
      value={fr.parent.minutes(data?.minutesToday ?? 0)}
      container={colors.brandTint}
      tint={colors.brandInk}
      footerReserve={barSlot}
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
      <CardHeader icon="learn" title={fr.parent.bySubject} />
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
              <EcolnaProgressBar progress={ratio} fill={subjectColors[entry.subject].solid} height={BAR} />
            </View>
            <EcolnaText variant="labelLg" style={{ minWidth: scaled(52, scale) }} align="right">
              {fr.parent.percent(Math.round(ratio * 100))}
            </EcolnaText>
          </View>
        );
      })}
    </EcolnaCard>
  );

  const weekCard = week ? <WeekChart week={week} /> : null;

  const analysis = (
    <EcolnaCard rounded="xl" style={[styles.cardGap, splitPanes && styles.grow]}>
      <CardHeader icon="insight" title={fr.parent.progressAnalysis} />
      {(data?.analysis ?? []).map((sentence) => (
        <EcolnaText key={sentence} variant="bodyLg">
          {sentence}
        </EcolnaText>
      ))}
      {data && data.recommendations.length > 0 ? (
        // Une recommandation, pas une alerte : l'encre sur la teinte, seule l'étiquette en bleu.
        <View style={[styles.recommendationBox, { padding: scaled(spacing.md, scale) }]}>
          <EcolnaText variant="tag" color={colors.brandInk}>
            {fr.parent.recommendation}
          </EcolnaText>
          {data.recommendations.map((recommendation) => (
            <EcolnaText key={recommendation} variant="bodyMd" color={colors.ink}>
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

  return (
    <EcolnaScreen background="plain" fullWidth={splitPanes}>
      {/* Tablette : une seule rangée — retour, l'enfant et le titre, puis partager
          et paramètres. Téléphone : le titre passe sous la rangée des boutons. */}
      <EcolnaScreenHeader
        onBack={goBack}
        leading={isTablet ? <EcolnaAvatar avatarId={profile.avatarId} size={scaled(52, scale)} /> : null}
        title={isTablet ? fr.parent.dashboardTitle(profile.firstName) : undefined}
        subtitle={isTablet ? fr.parent.dashboardSubtitle : undefined}
        titleVariant="headlineLg"
        alignTitle="left"
        right={
          <>
            <EcolnaIconButton icon="share" accessibilityLabel={fr.parent.share} onPress={share} />
            <EcolnaIconButton
              icon="gear"
              accessibilityLabel={fr.settings.title}
              onPress={() => router.push('/(settings)')}
            />
          </>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: screenPadding, gap }]}
        showsVerticalScrollIndicator={false}
      >
        {isTablet ? null : (
          <View style={[styles.titleRow, { gap }]}>
            <EcolnaAvatar avatarId={profile.avatarId} size={scaled(48, scale)} />
            <View style={styles.flex}>
              <EcolnaText variant="headlineMd">{fr.parent.dashboardTitle(profile.firstName)}</EcolnaText>
              <EcolnaText variant="bodyMd" color={colors.textSecondary}>
                {fr.parent.dashboardSubtitle}
              </EcolnaText>
            </View>
          </View>
        )}
        {splitPanes ? (
          // Couché : les chiffres et les disciplines à gauche, la semaine et la lecture à droite.
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
              {weekCard}
              {analysis}
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
            {weekCard}
            {analysis}
          </>
        )}
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl, paddingTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  flex2: { flex: 1.6 },
  grow: { flexGrow: 1 },
  cardGap: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  subjectsCard: { gap: spacing.md },
  subjectRow: { flexDirection: 'row', alignItems: 'center' },
  subjectLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.xxs },
  recommendationBox: {
    backgroundColor: colors.brandTint,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  weekRow: { flexDirection: 'row' },
  weekColumn: { flex: 1, alignItems: 'center' },
  weekPlot: { justifyContent: 'flex-end', alignItems: 'center' },
  baseline: { alignSelf: 'stretch', backgroundColor: colors.track },
  weekLabel: { marginTop: spacing.xs },
});
