import { Tabs } from 'expo-router';
import { StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Minimal shape of the tab-bar props we consume (no direct react-navigation import). */
interface AlifaTabBarProps {
  state: { index: number; routes: Array<{ key: string; name: string }> };
  navigation: { navigate: (name: string) => void };
}

import { AlifaIcon, type IconName } from '@/design-system/icons/alifa-icon';
import { AlifaText } from '@/design-system/primitives';
import { a11y, colors, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

const TAB_META: Record<string, { label: string; icon: IconName }> = {
  index: { label: fr.tabs.home, icon: 'home' },
  learn: { label: fr.tabs.learn, icon: 'book' },
  parents: { label: fr.tabs.parents, icon: 'parents' },
};

/** Custom light tab bar with the sand active pill (mockups S06/S07/S17). */
function AlifaTabBar({ state, navigation }: AlifaTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, shadows.raised, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name];
        if (!meta) {
          return null;
        }
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={meta.label}
            accessibilityState={{ selected: focused }}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tab, focused && styles.tabActive]}
          >
            <AlifaIcon
              name={meta.icon}
              size={24}
              color={focused ? colors.onPrimaryContainer : colors.onSurfaceVariant}
              filled={focused}
            />
            <AlifaText
              variant="labelSm"
              color={focused ? colors.onPrimaryContainer : colors.onSurfaceVariant}
            >
              {meta.label}
            </AlifaText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AlifaTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="parents" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    minHeight: a11y.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xxs,
  },
  tabActive: { backgroundColor: colors.primaryContainer },
});
