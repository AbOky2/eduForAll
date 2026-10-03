import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { ACHIEVEMENT_IDS, type AchievementId } from '@/features/achievements/domain/achievements';
import { AchievementBadge } from '@/features/achievements/presentation/achievement-badge';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import { EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaPill } from '@/design-system/components/ecolna-pill';
import { StarRow } from '@/design-system/components/star-row';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { SunBurst } from '@/design-system/illustrations/backdrops';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';

/**
 * La réussite (mockup S16, direction v3). L'enfant, en joie, au cœur d'un
 * soleil ; ses étoiles qui éclosent ; les badges qu'il vient de gagner ; et
 * tout de suite la suite — un enfant qui vient de réussir veut enchaîner.
 * En paysage, la fête à gauche, les mots et les boutons à droite.
 */
export default function LessonResultScreen() {
  const router = useRouter();
  const { splitPanes, isTablet, scale, screenPadding } = useResponsive();
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

  const avatar = scaled(isTablet ? 168 : 132, scale);
  const burst = Math.round(avatar * 2.1);
  const check = scaled(isTablet ? 44 : 36, scale);

  const celebration = (
    <View style={[styles.celebration, { gap: scaled(spacing.md, scale) }]}>
      <StarRow earned={stars} size={scaled(isTablet ? 56 : 44, scale)} celebrate />
      <View style={{ width: burst, height: burst * 0.78, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[styles.burst, { width: burst, height: burst, top: -burst * 0.11 }]}>
          <SunBurst size={burst} />
        </View>
        <View>
          <View style={[styles.avatarRing, { borderRadius: avatar }]}>
            <EcolnaAvatar avatarId={profile?.avatarId ?? 'avatar-1'} size={avatar} expression="joy" />
          </View>
          {/* La coche du palier M en mode couleur EST un disque vert : un liseré
              blanc la détache de l'avatar, sans second disque autour. */}
          <View style={[styles.check, { borderRadius: check }]}>
            <EcolnaIcon name="check" size={check} mode="color" />
          </View>
        </View>
      </View>
    </View>
  );

  const words = (
    <View style={[styles.words, { gap: scaled(spacing.md, scale) }]}>
      <EcolnaText variant="displayHero" align="center">
        {fr.result.title}
      </EcolnaText>
      <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
        {stars === 3 ? fr.result.perfect : stars === 2 ? fr.result.oneMoreStar : fr.result.needsReview}
      </EcolnaText>

      {newBadges.length > 0 ? (
        <View style={[styles.badges, { gap: scaled(spacing.sm, scale) }]}>
          <EcolnaPill tone="sun" variant="buttonSm" label={fr.achievements.unlocked} style={styles.center} />
          <View style={styles.badgeRow}>
            {newBadges.map((id) => (
              <AchievementBadge key={id} id={id} earned size={scaled(80, scale)} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.buttons, { gap: scaled(spacing.sm, scale) }]}>
        {nextLessonId ? (
          <EcolnaButton
            label={fr.result.nextLesson}
            icon={<EcolnaIcon name="play" size={scaled(20, scale)} color={colors.onSun} />}
            onPress={() => router.replace(`/(child)/lesson/${nextLessonId}`)}
          />
        ) : (
          <EcolnaButton label={fr.common.continue} onPress={() => router.replace('/(child)/(tabs)')} />
        )}
        {lessonId ? (
          <EcolnaButton
            label={fr.common.replay}
            variant="secondary"
            icon={<EcolnaIcon name="replay" size={scaled(20, scale)} color={colors.secondary} />}
            onPress={() => router.replace(`/(child)/lesson/${lessonId}`)}
          />
        ) : null}
        {nextLessonId ? (
          <EcolnaButton
            label={fr.result.backHome}
            variant="ghost"
            onPress={() => router.replace('/(child)/(tabs)')}
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <EcolnaScreen background="default" fullWidth>
      <View
        style={[
          styles.container,
          { paddingHorizontal: screenPadding, gap: scaled(spacing.xl, scale) },
          splitPanes && styles.split,
        ]}
      >
        {celebration}
        {words}
      </View>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  split: { flexDirection: 'row', justifyContent: 'space-evenly' },
  celebration: { alignItems: 'center' },
  burst: { position: 'absolute' },
  avatarRing: { borderWidth: 6, borderColor: colors.card, backgroundColor: colors.card },
  check: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    backgroundColor: colors.card,
    padding: 3,
  },
  words: { width: '100%', maxWidth: 520, alignItems: 'stretch' },
  badges: { alignItems: 'center' },
  center: { alignSelf: 'center' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  buttons: { marginTop: spacing.xs },
});
