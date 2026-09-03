import type { ExpoConfig } from 'expo/config';

/**
 * Store identifiers are placeholders until the product owner provides the
 * final legal identity (see docs/store-readiness.md). Development and preview
 * builds work with these values; do not submit to stores without replacing them.
 */
const ANDROID_PACKAGE = process.env.ALIFA_ANDROID_PACKAGE ?? 'td.alifa.app.dev';
const IOS_BUNDLE_IDENTIFIER = process.env.ALIFA_IOS_BUNDLE_ID ?? 'td.alifa.app.dev';

/**
 * Projet EAS @okimy/alifa. Ce n'est pas un secret : c'est l'équivalent de ce
 * qu'Expo écrit dans app.json sur un projet à configuration statique. La
 * configuration d'ALIFA étant dynamique, EAS ne peut pas l'écrire lui-même.
 * La variable d'environnement permet de pointer un autre projet.
 */
const EAS_PROJECT_ID =
  process.env.EAS_PROJECT_ID ?? 'aa1d821b-49a3-4a56-aad8-9cd2a0b0afa3';

/**
 * Vrai pour tout build destiné à quelqu'un d'autre que le développeur
 * (profils preview, production, production-apk d'eas.json).
 *
 * React Native déclare par défaut des permissions dont il n'a besoin qu'en
 * développement : INTERNET pour joindre Metro, SYSTEM_ALERT_WINDOW pour
 * l'overlay du menu dev. Les laisser dans une app pour enfants qui promet
 * de ne jamais accéder au réseau serait une contradiction visible dans la
 * liste des autorisations du Play Store.
 */
const IS_RELEASE_BUILD = process.env.ALIFA_RELEASE === '1';

/**
 * Autorisations retirées des builds livrés. ALIFA n'effectue aucun appel
 * réseau (règle n° 1 du projet) et n'écrit que dans sa base privée : rien de
 * tout cela ne lui sert. VIBRATE est conservée — le retour haptique de fin
 * d'exercice s'en sert.
 */
const BLOCKED_PERMISSIONS = [
  'android.permission.INTERNET',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

const config: ExpoConfig = {
  name: 'ALIFA',
  slug: 'alifa',
  owner: 'okimy',
  version: '1.0.0',
  // Tablet-first: the app must work held either way. Layouts adapt through
  // src/design-system/responsive.
  orientation: 'default',
  scheme: 'alifa',
  // Le projet n'embarque pas react-native-web. Le déclarer évite que
  // `expo export --platform all` parte sur une plateforme absente.
  platforms: ['ios', 'android'],
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
    // La progression de l'enfant ne doit pas partir dans la sauvegarde Google
    // Drive : la politique de confidentialité affirme que les données ne
    // quittent jamais l'appareil, et c'est ce qui est déclaré dans le
    // formulaire Data Safety.
    allowBackup: false,
    ...(IS_RELEASE_BUILD ? { blockedPermissions: BLOCKED_PERMISSIONS } : {}),
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
    contentVersion: '2.1.0',
    ...(EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {}),
  },
};

export default config;
