import { ScrollView, StyleSheet, View } from 'react-native';

import { EcolnaPill } from '@/design-system/components/ecolna-pill';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { Orbit, OrbitChip, OrbitTile } from '@/design-system/illustrations/orbit';
import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * Hors connexion — direction v4. Une bonne nouvelle, pas une panne : tout
 * est déjà dans la tablette (le nuage coché, entouré des leçons, des sons et
 * des dessins). En paysage, l'illustration à gauche et les mots à droite.
 */
export default function OfflineInfoScreen() {
  const goBack = useSafeBack();
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
        tone="sun"
        label={fr.offline.badge}
        icon={<EcolnaIcon name="offline-ok" size={scaled(20, scale)} color={colors.rewardDeep} filled />}
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
          center={<OrbitTile icon="offline-ok" color={colors.success} size={Math.round(art * 0.32)} />}
          satellites={[
            { node: <OrbitChip icon="book" color={subjectColors.reading.solid} tint={subjectColors.reading.tint} size={chip} />, size: chip, angle: -125, ring: 1 },
            { node: <OrbitChip icon="speaker" color={colors.brand} tint={colors.brandTint} size={chip} />, size: chip, angle: -35, ring: 1 },
            { node: <OrbitChip icon="pencil" color={subjectColors.writing.solid} tint={subjectColors.writing.tint} size={chip} />, size: chip, angle: 45, ring: 1 },
            { node: <OrbitChip icon="calculator" color={subjectColors.math.solid} tint={subjectColors.math.tint} size={chip} />, size: chip, angle: 140, ring: 1 },
          ]}
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
});
