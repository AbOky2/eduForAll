/**
 * EcolnaAvatar — le portrait d'un des douze enfants (direction v4 § 8).
 *
 * Niveau de détail automatique : `small` sous 64 dp (ni point de lumière, ni
 * nez, ni motif de vêtement ; traits épaissis pour rester lisibles à 40 px),
 * `full` à partir de 64 dp. Deux expressions : `calm` (par défaut) et `joy`
 * (réussite, sélection) — les yeux se plissent, la bouche s'ouvre.
 *
 * `popOut` (grandes tailles : profil, réussite) : la coiffure peut sortir du
 * disque par le haut ; le buste reste découpé par le bas.
 */
import { memo, useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Rect } from 'react-native-svg';

import { avatarArt } from './avatar-cast';
import {
  PORTRAIT_BACKDROPS,
  PortraitArt,
  PortraitHead,
  type PortraitExpression,
  type PortraitLod,
  type PortraitSpec,
} from './portrait';

export type AvatarExpression = PortraitExpression;
export type AvatarLod = PortraitLod;

export interface EcolnaAvatarProps {
  /** Identifiant enregistré dans le profil ; inconnu → avatar-1, jamais de crash. */
  avatarId: string;
  /** Diamètre du disque en dp. */
  size: number;
  expression?: AvatarExpression;
  /** Disque de fond coloré (défaut : oui). */
  backdrop?: boolean;
  /** La coiffure déborde du disque par le haut (grandes tailles). */
  popOut?: boolean;
}

/** Sous 64 dp, on dessine pour l'œil qui voit petit. */
export const SMALL_LOD_BELOW = 64;

/** Marge au-dessus du disque pour la variante `popOut`, en unités du repère. */
const POP_HEADROOM = 14;

/** Identifiant d'élément SVG valide (useId peut contenir « : » ou « « »). */
function useClipId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^A-Za-z0-9_-]/g, '')}`;
}

export function portraitSpecOf(avatarId: string): PortraitSpec {
  const art = avatarArt(avatarId);
  return {
    skin: art.skin,
    hair: art.hair,
    garment: art.garment,
    accessories: art.accessories,
    brow: art.brows,
    nose: art.nose,
  };
}

function EcolnaAvatarImpl({
  avatarId,
  size,
  expression = 'calm',
  backdrop = true,
  popOut = false,
}: EcolnaAvatarProps) {
  const clipId = useClipId('avatar');
  const art = avatarArt(avatarId);
  const lod: AvatarLod = size < SMALL_LOD_BELOW ? 'small' : 'full';
  const head = popOut ? POP_HEADROOM : 0;
  return (
    <Svg width={size} height={(size * (120 + head)) / 120} viewBox={`0 ${-head} 120 ${120 + head}`}>
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx={60} cy={60} r={60} />
          {/* Variante « hors du cadre » : tout ce qui est au-dessus de l'équateur passe. */}
          {popOut ? <Rect x={0} y={-head} width={120} height={60 + head} /> : null}
        </ClipPath>
      </Defs>
      {backdrop ? <Circle cx={60} cy={60} r={60} fill={PORTRAIT_BACKDROPS[art.backdrop]} /> : null}
      <G clipPath={`url(#${clipId})`}>
        <PortraitArt spec={portraitSpecOf(avatarId)} expression={expression} lod={lod} />
      </G>
    </Svg>
  );
}

export const EcolnaAvatar = memo(EcolnaAvatarImpl);

/** La tête seule d'un enfant de la distribution (repère 120), pour les scènes. */
function AvatarHeadArtImpl({
  avatarId,
  expression = 'calm',
  lod = 'small',
}: {
  avatarId: string;
  expression?: AvatarExpression;
  lod?: AvatarLod;
}) {
  return <PortraitHead spec={portraitSpecOf(avatarId)} expression={expression} lod={lod} />;
}

export const AvatarHeadArt = memo(AvatarHeadArtImpl);
