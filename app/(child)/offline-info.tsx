import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SunCloudScene } from '@/design-system/illustrations/scenes';
import { AlifaButton, AlifaCard, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Offline reassurance — mockup S20. */
export default function OfflineInfoScreen() {
  const router = useRouter();
  return (
    <AlifaScreen background="default">
      <View style={styles.container}>
        <AlifaCard rounded="xl" padded={false}>
          <SunCloudScene width={320} height={230} />
        </AlifaCard>
        <View style={styles.badge}>
          <AlifaText variant="labelMd" color={colors.onTertiaryContainer}>
            ☀ {fr.offline.badge}
          </AlifaText>
        </View>
        <AlifaText variant="headlineLg" align="center">
          {fr.offline.title}
        </AlifaText>
        <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.offline.subtitle}
        </AlifaText>
        <AlifaButton label={fr.common.understood} onPress={() => router.back()} />
      </View>
    </AlifaScreen>
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
