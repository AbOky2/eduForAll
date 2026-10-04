import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getDatabase } from '@/database/connection/database';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import {
  findLesson,
  lessonForSkill,
  worldOfLesson,
} from '@/features/curriculum/application/curriculum-catalog';
import { describeSkill } from '@/features/parent-space/application/parent-dashboard';
import { REVISION_BATCH } from '@/features/revision/domain/revision-engine';
import { createRevisionRepository } from '@/features/revision/infrastructure/revision-repository';
import { EcolnaAvatar } from '@/design-system/avatars';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { SubjectArt, type SubjectArtId } from '@/design-system/icons/subject-art';
import {
  EcolnaButton,
  EcolnaCard,
  EcolnaIconButton,
  EcolnaScreen,
  EcolnaText,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useFocusedData } from '@/shared/hooks/use-focused-data';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

interface RevisionItem {
  skillId: string;
  label: string;
  lessonId: string | null;
  subject: SubjectArtId | null;
}

/**
 * L'atelier de révision (direction v4). On ne dit pas « tu as échoué » : on
 * revoit ensemble ce qui est encore fragile. La composition de l'écran hors
 * connexion : couché, à gauche l'enfant, au calme, dans le bleu de la
 * révision, la pastille de reprise à l'épaule ; à droite le titre, les leçons
 * à revoir sur une carte blanche posée — un aperçu, qu'on ne touche pas — et
 * une seule action : le bouton soleil. Deux cibles qui ouvrent la même leçon
 * laisseraient l'enfant hésiter entre elles. Debout, le même ordre, centré.
 */
