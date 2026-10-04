import { Stack } from 'expo-router';

import { guardParentScreen } from '@/features/parent-space/presentation/parent-session-guard';
import { colors } from '@/design-system/tokens';

/**
 * L'espace parents. La porte reste toujours accessible ; le tableau de bord
 * n'est rendu qu'une fois la porte franchie (session éphémère), sinon on
 * repart vers la porte — y compris par un lien profond `ecolna:///dashboard`.
 */
export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_bottom',
      }}
      screenLayout={guardParentScreen}
    />
  );
}
