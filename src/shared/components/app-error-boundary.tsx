import { StyleSheet, View } from 'react-native';

import { AlifaButton, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { colors, spacing } from '@/design-system/tokens';
import { createLogger } from '@/core/logging/logger';
import { fr } from '@/localization/fr/strings';

const log = createLogger('error-boundary');

interface ErrorBoundaryProps {
  error: Error;
  retry: () => Promise<void>;
}

/**
 * Expo Router global error boundary. Child-safe copy, no stack traces on
 * screen (they go to the local log for the parent diagnostics export).
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  log.error('route error boundary', error);
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <AlifaIcon name="leaf" size={40} color={colors.tertiaryContainer} />
      </View>
      <AlifaText variant="headlineMd" align="center">
        {fr.errors.genericTitle}
      </AlifaText>
      <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
        {fr.errors.genericMessage}
      </AlifaText>
      <AlifaButton label={fr.common.retry} onPress={() => void retry()} />
    </View>
  );
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
    backgroundColor: colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
