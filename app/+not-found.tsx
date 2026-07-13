import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AlifaButton, AlifaScreen, AlifaText } from '@/design-system/primitives';
import { AlifaIcon } from '@/design-system/icons/alifa-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Unknown route: kind copy, single way home — never a technical 404. */
export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <AlifaScreen background="default">
      <View style={styles.container}>
        <View style={styles.badge}>
          <AlifaIcon name="leaf" size={34} color={colors.onTertiaryContainer} />
        </View>
        <AlifaText variant="headlineMd" align="center">
          {fr.errors.contentUnavailable}
        </AlifaText>
        <AlifaButton label={fr.tabs.home} onPress={() => router.replace('/(child)/(tabs)')} />
      </View>
    </AlifaScreen>
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
