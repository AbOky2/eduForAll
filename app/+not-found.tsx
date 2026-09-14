import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EcolnaButton, EcolnaScreen, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Unknown route: kind copy, single way home — never a technical 404. */
export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <EcolnaScreen background="default">
      <View style={styles.container}>
        <View style={styles.badge}>
          <EcolnaIcon name="leaf" size={34} color={colors.onTertiaryContainer} />
        </View>
        <EcolnaText variant="headlineMd" align="center">
          {fr.errors.contentUnavailable}
        </EcolnaText>
        <EcolnaButton label={fr.tabs.home} onPress={() => router.replace('/(child)/(tabs)')} />
      </View>
    </EcolnaScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
