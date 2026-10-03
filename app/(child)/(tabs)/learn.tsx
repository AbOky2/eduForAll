import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadHomeSummary,
  type SubjectProgress,
} from '@/features/learning-path/application/home-summary';
import type { Subject } from '@/content/schemas/curriculum-schema';
import { SubjectPortal } from '@/design-system/components/subject-portal';
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

/**
 * « Choisis ton module » (direction v3). Quatre portes, une par discipline
 * du programme : côte à côte en paysage, deux par deux en portrait, une par
 * ligne au téléphone. Une porte encore fermée répond quand on la touche.
 */
export default function ModuleSelectionScreen() {
  const router = useRouter();
  const { splitPanes, isTablet, scale, screenPadding, height } = useResponsive();
  // Une tablette 7" couchée n'a que 600 dp : l'objet rapetisse avant que les
  // portes ne passent sous la barre d'onglets.
  const portalArt = splitPanes ? (height < 720 ? 64 : 80) : 88;
  const profile = useActiveProfile((state) => state.profile);
  const [explained, setExplained] = useState<Subject | null>(null);
  const subjects: SubjectProgress[] =
    useFocusedData(
      () => (profile ? loadHomeSummary(profile.id, profile.level).then((s) => s.subjects) : null),
      profile?.id ?? null,
    ) ?? [];

  const gap = scaled(isTablet ? spacing.lg : spacing.md, scale);
  const columns = splitPanes ? 4 : isTablet ? 2 : 1;
  const rows: SubjectProgress[][] = [];
  for (let start = 0; start < subjects.length; start += columns) {
    rows.push(subjects.slice(start, start + columns));
  }

  return (
    <EcolnaScreen background="default" withBottomInset={false}>
      <ScrollView
        contentContainerStyle={[
          // En paysage, les quatre portes occupent toute la hauteur libre.
          splitPanes && styles.fill,
          {
            paddingHorizontal: screenPadding,
            gap,
            paddingTop: scaled(spacing.lg, scale),
            paddingBottom: splitPanes ? scaled(spacing.lg, scale) : spacing.xxl,
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

        {rows.map((row, index) => (
          <View
            key={index}
            style={[
              styles.row,
              { gap },
              columns > 1 && styles.rowStretch,
              splitPanes && styles.fill,
            ]}
          >
            {row.map((subject) => (
              <SubjectPortal
                key={subject.subject}
                subject={subject.subject}
                label={LABELS[subject.subject]}
                hint={fr.learn.subjectHints[subject.subject]}
                status={null}
                artSize={portalArt}
                completed={subject.completed}
                total={subject.total}
                locked={subject.locked}
                layout={columns > 1 ? 'portal' : 'row'}
                explanation={explained === subject.subject ? fr.home.lockedExplain : null}
                accessibilityLabel={`${LABELS[subject.subject]}${subject.locked ? `, ${fr.learn.locked}` : ''}`}
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
            ))}
          </View>
        ))}
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  titles: { gap: spacing.xxs },
  row: {},
  fill: { flexGrow: 1 },
  rowStretch: { flexDirection: 'row', alignItems: 'stretch' },
});
