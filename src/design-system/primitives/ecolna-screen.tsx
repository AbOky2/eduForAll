import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../tokens';
import { useResponsive } from '../responsive';

type ScreenBackground = 'default' | 'exercise' | 'night' | 'plain' | 'plain-card';

interface EcolnaScreenProps {
  children: ReactNode;
  /**
   * `default`  — la toile claire des écrans de navigation
   * `exercise` — la page blanche d'un exercice : la lettre y est seule
   * `night`    — la nuit du Sahel : la célébration
   * `plain`    — la toile de l'espace parent ; `plain-card` : alias
   */
  background?: ScreenBackground;
  /** Extra bottom padding for screens without a tab bar. */
  withBottomInset?: boolean;
  /** Adds the standard horizontal margin. Screens that scroll add their own. */
  padded?: boolean;
  /**
   * Héritage : la colonne de lecture est désormais tenue par la gouttière
   * (`screenPadding`, qui s'élargit sur les grandes fenêtres). Sans effet.
   */
  fullWidth?: boolean;
}

/**
 * Every screen sits inside this. v4 « Épure » : aucun décor — la couleur,
 * l'espace et le contenu portent l'écran ; le sentiment du lieu vit dans trois
 * moments dessinés (accueil, carte, célébration). Sur tablette, la gouttière
 * (`screenPadding`) borne le contenu à la colonne de largeur lisible : chaque
 * écran a le même bord gauche.
 */
export function EcolnaScreen({
  children,
  background = 'default',
  withBottomInset = true,
  padded = false,
}: EcolnaScreenProps) {
  const insets = useSafeAreaInsets();
  const { screenPadding } = useResponsive();
  const backgroundColor =
    background === 'exercise'
      ? colors.exerciseBackground
      : background === 'night'
        ? colors.night
        : colors.background;

  return (
    <View style={[styles.root, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.centering}>
        <View
          style={[
            styles.content,
            {
              paddingBottom: withBottomInset ? insets.bottom + spacing.md : 0,
              paddingHorizontal: padded ? screenPadding : 0,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centering: { flex: 1, alignItems: 'center', width: '100%' },
  content: { flex: 1, width: '100%' },
});
