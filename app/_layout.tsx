import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/design-system/tokens';
import { AlifaText } from '@/design-system/primitives';
import { fr } from '@/localization/fr/strings';
import { StyleSheet, View } from 'react-native';

export { ErrorBoundary } from '@/shared/components/app-error-boundary';

export const unstable_settings = {
  initialRouteName: 'index',
};

function SuspenseFallback() {
  return (
    <View style={styles.fallback}>
      <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
        {fr.common.appName}
      </AlifaText>
    </View>
  );
}

export default function RootLayout() {
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
