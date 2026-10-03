const { withDangerousMod } = require('expo/config-plugins');
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

/**
 * Relève la cible de déploiement iOS de TOUS les targets de Pods.
 *
 * `react_native_post_install` ne parcourt que les targets principaux
 * (`pod_target_installation_results`). Les bundles de ressources sont des
 * targets natifs séparés : `RNSVG-RNSVGFilters` garde donc le `ios => 12.4`
 * du podspec de react-native-svg, et Xcode 27 refuse de compiler en dessous
 * de 15.0 — « the range of supported deployment target versions is 15.0 to
 * 27.0.x ».
 *
 * Le correctif vit ici plutôt que dans `ios/Podfile`, parce que `prebuild`
 * régénère le Podfile à chaque fois.
 */
const BLOC = `
    # Cible de déploiement : voir plugins/with-pods-deployment-target.js.
    # react_native_post_install laisse les bundles de ressources derrière lui.
    ecolna_minimum = (podfile_properties['ios.deploymentTarget'] || '16.4').to_f
    installer.pods_project.targets.each do |ecolna_target|
      ecolna_target.build_configurations.each do |ecolna_config|
        if ecolna_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < ecolna_minimum
          ecolna_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = ecolna_minimum.to_s
        end
      end
    end
`;

module.exports = function withPodsDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    (mod) => {
      const chemin = join(mod.modRequest.platformProjectRoot, 'Podfile');
      const podfile = readFileSync(chemin, 'utf8');
      if (podfile.includes('ecolna_minimum')) {
        return mod;
      }
      const ancre = 'post_install do |installer|';
      if (!podfile.includes(ancre)) {
        throw new Error(
          'Podfile sans bloc post_install : le plugin de cible de déploiement ne sait plus où s’insérer.',
        );
      }
      writeFileSync(chemin, podfile.replace(ancre, ancre + BLOC));
      return mod;
    },
  ]);
};
