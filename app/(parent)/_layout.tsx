import { Stack } from 'expo-router';

import { colors } from '@/design-system/tokens';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_bottom',
      }}
    />
  );
}
