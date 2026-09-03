import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { loadAchievementBoard } from '@/features/achievements/application/sync-achievements';
import { ACHIEVEMENT_IDS } from '@/features/achievements/domain/achievements';
import { AchievementBadge } from '@/features/achievements/presentation/achievement-badge';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { AVATAR_IDS, avatarVariant } from '@/features/child-profile/domain/child-profile';
import { createChildProfileRepository } from '@/features/child-profile/infrastructure/child-profile-repository';
import { AlifaScreenHeader } from '@/design-system/components/alifa-screen-header';
import { AlifaStatCard } from '@/design-system/components/alifa-stat-card';
import { AvatarFace } from '@/design-system/illustrations/scenes';
import { AlifaScreen, AlifaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * « Mon profil » — reached by tapping the avatar on the home screen.
 * Child-facing on purpose: their face, their numbers, their badges. Anything
 * a parent may change (level, reset) stays behind the parent gate.
 */
export default function ChildProfileScreen() {
  const goBack = useSafeBack();
  const { scale } = useResponsive();
  const profile = useActiveProfile((state) => state.profile);
  const setProfile = useActiveProfile((state) => state.setProfile);
  const board = useFocusedData(
    () => (profile ? loadAchievementBoard(profile.id) : null),
    profile?.id ?? null,
  );
  const earnedSet = useMemo(() => new Set(board?.earned ?? []), [board]);

  if (!profile) {
    return null;
  }
  const stats = board?.stats ?? null;

  const chooseAvatar = (avatarId: (typeof AVATAR_IDS)[number]) => {
    void getDatabase()
      .then((db) => createChildProfileRepository(db).updateAvatar(profile.id, avatarId))
      .then((updated) => {
        if (updated) {
          setProfile(updated);
        }
      });
  };

  return (
    <AlifaScreen background="default">
      <AlifaScreenHeader onBack={goBack} title={fr.childProfile.title} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatarRing}>
            <AvatarFace variant={avatarVariant(profile.avatarId)} size={scaled(104, scale)} />
          </View>
          <AlifaText variant="headlineLg" align="center">
            {profile.firstName}
          </AlifaText>
          <View style={styles.levelPill}>
            <AlifaText variant="labelMd" color={colors.onSecondaryContainer}>
              {fr.learn.levelTitle(profile.level)}
            </AlifaText>
          </View>
        </View>

        <View style={styles.statRow}>
          <AlifaStatCard
            orientation="column"
            icon="book"
            value={String(stats?.completedLessons ?? 0)}
            label={fr.childProfile.lessonsDone}
            container={colors.primaryContainer}
            tint={colors.onPrimaryContainer}
          />
          <AlifaStatCard
            orientation="column"
            icon="star"
            value={String(stats?.totalStars ?? 0)}
            label={fr.childProfile.starsEarned}
            container={colors.tertiaryFixed}
            tint={colors.starActive}
          />
          <AlifaStatCard
            orientation="column"
            icon="flame"
            value={String(stats?.bestStreakDays ?? 0)}
            label={fr.childProfile.bestStreak}
            container={colors.secondaryContainer}
            tint={colors.onSecondaryContainer}
          />
        </View>

        <AlifaText variant="headlineSm">{fr.childProfile.changeAvatar}</AlifaText>
        <View style={styles.avatarRow}>
          {AVATAR_IDS.map((candidate, index) => {
            const selected = candidate === profile.avatarId;
            return (
              <Pressable
                key={candidate}
                accessibilityRole="radio"
                accessibilityLabel={`Avatar ${index + 1}`}
                accessibilityState={{ selected }}
                onPress={() => chooseAvatar(candidate)}
                style={[styles.avatarChoice, selected && styles.avatarChoiceSelected]}
              >
                <AvatarFace variant={avatarVariant(candidate)} size={56} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.badgeHeader}>
          <AlifaText variant="headlineSm">{fr.achievements.title}</AlifaText>
          <AlifaText variant="labelMd" color={colors.textSecondary}>
            {fr.achievements.countEarned(earnedSet.size, ACHIEVEMENT_IDS.length)}
          </AlifaText>
        </View>
        <AlifaText variant="bodyMd" color={colors.textSecondary}>
          {fr.achievements.subtitle}
        </AlifaText>
        <View style={styles.badgeGrid}>
          {ACHIEVEMENT_IDS.map((id) => (
            <AchievementBadge key={id} id={id} earned={earnedSet.has(id)} size={scaled(64, scale)} />
          ))}
        </View>
      </ScrollView>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.screenMargin, paddingBottom: spacing.xxl, gap: spacing.md },
  identity: { alignItems: 'center', gap: spacing.xs },
  avatarRing: { borderRadius: radius.pill, borderWidth: 4, borderColor: colors.card, overflow: 'hidden' },
  levelPill: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  avatarRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  avatarChoice: { borderRadius: radius.pill, borderWidth: 3, borderColor: 'transparent', padding: 2 },
  avatarChoiceSelected: { borderColor: colors.primary },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
});
