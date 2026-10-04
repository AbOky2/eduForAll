import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { getDatabase } from '@/database/connection/database';
import { ACHIEVEMENT_IDS, type AchievementId } from '@/features/achievements/domain/achievements';
import { AchievementBadge } from '@/features/achievements/presentation/achievement-badge';
import { medalRowLayout } from '@/features/achievements/presentation/medal-row-layout';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { worldOfLesson } from '@/features/curriculum/application/curriculum-catalog';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { EcolnaAvatar } from '@/design-system/avatars';
import type { BadgeLabelVariant } from '@/design-system/components/badge-tile';
import { Confetti } from '@/design-system/components/confetti';
import {
  STAR_MIDDLE_RATIO,
  StarRow,
  starsPeakAt,
} from '@/design-system/components/star-row';
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

/** La vannerie entière (anneau pointillé compris), rapportée à l'enfant. */
const HALO = 1.62;
/** Le disque nuit douce qui porte l'enfant, rapporté à l'enfant. */
const PLATE = 1.3;
/** Les mots entrent quand la dernière étoile atteint son sommet. */
const WORDS_AT = starsPeakAt(3);
/** Les médailles suivent les mots, l'une après l'autre. */
const MEDAL_AT = WORDS_AT + 250;
const MEDAL_STAGGER = 150;
/** La largeur de la colonne des mots, couchée. */
const WORDS_MAX = 480;

/**
 * La vannerie : un disque plein de nuit douce qui porte l'enfant, cerclé à
 * distance d'un pointillé rond — de courts tirets coiffés, comme le point
 * d'un couvercle tressé. Le nombre de tirets est entier : aucune couture.
 */
