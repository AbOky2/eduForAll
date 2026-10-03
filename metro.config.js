// Configuration Metro. Sans `ECOLNA_WEB_PREVIEW=1`, c'est exactement la
// configuration par défaut d'Expo : les builds iOS et Android n'en voient rien.
//
// Avec `ECOLNA_WEB_PREVIEW=1`, le banc de rendu web (docs/visual-qa.md) fait
// tourner l'app réelle dans un navigateur pour la regarder écran par écran :
// SQLite en WebAssembly (en-têtes COOP/COEP), deux cales web, et les polices
// servies par Metro (le plugin natif les embarque, le web ne les a pas).
const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (process.env.ECOLNA_WEB_PREVIEW === '1') {
  const shims = path.join(__dirname, 'scripts/web-preview');
  const sqliteShim = path.join(shims, 'expo-sqlite-web.js');
  const routerShim = path.join(shims, 'expo-router-web.js');
  config.resolver.assetExts.push('wasm');
  const upstream = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const fromApp = !context.originModulePath.includes('node_modules');
    if (platform === 'web' && moduleName === 'expo-sqlite' && context.originModulePath !== sqliteShim) {
      return { type: 'sourceFile', filePath: sqliteShim };
    }
    if (platform === 'web' && moduleName === 'expo-router' && fromApp && context.originModulePath !== routerShim) {
      return { type: 'sourceFile', filePath: routerShim };
    }
    return (upstream ?? context.resolveRequest)(context, moduleName, platform);
  };
  config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
    if (req.url && req.url.startsWith('/__fonts/')) {
      const file = path.join(__dirname, 'assets/fonts', path.basename(req.url));
      if (fs.existsSync(file)) {
        res.setHeader('Content-Type', 'font/ttf');
        res.end(fs.readFileSync(file));
        return;
      }
    }
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
}

module.exports = config;
