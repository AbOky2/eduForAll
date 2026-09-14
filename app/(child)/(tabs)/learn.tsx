import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  loadHomeSummary,
  type SubjectProgress,
} from '@/features/learning-path/application/home-summary';
import type { Subject } from '@/content/schemas/curriculum-schema';
import { EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon, type IconName } from '@/design-system/icons/ecolna-icon';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';

const MODULE_META: Record<
  Subject,
  { label: string; icon: IconName; pastille: string; tint: string; halo: string }
> = {
  language: {
    label: fr.subjects.language,
    icon: 'speech',
    pastille: colors.primaryFixedDim,
    tint: colors.onPrimaryContainer,
    halo: '#f6e5cf',
  },
  reading: {
    label: fr.subjects.reading,
    icon: 'book',
    pastille: colors.secondaryContainer,
    tint: colors.onSecondaryContainer,
    halo: '#dcefff',
  },
  writing: {
    label: fr.subjects.writing,
    icon: 'pencil',
    pastille: colors.tertiaryFixed,
    tint: colors.onTertiaryContainer,
    halo: '#fdf3d8',
  },
  math: {
    label: fr.subjects.math,
    icon: 'calculator',
    pastille: colors.secondary,
    tint: colors.onSecondary,
    halo: '#e3edf3',
  },
};

/** Module selection — mockup S07. */
export default function ModuleSelectionScreen() {
  const router = useRouter();
  const profile = useActiveProfile((state) => state.profile);
  const subjects: SubjectProgress[] =
    useFocusedData(
      () => (profile ? loadHomeSummary(profile.id, profile.level).then((s) => s.subjects) : null),
      profile?.id ?? null,
    ) ?? [];

  return (
    <EcolnaScreen background="default" withBottomInset={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <EcolnaText variant="headlineLg">{fr.learn.chooseModule}</EcolnaText>
        <EcolnaText variant="bodyLg" color={colors.textSecondary}>
          {fr.learn.readyToday}
        </EcolnaText>

        {subjects.map((subject) => {
          const meta = MODULE_META[subject.subject];
          return (
            <EcolnaCard
              key={subject.subject}
              rounded="xl"
              onPress={
                subject.locked
                  ? undefined
                  : () => router.push(`/(child)/level-map?subject=${subject.subject}`)
              }
              accessibilityLabel={`${meta.label}${subject.locked ? `, ${fr.learn.locked}` : ''}`}
              style={StyleSheet.flatten([styles.moduleCard, subject.locked && styles.locked])}
            >
              <View style={[styles.halo, { backgroundColor: meta.halo }]} />
              <View
                style={[
                  styles.pastille,
                  { backgroundColor: subject.locked ? colors.lockedContainer : meta.pastille },
                ]}
              >
                <EcolnaIcon
                  name={meta.icon}
                  size={26}
                  color={subject.locked ? colors.locked : meta.tint}
                />
              </View>
              <View style={styles.moduleText}>
                <EcolnaText variant="headlineMd">{meta.label}</EcolnaText>
                <View style={styles.badge}>
                  <EcolnaText variant="labelSm" color={colors.onSecondaryContainer}>
                    {subject.completed > 0
                      ? fr.home.lessonsDone(subject.completed)
                      : fr.home.newBadge}
                  </EcolnaText>
                </View>
              </View>
              <EcolnaIcon
                name={subject.locked ? 'lock' : 'chevron-right'}
                size={22}
                color={colors.onSurfaceVariant}
              />
            </EcolnaCard>
          );
        })}
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.screenMargin,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    overflow: 'hidden',
  },
  locked: { opacity: 0.7 },
  halo: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  pastille: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleText: { flex: 1, gap: spacing.xs },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryFixed,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
