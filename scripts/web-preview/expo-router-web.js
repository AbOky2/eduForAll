// Cale du banc : expose le routeur impératif pour naviguer depuis Playwright,
// et fait taire un avertissement propre au DOM (`accessible={false}` sur un
// <svg>), sans objet sur appareil.
const real = require('expo-router');
require('react-native').LogBox.ignoreLogs([/non-boolean attribute/]);
globalThis.__ecolnaRouter = real.router;
module.exports = real;
