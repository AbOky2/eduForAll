import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';

import type { ChildProfileId } from '@/core/ids/ids';
import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { worldsForLevel } from '@/features/curriculum/application/curriculum-catalog';
import {
  loadHomeSummary,
  type SubjectProgress,
} from '@/features/learning-path/application/home-summary';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';
import type { LevelId, Subject } from '@/content/schemas/curriculum-schema';
import {
  SubjectPortal,
  portalWorldStates,
  type PortalWorldState,
} from '@/design-system/components/subject-portal';
import { EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';

const LABELS: Record<Subject, string> = {
  language: fr.subjects.language,
  reading: fr.subjects.reading,
  writing: fr.subjects.writing,
  math: fr.subjects.math,
};

interface Door extends SubjectProgress {
  /** Un état par monde de la discipline, dans l'ordre du parcours. */
  worlds: PortalWorldState[];
}

/**
 * Les portes : la progression de chaque discipline (comme l'accueil) et
 * l'état de chacun de ses mondes. Un monde est fini quand toutes ses leçons
 * le sont ; la discipline est commencée dès qu'une leçon l'est.
 */
async function loadDoors(childProfileId: ChildProfileId, level: LevelId): Promise<Door[]> {
  const db = await getDatabase();
  const [summary, progress] = await Promise.all([
    loadHomeSummary(childProfileId, level),
    createProgressRepository(db).findAllProgress(childProfileId),
  ]);
  const status = new Map(progress.map((entry) => [entry.lessonId as string, entry.status]));
  const worlds = worldsForLevel(level);
  return summary.subjects.map((subject) => {
    const own = worlds
      .filter((world) => world.subject === subject.subject)
      .map((world) => ({
        done: world.lessons.every((lesson) => status.get(lesson.id) === 'completed'),
        started: world.lessons.some((lesson) => status.has(lesson.id)),
      }));
    return {
      ...subject,
      worlds: portalWorldStates(
        own,
        own.some((world) => world.started),
      ),
    };
  });
}

/**
 * « Que veux-tu apprendre ? » Quatre portes, une par discipline du
 * programme : côte à côte en paysage, deux par deux en portrait, une par
 * ligne au téléphone. Chaque porte montre la rangée de ses mondes (un point
 * par monde) : l'onglet dit où en est chaque chemin, il ne répète pas
 * l'accueil. Une porte encore fermée répond quand on la touche.
 *
 * Même rythme que l'accueil : ancré en haut, à la même marge, et les portes
 * prennent la hauteur qui reste jusqu'à la barre d'onglets.
 */
export default function ModuleSelectionScreen() {
  const router = useRouter();
  const { splitPanes, isTablet, scale, screenPadding, height } = useResponsive();
  // Une tablette 7" couchée n'a que 600 dp : l'objet rapetisse avant que les
  // portes ne passent sous la barre d'onglets.
  const short = height < 700;
  const portalArt = height >= 780 ? 120 : splitPanes && height < 720 ? 64 : 96;
  const profile = useActiveProfile((state) => state.profile);
  const [explained, setExplained] = useState<Subject | null>(null);
  const subjects: Door[] =
    useFocusedData(
      () => (profile ? loadDoors(profile.id, profile.level) : null),
      profile?.id ?? null,
    ) ?? [];

  const gap = scaled(isTablet && !short ? spacing.lg : spacing.md, scale);
  // Le même écart que l'accueil entre le titre et ce qui suit.
  const sectionGap = scaled(
    isTablet && !short ? spacing.xl : short ? spacing.md : spacing.lg,
    scale,
  );
  const columns = splitPanes ? 4 : isTablet ? 2 : 1;
  const rows: Door[][] = [];
  for (let start = 0; start < subjects.length; start += columns) {
    rows.push(subjects.slice(start, start + columns));
  }

  return (
    <EcolnaScreen background="default" withBottomInset={false}>
      <ScrollView
        contentContainerStyle={[
          styles.grow,
          {
            paddingHorizontal: screenPadding,
            gap: sectionGap,
            paddingTop: scaled(short ? spacing.sm : spacing.md, scale),
            // L'ombre des portes s'éteint avant le bord : jamais tranchée net.
            paddingBottom: isTablet ? scaled(spacing.xl, scale) : spacing.xxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titles}>
          <EcolnaText variant={isTablet ? 'displayHero' : 'headlineLg'}>
            {fr.learn.chooseModule}
          </EcolnaText>
          <EcolnaText variant="bodyLg" color={colors.textSecondary}>
            {fr.learn.readyToday}
          </EcolnaText>
        </View>

        {/* Les portes partent du titre et prennent la hauteur qui reste. */}
        <View style={[columns > 1 && styles.grow, { gap }]}>
          {rows.map((row, index) => (
            <View key={index} style={[{ gap }, columns > 1 && styles.rowStretch]}>
              {row.map((subject) => {
                const worldsDone = subject.worlds.filter((state) => state === 'done').length;
                const worldsLabel = fr.learn.worldsDone(worldsDone, subject.worlds.length);
                return (
                  <SubjectPortal
                    key={subject.subject}
                    subject={subject.subject}
                    label={LABELS[subject.subject]}
                    hint={fr.learn.subjectHints[subject.subject]}
                    artSize={portalArt}
                    completed={subject.completed}
                    total={subject.total}
                    worlds={subject.worlds}
                    worldsLabel={worldsLabel}
                    locked={subject.locked}
                    layout={columns > 1 ? 'portal' : 'row'}
                    explanation={explained === subject.subject ? fr.home.lockedExplain : null}
                    // Ce que l'enfant voit (le nom, les points des mondes), dit à voix haute.
                    accessibilityLabel={`${LABELS[subject.subject]}${
                      subject.locked ? `, ${fr.learn.locked}` : ''
                    }. ${worldsLabel}`}
                    accessibilityHint={subject.locked ? fr.learn.lockedA11yHint : undefined}
                    onPress={() => {
                      if (subject.locked) {
                        setExplained(subject.subject);
                        AccessibilityInfo.announceForAccessibility(fr.home.lockedExplain);
                        return;
                      }
                      router.push(`/(child)/level-map?subject=${subject.subject}`);
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  titles: { gap: spacing.xxs },
  grow: { flexGrow: 1 },
  rowStretch: { flexGrow: 1, flexDirection: 'row', alignItems: 'stretch' },
});
