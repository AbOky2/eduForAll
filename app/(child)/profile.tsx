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

/** Un chiffre dont l'enfant est fier : son pictogramme plein, la valeur, le mot. */
function Stat({ icon, color, value, label }: { icon: IconName; color: string; value: string; label: string }) {
  const { scale } = useResponsive();
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label} : ${value}`}>
      <EcolnaIcon name={icon} size={scaled(28, scale)} color={color} filled />
      <EcolnaText variant="headlineLg" align="center">
        {value}
      </EcolnaText>
      <EcolnaText variant="labelSm" color={colors.textSecondary} align="center" numberOfLines={2}>
        {label}
      </EcolnaText>
    </View>
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

  const hero = scaled(isTablet ? 136 : 112, scale);
  const badgeColumns = splitPanes ? 4 : isTablet ? 5 : 3;
  const gap = scaled(spacing.lg, scale);

  const identity = (
    <EcolnaCard rounded="xl" padded={false}>
      <View style={[styles.who, { gap: scaled(spacing.sm, scale), padding: scaled(spacing.xl, scale) }]}>
        <EcolnaAvatar avatarId={profile.avatarId} size={hero} popOut />
        <EcolnaText variant="displayHero" align="center">
          {profile.firstName}
        </EcolnaText>
        <EcolnaPill tone="petrol" label={fr.learn.levelTitle(profile.level)} style={styles.center} />
      </View>
      {/* Trois chiffres sur une même bande, séparés d'un filet. */}
      <View style={[styles.statStrip, { paddingVertical: scaled(spacing.md, scale) }]}>
        <Stat icon="book" color={colors.brand} value={String(stats?.completedLessons ?? 0)} label={fr.childProfile.lessonsDone} />
        <View style={styles.rule} />
        <Stat icon="star" color={colors.reward} value={String(stats?.totalStars ?? 0)} label={fr.childProfile.starsEarned} />
        <View style={styles.rule} />
        <Stat icon="sun" color={colors.reward} value={String(stats?.bestStreakDays ?? 0)} label={fr.childProfile.bestStreak} />
      </View>
    </EcolnaCard>
  );

  const collection = (
    <View style={{ gap }}>
      <View style={styles.sectionHead}>
        <EcolnaText variant="headlineMd">{fr.achievements.title}</EcolnaText>
        <EcolnaPill
          tone="sun"
          variant="labelMd"
          icon={<EcolnaIcon name="medal" size={scaled(16, scale)} color={colors.rewardDeep} filled />}
          label={fr.achievements.earnedCount(earnedSet.size)}
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
  leftPane: { flex: 0.9, paddingTop: spacing.sm },
  rightPane: { flex: 1.2 },
  scrollBottom: { paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  who: { alignItems: 'center' },
  center: { alignSelf: 'center' },
  statStrip: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  rule: { width: 1, backgroundColor: colors.border },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: spacing.xs },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shelf: {},
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  badgeCell: { alignItems: 'center' },
});
