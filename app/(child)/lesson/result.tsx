import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { getDatabase } from '@/database/connection/database';
import { ACHIEVEMENT_IDS, type AchievementId } from '@/features/achievements/domain/achievements';
import { AchievementBadge } from '@/features/achievements/presentation/achievement-badge';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import { EcolnaAvatar } from '@/design-system/avatars';
import { Confetti } from '@/design-system/components/confetti';
import { StarRow } from '@/design-system/components/star-row';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';

/**
 * La réussite (direction v4) : la nuit du Sahel, le seul écran sombre de
 * l'enfant. Son personnage en joie, cerclé de la vannerie de la carte du
 * jour ; ses étoiles qui éclosent ; une pluie de confettis, une fois ; les
 * badges qu'il vient de gagner ; et tout de suite la suite — un enfant qui
 * vient de réussir veut enchaîner. En paysage, la fête à gauche, les mots et
 * les boutons à droite.
 */
export default function LessonResultScreen() {
  const router = useRouter();
  const { isLandscape, isTablet, scale, screenPadding, width, height } = useResponsive();
  // Côte à côte dès qu'on est couché et qu'il y a la place : un téléphone en
  // paysage n'a pas la hauteur d'empiler le héros au-dessus des boutons.
  const sideBySide = isLandscape && width >= 640;
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

  // Le héros se règle aussi sur la hauteur : un téléphone couché n'a que 400 dp.
  const avatar = Math.min(
    scaled(isTablet ? 176 : 136, scale),
    Math.round(height * (sideBySide ? 0.34 : 0.21)),
  );
  // Deux cercles autour de l'enfant : la vannerie de la carte du jour.
  const halo = Math.round(avatar * 1.62);
  const check = scaled(isTablet ? 48 : 40, scale);

  const celebration = (
    <View style={[styles.celebration, { gap: scaled(spacing.lg, scale) }]}>
      <View style={[styles.center, { width: halo, height: halo }]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width={halo} height={halo}>
            <Circle cx={halo / 2} cy={halo / 2} r={halo / 2 - 1} stroke={colors.onColorTrack} strokeWidth={1.5} fill="none" opacity={0.45} />
            <Circle cx={halo / 2} cy={halo / 2} r={avatar / 2 + (halo - avatar) / 4} stroke={colors.onColorTrack} strokeWidth={1.5} fill="none" />
          </Svg>
        </View>
        <View>
          <EcolnaAvatar avatarId={profile?.avatarId ?? 'avatar-1'} size={avatar} expression="joy" />
          {/* La pastille de réussite, détachée de l'avatar par la nuit. */}
          <View
            style={[
              styles.check,
              { width: check, height: check, borderRadius: check / 2, borderWidth: scaled(4, scale) },
            ]}
          >
            <EcolnaIcon name="check" size={Math.round(check * 0.5)} color={colors.white} />
          </View>
        </View>
      </View>
      <StarRow
        earned={stars}
        size={scaled(isTablet ? 48 : 40, scale)}
        celebrate
        inactiveColor={colors.onColorTrack}
      />
    </View>
  );

  const words = (
    <View style={[styles.words, { gap: scaled(spacing.md, scale) }]}>
      <EcolnaText variant="displayHero" align="center" color={colors.white}>
        {fr.result.title}
      </EcolnaText>
      <EcolnaText variant="bodyLg" color={colors.onNightSecondary} align="center">
        {stars === 3
          ? fr.result.perfect
          : stars === 2
            ? fr.result.oneMoreStar
            : fr.result.needsReview}
      </EcolnaText>

      {newBadges.length > 0 ? (
        // Le badge gagné, sur une feuille blanche : il se lit comme dans la collection.
        <View style={[styles.badges, { gap: scaled(spacing.sm, scale), padding: scaled(spacing.md, scale) }]}>
          <View style={styles.badgeTitle}>
            <EcolnaIcon name="sparkle" size={scaled(20, scale)} mode="color" />
            <EcolnaText variant="labelLg">{fr.achievements.unlocked}</EcolnaText>
          </View>
          <View style={styles.badgeRow}>
            {newBadges.map((id) => (
              <AchievementBadge key={id} id={id} earned size={scaled(72, scale)} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.buttons, { gap: scaled(spacing.sm, scale) }]}>
        {nextLessonId ? (
          <EcolnaButton
            label={fr.result.nextLesson}
            icon={<EcolnaIcon name="play" size={scaled(20, scale)} color={colors.onReward} filled />}
            onPress={() => router.replace(`/(child)/lesson/${nextLessonId}`)}
          />
        ) : (
          <EcolnaButton
            label={fr.common.continue}
            onPress={() => router.replace('/(child)/(tabs)')}
          />
        )}
        {lessonId ? (
          <EcolnaButton
            label={fr.common.replay}
            variant="secondary"
            onDark
            icon={<EcolnaIcon name="replay" size={scaled(20, scale)} color={colors.white} />}
            onPress={() => router.replace(`/(child)/lesson/${lessonId}`)}
          />
        ) : null}
        {nextLessonId ? (
          <EcolnaButton
            label={fr.result.backHome}
            variant="ghost"
            onDark
            onPress={() => router.replace('/(child)/(tabs)')}
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <EcolnaScreen background="night" fullWidth>
      <StatusBar style="light" />
      {/* Centré quand tout tient, défilable sinon (badges, petite fenêtre). */}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: screenPadding,
            paddingVertical: scaled(spacing.lg, scale),
            gap: scaled(spacing.xl, scale),
          },
          sideBySide && styles.split,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {celebration}
        {words}
      </ScrollView>
      <Confetti width={width} height={height} />
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  split: { flexDirection: 'row', justifyContent: 'space-evenly' },
  celebration: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  check: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderColor: colors.night,
  },
  words: { width: '100%', maxWidth: 520, alignItems: 'stretch' },
  badges: { alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl },
  badgeTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  buttons: { marginTop: spacing.sm },
});
