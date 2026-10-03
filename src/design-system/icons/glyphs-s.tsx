/**
 * Palier S — glyphes d'interface sur la grille 24 (design/brief-identite-v2.md § 6.2).
 *
 * Chrome et espace parent, affichés de 20 à 32 dp. Un seul geste : trait de
 * 2 u centré, bouts et jointures ronds. Les droites horizontales et verticales
 * sont centrées sur des unités impaires quand la symétrie le permet (bords
 * sur des pixels entiers en 1x, 1,5x, 2x, 3x). Au plus une décimale, au plus
 * deux détails intérieurs, six éléments par glyphe.
 *
 * Chaque glyphe a un jumeau plein (`filled`) : même silhouette remplie,
 * détails en évidement `colors.card`. Le palier S n'a pas de mode couleur :
 * la couleur vit dans le palier M (glyphs-m.tsx).
 */
import type { ReactElement } from 'react';
import { Path } from 'react-native-svg';

import { colors } from '../tokens';

/**
 * Tous les noms d'icônes, anciens (rétrocompatibles) et nouveaux (§ 6.5).
 * Chaque nom a un glyphe S ; le palier M (48 u) n'en redessine qu'une partie.
 */
export type IconName =
  // Métaphores v2 (§ 6.5)
  | 'home'
  | 'learn'
  | 'parents'
  | 'speaker'
  | 'replay'
  | 'play'
  | 'pause'
  | 'star'
  | 'star-outline'
  | 'sun'
  | 'sprout'
  | 'lightbulb'
  | 'check'
  | 'close'
  | 'lock'
  | 'arrow-back'
  | 'chevron-right'
  | 'book'
  | 'pencil'
  | 'gear'
  | 'trash'
  | 'share'
  | 'shield'
  | 'clock'
  | 'level'
  | 'target'
  | 'insight'
  | 'refresh'
  | 'compass'
  | 'offline-ok'
  | 'plus'
  // Retirés de l'UI enfant, redessinés dans le même style tant que des
  // écrans les appellent (supprimés après intégration).
  | 'ear'
  | 'speech'
  | 'calculator'
  | 'cloud-off'
  | 'leaf'
  | 'sparkle'
  | 'trophy'
  | 'flame'
  | 'medal';

/**
 * Rôle d'un calque :
 * - `line`   trait ouvert, identique dans les deux versions ;
 * - `shape`  silhouette fermée : trait, remplie dans le jumeau plein ;
 * - `detail` détail intérieur : trait, évidé (`colors.card`) dans le jumeau plein ;
 * - `solid`  forme pleine dans les deux versions (`w` : trait d'arrondi) ;
 * - `dot`    pastille pleine posée dans la silhouette, évidée dans le jumeau plein ;
 * - `hole`   contour d'un trou : trait, disque évidé dans le jumeau plein.
 */
type SKind = 'line' | 'shape' | 'detail' | 'solid' | 'dot' | 'hole';

interface SLayer {
  readonly kind: SKind;
  readonly d: string;
  /** Épaisseur du trait (défaut 2 u). */
  readonly w?: number;
}

export type SGlyph = readonly SLayer[];

const line = (d: string, w?: number): SLayer =>
  w === undefined ? { kind: 'line', d } : { kind: 'line', d, w };
const shape = (d: string): SLayer => ({ kind: 'shape', d });
const detail = (d: string): SLayer => ({ kind: 'detail', d });
const solid = (d: string, w?: number): SLayer =>
  w === undefined ? { kind: 'solid', d } : { kind: 'solid', d, w };
const dot = (d: string): SLayer => ({ kind: 'dot', d });
const hole = (d: string): SLayer => ({ kind: 'hole', d });

