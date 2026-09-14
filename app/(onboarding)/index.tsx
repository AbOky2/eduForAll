import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Pressable } from 'react-native';

import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { OfflineReadyScene, ReadingChildScene } from '@/design-system/illustrations/scenes';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Onboarding pager — mockups S02, S03, S04. Swipe or buttons. */
export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setPage(index);
  };

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const finish = () => router.push('/(onboarding)/create-profile');

  return (
    <EcolnaScreen background="default">
      <View style={styles.topBar}>
        <EcolnaText variant="headlineSm" color={colors.primary}>
          {fr.common.appName}
        </EcolnaText>
        {page < 2 ? (
          <Pressable accessibilityRole="button" onPress={finish} hitSlop={12}>
            <EcolnaText variant="labelMd" color={colors.textSecondary}>
              {fr.common.skip}
            </EcolnaText>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={styles.pager}
      >
        {/* Page 1 — Ton école t'accompagne partout (S02) */}
        <View style={[styles.page, { width }]}>
          <EcolnaCard rounded="xl" padded={false} style={styles.sceneCard}>
            <ReadingChildScene width={width - spacing.screenMargin * 2} height={210} />
          </EcolnaCard>
          <EcolnaText variant="headlineLg" align="center">
            Ton école{' '}
            <EcolnaText variant="headlineLg" color={colors.secondary}>
              t’accompagne
            </EcolnaText>{' '}
            partout.
          </EcolnaText>
        </View>

        {/* Page 2 — Les matières (S03) */}
        <View style={[styles.page, { width }]}>
          <View style={styles.sparkBadge}>
            <EcolnaIcon name="sparkle" size={30} color={colors.onSecondaryContainer} />
          </View>
          <EcolnaText variant="headlineLg" align="center">
            {fr.onboarding.subjectsTitle}
          </EcolnaText>
          <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
            {fr.onboarding.subjectsSubtitle}
          </EcolnaText>
          <View style={styles.subjectGrid}>
            {(
              [
                {
                  label: fr.subjects.language,
                  icon: 'speech',
                  tile: colors.primaryFixedDim,
                  tint: colors.onPrimaryContainer,
                },
                {
                  label: fr.subjects.reading,
                  icon: 'book',
                  tile: colors.secondaryContainer,
                  tint: colors.onSecondaryContainer,
                },
                {
                  label: fr.subjects.writing,
                  icon: 'pencil',
                  tile: colors.tertiaryFixed,
                  tint: colors.onTertiaryContainer,
                },
                {
                  label: fr.subjects.math,
                  icon: 'calculator',
                  tile: colors.secondary,
                  tint: colors.onSecondary,
                },
              ] as const
            ).map((subject) => (
              <EcolnaCard key={subject.label} style={styles.subjectCard}>
                <View style={[styles.subjectTile, { backgroundColor: subject.tile }]}>
                  <EcolnaIcon name={subject.icon} size={26} color={subject.tint} />
                </View>
                <EcolnaText variant="labelLg" align="center">
                  {subject.label}
                </EcolnaText>
              </EcolnaCard>
            ))}
          </View>
        </View>

        {/* Page 3 — Fonctionne sans connexion (S04) */}
        <View style={[styles.page, { width }]}>
          <EcolnaCard rounded="xl" padded={false} style={styles.sceneCard}>
            <OfflineReadyScene width={width - spacing.screenMargin * 2} height={210} />
          </EcolnaCard>
          <EcolnaText variant="headlineLg" align="center">
            {fr.onboarding.offlineTitle}
          </EcolnaText>
          <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
            {fr.onboarding.offlineSubtitle}
          </EcolnaText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={`Page ${page + 1} sur 3`}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === page
                  ? { backgroundColor: colors.primaryContainer, width: 26 }
                  : { backgroundColor: colors.surfaceContainerHighest },
              ]}
            />
          ))}
        </View>
        <EcolnaButton
          label={
            page === 0 ? fr.common.start : page === 1 ? fr.common.next : fr.onboarding.createProfile
          }
          onPress={() => (page < 2 ? goTo(page + 1) : finish())}
        />
      </View>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: spacing.md,
  },
  pager: { flex: 1 },
  page: {
    paddingHorizontal: spacing.screenMargin,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  sceneCard: { borderRadius: radius.xl },
  sparkBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  subjectCard: {
    width: '45%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subjectTile: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.screenMargin,
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: { height: 8, width: 8, borderRadius: 4 },
});
