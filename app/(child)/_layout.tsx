import { Redirect, Stack } from 'expo-router';

import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { colors } from '@/design-system/tokens';

/** Guard: the child area requires an active profile. */
export default function ChildLayout() {
  const profile = useActiveProfile((state) => state.profile);
  if (!profile) {
    return <Redirect href="/(onboarding)" />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lesson/[lessonId]" options={{ gestureEnabled: false }} />
      <Stack.Screen name="offline-info" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
