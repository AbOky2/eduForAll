import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { findWorld, lessonOrWorldCover } from '@/features/curriculum/application/curriculum-catalog';
import {
  loadHomeSummary,
  type HomeSummary,
  type SubjectProgress,
} from '@/features/learning-path/application/home-summary';
import type { Subject } from '@/content/schemas/curriculum-schema';
import { EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaPill } from '@/design-system/components/ecolna-pill';
import { LessonHeroCard } from '@/design-system/components/lesson-hero-card';
import { SubjectTile, fitSubjectTile } from '@/design-system/components/subject-tile';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { EcolnaGalet, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';

const SUBJECT_LABELS: Record<Subject, string> = {
  language: fr.subjects.language,
  reading: fr.subjects.reading,
  writing: fr.subjects.writing,
  math: fr.subjects.math,
};

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    rows.push(items.slice(start, start + size));
  }
  return rows;
}

/**
 * Accueil de l'enfant (direction v4 « Épure »). Trois étages, du plus
 * important au plus large : qui je suis (avatar, salutation, ma série de
 * soleils) ; aujourd'hui (la carte du jour, sur la nuit du Sahel, et la
 * révision à côté quand il y en a) ; mes matières. Une seule chose est
 * colorée en grand : ce qu'on fait maintenant.
 *
 * L'écran occupe toute la hauteur utile : sur une tablette qui a la place,
 * les tuiles des matières grandissent jusqu'à la barre d'onglets, à la taille
 * mesurée de ce qui reste (`fitSubjectTile`) ; une tablette 7" couchée et un
 * téléphone gardent des tuiles compactes.
 */
