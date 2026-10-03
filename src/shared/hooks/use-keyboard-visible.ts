import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Le clavier logiciel est-il ouvert ? Une hauteur nulle (clavier flottant de
 * l'iPad, clavier physique) compte comme fermé : il ne prend pas de place.
 */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (event) =>
      setVisible((event.endCoordinates?.height ?? 0) > 0),
    );
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}
