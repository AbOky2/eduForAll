import { render } from '@testing-library/react-native';
import { createElement } from 'react';

import { AVATAR_IDS } from '@/features/child-profile/domain/child-profile';
import { fr } from '@/localization/fr/strings';

import { AVATAR_ART_IDS, AVATAR_CAST, avatarArt } from './avatar-cast';
import { HAIR_COVERAGE, PORTRAIT_GARMENTS as GARMENTS, type PortraitSkin as SkinTone } from './portrait';
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
