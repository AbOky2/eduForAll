import { Stack } from 'expo-router';

import { guardParentScreen } from '@/features/parent-space/presentation/parent-session-guard';
import { colors } from '@/design-system/tokens';

/**
 * Les paramètres appartiennent à l'espace parents : chaque écran (réglages,
 * confidentialité, diagnostic) renvoie à la porte tant qu'elle n'a pas été
 * franchie, quel que soit le chemin — lien profond compris.
 */
export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      screenLayout={guardParentScreen}
    />
  );
}
