import { StyleSheet, View } from 'react-native';

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
  const { scale, isTablet, splitPanes, screenPadding } = useResponsive();
  const sceneWidth = scaled(splitPanes ? 360 : isTablet ? 420 : 300, scale);
  const sceneHeight = Math.round(sceneWidth * 0.68);

  const words = (
    <View style={[styles.words, { gap: scaled(spacing.md, scale) }]}>
      <EcolnaPill
        tone="sun"
        label={fr.offline.badge}
        icon={<EcolnaIcon name="sun" size={scaled(22, scale)} color={colors.onTertiaryContainer} />}
        style={splitPanes ? undefined : styles.center}
      />
      <EcolnaText variant={isTablet ? 'displayHero' : 'headlineLg'} align={splitPanes ? 'left' : 'center'}>
        {fr.offline.title}
      </EcolnaText>
      <EcolnaText variant="bodyLg" color={colors.textSecondary} align={splitPanes ? 'left' : 'center'}>
        {fr.offline.subtitle}
      </EcolnaText>
      <EcolnaButton label={fr.common.understood} onPress={goBack} style={styles.button} />
    </View>
  );

  return (
    <EcolnaScreen background="default">
      <View
        style={[
          styles.container,
          { paddingHorizontal: screenPadding, gap: scaled(spacing.xl, scale) },
          splitPanes && styles.split,
        ]}
      >
        <EcolnaCard rounded="xl" padded={false}>
          <SunCloudScene width={sceneWidth} height={sceneHeight} />
        </EcolnaCard>
        {words}
      </View>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  split: { flexDirection: 'row' },
  words: { flexShrink: 1, maxWidth: 480 },
  center: { alignSelf: 'center' },
  button: { marginTop: spacing.sm },
});
