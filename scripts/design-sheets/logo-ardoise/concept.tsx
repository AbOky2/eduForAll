/** @jsxRuntime automatic */
/**
 * ECOLNA — piste A « L'ardoise à la boucle » (brief § 11.1), proposition au jury.
 *
 * L'ardoise d'écolier du CP (programme officiel, p. 26 : « traçage des boucles
 * vers le haut »), inclinée de −6°, cadre de bois, face d'ardoise, et UNE
 * boucle de craie continue qui est aussi le « e » cursif d'ecolna. La phrase
 * qu'un maître dirait : « C'est l'ardoise de notre école. »
 *
 * Une seule géométrie : les mêmes chaînes `d` servent l'icône d'app, les deux
 * calques Android, le symbole dans l'app et le « e » du mot-symbole (posé par
 * une échelle + une translation, jamais redessiné).
 *
 * La craie (outils reproductibles dans le dossier de travail de l'équipe) :
 * - ligne médiane en courbes de Hobby (METAFONT). Le trait part de la ligne de
 *   base à gauche, sous la descente qui le recouvre ; il monte en barre du
 *   « e » (−20°), fait la boucle, redescend, arrondit le ventre et ressort en
 *   longue sortie vers le haut à droite (−30°). Inclinaison cursive : 8° ;
 * - épaisseur 92 (9 % du canevas, 2,6 px à 29 px), modulée par une pression
 *   de craie qui suit la direction avec un temps de retard : 82 en montée,
 *   102 en descente, 80 au bout de la sortie où la craie se lève (−13 / +10 %)
 *   — plus épais en descendant, comme à la main ;
 * - forme pleine : union booléenne du trait, congés sur chaque creux (aucune
 *   pointe), nœuds aux seuls extrema : 2 contours, 18 cubiques, aucun segment
 *   de moins de 12 unités, une décimale au plus.
 * Contre-forme 154 × 99 (largeur 1,7 × le trait) ; ≥ 50 de dégagement au bord
 * de la face, donc ≥ 35 sur la couche monochrome à l'échelle 0,70.
 *
 * Budget § 15 : trois formes sur le fond (cadre, face, craie), un dégradé (le
 * fond). Rien de cuit (ni ombre ni reflet) : iOS pose son verre, Android son
 * ombre. Composants d'art : react, react-native-svg et les jetons, rien d'autre.
 */
import { memo, useId } from 'react';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { illustration } from '../../../src/design-system/tokens';

const brand = illustration.brand;

// ---------------------------------------------------------------- géométrie

/** Canevas des sources plateforme (icône d'app, calques Android). */
export const CANVAS = 1024;

/**
 * L'inclinaison est obligatoire : droite, une ardoise encadrée se lit comme une
 * tablette ou une télévision. Jamais de point « caméra », jamais de trou de
 * ficelle.
 */
export const SLATE_TILT = 'rotate(-6 512 512)';

/** Cadre de bois 752 × 564 (4:3), r 120. */
export const SLATE_FRAME = { x: 136, y: 230, width: 752, height: 564, rx: 120 } as const;

/** Face d'ardoise rentrée de 68 (le cadre fait 9 % de la largeur), r 60. */
export const SLATE_FACE = { x: 204, y: 298, width: 616, height: 428, rx: 60 } as const;

/** Anneau du cadre, face vide — version monochrome (règle de remplissage evenodd). */
export const SLATE_RING_D =
  'M256 230H768A120 120 0 0 1 888 350V674A120 120 0 0 1 768 794H256A120 120 0 0 1 136 674V350A120 120 0 0 1 256 230Z' +
  'M264 298A60 60 0 0 0 204 358V666A60 60 0 0 0 264 726H760A60 60 0 0 0 820 666V358A60 60 0 0 0 760 298Z';

