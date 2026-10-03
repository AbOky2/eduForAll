/** @jsxRuntime automatic */
/**
 * ECOLNA — piste de marque B, « L'éléphanteau-livre » (finaliste du jury,
 * brief design/brief-identite-v2.md § 11.1).
 *
 * Un éléphanteau de face dont les deux oreilles sont les deux pages d'un livre
 * ouvert. Chaque oreille est une demi-couverture taupe (la peau) qui porte une
 * page : crème à gauche, côté lumière, sable à droite, côté ombre. On lit donc
 * deux choses à la fois — une oreille à l'intérieur clair, et un livre ouvert
 * dans sa couverture. La trompe descend sur le dos du livre et pend sous la
 * tranche comme un signet, puis se relève : un petit qui grandit (les
 * éléphanteaux de Zakouma, nés depuis 2013).
 *
 * Contrats (§ 14.5) : `EcolnaMark`, `EcolnaWordmark`, `EcolnaLogo`, plus les
 * sources plateforme dessinées par les mêmes chaînes `d` (une seule
 * géométrie) : `EcolnaAppIcon` (plein cadre opaque), `EcolnaAdaptiveForeground`
 * (cercle sûr 66/108, convention scale(0.64)), `EcolnaAdaptiveMonochrome`
 * (une couleur, dessinée à la main : pages et yeux évidés).
 *
 * Géométrie : canevas 1024 de l'icône. Les chaînes `d` sont générées une fois
 * (outil plume + fontTools, voir le rapport de l'équipe marque B) et
 * collées ici ; rien n'est calculé au rendu. N'importe que react,
 * react-native-svg et les jetons : rendable hors appareil.
 */
import { memo, useId } from 'react';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { illustration } from '../../../src/design-system/tokens';

// <mark-generated>
/** Tête et trompe : un seul contour (la trompe est un tube effilé dont la courbure croît vers le bout). */
const HEAD_D =
  'M512 204C628 204 722 298 722 414C722 486.9 684.2 554.6 622.1 592.8C598.4 607.4 584 633.2 584 661C584 669.4 584 678 582.4 686.3C581.6 690.9 581 695.5 580.6 700.1C580.3 705.1 580.3 710.1 580.7 715.1C581.2 720.3 582.2 725.6 583.7 730.7C585 735.3 586.6 739.8 588.5 744.2C590.1 747.8 592.5 751.2 595.4 754C598.5 756.9 602.3 759.3 606.3 760.8C609.6 762.1 613.2 763 616.8 762.8C620.3 762.5 623.8 761.3 626.7 759.3C645.7 746 671.8 750.6 685.2 769.6C698.5 788.6 693.9 814.8 674.8 828.1C663.2 836.2 650 842.4 636.4 846.2C622.7 850 608.1 851.2 593.9 850.3C580.4 849.5 566.8 846.7 553.9 842.1C540.7 837.3 528.1 830.6 516.8 822.3C506.1 814.4 496.4 805 487.6 795C479.2 785.3 471.7 774.8 465.3 763.8C458.8 752.4 453.5 740.4 449.5 727.9C445.4 715.3 442.7 702.2 441.6 688.9C440.8 679.6 440 670.3 440 661C440 633.2 425.6 607.4 401.9 592.8C339.8 554.6 302 486.9 302 414C302 298 396 204 512 204Z';
/** Les deux demi-couvertures (oreilles), même peau que la tête. */
const EAR_D =
  'M157.6 211.8C306.5 230 411.7 249.6 511.1 316.7L479.1 775.6C382.8 722.2 291.2 705.4 162.4 687.3C109 679.7 67.7 636.5 71.5 582.7L93.6 267.4C95.9 234.5 124.8 207.7 157.6 211.8ZM930.4 267.4L952.5 582.7C956.3 636.5 915 679.7 861.6 687.3C732.8 705.4 641.2 722.2 544.9 775.6L512.9 316.7C612.3 249.6 717.5 230 866.4 211.8C899.2 207.7 928.1 234.5 930.4 267.4Z';
const PAGE_L_D =
  'M155.1 247.7C294 264.7 415.4 295 508.3 357.6L481.8 735.7C394.4 687.2 283.8 668 164.9 651.3C131.3 646.6 105.1 619.1 107.4 585.2L129.5 269.9C130.4 257 142.2 246.1 155.1 247.7Z';
