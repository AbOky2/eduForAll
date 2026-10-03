import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { lessonForSkill } from '@/features/curriculum/application/curriculum-catalog';
import { describeSkill } from '@/features/parent-space/application/parent-dashboard';
import { REVISION_BATCH } from '@/features/revision/domain/revision-engine';
import { createRevisionRepository } from '@/features/revision/infrastructure/revision-repository';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import {
  EcolnaButton,
  EcolnaCard,
  EcolnaIconButton,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

interface RevisionItem {
  skillId: string;
  label: string;
  lessonId: string | null;
}

/** Une couleur de famille par notion, en rotation : chaque carte se distingue. */
const NOTION_TINTS = (['math', 'language', 'writing', 'reading'] as const).map(
  (family) => subjectColors[family],
);

/**
 * L'atelier de révision (mockup S17, direction v3). On ne dit pas « tu as
 * échoué » : on fait pousser ce qui est encore fragile — la pousse en est le
 * signe. Les notions à revoir, chacune sur sa carte, et un seul grand bouton.
 */
export default function RevisionScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { scale, isTablet, splitPanes, screenPadding } = useResponsive();
  const profile = useActiveProfile((state) => state.profile);
  const items: RevisionItem[] =
    useFocusedData(
      () =>
        profile
          ? getDatabase()
              .then((db) =>
                createRevisionRepository(db).findOpen(profile.id, REVISION_BATCH, new Date().toISOString()),
              )
              // Each struggled skill maps back to the first lesson that trains it.
              .then((open) =>
                // Le motif du moteur est écrit pour un adulte : il reste à
                // l'espace parent. L'enfant voit la notion, pas le reproche.
                open.map(({ skillId }) => ({
                  skillId,
                  label: describeSkill(skillId),
                  lessonId: lessonForSkill(skillId),
                })),
              )
          : null,
      profile?.id ?? null,
    ) ?? [];

  const firstLesson = items.find((item) => item.lessonId)?.lessonId ?? null;
  const gap = scaled(spacing.lg, scale);
  const disc = scaled(isTablet ? 132 : 104, scale);

  const intro = (
    <View style={[styles.intro, { gap: scaled(spacing.sm, scale) }]}>
      <View style={[styles.sproutDisc, { width: disc, height: disc, borderRadius: disc / 2 }]}>
        <EcolnaIcon name="sprout" size={Math.round(disc * 0.7)} mode="color" />
      </View>
      <EcolnaText variant={isTablet ? 'displayHero' : 'headlineLg'} align="center">
        {fr.revision.title}
      </EcolnaText>
      <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
        {fr.revision.subtitle}
      </EcolnaText>
    </View>
  );

  const work =
    items.length === 0 ? (
      <EcolnaCard rounded="xl" style={styles.emptyCard}>
        <EcolnaIcon name="star" size={scaled(56, scale)} mode="color" />
        <EcolnaText variant="headlineSm" align="center">
          {fr.revision.empty}
        </EcolnaText>
      </EcolnaCard>
    ) : (
      <View style={{ gap }}>
        <View style={[styles.grid, { gap: scaled(spacing.md, scale) }]}>
          {items.map((item, index) => {
            const tint = NOTION_TINTS[index % NOTION_TINTS.length] ?? subjectColors.math;
            return (
              <EcolnaCard
                key={item.skillId}
                rounded="xl"
                backgroundColor={tint.face}
                style={[styles.notionCard, { minHeight: scaled(96, scale) }]}
              >
                <EcolnaText variant="headlineMd" align="center" color={tint.ink}>
                  {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                </EcolnaText>
              </EcolnaCard>
            );
          })}
        </View>
        <EcolnaButton
          label={fr.revision.start}
          icon={<EcolnaIcon name="play" size={scaled(20, scale)} color={colors.onSun} />}
          disabled={!firstLesson}
          onPress={() => firstLesson && router.push(`/(child)/lesson/${firstLesson}`)}
        />
      </View>
    );

  return (
    <EcolnaScreen background="default" fullWidth={splitPanes}>
      <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
        <EcolnaIconButton icon="arrow-back" accessibilityLabel={fr.common.back} onPress={goBack} />
      </View>
      {splitPanes ? (
        <View style={[styles.split, { paddingHorizontal: screenPadding, gap: scaled(spacing.xxl, scale) }]}>
          <View style={styles.pane}>{intro}</View>
          <View style={styles.pane}>{work}</View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: screenPadding, gap: scaled(spacing.xl, scale) }]}
          showsVerticalScrollIndicator={false}
        >
          {intro}
          {work}
        </ScrollView>
      )}
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: spacing.sm },
  split: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  pane: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  intro: { alignItems: 'center' },
  sproutDisc: {
    backgroundColor: colors.feedbackCorrectContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  notionCard: { width: '47%', flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
});