/** La boucle de craie, repère de l'ardoise (avant inclinaison). */
export const CHALK_LOOP_D =
  'M707.1 511C728.7 511 747.1 528.8 747.1 550.5C747.1 560.4 743.5 570.1 736.9 577.5C724.7 591 687.5 606.5 669.9 613.6C611.2 637.4 548.6 647.9 486.5 658.9C454.4 664.7 421.9 674.3 389.1 674.3C311.4 674.3 297 617.8 297 552.2C297 516.2 301.1 476.6 317.5 444C349.2 380.9 421.9 348.8 490 348.8C558.8 348.8 637.4 389.6 637.4 467.1C637.4 491.5 623.8 521.5 623.8 525.3C623.8 539.6 636.8 535.5 645.2 532.8C659.5 528 696.2 511 707.1 511ZM553.2 465.5C553.2 443.8 516.9 437 500.4 437C451.6 437 399.6 462.4 399.6 517.6C399.6 521.7 401.5 525.9 404.1 529C414.1 540.5 431.4 533.8 444.1 531.4C478.4 524.8 531.8 516.1 548.5 481.4C550.8 476.6 553.2 470.9 553.2 465.5Z';

/**
 * Calques adaptatifs Android (108 dp) : le symbole tient dans le cercle sûr de
 * 66 dp (626 px sur 1024). L'ardoise, coins arrondis compris, s'inscrit dans un
 * cercle de 846 ; à 0,70 elle en occupe 592 — le plus grand possible avec une
 * marge (0,64, la convention des anciennes sources, la rendait trop petite à
 * 29 px : son « e » n'y faisait plus que 10 px).
 */
export const ADAPTIVE_TRANSFORM = 'translate(512 512) scale(0.7) translate(-512 -512)';

/** Boîte carrée du symbole seul : l'ardoise inclinée (783 × 616) + une marge. */
export const MARK_VIEWBOX = '112 112 800 800';

/** Boîte serrée de l'ardoise inclinée (pour composer les logotypes). */
const SLATE_BOX = { x: 120.5, y: 204.1, width: 783, height: 615.8 } as const;

// ------------------------------------------------------------ mot-symbole

/**
 * « ecolna » en bas-de-casse. Unités de la fonte (1000/em), y vers le bas,
 * ligne de base y = 0, hauteur d'x 593, hampe du l à −798, dépassement 10.
 */
export const WORDMARK_VIEWBOX = '0 -798 3789 808';
export const WORDMARK_RATIO = 3789 / 808;
const WORDMARK_HEIGHT = 808;
const WORDMARK_WIDTH = 3789;
/** Hauteur d'x du mot-symbole (unités de fonte). */
const X_HEIGHT = 593;

/**
 * « colna » : contours de Quicksand Bold (fontTools), épaissis de 29 de chaque
 * côté (fût 120 → 178 ; rapport fût / hauteur d'x 0,22 → 0,30), chaque lettre
 * élargie à travers sa contre-forme (c +22, o +36, n +40, a +30) pour que les
 * blancs restent ouverts, approche −2 %. Les fûts droits tombent sur des
 * coordonnées entières.
 */
