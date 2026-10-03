import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { loadAchievementBoard } from '@/features/achievements/application/sync-achievements';
import { ACHIEVEMENT_IDS } from '@/features/achievements/domain/achievements';
import { AchievementBadge } from '@/features/achievements/presentation/achievement-badge';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { AVATAR_IDS, type AvatarId } from '@/features/child-profile/domain/child-profile';
import { createChildProfileRepository } from '@/features/child-profile/infrastructure/child-profile-repository';
import { EcolnaAvatar } from '@/design-system/avatars';
import { AvatarGrid } from '@/design-system/components/avatar-grid';
import { EcolnaPill } from '@/design-system/components/ecolna-pill';
import { EcolnaIcon, type IconName } from '@/design-system/icons/ecolna-icon';
import { SunBurst } from '@/design-system/illustrations/backdrops';
import {
  EcolnaCard,
  EcolnaIconButton,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** Un chiffre dont l'enfant est fier, avec son pictogramme en couleur. */
function StatTile({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  const { scale } = useResponsive();
  return (
    <EcolnaCard style={styles.stat} accessibilityLabel={`${label} : ${value}`}>
      <EcolnaIcon name={icon} size={scaled(44, scale)} mode="color" />
      <EcolnaText variant="headlineLg" align="center">
        {value}
      </EcolnaText>
      <EcolnaText variant="labelSm" color={colors.textSecondary} align="center">
        {label}
      </EcolnaText>
    </EcolnaCard>
  );
}

/**
 * « Mon profil » — reached by tapping the avatar on the home screen.
 * Child-facing on purpose: their face, their numbers, their medals, their
 * choice of character. Anything a parent may change (level, reset) stays
 * behind the parent gate. On a landscape tablet: who I am on the left, what
 * I collect on the right.
 */
export default function ChildProfileScreen() {
  const goBack = useSafeBack();
  const { scale, isTablet, splitPanes, screenPadding } = useResponsive();
  const profile = useActiveProfile((state) => state.profile);
  const setProfile = useActiveProfile((state) => state.setProfile);
  const board = useFocusedData(
    () => (profile ? loadAchievementBoard(profile.id) : null),
    profile?.id ?? null,
  );
  const earnedSet = useMemo(() => new Set(board?.earned ?? []), [board]);

  if (!profile) {
    return null;
  }
  const stats = board?.stats ?? null;

  const chooseAvatar = (avatarId: string) => {
    void getDatabase()
      .then((db) => createChildProfileRepository(db).updateAvatar(profile.id, avatarId as AvatarId))
      .then((updated) => {
        if (updated) {
          setProfile(updated);
        }
      });
  };

  const hero = scaled(isTablet ? 148 : 120, scale);
  const badgeColumns = splitPanes ? 4 : isTablet ? 5 : 3;
  const gap = scaled(spacing.lg, scale);

  const identity = (
    <View style={{ gap }}>
      <EcolnaCard rounded="xl" style={[styles.identity, { gap: scaled(spacing.xs, scale) }]}>
        <View style={[styles.burst, { width: hero * 2.2, height: hero * 2.2, top: -hero * 0.45 }]}>
          <SunBurst size={hero * 2.2} />
        </View>
        <View style={[styles.avatarRing, { borderRadius: hero }]}>
          <EcolnaAvatar avatarId={profile.avatarId} size={hero} />
        </View>
        <EcolnaText variant="displayHero" align="center">
          {profile.firstName}
        </EcolnaText>
        <EcolnaPill tone="petrol" label={fr.learn.levelTitle(profile.level)} style={styles.center} />
      </EcolnaCard>
      <View style={[styles.statRow, { gap: scaled(spacing.sm, scale) }]}>
        <StatTile icon="book" value={String(stats?.completedLessons ?? 0)} label={fr.childProfile.lessonsDone} />
        <StatTile icon="star" value={String(stats?.totalStars ?? 0)} label={fr.childProfile.starsEarned} />
        <StatTile icon="sun" value={String(stats?.bestStreakDays ?? 0)} label={fr.childProfile.bestStreak} />
      </View>
    </View>
  );

  const collection = (
    <View style={{ gap }}>
      <View style={styles.sectionHead}>
        <EcolnaText variant="headlineMd">{fr.achievements.title}</EcolnaText>
        <EcolnaPill
          tone="sun"
          variant="labelMd"
          label={fr.achievements.countEarned(earnedSet.size, ACHIEVEMENT_IDS.length)}
        />
      </View>
      <EcolnaText variant="bodyMd" color={colors.textSecondary}>
        {fr.achievements.subtitle}
      </EcolnaText>
      <EcolnaCard rounded="xl" style={styles.shelf}>
        {/* Colonnes fixes : une étagère bien rangée, pas un vrac qui se replie. */}
        <View style={[styles.badgeGrid, { rowGap: scaled(spacing.md, scale) }]}>
          {ACHIEVEMENT_IDS.map((id) => (
            <View key={id} style={[styles.badgeCell, { width: `${100 / badgeColumns}%` }]}>
              <AchievementBadge id={id} earned={earnedSet.has(id)} size={scaled(isTablet ? 72 : 60, scale)} />
            </View>
          ))}
        </View>
      </EcolnaCard>

      <EcolnaText variant="headlineMd">{fr.childProfile.changeAvatar}</EcolnaText>
      <AvatarGrid
        avatarIds={AVATAR_IDS}
        selectedId={profile.avatarId}
        onSelect={chooseAvatar}
        minAvatar={56}
        maxAvatar={72}
        labelFor={(avatarId, index) =>
          fr.avatars.tileLabel(index + 1, fr.avatars.descriptions[avatarId as AvatarId])
        }
        accessibilityLabel={fr.childProfile.changeAvatar}
      />
    </View>
  );

  return (
    <EcolnaScreen background="default" fullWidth={splitPanes}>
      <View style={[styles.header, { paddingHorizontal: screenPadding, gap: scaled(spacing.md, scale) }]}>
        <EcolnaIconButton icon="arrow-back" accessibilityLabel={fr.common.back} onPress={goBack} />
        <EcolnaText variant="headlineLg">{fr.childProfile.title}</EcolnaText>
      </View>

      {splitPanes ? (
        <View style={[styles.split, { paddingHorizontal: screenPadding, gap: scaled(spacing.xxl, scale) }]}>
          <View style={styles.leftPane}>{identity}</View>
          <ScrollView style={styles.rightPane} contentContainerStyle={styles.scrollBottom} showsVerticalScrollIndicator={false}>
            {collection}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollBottom, { paddingHorizontal: screenPadding, gap: scaled(spacing.xl, scale) }]}
          showsVerticalScrollIndicator={false}
        >
          {identity}
          {collection}
        </ScrollView>
      )}
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  split: { flex: 1, flexDirection: 'row' },
  leftPane: { flex: 0.9, justifyContent: 'center' },
  rightPane: { flex: 1.2 },
  scrollBottom: { paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  identity: { alignItems: 'center', overflow: 'hidden', paddingTop: spacing.xl },
  burst: { position: 'absolute', alignSelf: 'center' },
  avatarRing: { borderWidth: 5, borderColor: colors.card, backgroundColor: colors.card },
  center: { alignSelf: 'center' },
  statRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shelf: {},
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  badgeCell: { alignItems: 'center' },
});
