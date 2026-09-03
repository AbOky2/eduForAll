import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { ACHIEVEMENT_IDS, type AchievementId } from '@/features/achievements/domain/achievements';
import { AchievementBadge } from '@/features/achievements/presentation/achievement-badge';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { avatarVariant } from '@/features/child-profile/domain/child-profile';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import { StarRow } from '@/design-system/components/star-row';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { AvatarFace } from '@/design-system/illustrations/scenes';
import { AlifaButton, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';

/** Lesson success (mockup S16): stars, avatar with check badge, warm words. */
export default function LessonResultScreen() {
  const router = useRouter();
  const {
    stars: starsParam,
    lessonId,
    badges: badgesParam,
  } = useLocalSearchParams<{ stars?: string; lessonId?: string; badges?: string }>();
  const profile = useActiveProfile((state) => state.profile);

  // Chaîner directement sur la leçon suivante : un enfant qui vient de réussir
  // veut enchaîner, pas repasser par un menu.
  const nextLessonId = useFocusedData(
    () =>
      profile
        ? getDatabase()
            .then((db) => createProgressRepository(db).findNextRecommendedLesson(profile.id))
            .then((next) => (next && next.lessonId !== lessonId ? (next.lessonId as string) : null))
        : null,
    profile ? `${profile.id}:${lessonId ?? ''}` : null,
  );

  const stars = Math.min(3, Math.max(1, Number(starsParam ?? '1')));
  // Only ids the app still knows about — a badge removed from the catalogue
  // must not crash a result screen reached from an old navigation state.
  const newBadges = (badgesParam ?? '')
    .split(',')
    .filter((id): id is AchievementId => (ACHIEVEMENT_IDS as readonly string[]).includes(id));

  return (
    <AlifaScreen background="default">
      <View style={styles.container}>
        <StarRow earned={stars} />

        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <AvatarFace variant={avatarVariant(profile?.avatarId ?? '')} size={96} />
          </View>
          <View style={styles.checkBadge}>
            <AlifaIcon name="check" size={16} color={colors.onSecondary} />
          </View>
        </View>

        <AlifaText variant="headlineLg" align="center">
          {fr.result.title}
        </AlifaText>
        <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
          {stars === 3 ? fr.result.perfect : stars === 2 ? fr.result.oneMoreStar : fr.result.needsReview}
        </AlifaText>

        {newBadges.length > 0 ? (
          <View style={styles.badges}>
            <AlifaText variant="labelLg" color={colors.primary} align="center">
              {fr.achievements.unlocked}
            </AlifaText>
            <View style={styles.badgeRow}>
              {newBadges.map((id) => (
                <AchievementBadge key={id} id={id} earned size={64} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.buttons}>
          {nextLessonId ? (
            <AlifaButton
              label={fr.result.nextLesson}
              icon={<AlifaIcon name="play" size={16} color={colors.onPrimaryContainer} />}
              onPress={() => router.replace(`/(child)/lesson/${nextLessonId}`)}
            />
          ) : (
            <AlifaButton label={fr.common.continue} onPress={() => router.replace('/(child)/(tabs)')} />
          )}
          {lessonId ? (
            <AlifaButton
              label={fr.common.replay}
              variant="secondary"
              icon={<AlifaIcon name="replay" size={18} color={colors.secondary} />}
              onPress={() => router.replace(`/(child)/lesson/${lessonId}`)}
            />
          ) : null}
          {nextLessonId ? (
            <AlifaButton
              label={fr.result.backHome}
              variant="ghost"
              onPress={() => router.replace('/(child)/(tabs)')}
            />
          ) : null}
        </View>
      </View>
    </AlifaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  avatarWrap: { alignSelf: 'center' },
  avatarRing: { borderRadius: 60, borderWidth: 4, borderColor: colors.card, overflow: 'hidden' },
  checkBadge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: { gap: spacing.sm, alignItems: 'center' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
  buttons: { gap: spacing.md, marginTop: spacing.lg },
});
