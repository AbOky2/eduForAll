import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { lessonForSkill } from '@/features/curriculum/application/curriculum-catalog';
import { describeSkill } from '@/features/parent-space/application/parent-dashboard';
import { createRevisionRepository } from '@/features/revision/infrastructure/revision-repository';
import { EcolnaScreenHeader } from '@/design-system/components/ecolna-screen-header';
import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

interface RevisionItem {
  skillId: string;
  label: string;
  lessonId: string | null;
}

/** Revision screen — mockup S17. Gentle framing, notion cards, one big CTA. */
export default function RevisionScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const profile = useActiveProfile((state) => state.profile);
  const items: RevisionItem[] =
    useFocusedData(
      () =>
        profile
          ? getDatabase()
              .then((db) =>
                createRevisionRepository(db).findOpen(profile.id, 4, new Date().toISOString()),
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

  return (
    <EcolnaScreen background="default">
      <EcolnaScreenHeader onBack={goBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.leafBadge}>
          <EcolnaIcon name="leaf" size={30} color={colors.onTertiaryContainer} />
        </View>
        <EcolnaText variant="headlineLg" align="center">
          {fr.revision.title}
        </EcolnaText>
        <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.revision.subtitle}
        </EcolnaText>

        {items.length === 0 ? (
          <EcolnaCard rounded="xl" style={styles.emptyCard}>
            <EcolnaIcon name="star" size={32} color={colors.starActive} />
            <EcolnaText variant="bodyLg" align="center">
              {fr.revision.empty}
            </EcolnaText>
          </EcolnaCard>
        ) : (
          <>
            <View style={styles.grid}>
              {items.map((item, index) => (
                <EcolnaCard key={item.skillId} style={styles.notionCard}>
                  <EcolnaText variant="headlineSm" align="center">
                    {item.label}
                  </EcolnaText>
                  <View
                    style={[
                      styles.underline,
                      {
                        backgroundColor: [
                          colors.primaryContainer,
                          colors.secondaryContainer,
                          '#f3c6c2',
                          colors.tertiaryFixed,
                        ][index % 4],
                      },
                    ]}
                  />
                </EcolnaCard>
              ))}
            </View>
            <EcolnaButton
              label={fr.revision.start}
              icon={<EcolnaIcon name="play" size={16} color={colors.onPrimaryContainer} />}
              disabled={!firstLesson}
              onPress={() => firstLesson && router.push(`/(child)/lesson/${firstLesson}`)}
            />
          </>
        )}
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.screenMargin,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  leafBadge: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  notionCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  underline: { width: 36, height: 4, borderRadius: 2 },
});
