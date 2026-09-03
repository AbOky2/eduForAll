import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Charge une donnée à chaque fois que l'écran reprend le focus, en ignorant
 * le résultat si l'écran a été quitté entre-temps.
 *
 * `key` identifie ce qu'on charge (l'identifiant du profil, la leçon…) : le
 * chargement est relancé quand il change, et ne part pas tant qu'il est
 * `null` (profil absent). La donnée reste `null` tant que rien n'est arrivé,
 * et les écrans affichent leur squelette.
 */
export function useFocusedData<T>(load: () => Promise<T> | null, key: string | null): T | null {
  const [data, setData] = useState<T | null>(null);
  // Le chargeur est une fonction fraîche à chaque rendu ; on garde la dernière
  // sans en faire une dépendance, sinon l'effet repartirait à chaque rendu.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  useFocusEffect(
    useCallback(() => {
      if (key === null) {
        return undefined;
      }
      let cancelled = false;
      const pending = loadRef.current();
      if (pending) {
        void pending.then((value) => {
          if (!cancelled) {
            setData(value);
          }
        });
      }
      return () => {
        cancelled = true;
      };
    }, [key]),
  );
  return data;
}
