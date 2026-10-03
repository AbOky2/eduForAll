import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DuneBackdrop, ExerciseBackdrop } from '../illustrations/backdrops';
import { colors, spacing } from '../tokens';
import { useResponsive } from '../responsive';

/** Un décor : ni cible tactile, ni élément lu par le lecteur d'écran. */
const DECOR = {
  pointerEvents: 'none',
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

type ScreenBackground = 'default' | 'exercise' | 'plain' | 'plain-card';

interface EcolnaScreenProps {
  children: ReactNode;
  /**
   * `default`  — ivoire et paysage ton sur ton (écrans de l'enfant)
   * `exercise` — ivoire calme, un brin d'acacia dans un coin (leçons)
   * `plain`    — ivoire nu (espace parent, réglages) ; `plain-card` : alias
   */
  background?: ScreenBackground;
  /** Extra bottom padding for screens without a tab bar. */
  withBottomInset?: boolean;
  /** Adds the standard horizontal margin. Screens that scroll add their own. */
  padded?: boolean;
  /** Retire la colonne de lecture : l'écran compose lui-même toute la largeur. */
  fullWidth?: boolean;
}

/**
 * Every screen sits inside this. It paints the place — a quiet Sahel
 * landscape for the child, plain ivory for the adult (direction v3 § 3) —
 * and, the part that matters on a tablet, keeps the content in a centred
 * column of readable width unless the screen composes the full width itself.
 */
export function EcolnaScreen({
  children,
  background = 'default',
  withBottomInset = true,
  padded = false,
  fullWidth = false,
}: EcolnaScreenProps) {
  const insets = useSafeAreaInsets();
  const { width, height, contentMaxWidth, screenPadding } = useResponsive();
  // Le décor épouse l'écran réel (au-dessus d'une barre d'onglets, dans une
  // fenêtre partagée), pas la fenêtre entière : sinon la dune proche passe
  // sous la barre et le paysage se coupe.
  const [area, setArea] = useState<{ width: number; height: number } | null>(null);
  const onLayout = (event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    if (!area || Math.abs(area.width - w) > 1 || Math.abs(area.height - h) > 1) {
      setArea({ width: w, height: h });
    }
  };
  const decorWidth = area?.width ?? width;
  const decorHeight = area?.height ?? height;
  const backgroundColor = background === 'exercise' ? colors.exerciseBackground : colors.background;

  return (
    <View style={[styles.root, { backgroundColor, paddingTop: insets.top }]} onLayout={onLayout}>
      {background === 'default' ? (
        <View style={StyleSheet.absoluteFill} {...DECOR}>
          <DuneBackdrop width={decorWidth} height={decorHeight} />
        </View>
      ) : null}
      {background === 'exercise' ? (
        <View style={StyleSheet.absoluteFill} {...DECOR}>
          <ExerciseBackdrop width={decorWidth} height={decorHeight} />
        </View>
      ) : null}
      <View style={styles.centering}>
        <View
          style={[
            styles.content,
            {
              maxWidth: fullWidth ? undefined : contentMaxWidth,
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
