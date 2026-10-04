import { Redirect } from 'expo-router';
import type { ReactElement } from 'react';

import { useParentSession } from '../application/parent-session-store';

/** La porte elle-même : la seule route adulte ouverte sans session. */
export const PARENT_GATE_ROUTE = 'gate';

/**
 * Enveloppe un écran réservé aux adultes : porte fermée, il n'est jamais
 * rendu et l'on repart vers la porte. Posé par les layouts `(parent)` et
 * `(settings)` via `screenLayout`, il vit DANS l'écran : la redirection
 * n'agit que sur l'écran qui a le focus (celui qu'on regarde), et un écran
 * resté dessous ne s'affiche plus jamais sans la porte, même un instant.
 */
export function ParentSessionGuard({ children }: { children: ReactElement }): ReactElement {
  const unlocked = useParentSession((state) => state.unlocked);
  return unlocked ? children : <Redirect href="/(parent)/gate" />;
}

/**
 * Le `screenLayout` des deux layouts adultes : chaque écran passe par la
 * garde, sauf la porte.
 */
export function guardParentScreen({
  route,
  children,
}: {
  route: { name: string };
  children: ReactElement;
}): ReactElement {
  return route.name === PARENT_GATE_ROUTE ? (
    children
  ) : (
    <ParentSessionGuard>{children}</ParentSessionGuard>
  );
}
