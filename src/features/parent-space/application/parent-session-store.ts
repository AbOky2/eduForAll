import { AppState, type NativeEventSubscription } from 'react-native';
import { create } from 'zustand';

/** Au-delà, la porte se referme d'elle-même : un parent qui s'éloigne ne laisse rien d'ouvert. */
export const PARENT_SESSION_MS = 5 * 60 * 1000;

/**
 * La session de l'espace parents : ouverte par la porte (bonne réponse),
 * refermée quand l'app passe en arrière-plan ou au bout de
 * `PARENT_SESSION_MS`. Les layouts `(parent)` et `(settings)` renvoient à la
 * porte tant qu'elle est fermée : un lien profond (`ecolna:///dashboard`) ne
 * contourne plus la porte (Apple 1.3, Familles de Google Play).
 *
 * État de session éphémère, JAMAIS persisté (ni SQLite ni stockage) : un
 * redémarrage de l'app repart porte fermée.
 */
interface ParentSessionState {
  unlocked: boolean;
  /** La porte vient d'être franchie. */
  unlock: () => void;
  lock: () => void;
}

let expiry: ReturnType<typeof setTimeout> | null = null;
let appStateSubscription: NativeEventSubscription | null = null;

function releaseWatchers(): void {
  if (expiry !== null) {
    clearTimeout(expiry);
    expiry = null;
  }
  appStateSubscription?.remove();
  appStateSubscription = null;
}

export const useParentSession = create<ParentSessionState>((set, get) => ({
  unlocked: false,
  unlock: () => {
    releaseWatchers();
    expiry = setTimeout(() => get().lock(), PARENT_SESSION_MS);
    // « background » seulement : iOS passe par « inactive » pour un simple
    // coup d'œil au centre de contrôle, sans que l'app soit quittée.
    appStateSubscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        get().lock();
      }
    });
    set({ unlocked: true });
  },
  lock: () => {
    releaseWatchers();
    set({ unlocked: false });
  },
}));