export default function ChildHomeScreen() {
  const router = useRouter();
  const { isTablet, splitPanes, scale, screenPadding, width, height } = useResponsive();
  // Une tablette 7" couchée n'a que 600 dp : on resserre plutôt que de faire défiler.
  const short = height < 700;
  const profile = useActiveProfile((state) => state.profile);
  const summary = useFocusedData<HomeSummary>(
    () => (profile ? loadHomeSummary(profile.id, profile.level) : null),
    profile?.id ?? null,
  );
  // Discipline verrouillée dont l'enfant vient de demander pourquoi.
  const [explained, setExplained] = useState<Subject | null>(null);
  // Ce qui reste pour les matières : la hauteur visible de l'écran, le haut de
  // leur grille et sa largeur. Aucune de ces mesures ne dépend des tuiles
  // elles-mêmes : les agrandir ne les change pas. Chaque mesure porte la
  // fenêtre où elle a été prise : juste après une rotation, celles de l'autre
  // orientation ne servent jamais.
  const windowKey = `${width}x${height}`;
  const [room, setRoom] = useState({ window: '', viewport: 0, section: 0, grid: 0, width: 0 });
  const measure = (key: 'viewport' | 'section' | 'grid' | 'width', value: number) => {
    const rounded = Math.round(value);
    setRoom((previous) =>
      previous[key] === rounded && previous.window === windowKey
        ? previous
        : { ...previous, [key]: rounded, window: windowKey },
    );
  };

  if (!profile) {
    return null;
  }
  const recommendation = summary?.recommendation ?? null;
  const streakDays = summary?.streakDays ?? 0;
  const revisionCount = summary?.revisionCount ?? 0;
  const world = recommendation ? findWorld(recommendation.worldId) : null;
  const lesson = world?.lessons.find((entry) => entry.id === recommendation?.lessonId) ?? null;
  // Paysage : quatre colonnes ; portrait et téléphone : deux par deux.
  const columns = splitPanes ? 4 : 2;
  const gap = scaled(isTablet && !short ? spacing.lg : spacing.md, scale);
  const sectionGap = scaled(isTablet && !short ? spacing.xl : short ? spacing.md : spacing.lg, scale);
  const avatarSize = scaled(isTablet && !short ? 64 : short ? 44 : 52, scale);
  const bottomPad = scaled(short ? spacing.xs : spacing.sm, scale);
  const subjects = summary?.subjects ?? [];
  const rows = chunk(subjects, columns);
  // Grande tuile : l'emblème devient la plus grande chose de la tuile —
  // l'enfant qui ne lit pas encore choisit sa matière à son dessin.
  const fit =
    isTablet && room.window === windowKey && room.viewport > 0 && room.width > 0 && rows.length > 0
      ? fitSubjectTile(
          {
            width: (room.width - (columns - 1) * gap) / columns,
            // Deux dp de marge : les arrondis des mesures ne font jamais défiler l'écran.
            height: Math.floor(
              (room.viewport - room.section - room.grid - bottomPad - (rows.length - 1) * gap) /
                rows.length -
                2,
            ),
          },
          scale,
        )
      : null;

  const greeting = (
    <View style={styles.greeting}>
      {/* Un prénom long (30 caractères permis) passe sur deux lignes, puis rapetisse : jamais tronqué. */}
      <EcolnaText
        // Le grand titre seulement couché : debout, la pastille lui prend
        // la place et « Bonjour Amina ! » se couperait en deux.
        variant={splitPanes && !short ? 'displayHero' : 'headlineLg'}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {fr.home.greeting(profile.firstName)}
      </EcolnaText>
      <EcolnaText variant="bodyLg" color={colors.textSecondary}>
        {fr.home.today(summary?.lessonsToday ?? 0)}
      </EcolnaText>
    </View>
  );

  const openSubject = (subject: SubjectProgress) => {
    if (subject.locked) {
      // Un appui sans effet n'apprend rien : on explique, sur place et à voix haute.
      setExplained(subject.subject);
      AccessibilityInfo.announceForAccessibility(fr.home.lockedExplain);
      return;
    }
    router.push(`/(child)/level-map?subject=${subject.subject}`);
  };

  // La révision : son titre, son compte, et une pilule bleue « Revoir » —
  // le bleu dit « on revoit », la pilule dit qu'on la touche.
  const reviseAction = (
    <View
      style={[
        styles.revisePill,
        {
          height: scaled(short ? 36 : 40, scale),
          paddingHorizontal: scaled(spacing.md, scale),
          gap: scaled(spacing.xxs, scale),
        },
      ]}
    >
      <EcolnaIcon name="replay" size={scaled(18, scale)} color={colors.brandInk} />
      <EcolnaText variant="buttonSm" color={colors.brandInk}>
        {fr.home.reviseAction}
      </EcolnaText>
    </View>
  );
  const revision =
    revisionCount > 0 ? (
      <EcolnaGalet
        face={colors.white}
        border={colors.border}
        borderWidth={1}
        radius={radius.xxl}
        shadow={shadows.card}
        onPress={() => router.push('/(child)/revision')}
        accessibilityLabel={`${fr.home.reviseTitle} ${fr.home.reviseCount(revisionCount)}`}
        style={splitPanes ? styles.revisionSide : undefined}
        faceStyle={[
          splitPanes ? styles.revisionColumn : styles.revisionRow,
          {
            padding: scaled(short ? spacing.md : spacing.lg, scale),
            gap: scaled(splitPanes ? spacing.sm : spacing.md, scale),
          },
        ]}
      >
        <View style={[styles.revisionText, !splitPanes && styles.grow]}>
          <EcolnaText variant={splitPanes && !short ? 'headlineMd' : 'headlineSm'}>
            {fr.home.reviseTitle}
          </EcolnaText>
          <EcolnaText variant="bodyMd" color={colors.textSecondary}>
            {fr.home.reviseCount(revisionCount)}
          </EcolnaText>
        </View>
        {reviseAction}
      </EcolnaGalet>
    ) : null;

  return (
    <EcolnaScreen background="default" withBottomInset={false}>
      <ScrollView
        onLayout={(event) => measure('viewport', event.nativeEvent.layout.height)}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: screenPadding,
            gap: sectionGap,
            paddingTop: scaled(short ? spacing.sm : spacing.md, scale),
            paddingBottom: bottomPad,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Qui je suis */}
        <View style={[styles.header, { gap: scaled(spacing.md, scale) }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fr.childProfile.title}
            onPress={() => router.push('/(child)/profile')}
            hitSlop={8}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}
          >
            <EcolnaAvatar avatarId={profile.avatarId} size={avatarSize} />
          </Pressable>
          {isTablet ? greeting : <View style={styles.greeting} />}
          {/* À droite, la série de soleils seule (rien avant le premier jour). */}
          {streakDays > 0 ? (
            <EcolnaPill
              tone="sun"
              variant="labelLg"
              label={fr.home.streakShort(streakDays)}
              accessibilityLabel={fr.home.streak(streakDays)}
              icon={<EcolnaIcon name="sun" size={scaled(22, scale)} mode="color" />}
              style={styles.streak}
            />
          ) : null}
        </View>
        {isTablet ? null : greeting}

        {/* Aujourd'hui */}
        {recommendation ? (
          <View style={splitPanes ? [styles.heroRow, { gap }] : { gap }}>
            <View style={splitPanes ? styles.heroMain : undefined}>
              <LessonHeroCard
                subject={world?.subject ?? null}
                eyebrow={
                  world ? fr.home.todayEyebrow(SUBJECT_LABELS[world.subject], world.title) : fr.home.startLesson
                }
                title={recommendation.title}
                meta={lesson ? fr.home.lessonMeta(lesson.stepCount, lesson.estimatedDurationMinutes) : ''}
                action={recommendation.reason === 'resume' ? fr.common.continue : fr.common.start}
                // Le libellé lu commence par ce que dit le bouton : ce qu'on voit est ce qu'on entend.
                accessibilityLabel={`${
                  recommendation.reason === 'resume' ? fr.home.continueLesson : fr.home.startLesson
                } : ${recommendation.title}`}
                onPress={() => router.push(`/(child)/lesson/${recommendation.lessonId}`)}
                style={splitPanes ? styles.grow : undefined}
                cover={lessonOrWorldCover(recommendation.lessonId)}
              />
            </View>
            {revision}
          </View>
        ) : (
          revision
        )}

        {/* Mes matières */}
        <View
          onLayout={(event) => measure('section', event.nativeEvent.layout.y)}
          // Tablette : la section descend jusqu'à la barre d'onglets.
          style={[isTablet && styles.grow, { gap: scaled(isTablet ? spacing.sm : spacing.md, scale) }]}
        >
          {/* Jamais plus petit que les noms des tuiles qu'il annonce. */}
          <EcolnaText variant={short && isTablet ? 'headlineSm' : 'headlineMd'}>
            {fr.home.activities}
          </EcolnaText>
          <View
            onLayout={(event) => {
              measure('grid', event.nativeEvent.layout.y);
              measure('width', event.nativeEvent.layout.width);
            }}
            style={[isTablet && styles.grow, { gap }]}
          >
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.gridRow, isTablet && styles.grow, { gap }]}>
                {row.map((subject) => (
                  <SubjectTile
                    key={subject.subject}
                    subject={subject.subject}
                    label={SUBJECT_LABELS[subject.subject]}
                    completed={subject.completed}
                    total={subject.total}
                    locked={subject.locked}
                    explanation={explained === subject.subject ? fr.home.lockedExplain : null}
                    artSize={splitPanes ? 40 : isTablet ? 44 : 48}
                    // Tablette qui a la place : de grandes tuiles qui remplissent
                    // la hauteur ; 7" couchée : en ligne, pour tenir sans défiler.
                    layout={fit ? fit.layout : isTablet ? 'row' : 'stack'}
                    emblem={fit?.emblem}
                    onPress={() => openSubject(subject)}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  greeting: { flex: 1, gap: 2 },
  streak: { alignSelf: 'center' },
  heroRow: { flexDirection: 'row', alignItems: 'stretch' },
  heroMain: { flex: 2.4 },
  grow: { flexGrow: 1 },
  revisionSide: { flex: 1 },
  revisionRow: { flexDirection: 'row', alignItems: 'center' },
  revisionColumn: { justifyContent: 'center', alignItems: 'flex-start' },
  revisionText: { flexShrink: 1, gap: 2 },
  revisePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
  },
  gridRow: { flexDirection: 'row', alignItems: 'stretch' },
});