export default function RevisionScreen() {
  const router = useRouter();
  const goBack = useSafeBack();
  const { scale, isTablet, isLandscape, screenPadding, width, height } = useResponsive();
  const profile = useActiveProfile((state) => state.profile);
  const items: RevisionItem[] =
    useFocusedData(
      () =>
        profile
          ? getDatabase()
              .then((db) =>
                createRevisionRepository(db).findOpen(
                  profile.id,
                  REVISION_BATCH,
                  new Date().toISOString(),
                ),
              )
              // Each struggled skill maps back to the first lesson that trains it.
              .then((open) =>
                // Le motif du moteur est écrit pour un adulte : il reste à
                // l'espace parent. L'enfant voit la notion, pas le reproche.
                open.map(({ skillId }) => {
                  const lessonId = lessonForSkill(skillId);
                  // L'enfant lit le nom de la leçon (« Ma maison : l'histoire »),
                  // jamais un identifiant de compétence.
                  const lesson = lessonId ? findLesson(lessonId) : null;
                  return {
                    skillId,
                    label: lesson?.title ?? describeSkill(skillId),
                    lessonId,
                    subject: lessonId ? (worldOfLesson(lessonId)?.subject ?? null) : null,
                  };
                }),
              )
          : null,
      profile?.id ?? null,
    ) ?? [];

  const firstLesson = items.find((item) => item.lessonId)?.lessonId ?? null;
  // Côte à côte dès qu'on est couché et qu'il y a la place, comme l'écran
  // hors connexion : l'enfant à gauche, les mots et l'action à droite.
  const sideBySide = isLandscape && width >= 640;
  const align = sideBySide ? 'left' : 'center';
  // Le disque se règle sur la largeur ET la hauteur : couché, un téléphone
  // n'a pas la place d'un grand portrait au-dessus des mots.
  const disc = Math.round(
    Math.min(
      scaled(sideBySide ? 300 : isTablet ? 280 : 200, scale),
      height * (sideBySide ? 0.56 : 0.28),
      sideBySide ? width * 0.34 : width - screenPadding * 2,
    ),
  );
  const portrait = Math.round(disc * 0.6);
  const pip = Math.max(scaled(28, scale), Math.round(portrait * 0.24));
  const emblem = scaled(40, scale);

  // L'enfant, au calme, sur son assiette blanche, dans le bleu de la révision ;
  // à son épaule, la pastille de reprise — la même que dans la feuille « à
  // revoir ». On revoit ensemble : l'écran commence par lui, pas par l'erreur.
  const art = (
    <View
      style={[styles.disc, { width: disc, height: disc, borderRadius: disc / 2 }]}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    >
      <View>
        <View
          style={[
            styles.plate,
            { width: portrait, height: portrait, borderRadius: portrait / 2 },
          ]}
        />
        <View style={styles.portrait}>
          <EcolnaAvatar
            avatarId={profile?.avatarId ?? 'avatar-1'}
            size={portrait}
            expression={items.length === 0 ? 'joy' : 'calm'}
            backdrop={false}
            popOut
          />
        </View>
        {items.length > 0 ? (
          <View
            style={[
              styles.pip,
              {
                width: pip,
                height: pip,
                borderRadius: pip / 2,
                borderWidth: Math.max(3, Math.round(pip * 0.1)),
              },
            ]}
          >
            <EcolnaIcon name="replay" size={Math.round(pip * 0.56)} color={colors.white} />
          </View>
        ) : null}
      </View>
    </View>
  );

  const work =
    items.length === 0 ? (
      <EcolnaCard rounded="xl" style={[styles.emptyCard, { gap: scaled(spacing.md, scale) }]}>
        <EcolnaIcon name="star" size={scaled(56, scale)} color={colors.reward} filled />
        <EcolnaText variant="headlineSm" align="center">
          {fr.revision.empty}
        </EcolnaText>
      </EcolnaCard>
    ) : (
      <View style={{ gap: scaled(spacing.lg, scale) }}>
        {/* Une page de cahier posée : une carte blanche (filet, ombre douce),
            chaque leçon sur sa ligne, l'emblème de sa discipline devant. Un
            aperçu, pas un bouton — rien ne s'y touche ; une seule action, le
            bouton soleil. */}
        <EcolnaCard rounded="xl" padded={false}>
          {items.map((item, index) => (
            <View
              key={item.skillId}
              accessible
              accessibilityLabel={item.label}
              style={[
                styles.row,
                index > 0 && styles.rowRule,
                {
                  gap: scaled(spacing.md, scale),
                  paddingVertical: scaled(spacing.md, scale),
                  paddingHorizontal: scaled(spacing.lg, scale),
                },
              ]}
            >
              {item.subject ? (
                <SubjectArt subject={item.subject} size={emblem} />
              ) : (
                <View style={[styles.leaf, { width: emblem, height: emblem }]}>
                  <EcolnaIcon
                    name="sprout"
                    size={scaled(24, scale)}
                    color={colors.success}
                    filled
                  />
                </View>
              )}
              <EcolnaText variant="headlineSm" style={styles.flex}>
                {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
              </EcolnaText>
            </View>
          ))}
        </EcolnaCard>
        {firstLesson ? (
          <EcolnaButton
            label={fr.revision.start}
            icon={
              <EcolnaIcon name="play" size={scaled(20, scale)} color={colors.onReward} filled />
            }
            onPress={() => router.push(`/(child)/lesson/${firstLesson}`)}
          />
        ) : (
          // Aucune leçon ne cible encore ces notions : pas de bouton mort, une phrase.
          <EcolnaText variant="bodyLg" color={colors.textSecondary} align={align}>
            {fr.revision.inLessons}
          </EcolnaText>
        )}
      </View>
    );

  return (
    <EcolnaScreen background="default" fullWidth>
      <View style={[styles.header, { paddingHorizontal: screenPadding }]}>
        <EcolnaIconButton icon="arrow-back" accessibilityLabel={fr.common.back} onPress={goBack} />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: screenPadding,
            paddingBottom: scaled(spacing.xxl, scale),
            gap: scaled(sideBySide ? spacing.xxxl : spacing.xl, scale),
          },
          sideBySide && styles.split,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {art}
        <View
          style={[
            styles.words,
            {
              gap: scaled(spacing.sm, scale),
              maxWidth: scaled(isTablet ? 440 : 360, scale),
            },
          ]}
        >
          <EcolnaText
            variant={isTablet ? 'displayHero' : 'headlineLg'}
            align={align}
            accessibilityRole="header"
          >
            {fr.revision.title}
          </EcolnaText>
          <EcolnaText variant="bodyLg" color={colors.textSecondary} align={align}>
            {fr.revision.subtitle}
          </EcolnaText>
          <View style={{ marginTop: scaled(spacing.lg, scale) }}>{work}</View>
        </View>
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: spacing.sm },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  split: { flexDirection: 'row' },
  words: { flexShrink: 1, width: '100%' },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandTint,
  },
  plate: { backgroundColor: colors.white },
  // Le portrait se pose sur l'assiette ; sa coiffure peut en sortir par le haut.
  portrait: { position: 'absolute', left: 0, bottom: 0 },
  pip: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderColor: colors.brandTint,
  },
  emptyCard: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowRule: { borderTopWidth: 1, borderTopColor: colors.border },
  leaf: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.successTint,
  },
  flex: { flex: 1 },
});
