import { memo, useId, useMemo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors, illustration } from '../tokens';
import { acacia, bandD, bandExtrema, lensD, q, type BandSpec } from './scene-geometry';

/**
 * Fonds d'écran (direction v3 § 3). Le paysage du Sahel derrière
 * l'interface, ton sur ton : un ciel qui se réchauffe vers le haut, deux
 * bandes de dunes et un acacia au loin. Rien ne dépasse
 * 1,23:1 de contraste avec l'ivoire du fond — on sent un lieu, on ne le
 * regarde pas. Dessinés en dp à la taille réelle de la fenêtre (un fond étiré
 * déformerait les dunes), recalculés seulement quand elle change.
 *
 * Uniquement react-native-svg et les jetons : rendables hors appareil.
 */

const ambient = illustration.ambient;

interface BackdropProps {
  width: number;
  height: number;
}

/** Le lieu des écrans de l'enfant : accueil, apprendre, carte, profil. */
export const DuneBackdrop = memo(function DuneBackdrop({ width, height }: BackdropProps) {
  const skyId = useId();
  const art = useMemo(() => {
    const W = Math.max(width, 1);
    const H = Math.max(height, 1);
    // Unité : la petite dimension, pour que dunes et arbre gardent leurs
    // proportions du téléphone au paysage de tablette.
    const u = Math.min(W, H) / 100;
    const yFar = H - Math.min(H * 0.2, 30 * u);
    const yNear = H - Math.min(H * 0.1, 15 * u);
    const far: BandSpec = {
      core: [
        [W * 0.12, yFar - 2.5 * u],
        [W * 0.42, yFar + 1.5 * u],
        [W * 0.78, yFar - 3 * u],
      ],
      step: Math.max(W * 0.3, 34 * u),
      crest: yFar - 2 * u,
      trough: yFar + 1.5 * u,
    };
    const near: BandSpec = {
      core: [
        [W * 0.28, yNear + 1.5 * u],
        [W * 0.6, yNear - 2.5 * u],
        [W * 0.95, yNear + 1 * u],
      ],
      step: Math.max(W * 0.38, 44 * u),
      crest: yNear - 2 * u,
      trough: yNear + 1.5 * u,
    };
    // Un arbre lointain : ≈ 15 % de la petite dimension, jamais plus de 120 dp.
    const treeU = Math.min(0.5 * u, 4);
    const tree = acacia(W * 0.88, yFar - 0.8 * u, treeU);
    return {
      W: q(W),
      H: q(H),
      skyH: q(H * 0.55),
      far: bandD(bandExtrema(far, 0, 0, W), H),
      near: bandD(bandExtrema(near, 0, 0, W), H),
      tree,
    };
  }, [width, height]);
  const { tree } = art;
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${art.W} ${art.H}`}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={ambient.skyTop} />
          <Stop offset="1" stopColor={colors.background} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={art.W} height={art.skyH} fill={`url(#${skyId})`} />
      <G fill={ambient.acacia}>
        <Path d={tree.trunk} />
        <Path d={tree.back.full} />
        <Path d={tree.front.full} />
      </G>
      <Path
        d={tree.branches}
        stroke={ambient.acacia}
        strokeWidth={tree.branchWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path d={art.far} fill={ambient.duneFar} />
      <Path d={art.near} fill={ambient.duneNear} />
    </Svg>
  );
});

/**
 * Les écrans d'exercice : l'ivoire calme, et un seul motif — un brin
 * d'acacia — coupé par le coin bas droit, loin des réponses et des consignes.
 */
export const ExerciseBackdrop = memo(function ExerciseBackdrop({ width, height }: BackdropProps) {
  const art = useMemo(() => {
    const W = Math.max(width, 1);
    const H = Math.max(height, 1);
    const s = Math.min(W, H) / 100;
    // Pied du brin hors cadre, en bas à droite ; tige qui monte vers la gauche.
    const x0 = W + 2 * s;
    const y0 = H + 4 * s;
    const P = (dx: number, dy: number) => `${q(x0 + dx * s)} ${q(y0 + dy * s)}`;
    const stem = `M${P(0, 0)}C${P(-6, -10)} ${P(-14, -18)} ${P(-26, -24)}`;
    // Folioles : des lentilles fines de part et d'autre de la tige.
    const leaves = [
      lensD(x0 - 6 * s, y0 - 12 * s, 4.2 * s, 1.6 * s, 0.6 * s),
      lensD(x0 - 11 * s, y0 - 17 * s, 4.6 * s, 1.7 * s, 0.6 * s),
      lensD(x0 - 17 * s, y0 - 20.5 * s, 4.4 * s, 1.6 * s, 0.6 * s),
      lensD(x0 - 23 * s, y0 - 23 * s, 3.8 * s, 1.5 * s, 0.6 * s),
    ];
    return {
      W: q(W),
      H: q(H),
      stem,
      stemWidth: q(1.6 * s),
      leavesUp: leaves.map((leaf, index) => ({
        d: leaf.full,
        rotate: -38 - index * 4,
        cx: q(x0 - [6, 11, 17, 23][index]! * s),
        cy: q(y0 - [12, 17, 20.5, 23][index]! * s),
        dy: q(-3.6 * s),
      })),
    };
  }, [width, height]);
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${art.W} ${art.H}`}
      pointerEvents="none"
    >
      <Path
        d={art.stem}
        stroke={ambient.exerciseMotif}
        strokeWidth={art.stemWidth}
        strokeLinecap="round"
        fill="none"
      />
      {art.leavesUp.map((leaf, index) => (
        <G key={index} fill={ambient.exerciseMotif}>
          <Path
            d={leaf.d}
            transform={`translate(0 ${leaf.dy}) rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
          />
          <Path
            d={leaf.d}
            transform={`translate(0 ${-leaf.dy}) rotate(${-leaf.rotate - 72} ${leaf.cx} ${leaf.cy})`}
          />
        </G>
      ))}
    </Svg>
  );
});

