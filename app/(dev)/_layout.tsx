import { Redirect, Stack } from 'expo-router';

import { colors } from '@/design-system/tokens';

/**
 * La galerie du design system : un outil de développement. Dans un build
 * livré, elle n'existe pas — un lien profond (ecolna:///design-system) ramène
 * à l'accueil (Apple 2.3.1 : aucune fonction cachée).
 */
export default function DevLayout() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
