import { SplashScreen, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { bootstrapApp, type BootstrapOutcome } from '@/core/config/bootstrap';
import { EcolnaButton, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Reloads can race the splash module; starting visible is fine.
});

/**
 * Bootstrap gate (mockup S01 is the native splash). Initializes the local
 * database and content fully offline, then routes to onboarding or the child
 * home. On failure it shows a kind recovery screen — never a blank page.
 */
export default function BootstrapScreen() {
  const router = useRouter();
  const [outcome, setOutcome] = useState<BootstrapOutcome | null>(null);

  useEffect(() => {
    let cancelled = false;
    void bootstrapApp().then((result) => {
      if (!cancelled) {
        setOutcome(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (outcome) {
      SplashScreen.hideAsync().catch(() => undefined);
      if (outcome.status === 'ready') {
        router.replace(outcome.initialRoute);
      }
    }
  }, [outcome, router]);

  if (outcome?.status === 'failed') {
    return (
      <View style={styles.container}>
        <View style={styles.bubble}>
          <EcolnaIcon name="cloud-off" size={40} color={colors.onSurfaceVariant} />
        </View>
        <EcolnaText variant="headlineMd" align="center">
          {fr.errors.initFailedTitle}
        </EcolnaText>
        <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.errors.initFailedMessage}
        </EcolnaText>
        <EcolnaButton
          label={fr.common.retry}
          onPress={() => {
            setOutcome(null);
            void bootstrapApp().then(setOutcome);
          }}
        />
      </View>
    );
  }

  // Splash stays visible while bootstrapping (sub-second on target devices).
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },
  bubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
