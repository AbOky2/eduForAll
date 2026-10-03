import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { getDatabase } from '@/database/connection/database';
import { ACHIEVEMENT_IDS, type AchievementId } from '@/features/achievements/domain/achievements';
import { AchievementBadge } from '@/features/achievements/presentation/achievement-badge';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { worldOfLesson } from '@/features/curriculum/application/curriculum-catalog';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import { EcolnaAvatar } from '@/design-system/avatars';
import { Confetti } from '@/design-system/components/confetti';
import { StarRow } from '@/design-system/components/star-row';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { SubjectArt } from '@/design-system/icons/subject-art';
import {
  EcolnaButton,
  EcolnaIconButton,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y, colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';

/** Le halo : deux cercles autour de l'enfant (la vannerie de la carte du jour). */
const HALO = 1.62;
/** L'étoile du milieu de `StarRow` est en majesté : 1,35 fois plus grande, et relevée. */
const STAR_MIDDLE = 1.35;

/**
 * La réussite (direction v4) : la nuit du Sahel, le seul écran sombre de
 * l'enfant. Couché, deux colonnes sur un même axe : à gauche la fête — ses
 * étoiles posées au-dessus de lui, l'enfant en joie dans sa vannerie ; à
 * droite les mots — ce qu'il vient d'apprendre (la discipline et la leçon),
 * « Bravo ! », ses étoiles dites, ses nouvelles médailles, et tout de suite
 * la suite : un enfant qui vient de réussir veut enchaîner. Debout, le même
 * ordre de haut en bas.
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

  // Ce qu'on vient d'apprendre : la discipline (son emblème) et le titre de la leçon.
  const world = lessonId ? worldOfLesson(lessonId) : null;
  const lessonTitle = world?.lessons.find((lesson) => lesson.id === lessonId)?.title ?? null;

  // Le bouton fermer occupe le haut : le contenu, centré, ne passe jamais dessous.
  const closeSize = Math.max(a11y.minTouchTarget, scaled(52, scale));
  const edge = closeSize + 2 * spacing.sm;

  const starSize = scaled(isTablet ? 48 : 40, scale);
  const starsHeight = Math.round(starSize * STAR_MIDDLE) + spacing.sm;
  const starsGap = scaled(spacing.md, scale);
  // Le héros se règle sur la hauteur : couché, les étoiles et la vannerie
  // tiennent ensemble dans la colonne ; debout, l'enfant garde un cinquième
  // de l'écran pour laisser les mots et les boutons sous lui.
  const avatar = Math.round(
    Math.min(
      scaled(isTablet ? 176 : 136, scale),
      sideBySide ? (height - 2 * edge - starsHeight - starsGap) / HALO : height * 0.2,
    ),
  );
  const halo = Math.round(avatar * HALO);
  const check = scaled(isTablet ? 48 : 40, scale);

  const celebration = (
    <View style={[styles.celebration, { gap: starsGap }]}>
      <StarRow earned={stars} size={starSize} celebrate inactiveColor={colors.onColorSoft} onDark />
      <View style={[styles.center, { width: halo, height: halo }]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width={halo} height={halo}>
            <Circle
              cx={halo / 2}
              cy={halo / 2}
              r={halo / 2 - 1}
              stroke={colors.onColorTrack}
              strokeWidth={1.5}
              fill="none"
              opacity={0.45}
            />
            <Circle
              cx={halo / 2}
              cy={halo / 2}
              r={avatar / 2 + (halo - avatar) / 4}
              stroke={colors.onColorTrack}
              strokeWidth={1.5}
              fill="none"
            />
          </Svg>
        </View>
        <View>
          <EcolnaAvatar avatarId={profile?.avatarId ?? 'avatar-1'} size={avatar} expression="joy" />
          {/* La pastille de réussite, détachée de l'avatar par la nuit. */}
          <View
            style={[
              styles.check,
              {
                width: check,
                height: check,
                borderRadius: check / 2,
                borderWidth: scaled(4, scale),
              },
            ]}
          >
            <EcolnaIcon name="check" size={Math.round(check * 0.5)} color={colors.white} />
          </View>
        </View>
      </View>
    </View>
  );

  // La discipline et la leçon : une puce de verre, l'emblème en couleur.
  const lessonChip =
    world && lessonTitle ? (
      <View
        style={[
          styles.chip,
          {
            gap: scaled(spacing.xs, scale),
            paddingVertical: scaled(spacing.xxs, scale),
            paddingLeft: scaled(spacing.xxs, scale),
            paddingRight: scaled(spacing.md, scale),
          },
        ]}
        accessible
        accessibilityLabel={`${fr.subjects[world.subject]} : ${lessonTitle}`}
      >
        <SubjectArt subject={world.subject} size={scaled(28, scale)} />
        <EcolnaText
          variant="labelLg"
          color={colors.onNightSecondary}
          numberOfLines={1}
          style={styles.shrink}
        >
          {lessonTitle}
        </EcolnaText>
      </View>
    ) : null;

  // Les médailles gagnées : une rangée compacte de puces (médaille et nom).
  const badges =
    newBadges.length > 0 ? (
      <View style={[styles.badges, { gap: scaled(spacing.sm, scale) }]}>
        <View style={styles.badgeTitle}>
          <EcolnaIcon name="sparkle" size={scaled(18, scale)} mode="color" />
          <EcolnaText variant="labelLg" color={colors.white}>
            {newBadges.length > 1 ? fr.achievements.unlockedMany : fr.achievements.unlocked}
          </EcolnaText>
        </View>
        <View style={[styles.badgeRow, { gap: scaled(spacing.sm, scale) }]}>
          {newBadges.map((id) => (
            <AchievementBadge
              key={id}
              id={id}
              earned
              size={scaled(40, scale)}
              onDark
              layout="inline"
            />
          ))}
        </View>
      </View>
    ) : null;

  const words = (
    <View style={[styles.words, sideBySide && styles.wordsSide]}>
      {lessonChip}
      {/* Lu d'un trait par le lecteur d'écran. */}
      <View
        accessible
        accessibilityRole="header"
        accessibilityLabel={fr.result.title}
        style={{ marginTop: lessonChip ? scaled(spacing.md, scale) : 0 }}
      >
        <EcolnaText
          variant="displayHero"
          align="center"
          color={colors.white}
          style={{
            fontSize: scaled(isTablet ? 52 : 40, scale),
            lineHeight: scaled(isTablet ? 60 : 48, scale),
            letterSpacing: -1,
          }}
        >
          {fr.result.bravo}
        </EcolnaText>
      </View>
      <EcolnaText
        variant="bodyLg"
        color={colors.onNightSecondary}
        align="center"
        style={{ marginTop: scaled(spacing.xxs, scale) }}
      >
        {stars === 3
          ? fr.result.perfect
          : stars === 2
            ? fr.result.oneMoreStar
            : fr.result.needsReview}
      </EcolnaText>

      {badges ? <View style={{ marginTop: scaled(spacing.lg, scale) }}>{badges}</View> : null}

      <View
        style={[
          styles.buttons,
          { gap: scaled(spacing.sm, scale), marginTop: scaled(spacing.xl, scale) },
        ]}
      >
        {nextLessonId ? (
          <EcolnaButton
            label={fr.result.nextLesson}
            icon={
              <EcolnaIcon name="play" size={scaled(20, scale)} color={colors.onReward} filled />
            }
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
      </View>
    </View>
  );

  return (
    <EcolnaScreen background="night" fullWidth>
      <StatusBar style="light" />
      {/* Revenir à l'accueil : la croix de la leçon, en haut, hors du moment de fête. */}
      <View style={[styles.close, { paddingHorizontal: screenPadding }]}>
        <EcolnaIconButton
          icon="close"
          tone="glass"
          accessibilityLabel={fr.result.backHome}
          onPress={() => router.replace('/(child)/(tabs)')}
        />
      </View>
      {/* Centré quand tout tient, défilable sinon (badges, petite fenêtre). */}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: screenPadding,
            paddingVertical: edge,
            gap: scaled(sideBySide ? spacing.xxl : spacing.xl, scale),
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
  // Une seule ligne médiane : les deux colonnes centrées sur le même axe.
  split: { flexDirection: 'row' },
  celebration: { alignItems: 'center', justifyContent: 'center' },
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
  words: { width: '100%', maxWidth: 520, alignItems: 'stretch', justifyContent: 'center' },
  wordsSide: { flexShrink: 1, maxWidth: 480 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.onColorGlass,
  },
  shrink: { flexShrink: 1 },
  badges: { alignItems: 'center' },
  close: { position: 'absolute', top: spacing.sm, left: 0, zIndex: 2 },
  badgeTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  buttons: {},
});
