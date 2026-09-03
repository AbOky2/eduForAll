import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlifaIcon, type IconName } from '@/design-system/icons/alifa-icon';
import { AlifaText } from '@/design-system/primitives';
import { a11y, colors, radius, shadows, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

/** Minimal shape of the tab-bar props we consume (no direct react-navigation import). */
interface AlifaTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

const TAB_META: Record<string, { label: string; icon: IconName }> = {
  index: { label: fr.tabs.home, icon: 'home' },
  learn: { label: fr.tabs.learn, icon: 'book' },
};

/** One tab-bar slot: icon over label, sand pill when active. */
function TabButton({
  label,
  icon,
  focused,
  onPress,
}: {
  label: string;
  icon: IconName;
  focused: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={[styles.tab, focused && styles.tabActive]}
    >
      <AlifaIcon
        name={icon}
        size={24}
        color={focused ? colors.onPrimaryContainer : colors.onSurfaceVariant}
        filled={focused}
      />
      <AlifaText
        variant="labelSm"
        color={focused ? colors.onPrimaryContainer : colors.onSurfaceVariant}
      >
        {label}
      </AlifaText>
    </Pressable>
  );
}

/**
 * Custom light tab bar with the sand active pill (mockups S06/S07/S17).
 *
 * « Parents » is deliberately NOT a tab: it opens the parent gate on top of
 * the child flow. As a real tab it stayed focused behind the parent stack, so
 * coming back re-triggered the redirect and the back button looked broken.
 */
function AlifaTabBar({ state, navigation }: AlifaTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View
      style={[styles.bar, shadows.raised, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
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
        onPress={() => router.push('/(parent)/gate')}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <AlifaTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
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
