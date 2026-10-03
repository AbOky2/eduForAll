import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/design-system/tokens';
import { FONT_ASSETS } from '@/design-system/tokens/font-assets';
import { EcolnaText } from '@/design-system/primitives';
import { fr } from '@/localization/fr/strings';
import { StyleSheet, View } from 'react-native';

export { ErrorBoundary } from '@/shared/components/app-error-boundary';

// L'écran de lancement reste affiché tant que les polices ne sont pas prêtes.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  initialRouteName: 'index',
};

function SuspenseFallback() {
  return (
    <View style={styles.fallback}>
      <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
        {fr.common.appName}
      </EcolnaText>
    </View>
  );
}

export default function RootLayout() {
  // Polices embarquées, lues depuis le bundle : aucun réseau. Une erreur de
  // chargement ne bloque pas l'app (repli sur la police système).
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(child)" />
          <Stack.Screen name="(parent)" />
          <Stack.Screen name="(settings)" />
          <Stack.Screen name="(dev)" />
          <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export { SuspenseFallback };

const styles = StyleSheet.create({
  root: { flex: 1 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