export const COLNA_D =
  'M1225.5-603Q1129.4-603 1058.6-563.4Q992.2-523.8 954.9-454.2Q918-385.3 918-296Q918-211.2 952.6-142Q987.7-71.8 1052.6-31Q1121.2 10 1219.9 10Q1282.7 10 1333.2-3.5Q1383.8-17.4 1416.1-41.1Q1456-70.3 1456-110Q1456-144.6 1435.1-169.3Q1412.4-196 1373-196Q1340.6-196 1321.6-180.4Q1312.8-173.2 1301.1-166.6Q1292.7-162.8 1278.8-160.6Q1261.8-158 1236.8-158Q1195.5-158 1164.4-175.5Q1132.9-193.3 1115.3-223.9Q1097.6-255.1 1097.6-296Q1097.6-338.1 1114.9-369.4Q1131.9-399.6 1164-417.3Q1196.4-435 1244.6-435Q1253-435 1272.7-431.9Q1288.9-429.3 1294.5-426.1Q1295.1-425.8 1295.6-425.5Q1304.1-421.1 1309.8-416.2Q1321.4-406.2 1336.1-399.8Q1352-393 1374-393Q1412.3-393 1432.9-423.1Q1450-448 1450-477Q1450-519.8 1417.1-549.9Q1388.5-576 1339.4-589.9Q1292.3-603 1225.5-603ZM2136-296Q2136-385.8 2095.5-455.1Q2055.2-524.3 1987-563.6Q1917.4-603 1817-603Q1716.6-603 1647-563.6Q1578.8-524.3 1538.5-455.1Q1498-385.8 1498-296Q1498-206.2 1538.5-136.9Q1578.9-67.6 1647.2-28.8Q1716.7 10 1817 10Q1917.3 10 1986.8-28.8Q2055.1-67.6 2095.5-136.9Q2136-206.2 2136-296ZM1958-296Q1958-253.4 1941-222.4Q1923.4-191.7 1891.9-174.8Q1858.9-158 1817-158Q1775.1-158 1742.1-174.8Q1710.6-191.7 1693-222.4Q1676-253.4 1676-296Q1676-339.6 1693-370.6Q1710.6-401.3 1742.1-418.2Q1775.1-435 1817-435Q1858.9-435 1891.9-418.2Q1923.4-401.3 1941-370.6Q1958-339.6 1958-296ZM2409-90L2409-708Q2409-745.5 2384.6-771.4Q2359.5-798 2321-798Q2283-798 2257-772Q2231-746 2231-708L2231-90Q2231-52.2 2256.2-26.3Q2281.7 0 2319 0Q2357 0 2383-26Q2409-52 2409-90ZM2881-603Q2830.1-603 2783.8-590.8Q2741.2-578.8 2711.8-559.3Q2703.7-553.4 2696.3-547.1Q2690.6-557.6 2681.8-566.7Q2656.3-593 2618-593Q2579.7-593 2554.2-566.7Q2529-540.8 2529-503L2529-90Q2529-52.2 2554.2-26.3Q2579.7 0 2618 0Q2656.3 0 2681.8-26.3Q2707-52.2 2707-90L2707-346Q2707-371.6 2718.2-391.6Q2729.9-411 2754.8-422.9Q2782.1-435 2826.1-435Q2868-435 2885.7-424.5Q2901.9-414.1 2907.8-396.6Q2915-374.5 2915-346L2915-90Q2915-52.2 2940.2-26.3Q2965.7 0 3004 0Q3042.3 0 3067.8-26.3Q3093-52.2 3093-90L3093-346Q3093-413 3077.4-468.4Q3060.4-528.8 3014.7-565.6Q2968.2-603 2881-603ZM3700-603Q3661.7-603 3636.2-576.7Q3629-569.3 3623.9-561Q3598.9-577.1 3565.9-588.3Q3518.2-603 3459.6-603Q3373.5-603 3311.3-562.9Q3249.8-523.2 3213.8-453.9Q3178-385.1 3178-296Q3178-207.9 3213.8-139.1Q3249.9-69.7 3312.5-30Q3375.7 10 3464.4 10Q3517.4 10 3561.5-4.4Q3599.5-18.1 3626.5-38.1Q3630.7-31.9 3636.2-26.3Q3661.7 0 3700 0Q3738.3 0 3763.8-26.3Q3789-52.2 3789-90L3789-513Q3789-552 3763.5-577.5Q3738-603 3700-603ZM3482.8-158Q3441.2-158 3411.1-175.1Q3382-192.8 3366.6-223.7Q3351-255.7 3351-296Q3351-337.3 3366.6-369.3Q3382-400.2 3411.1-417.9Q3441.2-435 3482.8-435Q3525.6-435 3555.8-417.9Q3585-400.2 3600.4-369.3Q3616-337.3 3616-296Q3616-255.7 3600.4-223.7Q3585-192.8 3555.8-175.1Q3525.6-158 3482.8-158Z';

