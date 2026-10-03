import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { getDatabase } from '@/database/connection/database';
import { loadAchievementBoard } from '@/features/achievements/application/sync-achievements';
import { ACHIEVEMENT_IDS } from '@/features/achievements/domain/achievements';
import {
  AchievementBadge,
  shelfOrder,
} from '@/features/achievements/presentation/achievement-badge';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { AVATAR_IDS, type AvatarId } from '@/features/child-profile/domain/child-profile';
import { createChildProfileRepository } from '@/features/child-profile/infrastructure/child-profile-repository';
import {
  loadHomeSummary,
  type HomeSummary,
} from '@/features/learning-path/application/home-summary';
import { EcolnaAvatar } from '@/design-system/avatars';
import { AvatarGrid } from '@/design-system/components/avatar-grid';
import { EcolnaPill } from '@/design-system/components/ecolna-pill';
import { EcolnaIcon, type IconName } from '@/design-system/icons/ecolna-icon';
import { SubjectArt } from '@/design-system/icons/subject-art';
import {
  EcolnaCard,
  EcolnaIconButton,
  EcolnaProgressRing,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** Hauteur du fondu qui couvre le bas d'une liste qui défile, en dp avant mise à l'échelle. */
const FADE = 40;
/** L'air laissé autour des cartes d'un volet qui défile, pour leur ombre. */
const SHADOW_ROOM = spacing.sm;

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
 * Les quatre disciplines : l'anneau autour de l'emblème, comme sur l'accueil
 * (plein, il passe au soleil). Aucun chiffre, aucune fraction : l'enfant voit
 * l'anneau se remplir, les nombres restent à l'espace parent.
 */
function SubjectRings({ subjects }: { subjects: HomeSummary['subjects'] }) {
  const { scale } = useResponsive();
  const ring = scaled(56, scale);
  const stroke = scaled(4, scale);
  const art = ring - 2 * stroke - scaled(6, scale);
  return (
    <View style={styles.rings}>
      {subjects.map((entry) => {
        const label = fr.subjects[entry.subject];
        return (
          <View key={entry.subject} style={[styles.ringCell, { gap: scaled(spacing.xxs, scale) }]}>
            {entry.locked ? (
              <View style={[styles.center, { width: ring, height: ring }]} accessible accessibilityLabel={label}>
                <SubjectArt subject={entry.subject} size={art} muted />
              </View>
            ) : (
              <EcolnaProgressRing
                progress={entry.total > 0 ? entry.completed / entry.total : 0}
                size={ring}
                stroke={stroke}
                color={subjectColors[entry.subject].solid}
                accessibilityLabel={label}
              >
                <SubjectArt subject={entry.subject} size={art} />
              </EcolnaProgressRing>
            )}
            <EcolnaText variant="labelSm" color={colors.textSecondary} align="center" numberOfLines={1}>
              {label}
            </EcolnaText>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Le bas d'une liste qui défile s'efface dans la toile : une rangée n'est
 * jamais tranchée net par le bord de l'écran.
 */
function BottomFade({ id, height }: { id: string; height: number }) {
  return (
    <View pointerEvents="none" style={[styles.fade, { height }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.background} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.background} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * « Mon profil » — reached by tapping the avatar on the home screen.
 * Child-facing on purpose: their face, their numbers, their medals, their
 * choice of character. Anything a parent may change (level, reset) stays
 * behind the parent gate. On a landscape tablet: who I am on the left (a card
 * as tall as the collection beside it), what I collect on the right.
 */
export default function ChildProfileScreen() {
  const goBack = useSafeBack();
  const { scale, isTablet, splitPanes, screenPadding, height } = useResponsive();
  const profile = useActiveProfile((state) => state.profile);
  const setProfile = useActiveProfile((state) => state.setProfile);
  const board = useFocusedData(
    () => (profile ? loadAchievementBoard(profile.id) : null),
    profile?.id ?? null,
  );
  const summary = useFocusedData<HomeSummary>(
    () => (profile ? loadHomeSummary(profile.id, profile.level) : null),
    profile ? `${profile.id}:${profile.level}` : null,
  );
  const earnedSet = useMemo(() => new Set<string>(board?.earned ?? []), [board]);
  // Ce qu'on a d'abord : les médailles gagnées en tête de l'étagère.
  const shelf = useMemo(() => shelfOrder(ACHIEVEMENT_IDS, earnedSet), [earnedSet]);

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

  // Une tablette couchée de peu de hauteur (7") : l'enfant à côté de son nom,
  // pour que la carte d'identité tienne entière avec ses chiffres et ses anneaux.
  const shortPane = splitPanes && height < 720;
  const hero = shortPane ? scaled(88, scale) : scaled(isTablet ? 136 : 112, scale);
  const badgeColumns = splitPanes ? 4 : isTablet ? 5 : 3;
  const gap = scaled(spacing.lg, scale);
  const fade = scaled(FADE, scale);

  const identity = (
    <EcolnaCard rounded="xl" padded={false} style={splitPanes ? styles.grow : undefined} contentStyle={splitPanes ? styles.grow : undefined}>
      <View
        style={[
          shortPane ? styles.whoRow : styles.who,
          splitPanes && styles.grow,
          {
            gap: scaled(shortPane ? spacing.lg : spacing.sm, scale),
            padding: scaled(shortPane ? spacing.lg : spacing.xl, scale),
          },
        ]}
      >
        <EcolnaAvatar avatarId={profile.avatarId} size={hero} popOut />
        <View style={[shortPane ? styles.nameBlock : styles.who, { gap: scaled(spacing.sm, scale) }]}>
          <EcolnaText variant={shortPane ? 'headlineLg' : 'displayHero'} align={shortPane ? 'left' : 'center'}>
            {profile.firstName}
          </EcolnaText>
          <EcolnaPill
            tone="petrol"
            label={fr.learn.levelTitle(profile.level)}
            style={shortPane ? undefined : styles.center}
          />
        </View>
      </View>
      {/* Trois chiffres sur une même bande, séparés d'un filet. */}
      <View style={[styles.band, { paddingVertical: scaled(spacing.md, scale) }]}>
        <Stat icon="book" color={colors.brand} value={String(stats?.completedLessons ?? 0)} label={fr.childProfile.lessonsDone} />
        <View style={styles.rule} />
        <Stat icon="star" color={colors.reward} value={String(stats?.totalStars ?? 0)} label={fr.childProfile.starsEarned} />
        <View style={styles.rule} />
        <Stat icon="sun" color={colors.reward} value={String(stats?.bestStreakDays ?? 0)} label={fr.childProfile.bestStreak} />
      </View>
      {/* Puis les quatre disciplines, sans un chiffre. */}
      {summary && summary.subjects.length > 0 ? (
        <View
          style={[
            styles.band,
            { paddingVertical: scaled(spacing.lg, scale), paddingHorizontal: scaled(spacing.sm, scale) },
          ]}
        >
          <SubjectRings subjects={summary.subjects} />
        </View>
      ) : null}
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
      <EcolnaCard rounded="xl">
        {/* Colonnes fixes et rangées de même hauteur : une étagère bien rangée. */}
        <View style={[styles.badgeGrid, { rowGap: scaled(spacing.md, scale) }]}>
          {shelf.map((id) => (
            <View key={id} style={[styles.badgeCell, { width: `${100 / badgeColumns}%` }]}>
              <AchievementBadge
                id={id}
                earned={earnedSet.has(id)}
                size={scaled(isTablet ? 68 : 60, scale)}
                fill
              />
            </View>
          ))}
        </View>
      </EcolnaCard>

      <EcolnaText variant="headlineMd" style={{ marginTop: scaled(spacing.xs, scale) }}>
        {fr.childProfile.changeAvatar}
      </EcolnaText>
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
          {/* La carte d'identité prend toute la hauteur du volet : deux masses égales. */}
          <ScrollView
            style={styles.leftPane}
            contentContainerStyle={styles.leftContent}
            showsVerticalScrollIndicator={false}
          >
            {identity}
          </ScrollView>
          <View style={styles.rightPane}>
            <ScrollView
              contentContainerStyle={[styles.scrollTop, styles.shadowRoom, { paddingBottom: fade }]}
              showsVerticalScrollIndicator={false}
            >
              {collection}
            </ScrollView>
            <BottomFade id="ecolna-profile-fade-pane" height={fade} />
          </View>
        </View>
      ) : (
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollTop,
              { paddingHorizontal: screenPadding, gap: scaled(spacing.xl, scale), paddingBottom: fade },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {identity}
            {collection}
          </ScrollView>
          <BottomFade id="ecolna-profile-fade" height={fade} />
        </View>
      )}
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  split: { flex: 1, flexDirection: 'row' },
  // Les volets défilent dans une marge de 12 dp rendue à la gouttière : l'ombre
  // des cartes n'est jamais rognée par le bord du défilement.
  leftPane: { flex: 1, marginHorizontal: -SHADOW_ROOM },
  // Au moins la hauteur du volet : la carte s'y étire ; plus haute, elle défile.
  leftContent: { flexGrow: 1, padding: SHADOW_ROOM, paddingTop: spacing.sm },
  rightPane: { flex: 1.15, marginHorizontal: -SHADOW_ROOM },
  scrollTop: { paddingTop: spacing.sm },
  shadowRoom: { paddingHorizontal: SHADOW_ROOM },
  who: { alignItems: 'center', justifyContent: 'center' },
  whoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  nameBlock: { alignItems: 'flex-start' },
  center: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  band: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  rule: { width: 1, backgroundColor: colors.border },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: spacing.xs },
  rings: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  ringCell: { flex: 1, alignItems: 'center' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  badgeCell: { alignItems: 'center', paddingHorizontal: spacing.xxs },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
