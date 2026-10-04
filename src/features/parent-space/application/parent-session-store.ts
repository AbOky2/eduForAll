import { AppState, type NativeEventSubscription } from 'react-native';
import { create } from 'zustand';

/** Sans un geste pendant ce délai, la porte se referme : un parent qui s'éloigne ne laisse rien d'ouvert. */
export const PARENT_SESSION_MS = 5 * 60 * 1000;

/**
 * La session de l'espace parents : ouverte par la porte (bonne réponse),
 * refermée quand l'app passe en arrière-plan ou après `PARENT_SESSION_MS`
 * sans un geste (chaque toucher dans un écran adulte la prolonge). Le
 * partage système est une exception : sur Android, sa feuille est une autre
 * activité et fait passer l'app en arrière-plan ; le parent qui partage ne
 * doit pas retrouver la porte au retour. Les layouts `(parent)` et `(settings)` renvoient à la
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
  /** Un geste dans un écran adulte : le délai repart pour une durée entière. */
  touch: () => void;
  /** Juste avant d'ouvrir la feuille de partage du système (Android la sort de l'app). */
  beginExternalShare: () => void;
}

let expiry: ReturnType<typeof setTimeout> | null = null;
let appStateSubscription: NativeEventSubscription | null = null;
// Une feuille de partage est ouverte : l'arrière-plan qu'elle provoque ne ferme rien.
let sharing = false;

function releaseWatchers(): void {
  if (expiry !== null) {
    clearTimeout(expiry);
    expiry = null;
  }
  appStateSubscription?.remove();
  appStateSubscription = null;
  sharing = false;
}

export const useParentSession = create<ParentSessionState>((set, get) => ({
  unlocked: false,
  unlock: () => {
    releaseWatchers();
    expiry = setTimeout(() => get().lock(), PARENT_SESSION_MS);
    // « background » seulement : iOS passe par « inactive » pour un simple
    // coup d'œil au centre de contrôle, sans que l'app soit quittée.
    appStateSubscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        sharing = false;
      } else if (next === 'background' && !sharing) {
        get().lock();
      }
    });
    set({ unlocked: true });
  },
  lock: () => {
    releaseWatchers();
    set({ unlocked: false });
  },
  touch: () => {
    if (!get().unlocked) {
      return;
    }
    if (expiry !== null) {
      clearTimeout(expiry);
    }
    expiry = setTimeout(() => get().lock(), PARENT_SESSION_MS);
  },
  beginExternalShare: () => {
    if (!get().unlocked) {
      return;
    }
    sharing = true;
    get().touch();
  },
}));