/**
 * Le glyphe signature : le « e » EST la boucle de craie de l'icône, posée à la
 * hauteur des rondes (dépassements compris) — même chaîne `d`. Son trait
 * (92 × 1,88 ≈ 173) rejoint le fût épaissi (178).
 */
export const E_IN_WORDMARK = 'translate(-559.4 -1260.1) scale(1.8837)';

// -------------------------------------------------------------- composants

type Tone = 'color' | 'mono';

/** Identifiant SVG unique par instance (dégradés, découpes). */
function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/** Les trois formes, inclinées. En mono : anneau plein + boucle pleine, face vide. */
function SlateShapes({ tone, monoColor }: { tone: Tone; monoColor: string }) {
  if (tone === 'mono') {
    return (
      <G transform={SLATE_TILT}>
        <Path d={SLATE_RING_D} fill={monoColor} fillRule="evenodd" />
        <Path d={CHALK_LOOP_D} fill={monoColor} />
      </G>
    );
  }
  return (
    <G transform={SLATE_TILT}>
      <Rect {...SLATE_FRAME} fill={brand.wood} />
      <Rect {...SLATE_FACE} fill={brand.slate} />
      <Path d={CHALK_LOOP_D} fill={brand.chalk} />
    </G>
  );
}

/** Fond or : dégradé vertical, plus clair en haut (lumière d'en haut, ΔL* 11,6). */
function GoldBackground({ id }: { id: string }) {
  return (
    <>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={brand.goldTop} />
          <Stop offset="1" stopColor={brand.goldBottom} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={CANVAS} height={CANVAS} fill={`url(#${id})`} />
    </>
  );
}

/** Le symbole seul (dans l'app, l'écran de démarrage, les logotypes). */
export const EcolnaMark = memo(function EcolnaMark({
  size,
  tone = 'color',
  monoColor = brand.wordmark,
}: {
  size: number;
  tone?: Tone;
  monoColor?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox={MARK_VIEWBOX}>
      <SlateShapes tone={tone} monoColor={monoColor} />
    </Svg>
  );
});

/** Icône d'app plein cadre, opaque, sans coin arrondi (source de app-icon.png et icon-512.png). */
export const EcolnaAppIcon = memo(function EcolnaAppIcon({ size }: { size: number }) {
  const gradient = useSvgId('ardoise-or');
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
      <GoldBackground id={gradient} />
      <SlateShapes tone="color" monoColor={brand.wordmark} />
    </Svg>
  );
});

/** Calque de fond adaptatif Android : l'or seul. */
export const EcolnaAdaptiveBackground = memo(function EcolnaAdaptiveBackground({ size }: { size: number }) {
  const gradient = useSvgId('ardoise-fond');
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
      <GoldBackground id={gradient} />
    </Svg>
  );
});

/** Calque de premier plan adaptatif Android : l'ardoise dans le cercle sûr, fond transparent. */
export const EcolnaAdaptiveForeground = memo(function EcolnaAdaptiveForeground({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
      <G transform={ADAPTIVE_TRANSFORM}>
        <SlateShapes tone="color" monoColor={brand.wordmark} />
      </G>
    </Svg>
  );
});

/**
 * Calque monochrome Android 13+ (icônes à thème) : seul l'alpha compte, le
 * système teinte. Anneau plein + boucle pleine, face vide ; séparation ≥ 35
 * (le brief demande ≥ 32), anneau de 48.
 */
export const EcolnaAdaptiveMonochrome = memo(function EcolnaAdaptiveMonochrome({
  size,
  color = illustration.white,
}: {
  size: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
      <G transform={ADAPTIVE_TRANSFORM}>
        <SlateShapes tone="mono" monoColor={color} />
      </G>
    </Svg>
  );
});

/** Le mot-symbole seul, en chemins (jamais en texte vivant). Sous ≈ 96 dp de large : le symbole seul. */
export const EcolnaWordmark = memo(function EcolnaWordmark({
  height,
  color = brand.wordmark,
}: {
  height: number;
  color?: string;
}) {
  return (
    <Svg width={height * WORDMARK_RATIO} height={height} viewBox={WORDMARK_VIEWBOX}>
      <WordmarkShapes color={color} />
    </Svg>
  );
});

