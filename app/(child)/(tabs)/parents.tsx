import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * The "Parents" tab immediately opens the parent gate: parent content never
 * renders inside the child flow (stores requirement for kids apps).
 */
export default function ParentsTabRedirect() {
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      router.push('/(parent)/gate');
    }, [router]),
  );
  return null;
}