const PAGE_R_D =
  'M894.5 269.9L916.6 585.2C918.9 619.1 892.7 646.6 859.1 651.3C740.2 668 629.6 687.2 542.2 735.7L515.7 357.6C608.6 295 730 264.7 868.9 247.7C881.8 246.1 893.6 257 894.5 269.9Z';
/** Lignes de texte ton sur ton (≈ 1,1:1) : on les lit à 180 px, elles s'effacent à 29 px. */
const LINES_L_D =
  'M182.5 313.8C257.2 322.9 305.7 332.5 368.3 352.8M178.8 367.6C219.3 372.6 244.8 380.8 279.5 388.8M175 421.5C249.6 430.7 298.2 440.2 360.7 460.5M171.2 475.4C197.4 478.6 213.8 484.7 236.4 489.1';
const LINES_R_D =
  'M655.7 352.8C718.3 332.5 766.8 322.9 841.5 313.8M744.5 388.8C779.2 380.8 804.7 372.6 845.2 367.6M663.3 460.5C725.8 440.2 774.4 430.7 849 421.5M787.6 489.1C810.2 484.7 826.6 478.6 852.8 475.4';
const LINE_W = 18;
const EYE_WHITES_D =
  'M428 364C462.2 364 490 391.8 490 426C490 460.2 462.2 488 428 488C393.8 488 366 460.2 366 426C366 391.8 393.8 364 428 364ZM596 364C630.2 364 658 391.8 658 426C658 460.2 630.2 488 596 488C561.8 488 534 460.2 534 426C534 391.8 561.8 364 596 364Z';
const PUPILS_D =
  'M434 380C452.8 380 468 395.2 468 414C468 432.8 452.8 448 434 448C415.2 448 400 432.8 400 414C400 395.2 415.2 380 434 380ZM590 380C608.8 380 624 395.2 624 414C624 432.8 608.8 448 590 448C571.2 448 556 432.8 556 414C556 395.2 571.2 380 590 380Z';
const CATCHLIGHTS_D =
  'M423 392.5C428.8 392.5 433.5 397.2 433.5 403C433.5 408.8 428.8 413.5 423 413.5C417.2 413.5 412.5 408.8 412.5 403C412.5 397.2 417.2 392.5 423 392.5ZM579 392.5C584.8 392.5 589.5 397.2 589.5 403C589.5 408.8 584.8 413.5 579 413.5C573.2 413.5 568.5 408.8 568.5 403C568.5 397.2 573.2 392.5 579 392.5Z';
/** Reflet signature (§ 4.3) : tiret blanc vers 10–11 h, rentré ; couleur et app seulement. */
const SHEEN_D =
  'M347 347.3A178 178 0 0 1 412.5 266.4';
const SHEEN_W = 26;
const MONO_D =
  'M157.6 211.8C306.5 230 411.7 249.6 511.1 316.7L479.1 775.6C382.8 722.2 291.2 705.4 162.4 687.3C109 679.7 67.7 636.5 71.5 582.7L93.6 267.4C95.9 234.5 124.8 207.7 157.6 211.8ZM930.4 267.4L952.5 582.7C956.3 636.5 915 679.7 861.6 687.3C732.8 705.4 641.2 722.2 544.9 775.6L512.9 316.7C612.3 249.6 717.5 230 866.4 211.8C899.2 207.7 928.1 234.5 930.4 267.4ZM512 204C628 204 722 298 722 414C722 486.9 684.2 554.6 622.1 592.8C598.4 607.4 584 633.2 584 661C584 669.4 584 678 582.4 686.3C581.6 690.9 581 695.5 580.6 700.1C580.3 705.1 580.3 710.1 580.7 715.1C581.2 720.3 582.2 725.6 583.7 730.7C585 735.3 586.6 739.8 588.5 744.2C590.1 747.8 592.5 751.2 595.4 754C598.5 756.9 602.3 759.3 606.3 760.8C609.6 762.1 613.2 763 616.8 762.8C620.3 762.5 623.8 761.3 626.7 759.3C645.7 746 671.8 750.6 685.2 769.6C698.5 788.6 693.9 814.8 674.8 828.1C663.2 836.2 650 842.4 636.4 846.2C622.7 850 608.1 851.2 593.9 850.3C580.4 849.5 566.8 846.7 553.9 842.1C540.7 837.3 528.1 830.6 516.8 822.3C506.1 814.4 496.4 805 487.6 795C479.2 785.3 471.7 774.8 465.3 763.8C458.8 752.4 453.5 740.4 449.5 727.9C445.4 715.3 442.7 702.2 441.6 688.9C440.8 679.6 440 670.3 440 661C440 633.2 425.6 607.4 401.9 592.8C339.8 554.6 302 486.9 302 414C302 298 396 204 512 204ZM144.7 281L123.4 586.3C121.6 611.2 141.3 631.9 166.1 635.4C280.9 651.5 399 673.2 483 719.7L507.1 374.5C419.2 315.3 285 279.7 154 263.6C150 263.1 145 277 144.7 281ZM870 263.6C739 279.7 604.8 315.3 516.9 374.5L541 719.7C625 673.2 743.1 651.5 857.9 635.4C882.7 631.9 902.4 611.2 900.6 586.3L879.3 281C879 277 874 263.1 870 263.6ZM366 426C366 460.2 393.8 488 428 488C462.2 488 490 460.2 490 426C490 391.8 462.2 364 428 364C393.8 364 366 391.8 366 426ZM534 426C534 460.2 561.8 488 596 488C630.2 488 658 460.2 658 426C658 391.8 630.2 364 596 364C561.8 364 534 391.8 534 426ZM432.2 387.6C448.8 387.6 462.2 401 462.2 417.6C462.2 434.2 448.8 447.6 432.2 447.6C415.6 447.6 402.2 434.2 402.2 417.6C402.2 401 415.6 387.6 432.2 387.6ZM591.8 387.6C608.4 387.6 621.8 401 621.8 417.6C621.8 434.2 608.4 447.6 591.8 447.6C575.2 447.6 561.8 434.2 561.8 417.6C561.8 401 575.2 387.6 591.8 387.6Z';
