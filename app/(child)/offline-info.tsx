import { ScrollView, StyleSheet, View } from 'react-native';

import { EcolnaPill } from '@/design-system/components/ecolna-pill';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { EcolnaAvatar } from '@/design-system/avatars';
import { SubjectArt } from '@/design-system/icons/subject-art';
import { Orbit } from '@/design-system/illustrations/orbit';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * Hors connexion — direction v4. Une bonne nouvelle, pas une panne : tout
 * est déjà dans la tablette (le nuage coché, entouré des leçons, des sons et
 * des dessins). En paysage, l'illustration à gauche et les mots à droite.
 */
export default function OfflineInfoScreen() {
  const goBack = useSafeBack();
  const profile = useActiveProfile((state) => state.profile);
  const { scale, isTablet, isLandscape, screenPadding, width, height } = useResponsive();
  // Côte à côte dès qu'on est couché et qu'il y a la place (téléphone compris).
  const sideBySide = isLandscape && width >= 640;
  // L'illustration se règle sur la largeur ET la hauteur : couché, un
  // téléphone n'a pas la place d'une image de tablette au-dessus des mots.
  const art = Math.round(
    Math.min(
      scaled(sideBySide ? 340 : isTablet ? 360 : 260, scale),
      height * (sideBySide ? 0.62 : 0.36),
      sideBySide ? width * 0.4 : width - screenPadding * 2,
    ),
  );
  const chip = Math.round(art * 0.16);

  const words = (
    <View style={[styles.words, { gap: scaled(spacing.md, scale) }]}>
      <EcolnaPill
        tone="white"
        label={fr.offline.badge}
        icon={<EcolnaIcon name="offline-ok" size={scaled(20, scale)} color={colors.success} filled />}
        style={sideBySide ? undefined : styles.center}
      />
      <EcolnaText
        variant={isTablet ? 'displayHero' : 'headlineLg'}
        align={sideBySide ? 'left' : 'center'}
      >
        {fr.offline.title}
      </EcolnaText>
      <EcolnaText
        variant="bodyLg"
        color={colors.textSecondary}
        align={sideBySide ? 'left' : 'center'}
      >
        {fr.offline.subtitle}
      </EcolnaText>
      <EcolnaButton label={fr.common.understood} onPress={goBack} style={styles.button} />
    </View>
  );

  return (
    <EcolnaScreen background="default">
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: screenPadding,
            paddingVertical: scaled(spacing.lg, scale),
            gap: scaled(spacing.xl, scale),
          },
          sideBySide && styles.split,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Tout est déjà dans la tablette : les leçons, les sons, les dessins. */}
        <Orbit
          size={art}
          center={
            <View>
              <EcolnaAvatar avatarId={profile?.avatarId ?? 'avatar-1'} size={Math.round(art * 0.36)} expression="joy" />
              <View style={[styles.okBadge, { width: chip * 0.8, height: chip * 0.8, borderRadius: chip * 0.4 }]}>
                <EcolnaIcon name="offline-ok" size={Math.round(chip * 0.44)} color={colors.white} filled />
              </View>
            </View>
          }
          // L'enfant au centre, ses quatre disciplines autour : tout est là.
          satellites={(['language', 'reading', 'writing', 'math'] as const).map((subject, index) => ({
            node: <SubjectArt subject={subject} size={chip} />,
            size: chip,
            angle: -135 + index * 90,
            ring: 1 as const,
          }))}
        />
        {words}
      </ScrollView>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  split: { flexDirection: 'row' },
  words: { flexShrink: 1, maxWidth: 480 },
  center: { alignSelf: 'center' },
  button: { marginTop: spacing.sm },
  okBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.background,
  },
});
