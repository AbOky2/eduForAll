import { StyleSheet, View } from 'react-native';

import { SunCloudScene } from '@/design-system/illustrations/scenes';
import { EcolnaButton, EcolnaCard, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';
import { useSafeBack } from '@/shared/hooks/use-safe-back';

/** Offline reassurance — mockup S20. */
export default function OfflineInfoScreen() {
  const goBack = useSafeBack();
  return (
    <EcolnaScreen background="default">
      <View style={styles.container}>
        <EcolnaCard rounded="xl" padded={false}>
          <SunCloudScene width={320} height={230} />
        </EcolnaCard>
        <View style={styles.badge}>
          <EcolnaText variant="labelMd" color={colors.onTertiaryContainer}>
            ☀ {fr.offline.badge}
          </EcolnaText>
        </View>
        <EcolnaText variant="headlineLg" align="center">
          {fr.offline.title}
        </EcolnaText>
        <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.offline.subtitle}
        </EcolnaText>
        <EcolnaButton label={fr.common.understood} onPress={goBack} />
      </View>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenMargin,
    gap: spacing.lg,
  },
  badge: {
    backgroundColor: colors.tertiaryFixed,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