const MARK_VIEWBOX = '54 69 917 917';
/** Repères de construction (planche seulement). */
export const CONSTRUCTION = {
  head: { cx: 512, cy: 414, r: 210 },
  fillet: { r: 80 },
  trunkAxis: 'M512 661L512 685A140 140 0 0 0 544.8 775A88 88 0 0 0 604.5 806.1A70 70 0 0 0 650.7 793.7',
  trunk: { root: 144, tip: 84 },
  eye: { y: 426, dx: 84, r: 62, pupil: 34, glint: 10.5 },
  rim: 36,
  bounds: [71.3, 204, 952.7, 850.6],
} as const;
// </mark-generated>

// <wordmark-generated>
/**
 * « ecolna » : contours Quicksand Bold (fontTools), y inversé et étiré de
 * 1/0.6 pour la plume elliptique (voir WordmarkShapes), ligne de base à 0.
 */
const WORDMARK_D =
  'M317 16.7Q232 16.7 169.5 -42.5Q107 -101.7 73.5 -203.3Q40 -305 40 -433.3Q40 -583.3 76.5 -689.2Q113 -795 172 -851.7Q231 -908.3 297 -908.3Q348 -908.3 393.5 -873.3Q439 -838.3 474 -777.5Q509 -716.7 529.5 -636.7Q550 -556.7 550 -466.7Q549 -396.7 531 -371.7Q513 -346.7 489 -346.7H107L77 -496.7H444L422 -463.3V-508.3Q420 -556.7 401.5 -618.3Q383 -680 355.5 -702.5Q328 -725 297 -725Q267 -725 241 -711.7Q215 -698.3 196 -666.7Q177 -635 166 -581.7Q155 -528.3 155 -446.7Q155 -356.7 177.5 -294.2Q200 -231.7 235.5 -199.2Q271 -166.7 311 -166.7Q390 -166.7 430 -166.7Q485 -166.7 485 -75Q485 16.7 430 16.7Q380 16.7 317 16.7ZM923 -908.3Q980 -908.3 1022.5 -888.3Q1065 -868.3 1088.5 -832.5Q1112 -796.7 1112 -746.7Q1112 -713.3 1100 -684.2Q1088 -655 1065 -655Q1049 -655 1038.5 -662.5Q1028 -670 1020 -681.7Q1012 -693.3 1001 -703.3Q991 -713.3 970.5 -719.2Q950 -725 940 -725Q889 -725 853.5 -688.3Q818 -651.7 799 -589.2Q780 -526.7 780 -445Q780 -365 799.5 -302.5Q819 -240 853.5 -203.3Q888 -166.7 933 -166.7Q958 -166.7 976 -171.7Q994 -176.7 1006 -186.7Q1020 -200 1031 -215Q1042 -230 1064 -230Q1090 -230 1104 -202.5Q1118 -175 1118 -135Q1118 -93.3 1090 -59.2Q1062 -25 1016.5 -4.2Q971 16.7 918 16.7Q839 16.7 781 -44.2Q723 -105 691.5 -210Q660 -315 660 -445Q660 -581.7 693.5 -685.8Q727 -790 786.5 -849.2Q846 -908.3 923 -908.3ZM1746 -445Q1746 -308.3 1709.5 -204.2Q1673 -100 1611.5 -41.7Q1550 16.7 1474 16.7Q1398 16.7 1336.5 -41.7Q1275 -100 1238.5 -204.2Q1202 -308.3 1202 -445Q1202 -581.7 1238.5 -685.8Q1275 -790 1336.5 -849.2Q1398 -908.3 1474 -908.3Q1550 -908.3 1611.5 -849.2Q1673 -790 1709.5 -685.8Q1746 -581.7 1746 -445ZM1626 -445Q1626 -530 1605.5 -592.5Q1585 -655 1550.5 -690Q1516 -725 1474 -725Q1432 -725 1397.5 -690Q1363 -655 1342.5 -592.5Q1322 -530 1322 -445Q1322 -361.7 1342.5 -299.2Q1363 -236.7 1397.5 -201.7Q1432 -166.7 1474 -166.7Q1516 -166.7 1550.5 -201.7Q1585 -236.7 1605.5 -299.2Q1626 -361.7 1626 -445ZM2525 -908.3Q2599 -908.3 2637.5 -856.7Q2676 -805 2690.5 -719.2Q2705 -633.3 2705 -528.3V-101.7Q2705 -58.3 2688 -29.2Q2671 0 2645 0Q2619 0 2602 -29.2Q2585 -58.3 2585 -101.7V-528.3Q2585 -583.3 2576.5 -627.5Q2568 -671.7 2546 -698.3Q2524 -725 2483 -725Q2443 -725 2415.5 -698.3Q2388 -671.7 2373.5 -627.5Q2359 -583.3 2359 -528.3V-101.7Q2359 -58.3 2342 -29.2Q2325 0 2299 0Q2273 0 2256 -29.2Q2239 -58.3 2239 -101.7V-790Q2239 -833.3 2256 -862.5Q2273 -891.7 2299 -891.7Q2325 -891.7 2342 -862.5Q2359 -833.3 2359 -790V-718.3L2344 -723.3Q2353 -751.7 2370 -784.2Q2387 -816.7 2410 -845Q2433 -873.3 2462 -890.8Q2491 -908.3 2525 -908.3ZM3305 -908.3Q3331 -908.3 3348 -880Q3365 -851.7 3365 -806.7V-101.7Q3365 -58.3 3348 -29.2Q3331 0 3305 0Q3279 0 3262 -29.2Q3245 -58.3 3245 -101.7V-183.3L3267 -168.3Q3267 -146.7 3253 -115.8Q3239 -85 3215 -55Q3191 -25 3158.5 -4.2Q3126 16.7 3088 16.7Q3019 16.7 2963 -42.5Q2907 -101.7 2874.5 -205.8Q2842 -310 2842 -445Q2842 -581.7 2874.5 -685.8Q2907 -790 2962 -849.2Q3017 -908.3 3084 -908.3Q3127 -908.3 3163 -886.7Q3199 -865 3225.5 -831.7Q3252 -798.3 3266.5 -764.2Q3281 -730 3281 -706.7L3245 -685V-806.7Q3245 -850 3262 -879.2Q3279 -908.3 3305 -908.3ZM3103 -166.7Q3147 -166.7 3180 -203.3Q3213 -240 3231.5 -303.3Q3250 -366.7 3250 -445Q3250 -525 3231.5 -588.3Q3213 -651.7 3180 -688.3Q3147 -725 3103 -725Q3060 -725 3027 -688.3Q2994 -651.7 2975.5 -588.3Q2957 -525 2957 -445Q2957 -366.7 2975.5 -303.3Q2994 -240 3027 -203.3Q3060 -166.7 3103 -166.7Z';