/** Cercle en chemin (deux demi-arcs), calculé une fois au chargement. */
export function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx + r} ${cy}A${r} ${r} 0 1 1 ${cx - r} ${cy}A${r} ${r} 0 1 1 ${cx + r} ${cy}Z`;
}

/** Étoile dodue, pointes arrondies ≥ 1,5 u (trait compris). */
const STAR_S =
  'M12.8 4.6L14.8 8.2A1.2 1.2 0 0 0 15.6 8.7L19.6 9.6A0.9 0.9 0 0 1 20.1 11.1L17.4 14.1A1.2 1.2 0 0 0 17.1 15.1L17.5 19.1A0.9 0.9 0 0 1 16.2 20.1L12.5 18.4A1.2 1.2 0 0 0 11.5 18.4L7.8 20.1A0.9 0.9 0 0 1 6.5 19.1L6.9 15.1A1.2 1.2 0 0 0 6.6 14.1L3.9 11.1A0.9 0.9 0 0 1 4.4 9.6L8.4 8.7A1.2 1.2 0 0 0 9.2 8.2L11.2 4.6A0.9 0.9 0 0 1 12.8 4.6Z';

export const S_GLYPHS: Readonly<Record<IconName, SGlyph>> = {
  // Maison : toit à faîte arrondi, une porte.
  home: [
    shape('M5 11L10.5 5.5Q12 4 13.5 5.5L19 11V17A2 2 0 0 1 17 19H7A2 2 0 0 1 5 17Z'),
    detail('M10 19V16A2 2 0 0 1 14 16V19'),
  ],
  // Sac d'écolier : dôme, petite anse, rabat et boucle.
  learn: [
    line('M10 7V5A2 2 0 0 1 14 5V7'),
    shape('M5 12A5 5 0 0 1 10 7H14A5 5 0 0 1 19 12V19A2 2 0 0 1 17 21H7A2 2 0 0 1 5 19Z'),
    detail('M5 13.5C7.5 15.3 9.5 15.8 12 15.8C14.5 15.8 16.5 15.3 19 13.5'),
    dot(
      'M11.5 14.5H12.5A1 1 0 0 1 13.5 15.5V16.5A1 1 0 0 1 12.5 17.5H11.5A1 1 0 0 1 10.5 16.5V15.5A1 1 0 0 1 11.5 14.5Z',
    ),
  ],
  // Un enfant et un adulte côte à côte (le cadenas d'onglet est un modificateur).
  parents: [
    shape(circlePath(6, 11, 2)),
    shape('M3 21V20A3 3 0 0 1 9 20V21Z'),
    shape(circlePath(17, 6, 3)),
    shape('M13 21V17A4 4 0 0 1 21 17V21Z'),
  ],
  // Haut-parleur : corps et pavillon en une silhouette, deux ondes.
  speaker: [
    shape(
      'M4.5 9H6.7A0.8 0.8 0 0 0 7.2 8.8L10 6A0.6 0.6 0 0 1 11 6.4V17.6A0.6 0.6 0 0 1 10 18L7.2 15.2A0.8 0.8 0 0 0 6.7 15H4.5A1.5 1.5 0 0 1 3 13.5V10.5A1.5 1.5 0 0 1 4.5 9Z',
    ),
    line('M15.2 7.8A6 6 0 0 1 15.2 16.2M18.1 4.9A10 10 0 0 1 18.1 19.1'),
  ],
  // Flèche circulaire, pointe pleine arrondie.
  replay: [
    line('M12 6A7.5 7.5 0 1 1 5.2 10.3'),
    solid(
      'M7.9 5.6L12 3.1A0.5 0.5 0 0 1 12.8 3.5V8.5A0.5 0.5 0 0 1 12 8.9L7.9 6.4A0.5 0.5 0 0 1 7.9 5.6Z',
      1,
    ),
  ],
  // Triangle plein arrondi, boîte décalée d'1 u vers la droite.
  play: [
    solid(
      'M7.6 7.8V16.2A1.6 1.6 0 0 0 10 17.6L17.3 13.4A1.6 1.6 0 0 0 17.3 10.6L10 6.4A1.6 1.6 0 0 0 7.6 7.8Z',
    ),
  ],
  // Deux pilules pleines.
  pause: [
    solid('M6 7A2 2 0 0 1 10 7V17A2 2 0 0 1 6 17Z'),
    solid('M14 7A2 2 0 0 1 18 7V17A2 2 0 0 1 14 17Z'),
  ],
  // Étoile gagnée : toujours pleine ; à gagner : contour.
  star: [solid(STAR_S, 2)],
  'star-outline': [shape(STAR_S)],
  // Soleil : disque et huit rayons-pilules.
  sun: [
    shape(circlePath(12, 12, 3)),
    line(
      'M19.2 12H21M17.1 17.1L18.4 18.4M12 19.2V21M6.9 17.1L5.6 18.4M4.8 12H3M6.9 6.9L5.6 5.6M12 4.8V3M17.1 6.9L18.4 5.6',
    ),
  ],
  // Pousse : deux feuilles, une tige, la terre.
  sprout: [
    line('M5 21H19M12 21V12'),
    shape('M12 15C12 11.7 9.3 9 5.5 9C5.5 12.3 8.2 15 12 15Z'),
    shape('M12 12C12 8.1 14.7 5 19 5C19 8.9 16.3 12 12 12Z'),
  ],
  // Ampoule ronde, culot en deux pilules.
  lightbulb: [
    shape('M9.5 13C9.5 11.5 7 10.8 7 8A5 5 0 0 1 17 8C17 10.8 14.5 11.5 14.5 13Z'),
    line('M9.5 17H14.5M10.5 21H13.5'),
  ],
  check: [line('M5 12.5L9.5 17L19 7.5', 2.5)],
  close: [line('M6 6L18 18M18 6L6 18')],
  // Cadenas rond : corps en disque, anse, trou de serrure.
  lock: [
    line('M8.5 10V7.5A3.5 3.5 0 0 1 15.5 7.5V10'),
    shape(circlePath(12, 14.5, 6)),
    dot(circlePath(12, 14.5, 1.5)),
  ],
  'arrow-back': [line('M11 5.5L4.5 12L11 18.5M4.5 12H19.5', 2.5)],
  'chevron-right': [line('M8.5 5L15.5 12L8.5 19', 2.5)],
  // Livre ouvert, reliure au centre.
  book: [
    shape(
      'M12 6.5C10.2 5.1 7.3 4.5 3 5V18C7.3 17.5 10.2 18.1 12 19.5C13.8 18.1 16.7 17.5 21 18V5C16.7 4.5 13.8 5.1 12 6.5Z',
    ),
    detail('M12 6.5V19.5'),
  ],
  // Crayon à 45°, pointe arrondie, bague de gomme.
  pencil: [shape('M4.5 19.5L6 15L15 6A2.1 2.1 0 0 1 18 9L9 18Z'), detail('M13 8L16 11M6 15L9 18')],
  // Roue à six dents arrondies (espace parent seulement).
  gear: [
    shape(
      'M10.3 5L10.1 4.5A1 1 0 0 1 11.1 3.3H12.9A1 1 0 0 1 13.9 4.5L13.7 5A0.8 0.8 0 0 0 14.1 5.9L16.2 7.1A0.8 0.8 0 0 0 17.2 7L17.6 6.6A1 1 0 0 1 19.1 6.9L20 8.4A1 1 0 0 1 19.4 9.9L18.9 10A0.8 0.8 0 0 0 18.3 10.8V13.2A0.8 0.8 0 0 0 18.9 14L19.4 14.1A1 1 0 0 1 20 15.6L19.1 17.1A1 1 0 0 1 17.6 17.4L17.2 17A0.8 0.8 0 0 0 16.2 16.9L14.1 18.1A0.8 0.8 0 0 0 13.7 19L13.9 19.5A1 1 0 0 1 12.9 20.7H11.1A1 1 0 0 1 10.1 19.5L10.3 19A0.8 0.8 0 0 0 9.9 18.1L7.8 16.9A0.8 0.8 0 0 0 6.8 17L6.4 17.4A1 1 0 0 1 4.9 17.1L4 15.6A1 1 0 0 1 4.6 14.1L5.1 14A0.8 0.8 0 0 0 5.7 13.2V10.8A0.8 0.8 0 0 0 5.1 10L4.6 9.9A1 1 0 0 1 4 8.4L4.9 6.9A1 1 0 0 1 6.4 6.6L6.8 7A0.8 0.8 0 0 0 7.8 7.1L9.9 5.9A0.8 0.8 0 0 0 10.3 5Z',
    ),
    hole(circlePath(12, 12, 2.5)),
  ],
  // Corbeille : couvercle, poignée, cuve à deux rainures.
  trash: [
    line('M4 7H20M9 7V5A2 2 0 0 1 11 3H13A2 2 0 0 1 15 5V7'),
    shape('M6 7V19A2 2 0 0 0 8 21H16A2 2 0 0 0 18 19V7Z'),
    detail('M10 11V17M14 11V17'),
  ],
  // Trois nœuds reliés.
  share: [
    shape(circlePath(6.5, 12, 2.5)),
    shape(circlePath(17.5, 6, 2.5)),
    shape(circlePath(17.5, 18, 2.5)),
    line('M8.7 10.8L15.3 7.2M8.7 13.2L15.3 16.8'),
  ],
  // Écu arrondi et coche : protégé, confidentialité, porte parentale.
  shield: [
    shape(
      'M12 3L18 5A1.5 1.5 0 0 1 19 6.4V11.5C19 15.6 16.2 19 12 21C7.8 19 5 15.6 5 11.5V6.4A1.5 1.5 0 0 1 6 5Z',
    ),
    detail('M8.5 12L11 14.5L15.5 10'),
  ],
  // Horloge, aiguilles à 10 h 10.
  clock: [shape(circlePath(12, 12, 9)), detail('M8.5 10L12 12L16.5 9.5')],
  // Trois marches montantes.
  level: [
    shape(
      'M3 19V17A2 2 0 0 1 5 15H8A1 1 0 0 0 9 14V11A2 2 0 0 1 11 9H14A1 1 0 0 0 15 8V5A2 2 0 0 1 17 3H19A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19Z',
    ),
  ],
  // Cible : trois anneaux.
  target: [
    shape(circlePath(12, 12, 9)),
    detail(circlePath(12, 12, 5)),
    dot(circlePath(12, 12, 1.5)),
  ],
  // Courbe qui monte sur sa ligne de base, point final plein.
  insight: [line('M3 21H21M4 16.5C9 16.5 12.5 12.5 16 8.5'), solid(circlePath(17.5, 7, 2.5))],
  // Deux flèches circulaires.
  refresh: [
    line('M4.5 9.3A8 8 0 0 1 16.6 5.4M19.5 14.7A8 8 0 0 1 7.4 18.6'),
    solid(
      'M18.4 6.1L17.7 3.5A0.6 0.6 0 0 0 16.6 3.4L14.6 6.2A0.6 0.6 0 0 0 15.2 7.1L17.8 6.9A0.6 0.6 0 0 0 18.4 6.1ZM5.6 17.9L6.3 20.5A0.6 0.6 0 0 0 7.4 20.6L9.4 17.8A0.6 0.6 0 0 0 8.8 16.9L6.2 17.1A0.6 0.6 0 0 0 5.6 17.9Z',
      1,
    ),
  ],
  // Boussole : page introuvable.
  compass: [
    shape(circlePath(12, 12, 9)),
    dot(
      'M15.5 9.4L14.1 13.5A1 1 0 0 1 13.5 14.1L9.4 15.5A0.7 0.7 0 0 1 8.5 14.6L9.9 10.5A1 1 0 0 1 10.5 9.9L14.6 8.5A0.7 0.7 0 0 1 15.5 9.4Z',
    ),
  ],
  // Tablette (barre d'accueil) et coche : « ça marche sans internet ». En
  // portrait avec sa barre : en paysage, on lisait une case cochée.
  'offline-ok': [
    shape('M7 3H17A2 2 0 0 1 19 5V19A2 2 0 0 1 17 21H7A2 2 0 0 1 5 19V5A2 2 0 0 1 7 3Z'),
    detail('M9 10.5L11 12.5L15 8.5M10.5 17H13.5'),
  ],
  plus: [line('M12 5V19M5 12H19')],

  // — Retirés de l'UI enfant —
  ear: [
    line('M7 9.5A5.5 5.5 0 0 1 18 9.5C18 12.5 15.5 13.5 15 16C14.6 18.4 13.3 20 11 20'),
    detail('M10 10A2.5 2.5 0 0 1 15 10C15 11.5 13.5 12.2 13.2 13.5'),
  ],
  speech: [
    shape('M7 4H17A3 3 0 0 1 20 7V13A3 3 0 0 1 17 16H11L7 19.5V16A3 3 0 0 1 4 13V7A3 3 0 0 1 7 4Z'),
    detail('M8 8H16M8 12H13'),
  ],
  calculator: [
    shape('M7 3H17A2 2 0 0 1 19 5V19A2 2 0 0 1 17 21H7A2 2 0 0 1 5 19V5A2 2 0 0 1 7 3Z'),
    detail('M8 7H16'),
    dot(
      `${circlePath(9, 12, 1.5)}${circlePath(15, 12, 1.5)}${circlePath(9, 17, 1.5)}${circlePath(15, 17, 1.5)}`,
    ),
  ],
  'cloud-off': [
    shape('M7.5 18H17A3.5 3.5 0 0 0 17.6 11A5.5 5.5 0 0 0 7 9.5A4.3 4.3 0 0 0 7.5 18Z'),
    line('M4 4L20 20'),
  ],
  leaf: [shape('M5 19C5 10.5 10.5 5 19 5C19 13.5 13.5 19 5 19Z'), detail('M5 19L13 11')],
  sparkle: [
    shape('M11 3.5Q12 10 18.5 11Q12 12 11 18.5Q10 12 3.5 11Q10 10 11 3.5Z'),
    solid(circlePath(18.5, 18.5, 1.5)),
  ],
  trophy: [
    shape('M7 4H17V9A5 5 0 0 1 7 9Z'),
    line('M7 5.5H5.5A2.5 2.5 0 0 0 7.5 10.5M17 5.5H18.5A2.5 2.5 0 0 1 16.5 10.5'),
    line('M12 14V20M8.5 20H15.5'),
  ],
  flame: [
    shape(
      'M12 3C12.5 6 15 7.5 16.5 10C17.6 11.8 18 13 18 14.5A6 6 0 0 1 6 14.5C6 11.5 8 9.5 9.5 11C9.5 8 10.5 5 12 3Z',
    ),
    dot('M12 13.5C13.5 15 14 16 14 17A2 2 0 0 1 10 17C10 16 10.5 15 12 13.5Z'),
  ],
  medal: [
    line('M8 3L10.5 9M16 3L13.5 9'),
    shape(circlePath(12, 15, 5.5)),
    dot(
      'M12.4 12.8L12.9 13.9A0.3 0.3 0 0 0 13.1 14L14.2 14.2A0.4 0.4 0 0 1 14.5 14.9L13.6 15.7A0.3 0.3 0 0 0 13.5 15.9L13.7 17.1A0.4 0.4 0 0 1 13.2 17.5L12.1 17A0.3 0.3 0 0 0 11.9 17L10.8 17.5A0.4 0.4 0 0 1 10.3 17.1L10.5 15.9A0.3 0.3 0 0 0 10.4 15.7L9.5 14.9A0.4 0.4 0 0 1 9.8 14.2L10.9 14A0.3 0.3 0 0 0 11.1 13.9L11.6 12.8A0.4 0.4 0 0 1 12.4 12.8Z',
    ),
  ],
};

const ROUND = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Les calques d'un glyphe S, en `mono` (contour) ou en jumeau plein. */
export function renderSGlyph(glyph: SGlyph, color: string, filled: boolean): ReactElement[] {
  return glyph.map((layer, index) => {
    const w = layer.w ?? 2;
    switch (layer.kind) {
      case 'line':
        return (
          <Path key={index} d={layer.d} fill="none" stroke={color} strokeWidth={w} {...ROUND} />
        );
      case 'shape':
        return (
          <Path
            key={index}
            d={layer.d}
            fill={filled ? color : 'none'}
            stroke={color}
            strokeWidth={w}
            {...ROUND}
          />
        );
      case 'detail':
        return (
          <Path
            key={index}
            d={layer.d}
            fill="none"
            stroke={filled ? colors.card : color}
            strokeWidth={w}
            {...ROUND}
          />
        );
      case 'solid':
        return layer.w === undefined ? (
          <Path key={index} d={layer.d} fill={color} />
        ) : (
          <Path
            key={index}
            d={layer.d}
            fill={color}
            stroke={color}
            strokeWidth={layer.w}
            {...ROUND}
          />
        );
      case 'dot':
        return <Path key={index} d={layer.d} fill={filled ? colors.card : color} />;
      case 'hole':
        return filled ? (
          <Path key={index} d={layer.d} fill={colors.card} />
        ) : (
          <Path key={index} d={layer.d} fill="none" stroke={color} strokeWidth={w} {...ROUND} />
        );
      default: {
        const unhandled: never = layer.kind;
        throw new Error(`calque inconnu : ${String(unhandled)}`);
      }
    }
  });
}
