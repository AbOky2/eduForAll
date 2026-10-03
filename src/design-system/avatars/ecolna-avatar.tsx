/**
 * EcolnaAvatar — le portrait d'un des douze enfants (brief § 8, contrat § 14.3).
 *
 * Niveau de détail automatique : `small` sous 64 dp (ni texture, ni paupière,
 * ni broderie fine ; sourcils et reflets d'œil épaissis pour rester lisibles
 * à 40 px en 1x), `full` à partir de 64 dp. Deux expressions : `calm` (par
 * défaut) et `joy` (réussite, sélection) — seuls sourcils, paupières et
 * bouche changent.
 */
import { memo, useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';

import { colors, illustration, skinTones } from '@/design-system/tokens';

import { avatarArt, BACKDROP_MOTIFS } from './avatar-cast';
import {
  AccessoriesBack,
  AccessoriesBust,
  AccessoriesFront,
  AvatarFeatures,
  AvatarHead,
  AvatarNeck,
  BackdropDisc,
  Garment,
  GARMENTS,
  HairBack,
  HairDrape,
  HairFront,
  SILHOUETTE_D,
  type AvatarExpression,
  type AvatarLod,
} from './avatar-parts';

export interface EcolnaAvatarProps {
  /** Identifiant enregistré dans le profil ; inconnu → avatar-1, jamais de crash. */
  avatarId: string;
  /** Diamètre en dp. */
  size: number;
  expression?: AvatarExpression;
  /** Disque de fond coloré (défaut : oui). */
  backdrop?: boolean;
}

/** Sous 64 dp, on dessine pour l'œil qui voit petit. */
export const SMALL_LOD_BELOW = 64;

/** Identifiant d'élément SVG valide (useId peut contenir « : » ou « « »). */
function useClipId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^A-Za-z0-9_-]/g, '')}`;
}

function EcolnaAvatarImpl({ avatarId, size, expression = 'calm', backdrop = true }: EcolnaAvatarProps) {
  const clipId = useClipId('avatar');
  const art = avatarArt(avatarId);
  const lod: AvatarLod = size < SMALL_LOD_BELOW ? 'small' : 'full';
  const skin = skinTones[art.skin];
  // La bretelle est or, sauf sur un vêtement déjà jaune où elle disparaîtrait.
  const strapColor =
    GARMENTS[art.garment].fabric === 'saffron' ? illustration.fabric.indigo : illustration.metal.gold;
  const hair = { style: art.hair, lod, skin };
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx={60} cy={60} r={60} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        {backdrop ? <BackdropDisc backdrop={art.backdrop} motif={BACKDROP_MOTIFS[art.backdrop]} /> : null}
        <HairBack {...hair} />
        <AvatarNeck skin={skin} />
        <Garment id={art.garment} lod={lod} />
        <AccessoriesBust marker={art.marker} accessories={art.accessories} strapColor={strapColor} lod={lod} />
        <HairDrape {...hair} />
        <AccessoriesBack marker={art.marker} accessories={art.accessories} />
        <AvatarHead skinTone={art.skin} nose={art.nose} hair={art.hair} lod={lod} expression={expression} />
        <AvatarFeatures brows={art.brows} expression={expression} lod={lod} skin={skin} />
        <HairFront {...hair} />
        <AccessoriesFront accessories={art.accessories} lod={lod} />
      </G>
    </Svg>
  );
}

export const EcolnaAvatar = memo(EcolnaAvatarImpl);

/**
 * La tête seule d'un enfant de la distribution, dans le repère 0 0 120 120 —
 * sans `Svg`, sans disque, cou ni buste : pour les scènes, qui la posent sur
 * un corps avec `<G transform="translate(…) scale(…)">` (3,5–4 têtes de haut,
 * brief § 10). Les nattes sur l'épaule, la bretelle et l'ardoise appartiennent
 * au corps. Détail réduit par défaut : une tête de scène est petite.
 */
function AvatarHeadArtImpl({
  avatarId,
  expression = 'calm',
  lod = 'small',
}: {
  avatarId: string;
  expression?: AvatarExpression;
  lod?: AvatarLod;
}) {
  const art = avatarArt(avatarId);
  const skin = skinTones[art.skin];
  const hair = { style: art.hair, lod, skin };
  return (
    <>
      <HairBack {...hair} />
      <AccessoriesBack marker={art.marker} accessories={art.accessories} />
      <AvatarHead skinTone={art.skin} nose={art.nose} hair={art.hair} lod={lod} expression={expression} />
      <AvatarFeatures brows={art.brows} expression={expression} lod={lod} skin={skin} />
      <HairFront {...hair} />
      <AccessoriesFront accessories={art.accessories} lod={lod} />
    </>
  );
}

export const AvatarHeadArt = memo(AvatarHeadArtImpl);

/**
 * La place vide du profil, avant tout choix : une forme de tête et d'épaules
 * douce, jamais un « ? ».
 */
function AvatarSilhouetteImpl({ size }: { size: number }) {
  const clipId = useClipId('silhouette');
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx={60} cy={60} r={60} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        <Circle cx={60} cy={60} r={60} fill={colors.surfaceContainerLow} />
        <Path d={SILHOUETTE_D} fill={colors.surfaceContainerHigh} />
      </G>
    </Svg>
  );
}

export const AvatarSilhouette = memo(AvatarSilhouetteImpl);
