import { render } from '@testing-library/react-native';
import { createElement } from 'react';

import { AVATAR_IDS } from '@/features/child-profile/domain/child-profile';
import { fr } from '@/localization/fr/strings';

import { AVATAR_ART_IDS, AVATAR_CAST, avatarArt, type AvatarArt } from './avatar-cast';
import { colors } from '@/design-system/tokens';

import {
  HAIR_COVERAGE,
  PORTRAIT_FABRICS as FABRICS,
  PORTRAIT_GARMENTS as GARMENTS,
  PORTRAIT_HEADS,
  eyeCenters,
  type PortraitHeadShape,
  type PortraitSkin as SkinTone,
} from './portrait';
import { EcolnaAvatar } from './ecolna-avatar';

/** Invariants de la distribution — design/brief-identite-v2.md § 8.3. */
describe('les douze enfants', () => {
  it('sont douze, dans l’ordre, alignés sur les identifiants du profil', () => {
    expect(AVATAR_ART_IDS).toHaveLength(12);
    expect(AVATAR_CAST.map((art) => art.id)).toEqual([...AVATAR_ART_IDS]);
    expect([...AVATAR_IDS]).toEqual([...AVATAR_ART_IDS]);
  });

  it('comptent six filles et six garçons', () => {
    expect(AVATAR_CAST.filter((art) => art.gender === 'girl')).toHaveLength(6);
    expect(AVATAR_CAST.filter((art) => art.gender === 'boy')).toHaveLength(6);
  });

  it('portent chaque peau exactement deux fois : une fille et un garçon', () => {
    const skins: SkinTone[] = ['ebene', 'cacao', 'acajou', 'cannelle', 'miel', 'sable'];
    for (const skin of skins) {
      const wearers = AVATAR_CAST.filter((art) => art.skin === skin);
      expect(wearers.map((art) => art.gender).sort()).toEqual(['boy', 'girl']);
    }
  });

  it('comptent deux aides techniques : des lunettes et un appareil auditif', () => {
    const aids = AVATAR_CAST.flatMap((art) =>
      art.accessories.filter((accessory) => accessory === 'glasses' || accessory === 'hearing-aid'),
    );
    expect(aids.sort()).toEqual(['glasses', 'hearing-aid']);
  });

  it('ne portent aucun marqueur religieux', () => {
    const religious = /kufi|taqiyah|calotte|voile|veil|hijab|niqab|turban|croix|cross|chapelet|rosary|tasbih/i;
    for (const art of AVATAR_CAST) {
      for (const trait of [art.hair, art.garment, ...art.accessories]) {
        expect(trait).not.toMatch(religious);
      }
      // Un foulard noué laisse voir racine, oreilles et cou : c'est de la mode, pas un voile.
      expect(HAIR_COVERAGE[art.hair].ears).toBe(true);
      expect(HAIR_COVERAGE[art.hair].neck).toBe(true);
    }
    expect(HAIR_COVERAGE['knotted-scarf'].hairline).toBe(true);
  });

  it('ont des triplets (peau, cheveux, vêtement) uniques — pas de recoloriage', () => {
    const tuples = new Set(AVATAR_CAST.map((art) => `${art.skin}|${art.hair}|${art.garment}`));
    expect(tuples.size).toBe(12);
    // Mieux : ni deux coiffures ni deux vêtements identiques.
    expect(new Set(AVATAR_CAST.map((art) => art.hair)).size).toBe(12);
    expect(new Set(AVATAR_CAST.map((art) => art.garment)).size).toBe(12);
  });

  it('gardent pour les quatre premiers le genre et la couleur dominante des anciens avatars', () => {
    const legacy = [
      { id: 'avatar-1', gender: 'boy', fabric: 'indigo' },
      { id: 'avatar-2', gender: 'girl', fabric: 'terracotta' },
      { id: 'avatar-3', gender: 'boy', fabric: 'sage' },
      { id: 'avatar-4', gender: 'girl', fabric: 'plum' },
    ] as const;
    for (const old of legacy) {
      const art = avatarArt(old.id);
      expect(art.gender).toBe(old.gender);
      expect(GARMENTS[art.garment].fabric).toBe(old.fabric);
    }
  });

  it('portent des vêtements qui ne se fondent pas dans la toile : le bas du disque garde son bord', () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => {
        const v = parseInt(hex.slice(i, i + 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      }) as [number, number, number];
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
      return (hi + 0.05) / (lo + 0.05);
    };
    for (const art of AVATAR_CAST) {
      const fabric = FABRICS[GARMENTS[art.garment].fabric].base;
      // Un tee-shirt crème (1,0:1) effaçait le bas du disque sur la toile.
      expect({ id: art.id, ok: contrast(fabric, colors.canvas) >= 1.4 }).toEqual({ id: art.id, ok: true });
    }
  });

  it('ont chacun une description française qui commence par « Fille » ou « Garçon »', () => {
    const descriptions: Record<string, string> = fr.avatars.descriptions;
    expect(Object.keys(descriptions).sort()).toEqual([...AVATAR_ART_IDS].sort());
    for (const art of AVATAR_CAST) {
      expect(descriptions[art.id]).toMatch(art.gender === 'girl' ? /^Fille / : /^Garçon /);
    }
  });

  it('retombent sur avatar-1 pour un identifiant inconnu, sans planter', () => {
    expect(avatarArt('avatar-99').id).toBe('avatar-1');
    expect(avatarArt('').id).toBe('avatar-1');
    expect(() => render(createElement(EcolnaAvatar, { avatarId: 'inconnu', size: 40 }))).not.toThrow();
  });
});

