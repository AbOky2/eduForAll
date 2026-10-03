import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  findLesson,
  lessonForSkill,
  worldOfLesson,
} from '@/features/curriculum/application/curriculum-catalog';
import { describeSkill } from '@/features/parent-space/application/parent-dashboard';
import { REVISION_BATCH } from '@/features/revision/domain/revision-engine';
import { createRevisionRepository } from '@/features/revision/infrastructure/revision-repository';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '@/design-system/icons/subject-art';
import {
  EcolnaButton,
  EcolnaCard,
  EcolnaIconButton,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

interface RevisionItem {
  skillId: string;
  label: string;
  lessonId: string | null;
  subject: SubjectArtId | null;
}

/**
 * L'atelier de révision (direction v4). On ne dit pas « tu as échoué » : on
 * fait pousser ce qui est encore fragile — la pousse en est le signe. Les
 * notions à revoir, une par ligne avec l'emblème de leur discipline, et un
 * seul grand bouton.
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
                createRevisionRepository(db).findOpen(
                  profile.id,
                  REVISION_BATCH,
                  new Date().toISOString(),
                ),
              )
              // Each struggled skill maps back to the first lesson that trains it.
              .then((open) =>
                // Le motif du moteur est écrit pour un adulte : il reste à
                // l'espace parent. L'enfant voit la notion, pas le reproche.
                open.map(({ skillId }) => {
                  const lessonId = lessonForSkill(skillId);
                  // L'enfant lit le nom de la leçon (« Ma maison : l'histoire »),
                  // jamais un identifiant de compétence.
                  const lesson = lessonId ? findLesson(lessonId) : null;
                  return {
                    skillId,
                    label: lesson?.title ?? describeSkill(skillId),
                    lessonId,
                    subject: lessonId ? (worldOfLesson(lessonId)?.subject ?? null) : null,
                  };
                }),
              )
          : null,
      profile?.id ?? null,
    ) ?? [];

  const firstLesson = items.find((item) => item.lessonId)?.lessonId ?? null;
  const gap = scaled(spacing.lg, scale);
  const disc = scaled(isTablet ? 120 : 96, scale);

  const intro = (
    <View style={[styles.intro, { gap: scaled(spacing.sm, scale) }]}>
      <View style={[styles.sproutDisc, { width: disc, height: disc, borderRadius: disc / 2 }]}>
        <EcolnaIcon name="replay" size={Math.round(disc * 0.5)} color={colors.brand} />
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
        <EcolnaIcon name="star" size={scaled(56, scale)} color={colors.reward} filled />
        <EcolnaText variant="headlineSm" align="center">
          {fr.revision.empty}
        </EcolnaText>
      </EcolnaCard>
    ) : (
      <View style={{ gap }}>
        {/* Une liste, comme une page de cahier : chaque notion sur sa ligne,
            l'emblème de sa discipline devant. */}
        <EcolnaCard rounded="xl" padded={false}>
          {items.map((item, index) => (
            // Chaque notion s'ouvre sur sa leçon : ce qui ressemble à une ligne de liste se touche.
            <Pressable
              key={item.skillId}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              disabled={!item.lessonId}
              onPress={() => item.lessonId && router.push(`/(child)/lesson/${item.lessonId}`)}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowRule,
                {
                  gap: scaled(spacing.md, scale),
                  padding: scaled(spacing.md, scale),
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              {item.subject ? (
                <SubjectArt subject={item.subject} size={scaled(40, scale)} />
              ) : (
                <View
                  style={[styles.leaf, { width: scaled(40, scale), height: scaled(40, scale) }]}
                >
                  <EcolnaIcon
                    name="sprout"
                    size={scaled(24, scale)}
                    color={colors.success}
                    filled
                  />
                </View>
              )}
              <EcolnaText variant="headlineSm" style={styles.flex}>
                {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
              </EcolnaText>
              {item.lessonId ? (
                <EcolnaIcon name="chevron-right" size={scaled(22, scale)} color={colors.brand} />
              ) : null}
            </Pressable>
          ))}
        </EcolnaCard>
        {firstLesson ? (
          <EcolnaButton
            label={fr.revision.start}
            icon={
              <EcolnaIcon name="play" size={scaled(20, scale)} color={colors.onReward} filled />
            }
            onPress={() => router.push(`/(child)/lesson/${firstLesson}`)}
          />
        ) : (
          // Aucune leçon ne cible encore ces notions : pas de bouton mort, une phrase.
          <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
            {fr.revision.inLessons}
          </EcolnaText>
        )}
      </View>
    );

  return (
    <EcolnaScreen background="default" fullWidth={splitPanes}>
      <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
        <EcolnaIconButton icon="arrow-back" accessibilityLabel={fr.common.back} onPress={goBack} />
      </View>
      {splitPanes && items.length > 2 ? (
        <View
          style={[
            styles.split,
            { paddingHorizontal: screenPadding, gap: scaled(spacing.xxl, scale) },
          ]}
        >
          <View style={styles.pane}>{intro}</View>
          <View style={styles.pane}>{work}</View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: screenPadding, gap: scaled(spacing.xl, scale) },
          ]}
          style={styles.column}
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
  scroll: { paddingBottom: spacing.xxl, flexGrow: 1, justifyContent: 'center' },
  // Une ou deux notions : une seule colonne centrée, lisible d'un coup d'œil.
  column: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  intro: { alignItems: 'center' },
  sproutDisc: {
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowRule: { borderTopWidth: 1, borderTopColor: colors.border },
  leaf: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.successTint,
  },
  flex: { flex: 1 },
});