function Basketry({ size, plate, stroke }: { size: number; plate: number; stroke: number }) {
  const r = size / 2 - stroke / 2;
  // Un tiret de 0,6 × l'épaisseur (≈ 1,6 × avec ses bouts ronds), un vide d'environ 1,4 ×.
  const count = Math.max(12, Math.round((2 * Math.PI * r) / (stroke * 3)));
  const period = (2 * Math.PI * r) / count;
  const dash = stroke * 0.6;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={plate / 2} fill={colors.nightSoft} />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={colors.onColorTrack}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${period - dash}`}
      />
    </Svg>
  );
}

/**
 * Une entrée retardée : invisible jusqu'à `delay`, puis un fondu qui monte de
 * quelques dp. En mouvement réduit, tout est là d'emblée.
 */
function Reveal({ delay, rise, children }: { delay: number; rise: number; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [shown] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reducedMotion) {
      shown.setValue(1);
      return undefined;
    }
    const entrance = Animated.timing(shown, {
      toValue: 1,
      delay,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    entrance.start();
    return () => entrance.stop();
  }, [delay, reducedMotion, shown]);
  return (
    <Animated.View
      style={{
        opacity: shown,
        transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Une médaille gagnée qui éclôt : 0 → 1,08 → 1 sur un ressort, avec un léger
 * retour haptique — la récompense se sent autant qu'elle se voit. En
 * mouvement réduit, elle est simplement là.
 */
function PoppingMedal({
  id,
  size,
  width,
  labelVariant,
  delay,
}: {
  id: AchievementId;
  size: number;
  width: number;
  labelVariant: BadgeLabelVariant;
  delay: number;
}) {
  const reducedMotion = useReducedMotion();
  const [grow] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reducedMotion) {
      grow.setValue(1);
      return undefined;
    }
    const entrance = Animated.sequence([
      Animated.timing(grow, {
        toValue: 1.08,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(grow, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 }),
    ]);
    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      entrance.start();
    }, delay);
    return () => {
      clearTimeout(timer);
      entrance.stop();
    };
  }, [delay, grow, reducedMotion]);
  return (
    <Animated.View style={{ transform: [{ scale: grow }] }}>
      <AchievementBadge
        id={id}
        earned
        size={size}
        width={width}
        onDark
        labelVariant={labelVariant}
      />
    </Animated.View>
  );
}

/**
 * La réussite (direction v4) : la nuit du Sahel, le seul écran sombre de
 * l'enfant, et le sommet de la leçon. Couché, deux colonnes sur un même axe :
 * à gauche la fête — ses étoiles, grandes, qui éclosent l'une après l'autre
 * au-dessus de lui, l'enfant en joie porté par sa vannerie ; à droite, une
 * fois les étoiles posées, les mots — ce qu'il vient d'apprendre (la
 * discipline et la leçon), « Bravo ! », une louange, ses nouvelles médailles
 * en médaillons, et tout de suite la suite : un enfant qui vient de réussir
 * veut enchaîner. Debout, le même ordre de haut en bas.
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

  // Les étoiles occupent la scène : l'étoile du milieu fait environ 125 dp sur
  // une tablette (un sixième de la hauteur), 70 au téléphone.
  const starSize = isTablet ? Math.max(scaled(72, scale), 90) : scaled(52, scale);
  const starsHeight =
    Math.round(starSize * STAR_MIDDLE_RATIO) + Math.max(spacing.sm, Math.round(starSize / 8));
  const starsGap = scaled(spacing.md, scale);
  // L'enfant se règle sur ce qui reste : couché, les étoiles et la vannerie
  // tiennent ensemble dans la colonne ; debout, il laisse la place aux mots.
  const avatar = Math.round(
    Math.min(
      scaled(isTablet ? 150 : 112, scale),
      sideBySide ? (height - 2 * edge - starsHeight - starsGap) / HALO : height * 0.18,
    ),
  );
  const halo = Math.round(avatar * HALO);
  const plate = Math.round(avatar * PLATE);
  const check = scaled(isTablet ? 48 : 40, scale);

  // Les médailles gagnées, en médaillons côte à côte, leur nom dessous jamais
  // tronqué : réduites seulement quand elles ne tiendraient pas sur une rangée
  // (ou, sur une tablette 7" couchée, pas en hauteur).
  const wordsWidth = sideBySide ? WORDS_MAX : Math.min(520, width - 2 * screenPadding);
  const medals = medalRowLayout({
    count: newBadges.length,
    width: wordsWidth,
    base: isTablet ? scaled(height < 720 ? 72 : 84, scale) : 64,
    scale,
  });

  const celebration = (
    <View style={[styles.celebration, { gap: starsGap }]}>
      <StarRow
        earned={stars}
        size={starSize}
        gap={scaled(spacing.sm, scale)}
        celebrate
        inactiveColor={colors.onColorSoft}
        onDark
      />
      <View style={[styles.center, { width: halo, height: halo }]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Basketry size={halo} plate={plate} stroke={scaled(4, scale)} />
        </View>
        <View>
          <EcolnaAvatar avatarId={profile?.avatarId ?? 'avatar-1'} size={avatar} expression="joy" />
          {/* La pastille de réussite, détachée de l'avatar par la nuit douce qui le porte. */}
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

  // Les médailles gagnées : des médaillons nommés, qui éclosent après les mots.
  const badges =
    newBadges.length > 0 ? (
      <View style={[styles.badges, { gap: scaled(spacing.sm, scale) }]}>
        <Reveal delay={WORDS_AT} rise={scaled(12, scale)}>
          <View style={styles.badgeTitle}>
            <EcolnaIcon name="sparkle" size={scaled(18, scale)} mode="color" />
            <EcolnaText variant="labelLg" color={colors.onNightSecondary}>
              {newBadges.length > 1 ? fr.achievements.unlockedMany : fr.achievements.unlocked}
            </EcolnaText>
          </View>
        </Reveal>
        <View
          style={[
            styles.badgeRow,
            {
              columnGap: medals.gap,
              rowGap: scaled(spacing.md, scale),
              // Des rangées égales : jamais une médaille seule sous trois autres.
              maxWidth: medals.perRow * medals.cell + (medals.perRow - 1) * medals.gap,
            },
          ]}
        >
          {newBadges.map((id, index) => (
            <PoppingMedal
              key={id}
              id={id}
              size={medals.medal}
              width={medals.cell}
              labelVariant={medals.labelVariant}
              delay={MEDAL_AT + index * MEDAL_STAGGER}
            />
          ))}
        </View>
      </View>
    ) : null;

  const words = (
    <View style={[styles.words, sideBySide && styles.wordsSide]}>
      <Reveal delay={WORDS_AT} rise={scaled(12, scale)}>
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
      </Reveal>

      {badges ? <View style={{ marginTop: scaled(spacing.lg, scale) }}>{badges}</View> : null}

      <Reveal delay={WORDS_AT} rise={scaled(12, scale)}>
        <View
          style={[
            styles.buttons,
            { gap: scaled(spacing.sm, scale), marginTop: scaled(spacing.xl, scale) },
          ]}
        >
          {nextLessonId ? (
            <EcolnaButton
              label={fr.result.nextLesson}
              // Avancer, c'est une flèche : ▶ voudrait dire « lire le son ».
              icon={
                <EcolnaIcon name="arrow-forward" size={scaled(20, scale)} color={colors.onReward} />
              }
              onPress={() => router.replace(`/(child)/lesson/${nextLessonId}`)}
            />
          ) : (
            <EcolnaButton
              label={fr.common.continue}
              icon={
                <EcolnaIcon name="arrow-forward" size={scaled(20, scale)} color={colors.onReward} />
              }
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
      </Reveal>
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
            // La croix est à gauche, le contenu centré : ils ne se croisent qu'en
            // hauteur sur une tablette debout, où la place ne manque pas. Ailleurs,
            // une simple marge — la tablette 7" couchée et le téléphone tiennent.
            paddingVertical: isTablet && !sideBySide ? edge : scaled(spacing.lg, scale),
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
    borderColor: colors.nightSoft,
  },
  words: { width: '100%', maxWidth: 520, alignItems: 'stretch', justifyContent: 'center' },
  wordsSide: { flexShrink: 1, maxWidth: WORDS_MAX },
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
