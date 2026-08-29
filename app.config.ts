import type { ExpoConfig } from 'expo/config';

/**
 * Store identifiers are placeholders until the product owner provides the
 * final legal identity (see docs/store-readiness.md). Development and preview
 * builds work with these values; do not submit to stores without replacing them.
 */
const ANDROID_PACKAGE = process.env.ALIFA_ANDROID_PACKAGE ?? 'td.alifa.app.dev';
const IOS_BUNDLE_IDENTIFIER = process.env.ALIFA_IOS_BUNDLE_ID ?? 'td.alifa.app.dev';

const config: ExpoConfig = {
  name: 'ALIFA',
  slug: 'alifa',
  version: '1.0.0',
  // Tablet-first: the app must work held either way. Layouts adapt through
  // src/design-system/responsive.
  orientation: 'default',
  scheme: 'alifa',
  // Light-only for V1: the Stitch design system is light mode only.
  userInterfaceStyle: 'light',
  icon: './assets/icons/app-icon.png',
  backgroundColor: '#fbf8ff',
  primaryColor: '#7d562d',
  locales: {
    fr: './src/localization/configuration/app-fr.json',
  },
  ios: {
    bundleIdentifier: IOS_BUNDLE_IDENTIFIER,
    supportsTablet: true,
    infoPlist: {
      // French-only V1; keeps the system UI (permission prompts, etc.) in French.
      CFBundleAllowMixedLocalizations: true,
      // Offline-first: the app performs no network calls at runtime.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: ANDROID_PACKAGE,
    adaptiveIcon: {
      backgroundColor: '#f2efe1',
      foregroundImage: './assets/icons/adaptive-icon-foreground.png',
      monochromeImage: './assets/icons/adaptive-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#fbf8ff',
        image: './assets/icons/splash-icon.png',
        imageWidth: 160,
      },
    ],
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Quicksand-Regular.ttf',
          './assets/fonts/Quicksand-Medium.ttf',
          './assets/fonts/Quicksand-SemiBold.ttf',
          './assets/fonts/Quicksand-Bold.ttf',
          './assets/fonts/PlusJakartaSans-SemiBold.ttf',
        ],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    contentVersion: '2.0.0',
  },
};

export default config;