/** Le glyphe signature : le « l » à trompe (contour plein, repère réel). */
const WORDMARK_L_D =
  'M1929 -757C1977.6 -757 2017 -717.6 2017 -669V-156C2017 -152 2016.8 -148 2016.8 -144C2016.8 -139.2 2017.3 -134.4 2018.5 -129.7C2019.9 -124.1 2022.4 -118.7 2025.8 -114C2029.7 -108.6 2034.9 -104 2040.7 -100.9C2046 -98.1 2051.9 -95.6 2058 -95.6C2063.3 -95.5 2069.1 -97.7 2073.1 -101.2C2096.1 -121.9 2131.5 -120.1 2152.2 -97.1C2172.9 -74.1 2171 -38.7 2148 -18C2131 -2.7 2110.6 9.5 2089 16.9C2067.6 24.4 2044.3 27.2 2021.7 26.3C1999.4 25.3 1976.9 20.5 1956.2 12.1C1934.7 3.3 1914.5 -9.7 1897.7 -25.7C1880.3 -42.2 1865.9 -62.5 1856.2 -84.4C1846.4 -106.7 1841 -131.6 1841 -156V-669C1841 -717.6 1880.4 -757 1929 -757Z';
/** Plume : 56 u en largeur, 33.6 u en hauteur (fût 120 -> 176, rapport fût / hauteur d'x 0.30). */
const WORDMARK_PEN = 56;
const WORDMARK_SQUASH = 'scale(1 0.6)';
/** Boîte du mot : du haut du « l » au bas des rondes, plume comprise. */
const WORDMARK_BOX = { w: 3458, h: 783.8, viewBox: '-28 -757 3458 783.8' } as const;
/** Assemblages : symbole cadré sur sa boîte réelle, mot-symbole aligné sur la ligne des yeux. */
const LOCKUP = {
  horizontal: {
    w: 4205.7,
    h: 1000,
    viewBox: '0 0 4205.7 1000',
    mark: 'translate(0 0) scale(1.5456) translate(-71 -204)',
    word: 'translate(1503.2 58.4) scale(0.7815) translate(28 757)',
  },
  stacked: {
    w: 1526.8,
    h: 1436.1,
    viewBox: '0 0 1526.8 1436.1',
    mark: 'translate(81.8 0) scale(1.5456) translate(-71 -204)',
    word: 'translate(0 1090) scale(0.4415) translate(28 757)',
  },
} as const;
// </wordmark-generated>