function WordmarkShapes({ color }: { color: string }) {
  return (
    <>
      <G transform={E_IN_WORDMARK}>
        <Path d={CHALK_LOOP_D} fill={color} />
      </G>
      <Path d={COLNA_D} fill={color} />
    </>
  );
}

// Logotypes, composés en unités de fonte autour du mot-symbole.
/**
 * Horizontal : ardoise haute de 1,2 × le mot, centrée optiquement entre le
 * milieu de la hauteur d'x (−296) et celui de l'encre (−394) ; blanc entre
 * les deux = 0,45 hauteur d'x.
 */
const H_SLATE_SCALE = (1.2 * WORDMARK_HEIGHT) / SLATE_BOX.height;
const H_GAP = 0.45 * X_HEIGHT;
const H_SLATE_W = SLATE_BOX.width * H_SLATE_SCALE;
const H_HEIGHT = SLATE_BOX.height * H_SLATE_SCALE;
const H_CENTER_Y = -345;
const H_TOP = H_CENTER_Y - H_HEIGHT / 2;
const H_LAYOUT = {
  width: H_SLATE_W + H_GAP + WORDMARK_WIDTH,
  height: H_HEIGHT,
  slate: `translate(${(-SLATE_BOX.x * H_SLATE_SCALE).toFixed(1)} ${(H_TOP - SLATE_BOX.y * H_SLATE_SCALE).toFixed(1)}) scale(${H_SLATE_SCALE.toFixed(4)})`,
  word: `translate(${(H_SLATE_W + H_GAP).toFixed(1)} 0)`,
  viewBox: `0 ${H_TOP.toFixed(1)} ${(H_SLATE_W + H_GAP + WORDMARK_WIDTH).toFixed(1)} ${H_HEIGHT.toFixed(1)}`,
};

/** Empilé : ardoise large de la moitié du mot, blanc au-dessus de la hampe du l = 0,4 hauteur d'x. */
const S_SLATE_SCALE = (0.5 * WORDMARK_WIDTH) / SLATE_BOX.width;
const S_SLATE_H = SLATE_BOX.height * S_SLATE_SCALE;
const S_GAP = 0.4 * X_HEIGHT;
const S_TOP = -WORDMARK_HEIGHT + 10 - S_GAP - S_SLATE_H;
const S_LAYOUT = {
  width: WORDMARK_WIDTH,
  height: S_SLATE_H + S_GAP + WORDMARK_HEIGHT,
  slate: `translate(${((WORDMARK_WIDTH - SLATE_BOX.width * S_SLATE_SCALE) / 2 - SLATE_BOX.x * S_SLATE_SCALE).toFixed(1)} ${(S_TOP - SLATE_BOX.y * S_SLATE_SCALE).toFixed(1)}) scale(${S_SLATE_SCALE.toFixed(4)})`,
  viewBox: `0 ${S_TOP.toFixed(1)} ${WORDMARK_WIDTH} ${(S_SLATE_H + S_GAP + WORDMARK_HEIGHT).toFixed(1)}`,
};

/** Symbole + mot-symbole. `height` = hauteur totale du logotype. */
export const EcolnaLogo = memo(function EcolnaLogo({
  height,
  layout = 'horizontal',
}: {
  height: number;
  layout?: 'horizontal' | 'stacked';
}) {
  const l = layout === 'stacked' ? S_LAYOUT : H_LAYOUT;
  return (
    <Svg width={(height * l.width) / l.height} height={height} viewBox={l.viewBox}>
      <G transform={l.slate}>
        <SlateShapes tone="color" monoColor={brand.wordmark} />
      </G>
      {layout === 'stacked' ? (
        <WordmarkShapes color={brand.wordmark} />
      ) : (
        <G transform={H_LAYOUT.word}>
          <WordmarkShapes color={brand.wordmark} />
        </G>
      )}
    </Svg>
  );
});
