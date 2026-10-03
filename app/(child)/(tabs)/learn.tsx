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
 * « Que veux-tu apprendre ? » Quatre portes, une par discipline du
 * programme : côte à côte en paysage, deux par deux en portrait, une par
 * ligne au téléphone. Une porte encore fermée répond quand on la touche.
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
  const subjects: SubjectProgress[] =
    useFocusedData(
      () => (profile ? loadHomeSummary(profile.id, profile.level).then((s) => s.subjects) : null),
      profile?.id ?? null,
    ) ?? [];

  const gap = scaled(isTablet && !short ? spacing.lg : spacing.md, scale);
  // Le même écart que l'accueil entre le titre et ce qui suit.
  const sectionGap = scaled(isTablet && !short ? spacing.xl : short ? spacing.md : spacing.lg, scale);
  const columns = splitPanes ? 4 : isTablet ? 2 : 1;
  const rows: SubjectProgress[][] = [];
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
