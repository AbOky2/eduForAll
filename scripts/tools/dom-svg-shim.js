// react-native-svg -> balises SVG du DOM, pour le rendu hors application.
const tags = ['Circle','Ellipse','G','Line','Path','Polygon','Polyline','Rect','Text','Defs','ClipPath','LinearGradient','Stop','Mask','Use'];
const map = { Text: 'text' };
Object.defineProperty(module.exports, '__esModule', { value: true });
module.exports.Svg = 'svg';
module.exports.default = 'svg';
for (const tag of tags) {
  module.exports[tag] = map[tag] ?? tag.toLowerCase();
}
