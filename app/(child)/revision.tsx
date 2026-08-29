import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { lessonForSkill } from '@/features/curriculum/application/curriculum-catalog';
import { describeSkill } from '@/features/parent-space/application/parent-dashboard';
import { AlifaButton, AlifaCard, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

interface RevisionItem {
  skillId: string;
  label: string;
  lessonId: string | null;
}

/** Revision screen — mockup S17. Gentle framing, notion cards, one big CTA. */
export default function RevisionScreen() {
  const router = useRouter();
  const profile = useActiveProfile((state) => state.profile);
  const [items, setItems] = useState<RevisionItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!profile) {
        return undefined;
      }
      void (async () => {
        const db = await getDatabase();
        const rows = await db.getAllAsync<{ skill_id: string }>(
          `SELECT skill_id FROM revision_queue
           WHERE child_profile_id = ? AND resolved_at IS NULL
           ORDER BY due_at LIMIT 4`,
          profile.id,
        );
        // Each struggled skill maps back to the first lesson that trains it.
        const built = rows.map((row) => ({
          skillId: row.skill_id,
          label: describeSkill(row.skill_id),
          lessonId: lessonForSkill(row.skill_id),
        }));
        if (!cancelled) {
          setItems(built);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [profile]),
  );

  const firstLesson = items.find((item) => item.lessonId)?.lessonId ?? null;

  return (
    <AlifaScreen background="default">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.leafBadge}>
          <AlifaIcon name="leaf" size={30} color={colors.onTertiaryContainer} />
        </View>
        <AlifaText variant="headlineLg" align="center">
          {fr.revision.title}
        </AlifaText>
        <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.revision.subtitle}
        </AlifaText>

        {items.length === 0 ? (
          <AlifaCard rounded="xl" style={styles.emptyCard}>
            <AlifaIcon name="star" size={32} color={colors.starActive} />
            <AlifaText variant="bodyLg" align="center">
              {fr.revision.empty}
            </AlifaText>
          </AlifaCard>
        ) : (
          <>
            <View style={styles.grid}>
              {items.map((item, index) => (
                <AlifaCard key={item.skillId} style={styles.notionCard}>
                  <AlifaText variant="headlineSm" align="center">
                    {item.label}
                  </AlifaText>
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
                </AlifaCard>
              ))}
            </View>
            <AlifaButton
              label={fr.revision.start}
              icon={<AlifaIcon name="play" size={16} color={colors.onPrimaryContainer} />}
              disabled={!firstLesson}
              onPress={() => firstLesson && router.push(`/(child)/lesson/${firstLesson}`)}
            />
          </>
        )}
      </ScrollView>
    </AlifaScreen>
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
