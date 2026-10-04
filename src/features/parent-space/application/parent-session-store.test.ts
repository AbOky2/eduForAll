import { AppState, type AppStateStatus } from 'react-native';

import { PARENT_SESSION_MS, useParentSession } from './parent-session-store';

/** Le dernier écouteur d'état de l'app posé par la session, et son retrait. */
let listener: ((state: AppStateStatus) => void) | null = null;
const remove = jest.fn();

describe('la session de l’espace parents', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    listener = null;
    remove.mockClear();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
      listener = handler as (state: AppStateStatus) => void;
      return { remove };
    });
    useParentSession.getState().lock();
  });

  afterEach(() => {
    useParentSession.getState().lock();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('commence fermée : rien n’est persisté d’un lancement à l’autre', () => {
    expect(useParentSession.getState().unlocked).toBe(false);
  });

  it('s’ouvre quand la porte est franchie', () => {
    useParentSession.getState().unlock();
    expect(useParentSession.getState().unlocked).toBe(true);
  });

  it('se referme quand l’app passe en arrière-plan', () => {
    useParentSession.getState().unlock();
    listener?.('inactive');
    // Un coup d'œil au centre de contrôle (iOS) ne ferme rien.
    expect(useParentSession.getState().unlocked).toBe(true);
    listener?.('background');
    expect(useParentSession.getState().unlocked).toBe(false);
    // Plus d'écouteur une fois fermée.
    expect(remove).toHaveBeenCalled();
  });

  it('se referme d’elle-même au bout de quelques minutes', () => {
    useParentSession.getState().unlock();
    jest.advanceTimersByTime(PARENT_SESSION_MS - 1000);
    expect(useParentSession.getState().unlocked).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(useParentSession.getState().unlocked).toBe(false);
    expect(PARENT_SESSION_MS).toBeLessThanOrEqual(10 * 60 * 1000);
  });

  it('repart pour une durée entière quand la porte est de nouveau franchie', () => {
    useParentSession.getState().unlock();
    jest.advanceTimersByTime(PARENT_SESSION_MS - 1000);
    useParentSession.getState().unlock();
    jest.advanceTimersByTime(2000);
    expect(useParentSession.getState().unlocked).toBe(true);
    // Un seul écouteur actif : l'ancien a été retiré.
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
