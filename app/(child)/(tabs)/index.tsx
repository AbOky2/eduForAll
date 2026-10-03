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
import { SubjectTile } from '@/design-system/components/subject-tile';
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
 */
export default function ChildHomeScreen() {
  const router = useRouter();
  const { isTablet, splitPanes, scale, screenPadding, height } = useResponsive();
  // Une tablette 7" couchée n'a que 600 dp : on resserre plutôt que de faire défiler.
  const short = height < 700;
  const profile = useActiveProfile((state) => state.profile);
  const summary = useFocusedData<HomeSummary>(
    () => (profile ? loadHomeSummary(profile.id, profile.level) : null),
    profile?.id ?? null,
  );
  // Discipline verrouillée dont l'enfant vient de demander pourquoi.
  const [explained, setExplained] = useState<Subject | null>(null);

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

  const greeting = (
    <View style={styles.greeting}>
      {/* Un prénom long (30 caractères permis) passe sur deux lignes, puis rapetisse : jamais tronqué. */}
      <EcolnaText
        // Le grand titre seulement couché : debout, les pastilles lui prennent
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
          { padding: scaled(spacing.lg, scale), gap: scaled(spacing.md, scale) },
        ]}
      >
        <View style={[styles.revisionIcon, { width: scaled(52, scale), height: scaled(52, scale), borderRadius: scaled(16, scale) }]}>
          <EcolnaIcon name="refresh" size={scaled(28, scale)} color={colors.brand} />
        </View>
        <View style={styles.revisionText}>
          <EcolnaText variant="headlineSm">{fr.home.reviseTitle}</EcolnaText>
          <EcolnaText variant="bodyMd" color={colors.textSecondary}>
            {fr.home.reviseCount(revisionCount)}
          </EcolnaText>
        </View>
        <View style={splitPanes ? styles.revisionGo : undefined}>
          <EcolnaIcon name="chevron-right" size={scaled(22, scale)} color={colors.brand} />
        </View>
      </EcolnaGalet>
    ) : null;

  return (
    <EcolnaScreen background="default" withBottomInset={false}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: screenPadding, gap: sectionGap, paddingTop: scaled(short ? spacing.sm : spacing.md, scale) },
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
          <View style={styles.pills}>
            {streakDays > 0 ? (
              <EcolnaPill
                tone="sun"
                variant="labelLg"
                label={fr.home.streakShort(streakDays)}
                accessibilityLabel={fr.home.streak(streakDays)}
                icon={<EcolnaIcon name="sun" size={scaled(22, scale)} mode="color" />}
              />
            ) : null}
            <EcolnaPill
              tone="white"
              variant="labelMd"
              label={isTablet ? fr.offline.chip : ''}
              accessibilityLabel={fr.offline.badge}
              onPress={() => router.push('/(child)/offline-info')}
              icon={<EcolnaIcon name="offline-ok" size={scaled(20, scale)} mode="color" />}
            />
          </View>
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
                style={splitPanes ? styles.fill : undefined}
                cover={lessonOrWorldCover(recommendation.lessonId)}
              />
            </View>
            {revision}
          </View>
        ) : (
          revision
        )}

        {/* Mes matières */}
        <View style={{ gap: scaled(short ? spacing.sm : spacing.md, scale) }}>
          <EcolnaText variant={short ? 'headlineSm' : 'headlineMd'}>{fr.home.activities}</EcolnaText>
          <View style={{ gap }}>
            {chunk(summary?.subjects ?? [], columns).map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.gridRow, { gap }]}>
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
                    // Tablette : en ligne (quatre couché, deux par deux debout),
                    // pour que les quatre disciplines tiennent sans défiler.
                    layout={isTablet ? 'row' : 'stack'}
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
  scroll: { paddingBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center' },
  greeting: { flex: 1, gap: 2 },
  pills: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  heroRow: { flexDirection: 'row', alignItems: 'stretch' },
  heroMain: { flex: 2.4 },
  fill: { flexGrow: 1 },
  revisionSide: { flex: 1 },
  revisionRow: { flexDirection: 'row', alignItems: 'center' },
  revisionColumn: { justifyContent: 'space-between' },
  revisionText: { flex: 1, gap: 2 },
  revisionGo: { alignSelf: 'flex-end' },
  revisionIcon: { backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' },
  gridRow: { flexDirection: 'row', alignItems: 'stretch' },
});
