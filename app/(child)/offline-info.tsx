import { ScrollView, StyleSheet, View } from 'react-native';

import { EcolnaPill } from '@/design-system/components/ecolna-pill';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { SunCloudScene } from '@/design-system/illustrations/scenes';
import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/**
 * Hors connexion — mockup S20, direction v3. Une bonne nouvelle, pas une
 * panne : le soleil, et la promesse que tout marche ici. En paysage, la
 * scène à gauche et les mots à droite.
 */
export default function OfflineInfoScreen() {
  const goBack = useSafeBack();
  const { scale, isTablet, isLandscape, screenPadding, width, height } = useResponsive();
  // Côte à côte dès qu'on est couché et qu'il y a la place (téléphone compris).
  const sideBySide = isLandscape && width >= 640;
  // La scène se règle sur la largeur ET la hauteur : couché, un téléphone
  // n'a pas la place d'une scène de tablette au-dessus des mots.
  const sceneWidth = Math.round(
    Math.min(
      scaled(sideBySide ? 360 : isTablet ? 420 : 300, scale),
      (height * (sideBySide ? 0.55 : 0.32)) / 0.68,
      sideBySide ? width * 0.42 : width - screenPadding * 2,
    ),
  );
  const sceneHeight = Math.round(sceneWidth * 0.68);

  const words = (
    <View style={[styles.words, { gap: scaled(spacing.md, scale) }]}>
      <EcolnaPill
        tone="sun"
        label={fr.offline.badge}
        icon={<EcolnaIcon name="sun" size={scaled(22, scale)} color={colors.onTertiaryContainer} />}
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
        <EcolnaCard rounded="xl" padded={false}>
          <SunCloudScene width={sceneWidth} height={sceneHeight} />
        </EcolnaCard>
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