/**
 * Les voisins d'une grille de douze en `columns` colonnes, dans l'ordre
 * d'affichage d'`AvatarGrid` : à côté sur la même rangée, ou l'un au-dessus
 * de l'autre.
 */
function gridNeighbours(columns: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < AVATAR_CAST.length; i += 1) {
    if ((i + 1) % columns !== 0 && i + 1 < AVATAR_CAST.length) {
      pairs.push([i, i + 1]);
    }
    if (i + columns < AVATAR_CAST.length) {
      pairs.push([i, i + columns]);
    }
  }
  return pairs;
}

/**
 * Les colonnes réellement employées : 4 en paysage et 3 en portrait ou sur
 * téléphone (création de profil), 4 ou 6 sur le profil. Deux colonnes
 * n'arrivent sur aucune fenêtre prise en charge.
 */
const GRID_COLUMNS = [3, 4, 6] as const;

/** Direction v4 § 8 et critique de la ronde 4 : chaque enfant a son visage. */
describe('les visages des douze enfants', () => {
  it.each(GRID_COLUMNS)('deux voisins de grille n’ont jamais la même tête (%i colonnes)', (columns) => {
    for (const [a, b] of gridNeighbours(columns)) {
      const [first, second] = [AVATAR_CAST[a], AVATAR_CAST[b]] as [AvatarArt, AvatarArt];
      expect({ pair: [first.id, second.id], same: first.head === second.head }).toEqual({
        pair: [first.id, second.id],
        same: false,
      });
    }
  });

  it.each(GRID_COLUMNS)('deux voisins de grille n’ont jamais le même disque (%i colonnes)', (columns) => {
    for (const [a, b] of gridNeighbours(columns)) {
      const [first, second] = [AVATAR_CAST[a], AVATAR_CAST[b]] as [AvatarArt, AvatarArt];
      expect({ pair: [first.id, second.id], same: first.backdrop === second.backdrop }).toEqual({
        pair: [first.id, second.id],
        same: false,
      });
    }
  });

  it('ne partagent jamais à deux la même combinaison tête + yeux + bouche', () => {
    const faces = new Set(AVATAR_CAST.map((art) => `${art.head}|${art.eyes}|${art.mouth}`));
    expect(faces.size).toBe(AVATAR_CAST.length);
  });

  it('répartissent également les têtes, les regards et les bouches', () => {
    const count = (key: 'head' | 'eyes' | 'mouth') =>
      AVATAR_CAST.reduce<Record<string, number>>((acc, art) => ({ ...acc, [art[key]]: (acc[art[key]] ?? 0) + 1 }), {});
    expect(count('head')).toEqual({ oval: 3, round: 3, long: 3, cheeky: 3 });
    expect(count('eyes')).toEqual({ round: 4, almond: 4, wide: 4 });
    expect(count('mouth')).toEqual({ smile: 4, small: 4, crescent: 4 });
  });

  it('dessinent les têtes aux proportions décidées', () => {
    const size = (shape: PortraitHeadShape) => {
      const { spec, edgeAt } = PORTRAIT_HEADS[shape];
      return { width: Math.round(2 * (edgeAt(56) - 60)), height: spec.chin - spec.top };
    };
    expect(size('oval')).toEqual({ width: 54, height: 58 });
    expect(size('round')).toEqual({ width: 58, height: 55 });
    expect(size('long')).toEqual({ width: 51, height: 61 });
    // La joufflue s'évase sous les tempes : plus large aux joues qu'au crâne.
    const cheeky = PORTRAIT_HEADS.cheeky;
    expect(cheeky.edgeAt(66.5)).toBeGreaterThan(cheeky.edgeAt(56) + 1.5);
  });

  it.each(['oval', 'round', 'long', 'cheeky'] as const)('raccordent oreilles et cou à la tête %s, sans jour', (shape) => {
    const head = PORTRAIT_HEADS[shape];
    // L'oreille est centrée sur le bord du visage, symétrique.
    expect(Math.abs(head.ear.right - head.edgeAt(head.ear.y))).toBeLessThan(0.3);
    expect(head.ear.left + head.ear.right).toBeCloseTo(120, 5);
    // Le haut du cou (y = 76, x de 51,5 à 68,5) est caché sous la tête…
    expect(head.edgeAt(76)).toBeGreaterThan(68.5);
    // … et le menton s'arrête au-dessus des épaules (92,6) : le cou se voit.
    expect(head.spec.chin).toBeLessThan(92.6 - 4);
    // Les yeux restent dans le visage, oreilles exclues.
    for (const eyes of ['round', 'almond', 'wide'] as const) {
      const c = eyeCenters(shape, eyes);
      expect(c.right + 5).toBeLessThan(head.edgeAt(c.y));
    }
  });

  it('posent la coiffure sur l’ovale telle quelle, et la mettent à l’échelle des autres crânes', () => {
    expect(PORTRAIT_HEADS.oval.hairTransform).toBeUndefined();
    for (const shape of ['round', 'long', 'cheeky'] as const) {
      expect(PORTRAIT_HEADS[shape].hairTransform).toMatch(/^matrix\(/);
    }
  });
});

/** Budget de performance — brief § 8.2 et § 15 : ≤ 40 éléments, primitives autorisées seulement. */
describe('le budget SVG des avatars', () => {
  const ALLOWED = new Set(['RNSVGPath', 'RNSVGCircle', 'RNSVGEllipse', 'RNSVGRect', 'RNSVGGroup', 'RNSVGClipPath', 'RNSVGDefs']);

  interface HostNode {
    type: string;
    children?: (HostNode | string)[] | null;
  }

  /** Les éléments dessinés sous la racine de `Svg` (sa vue et son groupe interne exclus). */
  function authoredElements(avatarId: string, size: number, expression: 'calm' | 'joy'): string[] {
    const root = render(createElement(EcolnaAvatar, { avatarId, size, expression })).toJSON() as HostNode;
    const svgGroup = root.children?.[0] as HostNode;
    const types: string[] = [];
    const walk = (node: HostNode | string) => {
      if (typeof node === 'string') {
        return;
      }
      types.push(node.type);
      (node.children ?? []).forEach(walk);
    };
    (svgGroup.children ?? []).forEach(walk);
    return types;
  }

  it.each(AVATAR_ART_IDS)('%s tient dans 40 éléments, en détail complet comme réduit', (avatarId) => {
    for (const size of [160, 40]) {
      for (const expression of ['calm', 'joy'] as const) {
        const types = authoredElements(avatarId, size, expression);
        expect(types.length).toBeLessThanOrEqual(40);
        expect(types.filter((type) => !ALLOWED.has(type))).toEqual([]);
        expect(types.filter((type) => type === 'RNSVGClipPath')).toHaveLength(1);
      }
    }
  });
});
