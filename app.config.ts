import type { ExpoConfig } from 'expo/config';

/**
 * Store identifiers are placeholders until the product owner provides the
 * final legal identity (see docs/store-readiness.md). Development and preview
 * builds work with these values; do not submit to stores without replacing them.
 */
const ANDROID_PACKAGE = process.env.ECOLNA_ANDROID_PACKAGE ?? 'td.ecolna.app.dev';
const IOS_BUNDLE_IDENTIFIER = process.env.ECOLNA_IOS_BUNDLE_ID ?? 'td.ecolna.app.dev';

/**
 * Projet EAS `@okimy/alifa` — l'app s'appelle ECOLNA, son projet EAS a gardé
 * son nom d'origine. Ce n'est pas un secret : c'est l'équivalent de ce qu'Expo
 * écrit dans app.json sur un projet à configuration statique. La configuration
 * d'ECOLNA étant dynamique, EAS ne peut pas l'écrire lui-même. La variable
 * d'environnement permet de pointer un autre projet.
 */
const EAS_PROJECT_ID =
  process.env.EAS_PROJECT_ID ?? 'aa1d821b-49a3-4a56-aad8-9cd2a0b0afa3';

/**
 * Vrai pour tout build destiné à quelqu'un d'autre que le développeur
 * (profils preview, production, production-apk d'eas.json).
 *
 * INTERNET arrive par les manifestes d'`expo-file-system` et d'`expo-image`,
 * pas par React Native lui-même. La laisser dans une app pour enfants qui
 * promet de ne jamais accéder au réseau serait une contradiction visible dans
 * la liste des autorisations du Play Store. Les trois autres ne sont plus
 * déclarées par les dépendances actuelles : les bloquer ne coûte rien et
 * protège d'une régression d'une mise à jour de dépendance.
 */
const IS_RELEASE_BUILD = process.env.ECOLNA_RELEASE === '1';

/**
 * Un build livré qui retombe sur l'identifiant `.dev` produit un paquet que le
 * store refuse, et des clés de signature créées sous le mauvais nom. Les
 * valeurs par défaut ci-dessus sont là pour le développement : en release,
 * elles doivent avoir été fournies explicitement par le profil eas.json.
 */
if (IS_RELEASE_BUILD && (!process.env.ECOLNA_ANDROID_PACKAGE || !process.env.ECOLNA_IOS_BUNDLE_ID)) {
  throw new Error(
    'Build de release sans ECOLNA_ANDROID_PACKAGE / ECOLNA_IOS_BUNDLE_ID : ' +
      'l’app partirait sous l’identifiant de développement. Voir eas.json.',
  );
}

/**
 * Autorisations retirées des builds livrés. ECOLNA n'effectue aucun appel
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
  name: 'ECOLNA',
  // ⚠️ Ne pas renommer en 'ecolna'. eas-cli récupère le projet par
  // `extra.eas.projectId`, puis VÉRIFIE que ce slug est celui du projet côté
  // serveur : toute divergence fait échouer `eas build`, `eas submit` et
  // `eas project:info`. Le projet s'appelle encore `alifa` sur expo.dev ; le
  // renommer là-bas d'abord, puis aligner cette ligne.
  slug: 'alifa',
  owner: 'okimy',
  version: '1.0.0',
  // Tablet-first: the app must work held either way. Layouts adapt through
  // src/design-system/responsive.
  orientation: 'default',
  scheme: 'ecolna',
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
      // Le fond de l'icône adaptative doit être celui de la marque : Android
      // compose l'avant-plan par-dessus et rogne en cercle ou en écusson.
      backgroundColor: '#2b6485',
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