const B = illustration.elephanteau;
const PAGE_LIGHT = illustration.fabric.cream.base;
const PAGE_SHADE = illustration.fabric.sand.base;

/** Transformation des calques adaptatifs Android : 1024 -> cercle sûr de 626. */
const ADAPTIVE = 'translate(512 512) scale(0.64) translate(-512 -512)';
/** Splash : même échelle, recentré sur le symbole (sa boîte descend sous 512). */
const SPLASH = 'translate(512 512) scale(0.62) translate(-512 -527)';

/** Le dessin en couleur, dans le canevas 1024. */
const MarkColorShapes = memo(function MarkColorShapes({ sheen }: { sheen: boolean }) {
  return (
    <G>
      <Path d={EAR_D} fill={B.skin.base} />
      <Path d={PAGE_L_D} fill={PAGE_LIGHT} />
      <Path d={PAGE_R_D} fill={PAGE_SHADE} />
      <Path d={LINES_L_D} stroke={B.lineOnCream} strokeWidth={LINE_W} strokeLinecap="round" fill="none" />
      <Path d={LINES_R_D} stroke={B.lineOnSand} strokeWidth={LINE_W} strokeLinecap="round" fill="none" />
      <Path d={HEAD_D} fill={B.skin.base} />
      {sheen ? (
        <Path d={SHEEN_D} stroke={illustration.white} strokeWidth={SHEEN_W} strokeLinecap="round" fill="none" />
      ) : null}
      <Path d={EYE_WHITES_D} fill={illustration.white} />
      <Path d={PUPILS_D} fill={illustration.face.eye} />
      <Path d={CATCHLIGHTS_D} fill={illustration.white} />
    </G>
  );
});

/**
 * Le dessin en une couleur : silhouette pleine, pages et blancs des yeux
 * évidés (enroulement inverse, règle nonzero), pupilles pleines. La
 * couverture garde ≥ 32 px une fois réduite à 0,64.
 */
const MarkMonoShapes = memo(function MarkMonoShapes({ color }: { color: string }) {
  return <Path d={MONO_D} fill={color} />;
});

export interface EcolnaMarkProps {
  size: number;
  tone?: 'color' | 'mono';
  monoColor?: string;
}

