const {
  withInfoPlist,
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
} = require('expo/config-plugins');
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

/**
 * Adopte le cycle de vie UIScene d'UIKit.
 *
 * Une app compilée avec le SDK iOS 26 ou plus récent refuse de démarrer sans
 * lui : « Application failed to launch: UIScene life cycle is required for
 * apps built with this SDK ». Ni React Native 0.85 ni Expo SDK 56 ne
 * l'adoptent, et la montée en SDK 57 ne l'apporte pas non plus — il faut
 * l'écrire.
 *
 * Deux moitiés, indissociables : le manifeste dans l'Info.plist, et un
 * SceneDelegate qui crée réellement la fenêtre à partir de la scène. Le
 * manifeste seul donne un écran noir au lieu d'un plantage.
 *
 * Sous le cycle de vie scène, `application(_:open:options:)` n'est plus
 * appelé : les liens profonds arrivent par la scène, au démarrage à froid
 * comme à chaud. Sans ce relais, `ecolna://` cesserait de fonctionner.
 */

const SCENE_DELEGATE = `import UIKit
import React

/// Créé par plugins/with-ios-scene-lifecycle.js — ne pas éditer à la main.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    appDelegate.reactNativeFactory?.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: appDelegate.ecolnaLaunchOptions
    )

    // Démarrage à froid sur un lien : la scène le porte, pas l'app delegate.
    if let url = connectionOptions.urlContexts.first?.url {
      RCTLinkingManager.application(UIApplication.shared, open: url, options: [:])
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else { return }
    RCTLinkingManager.application(UIApplication.shared, open: url, options: [:])
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    RCTLinkingManager.application(
      UIApplication.shared, continue: userActivity, restorationHandler: { _ in }
    )
  }
}
`;

/** L'AppDelegate ne crée plus la fenêtre : c'est la scène qui s'en charge. */
function adapterAppDelegate(source) {
  if (source.includes('ecolnaLaunchOptions')) {
    return source;
  }
  const ancienBloc = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;
  if (!source.includes(ancienBloc)) {
    throw new Error(
      'AppDelegate.swift inattendu : le bloc de création de fenêtre a changé de forme. ' +
        'Revoir plugins/with-ios-scene-lifecycle.js avant de livrer.',
    );
  }
  return source
    .replace(
      'var reactNativeFactory: RCTReactNativeFactory?',
      'var reactNativeFactory: RCTReactNativeFactory?\n  /// Conservées pour la scène, qui démarre React Native.\n  var ecolnaLaunchOptions: [UIApplication.LaunchOptionsKey: Any]?',
    )
    .replace(
      ancienBloc,
      '    // La fenêtre est créée par SceneDelegate, à partir de la UIWindowScene.\n' +
        '    ecolnaLaunchOptions = launchOptions',
    );
}

module.exports = function withIosSceneLifecycle(config) {
  config = withInfoPlist(config, (mod) => {
    mod.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return mod;
  });

  config = withDangerousMod(config, [
    'ios',
    (mod) => {
      const dossier = join(
        mod.modRequest.platformProjectRoot,
        mod.modRequest.projectName ?? '',
      );
      writeFileSync(join(dossier, 'SceneDelegate.swift'), SCENE_DELEGATE);
      const appDelegate = join(dossier, 'AppDelegate.swift');
      writeFileSync(appDelegate, adapterAppDelegate(readFileSync(appDelegate, 'utf8')));
      return mod;
    },
  ]);

  return withXcodeProject(config, (mod) => {
    const nom = mod.modRequest.projectName ?? '';
    const chemin = `${nom}/SceneDelegate.swift`;
    if (!mod.modResults.hasFile(chemin)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath: chemin,
        groupName: nom,
        project: mod.modResults,
      });
    }
    return mod;
  });
};
