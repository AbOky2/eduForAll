import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { findWorld } from '@/features/curriculum/application/curriculum-catalog';
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
import { colors, radius, spacing } from '@/design-system/tokens';
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
 * Accueil de l'enfant (direction v3). Trois étages, du plus important au
 * plus large : qui je suis (avatar, salutation, ma série de soleils), ce que
 * je fais maintenant (la carte héros, et la révision à côté quand il y en a),
 * tout ce que je peux faire (les quatre disciplines, chacune de sa couleur).
 * Sur tablette en paysage, tout tient sans défiler.
 */
export default function ChildHomeScreen() {
  const router = useRouter();
  const { isTablet, splitPanes, scale, screenPadding } = useResponsive();
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
  // Paysage : quatre colonnes, tout tient sans défiler. Portrait et
  // téléphone : deux par deux, des tuiles plus grandes qui remplissent l'écran.
  const columns = splitPanes ? 4 : 2;
  const tileArt = splitPanes ? 72 : isTablet ? 120 : 72;
  // En paysage l'écran est court : des écarts plus serrés pour que les quatre
  // disciplines tiennent sans défiler sous la barre d'onglets.
  const gap = scaled(splitPanes ? spacing.md : isTablet ? spacing.lg : spacing.md, scale);
  const avatarSize = scaled(isTablet ? 72 : 60, scale);

  const greeting = (
    <View style={styles.greeting}>
      {/* Un prénom long (30 caractères permis) passe sur deux lignes, puis rapetisse : jamais tronqué. */}
      <EcolnaText
        variant={isTablet ? 'displayHero' : 'headlineLg'}
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
        face={colors.card}
        edge={colors.cardEdge}
        border={colors.cardEdge}
        radius={radius.xl}
        depth="lg"
        onPress={() => router.push('/(child)/revision')}
        accessibilityLabel={`${fr.home.reviseTitle} ${fr.home.reviseCount(revisionCount)}`}
        style={splitPanes ? styles.revisionSide : undefined}
        faceStyle={[
          splitPanes ? styles.revisionColumn : styles.revisionRow,
          { padding: scaled(spacing.lg, scale), gap: scaled(spacing.sm, scale) },
        ]}
      >
        <View style={[styles.sproutDisc, { width: scaled(56, scale), height: scaled(56, scale) }]}>
          <EcolnaIcon name="sprout" size={scaled(40, scale)} mode="color" />
        </View>
        <View style={splitPanes ? styles.revisionTextColumn : styles.revisionText}>
          <EcolnaText variant="headlineSm" align={splitPanes ? 'center' : 'left'}>
            {fr.home.reviseTitle}
          </EcolnaText>
          <EcolnaText
            variant="bodyMd"
            color={colors.textSecondary}
            align={splitPanes ? 'center' : 'left'}
          >
            {fr.home.reviseCount(revisionCount)}
          </EcolnaText>
        </View>
        {splitPanes ? null : (
          <EcolnaIcon name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        )}
      </EcolnaGalet>
    ) : null;

  return (
    <EcolnaScreen background="default" withBottomInset={false}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: screenPadding, gap, paddingTop: scaled(spacing.md, scale) },
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
            style={({ pressed }) => [
              styles.avatarRing,
              { borderRadius: avatarSize, transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <EcolnaAvatar avatarId={profile.avatarId} size={avatarSize} />
          </Pressable>
          {isTablet ? greeting : <View style={styles.greeting} />}
          <View style={styles.pills}>
            {streakDays > 0 ? (
              <EcolnaPill
                tone="white"
                variant="headlineSm"
                label={String(streakDays)}
                accessibilityLabel={fr.home.streak(streakDays)}
                icon={<EcolnaIcon name="sun" size={scaled(30, scale)} mode="color" />}
              />
            ) : null}
            <EcolnaPill
              tone="white"
              label=""
              accessibilityLabel={fr.offline.badge}
              onPress={() => router.push('/(child)/offline-info')}
              icon={
                <EcolnaIcon name="offline-ok" size={scaled(24, scale)} color={colors.secondary} />
              }
            />
          </View>
        </View>
        {isTablet ? null : greeting}

        {/* Ce que je fais maintenant */}
        {recommendation ? (
          <View style={splitPanes ? [styles.heroRow, { gap }] : { gap }}>
            <View style={splitPanes ? styles.heroMain : undefined}>
              <LessonHeroCard
                subject={world?.subject ?? null}
                tag={recommendation.reason === 'resume' ? fr.home.inProgress : fr.home.newTag}
                title={
                  recommendation.reason === 'resume' ? fr.home.continueLesson : fr.home.startLesson
                }
                detail={world ? `${world.title} · ${recommendation.title}` : recommendation.title}
                // Le libellé lu commence par le titre affiché (« Ma prochaine leçon »
                // ou « Continuer ma leçon ») : ce qu'on voit est ce qu'on entend.
                accessibilityLabel={`${
                  recommendation.reason === 'resume' ? fr.home.continueLesson : fr.home.startLesson
                } : ${recommendation.title}`}
                onPress={() => router.push(`/(child)/lesson/${recommendation.lessonId}`)}
              />
            </View>
            {revision}
          </View>
        ) : (
          revision
        )}

        {/* Tout ce que je peux faire */}
        <EcolnaText variant="headlineMd">{fr.home.activities}</EcolnaText>
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
                  artSize={tileArt}
                  onPress={() => openSubject(subject)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatarRing: { borderWidth: 4, borderColor: colors.card, backgroundColor: colors.card },
  greeting: { flex: 1, gap: 2 },
  pills: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  heroRow: { flexDirection: 'row', alignItems: 'stretch' },
  heroMain: { flex: 2 },
  revisionSide: { flex: 1 },
  revisionRow: { flexDirection: 'row', alignItems: 'center' },
  revisionColumn: { alignItems: 'center', justifyContent: 'center' },
  revisionText: { flex: 1, gap: 2 },
  revisionTextColumn: { gap: 2 },
  sproutDisc: {
    borderRadius: 999,
    backgroundColor: colors.feedbackCorrectContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: { flexDirection: 'row', alignItems: 'stretch' },
});