interface CardDunesProps extends BackdropProps {
  far: string;
  near: string;
}

/**
 * Deux dunes ton sur ton au pied d'une grande carte (carte héros), à droite :
 * la carte devient une fenêtre sur le paysage sans rien ôter au texte, qui
 * garde son contraste par-dessus (voir les jetons `primaryDune*`).
 */
export const CardDunes = memo(function CardDunes({ width, height, far, near }: CardDunesProps) {
  const art = useMemo(() => {
    const W = Math.max(width, 1);
    const H = Math.max(height, 1);
    const u = H / 100;
    const yFar = H * 0.7;
    const yNear = H * 0.86;
    const farBand: BandSpec = {
      core: [
        [W * 0.42, yFar + 8 * u],
        [W * 0.7, yFar - 6 * u],
        [W * 0.96, yFar + 2 * u],
      ],
      step: Math.max(W * 0.22, 40 * u),
      crest: yFar - 2 * u,
      trough: yFar + 10 * u,
    };
    const nearBand: BandSpec = {
      core: [
        [W * 0.3, yNear + 10 * u],
        [W * 0.62, yNear + 2 * u],
        [W * 0.9, yNear - 5 * u],
      ],
      step: Math.max(W * 0.26, 50 * u),
      crest: yNear - 3 * u,
      trough: yNear + 12 * u,
    };
    return {
      W: q(W),
      H: q(H),
      far: bandD(bandExtrema(farBand, 0, 0, W), H),
      near: bandD(bandExtrema(nearBand, 0, 0, W), H),
    };
  }, [width, height]);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${art.W} ${art.H}`} pointerEvents="none">
      <Path d={art.far} fill={far} />
      <Path d={art.near} fill={near} />
    </Svg>
  );
});

/**
 * Le soleil de la réussite : des rayons en éventail, ton sur ton, derrière
 * l'enfant qui vient de finir sa leçon. Immobile (rien ne boucle), dessiné
 * une fois pour sa taille.
 */
export const SunBurst = memo(function SunBurst({ size }: { size: number }) {
  const art = useMemo(() => {
    const c = size / 2;
    const rays = 14;
    const outer = c;
    const wedges: string[] = [];
    for (let i = 0; i < rays; i += 1) {
      const a0 = ((i - 0.5) * 2 * Math.PI) / rays - Math.PI / 2;
      const a1 = ((i + 0.5) * 2 * Math.PI) / rays - Math.PI / 2;
      wedges.push(
        `M${q(c)} ${q(c)}L${q(c + outer * Math.cos(a0))} ${q(c + outer * Math.sin(a0))}` +
          `A${q(outer)} ${q(outer)} 0 0 1 ${q(c + outer * Math.cos(a1))} ${q(c + outer * Math.sin(a1))}Z`,
      );
    }
    return {
      even: wedges.filter((_, i) => i % 2 === 0).join(''),
      odd: wedges.filter((_, i) => i % 2 === 1).join(''),
      core: q(size * 0.3),
      c: q(c),
    };
  }, [size]);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} pointerEvents="none">
      <Path d={art.even} fill={ambient.burstRay} />
      <Path d={art.odd} fill={ambient.burstRayAlt} />
      <Circle cx={art.c} cy={art.c} r={art.core} fill={ambient.burstCore} />
    </Svg>
  );
});