/** Le symbole seul (sans fond), pour l'app : en-tête, splash, à-propos. */
export const EcolnaMark = memo(function EcolnaMark({
  size,
  tone = 'color',
  monoColor = illustration.brand.wordmark,
}: EcolnaMarkProps) {
  return (
    <Svg width={size} height={size} viewBox={MARK_VIEWBOX}>
      {tone === 'mono' ? <MarkMonoShapes color={monoColor} /> : <MarkColorShapes sheen />}
    </Svg>
  );
});

/**
 * Icône d'app plein cadre, opaque, sans coin arrondi (iOS et Play
 * appliquent leur masque). Rien de « cuit » : ni ombre, ni reflet de tête —
 * iOS ajoute son verre. Seul dégradé : le fond (≤ 12 % de L*).
 */
export const EcolnaAppIcon = memo(function EcolnaAppIcon({ size }: { size: number }) {
  const id = `${useId()}-ecolna-fond`;
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={illustration.brand.goldTop} />
          <Stop offset="1" stopColor={illustration.brand.goldBottom} />
        </LinearGradient>
      </Defs>
      <Rect width={1024} height={1024} fill={`url(#${id})`} />
      <MarkColorShapes sheen={false} />
    </Svg>
  );
});

/** Calque avant adaptatif Android : transparent, symbole dans le cercle de 626. */
export const EcolnaAdaptiveForeground = memo(function EcolnaAdaptiveForeground({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <G transform={ADAPTIVE}>
        <MarkColorShapes sheen={false} />
      </G>
    </Svg>
  );
});

/** Icône thématique Android (13+) : une couleur, le système teinte. */
export const EcolnaAdaptiveMonochrome = memo(function EcolnaAdaptiveMonochrome({
  size,
  color = illustration.white,
}: {
  size: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <G transform={ADAPTIVE}>
        <MarkMonoShapes color={color} />
      </G>
    </Svg>
  );
});

/**
 * Splash (Android 12+ garde un cercle des deux tiers centraux) : le symbole
 * seul, sans mot — le texte en y = 902 de l'ancien splash sortait du cercle.
 */
export const EcolnaSplashIcon = memo(function EcolnaSplashIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <G transform={SPLASH}>
        <MarkColorShapes sheen={false} />
      </G>
    </Svg>
  );
});

/** Fond du calque adaptatif (couleur plate, `android.adaptiveIcon.backgroundColor`). */
export const ADAPTIVE_BACKGROUND = illustration.brand.goldBottom;

/**
 * Le mot-symbole : le contour Quicksand, étiré verticalement, reçoit un trait
 * de même couleur (jointures rondes) puis est recomprimé — la plume devient
 * une ellipse : les fûts s'épaississent plus que les horizontales, comme une
 * vraie graisse. Le « l » à trompe est un contour plein, déjà à sa graisse.
 */
const WordmarkShapes = memo(function WordmarkShapes({ color }: { color: string }) {
  return (
    <G>
      <G transform={WORDMARK_SQUASH}>
        <Path d={WORDMARK_D} fill={color} stroke={color} strokeWidth={WORDMARK_PEN} strokeLinejoin="round" />
      </G>
      <Path d={WORDMARK_L_D} fill={color} />
    </G>
  );
});

/** « ecolna » en chemins (jamais en texte vivant). `height` = hauteur de la boîte. */
export const EcolnaWordmark = memo(function EcolnaWordmark({
  height,
  color = illustration.brand.wordmark,
}: {
  height: number;
  color?: string;
}) {
  const width = (height * WORDMARK_BOX.w) / WORDMARK_BOX.h;
  return (
    <Svg width={width} height={height} viewBox={WORDMARK_BOX.viewBox}>
      <WordmarkShapes color={color} />
    </Svg>
  );
});

/** Symbole + mot-symbole. `height` = hauteur totale du bloc. */
export const EcolnaLogo = memo(function EcolnaLogo({
  height,
  layout = 'horizontal',
}: {
  height: number;
  layout?: 'horizontal' | 'stacked';
}) {
  const L = layout === 'stacked' ? LOCKUP.stacked : LOCKUP.horizontal;
  return (
    <Svg width={(height * L.w) / L.h} height={height} viewBox={L.viewBox}>
      <G transform={L.mark}>
        <MarkColorShapes sheen />
      </G>
      <G transform={L.word}>
        <WordmarkShapes color={illustration.brand.wordmark} />
      </G>
    </Svg>
  );
});
