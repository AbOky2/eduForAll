import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { EcolnaIcon, type IconName } from '@/design-system/icons/ecolna-icon';
import { EcolnaText } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Minimal shape of the tab-bar props we consume (no direct react-navigation import). */
interface EcolnaTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

const TAB_META: Record<string, { label: string; icon: IconName }> = {
  index: { label: fr.tabs.home, icon: 'home' },
  // Le cartable : le livre est réservé à la Lecture (brief v2 § 6.5).
  learn: { label: fr.tabs.learn, icon: 'learn' },
};

/**
 * La capsule de l'onglet actif (un fond bleuté derrière l'icône pleine). Elle
 * naît à chaque changement d'onglet : un ressort court 0,6 → 1, instantané
 * quand le système demande moins de mouvement.
 */
function ActivePebble({ size }: { size: number }) {
  const reducedMotion = useReducedMotion();
  const [grow] = useState(() => new Animated.Value(reducedMotion ? 1 : 0.6));
  useEffect(() => {
    if (reducedMotion) {
      grow.setValue(1);
      return;
    }
    Animated.spring(grow, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 9,
    }).start();
  }, [grow, reducedMotion]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pebble,
        { width: size * 1.5, height: size * 0.82, borderRadius: size, transform: [{ scale: grow }] },
      ]}
    />
  );
}

/**
 * Un emplacement : pictogramme sur libellé. Quatre indices changent ensemble
 * quand il est actif — forme (galet), contenant, couleur (mode couleur),
 * graisse du libellé — jamais la couleur seule (brief v2 § 6.6).
 */
function TabButton({
  label,
  icon,
  focused,
  onPress,
  parentsDoor = false,
}: {
  label: string;
  icon: IconName;
  focused: boolean;
  onPress: () => void;
  parentsDoor?: boolean;
}) {
  const { isTablet, scale, height } = useResponsive();
  // Un téléphone en paysage est « medium » par sa largeur mais n'a que 390 dp
  // de haut : la barre se compacte d'après la hauteur, pas la classe.
  const roomy = isTablet && height >= 520;
  const iconSize = roomy ? 30 : height < 520 ? 24 : 28;
  const pebble = roomy ? 48 : height < 520 ? 38 : 44;
  return (
    <Pressable
      accessibilityRole={parentsDoor ? 'button' : 'tab'}
      accessibilityLabel={label}
      accessibilityState={parentsDoor ? undefined : { selected: focused }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.slot,
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}
    >
      <View style={[styles.iconBox, { width: pebble, height: pebble }]}>
        {focused ? <ActivePebble size={pebble} /> : null}
        {/* Une vue autour du dessin : il passe au-dessus du galet partout. */}
        <View>
          <EcolnaIcon
            name={icon}
            size={iconSize}
            mode={focused ? 'color' : 'mono'}
            color={focused ? colors.brand : colors.inkTertiary}
            modifier={parentsDoor ? 'lock' : undefined}
          />
        </View>
      </View>
      <EcolnaText
        variant={focused ? 'buttonSm' : 'labelMd'}
        color={focused ? colors.brandInk : colors.inkSecondary}
        style={{ fontSize: scaled(14, Math.min(scale, 1.15)) }}
      >
        {label}
      </EcolnaText>
    </Pressable>
  );
}

/**
 * La barre d'onglets v4 : une capsule blanche qui flotte sur la toile, trois
 * emplacements égaux. Elle reste dans le flux — les écrans n'ont rien à
 * réserver sous leur contenu.
 *
 * « Parents » n'est pas un onglet : il ouvre la porte parentale par-dessus le
 * parcours de l'enfant. Onglet réel, il restait actif derrière la pile parent
 * et le retour semblait cassé. Il garde donc son allure de porte : toujours
 * au trait, un petit cadenas, un espace qui le sépare.
 */
function EcolnaTabBar({ state, navigation }: EcolnaTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isTablet, height } = useResponsive();
  const short = height < 520;
  return (
    <View
      style={[
        styles.band,
        { paddingBottom: Math.max(insets.bottom, short ? spacing.xxs : spacing.sm) + spacing.xxs },
      ]}
    >
      <View
        style={[
          styles.bar,
          shadows.floating,
          {
            minHeight: short ? 58 : isTablet ? 80 : 70,
            paddingVertical: short ? 2 : spacing.xs,
            maxWidth: isTablet ? 480 : undefined,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) {
            return null;
          }
          return (
            <TabButton
              key={route.key}
              label={meta.label}
              icon={meta.icon}
              focused={state.index === index}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
        <TabButton
          label={fr.tabs.parents}
          icon="parents"
          focused={false}
          parentsDoor
          onPress={() => router.push('/(parent)/gate')}
        />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <EcolnaTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xs,
  },
  // Trois emplacements égaux : l'espacement ne dépend plus de la longueur des mots.
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 2 },
  iconBox: { alignItems: 'center', justifyContent: 'center' },
  pebble: { position: 'absolute', backgroundColor: colors.brandTint },
});
