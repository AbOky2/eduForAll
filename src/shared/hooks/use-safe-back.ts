import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * Back navigation that can never dead-end.
 *
 * Deep links, `replace` and the parent gate can all leave a screen with an
 * empty history stack; `router.back()` then does nothing and the button looks
 * broken. This falls back to the child home, which is always a valid landing.
 */
export function useSafeBack(): () => void {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(child)/(tabs)');
  }, [router]);
}
