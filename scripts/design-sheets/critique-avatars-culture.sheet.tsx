/** @jsxRuntime automatic */
// Planche de critique (revue culturelle, critique n° 1) — ne modifie aucun
// fichier de l'équipe : elle recompose les pièces exportées pour regarder de
// près et pour tester des corrections proposées.
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/critique-avatars-culture.sheet.tsx .cache/design-renders/avatars-critique1-culture-zoom.png --dpr 2
import type { ReactNode } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';

import {
  AccessoriesBack,
  AccessoriesBust,
  AccessoriesFront,
  AVATAR_CAST,
  AvatarFeatures,
  AvatarHead,
  AvatarNeck,
  BACKDROP_MOTIFS,
  BackdropDisc,
  EcolnaAvatar,
  Garment,
  GARMENTS,
  HairBack,
  HairDrape,
  HairFront,
  type AvatarArt,
  type AvatarExpression,
} from '../../src/design-system/avatars';
import { illustration, skinTones, type SkinTone } from '../../src/design-system/tokens';

let clipCounter = 0;

interface ComposeProps {
  art: AvatarArt;
  size: number;
  expression?: AvatarExpression;
  /** Remplace la couche « cheveux arrière » (test d'une autre géométrie). */
  hairBack?: ReactNode;
  /** Remplace la couche « cheveux avant ». */
  hairFront?: ReactNode;
  /** Couche glissée entre la tête et les traits (sous les yeux). */
  underFeatures?: ReactNode;
  /** Couche posée tout en haut. */
  overlay?: ReactNode;
  /** Force le niveau de détail de la tête seule (ex. « small » retire le tiret de pommette). */
  headLod?: 'small' | 'full';
  viewBox?: string;
  backdrop?: boolean;
}

/** Même ordre de dessin que EcolnaAvatar, mais avec des pièces remplaçables. */
function Compose({ art, size, expression = 'calm', hairBack, hairFront, underFeatures, overlay, headLod, viewBox, backdrop = true }: ComposeProps) {
  const id = `crit-${clipCounter++}`;
  const lod = size < 64 && !viewBox ? 'small' : 'full';
  const skin = skinTones[art.skin];
  const strapColor = GARMENTS[art.garment].fabric === 'saffron' ? illustration.fabric.indigo : illustration.metal.gold;
  const hair = { style: art.hair, lod, skin } as const;
  return (
    <Svg width={size} height={size} viewBox={viewBox ?? '0 0 120 120'}>
      <Defs>
        <ClipPath id={id}>
          <Circle cx={60} cy={60} r={60} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id})`}>
        {backdrop ? <BackdropDisc backdrop={art.backdrop} motif={BACKDROP_MOTIFS[art.backdrop]} /> : null}
        {hairBack === undefined ? <HairBack {...hair} /> : hairBack}
        <AvatarNeck skin={skin} />
        <Garment id={art.garment} lod={lod} />
        <AccessoriesBust marker={art.marker} accessories={art.accessories} strapColor={strapColor} lod={lod} />
        <HairDrape {...hair} />
        <AccessoriesBack marker={art.marker} accessories={art.accessories} />
        <AvatarHead skinTone={art.skin} nose={art.nose} hair={art.hair} lod={headLod ?? lod} expression={expression} />
        {underFeatures}
        <AvatarFeatures brows={art.brows} expression={expression} lod={lod} skin={skin} />
        {hairFront === undefined ? <HairFront {...hair} /> : hairFront}
        <AccessoriesFront accessories={art.accessories} lod={lod} />
        {overlay}
      </G>
    </Svg>
  );
}

const cast = (id: string): AvatarArt => AVATAR_CAST.find((a) => a.id === id) as AvatarArt;
const withSkin = (id: string, skin: SkinTone): AvatarArt => ({ ...cast(id), skin });

const SKIN_ORDER: SkinTone[] = ['ebene', 'cacao', 'acajou', 'cannelle', 'miel', 'sable'];
const REGION: Record<string, string> = {
  'avatar-2': 'pagne (sud)',
  'avatar-3': 'jalabiya (nord)',
  'avatar-5': 'foulard (nord)',
  'avatar-11': 'boubou (nord)',
};
const tag = (art: AvatarArt) => `${art.id.replace('avatar-', 'n° ')} · ${art.skin}${REGION[art.id] ? ' · ' + REGION[art.id] : ''}`;
const bySkin = (arts: AvatarArt[]) => [...arts].sort((a, b) => SKIN_ORDER.indexOf(a.skin) - SKIN_ORDER.indexOf(b.skin));

/** Proposition : décorréler les indices régionaux de la peau (recherche § 1.7). */
const PROPOSED_SKINS: Record<string, SkinTone> = {
  'avatar-3': 'ebene',
  'avatar-6': 'miel',
  'avatar-11': 'cacao',
  'avatar-7': 'cannelle',
  'avatar-2': 'miel',
  'avatar-4': 'acajou',
};
const proposedCast = AVATAR_CAST.map((art) => (PROPOSED_SKINS[art.id] ? { ...art, skin: PROPOSED_SKINS[art.id] } : art));

// --- Propositions de géométrie -------------------------------------------------
/** Croissant de paupière inférieure (peaux profondes) : collé sous l'œil, 1,2 u au centre, effilé. */
const LOWER_LID_FIX_D =
  'M43.2 61.2C44.6 64.6 46.2 65.7 48 65.7C49.8 65.7 51.4 64.6 52.8 61.2A5.5 6.5 0 0 1 43.2 61.2ZM67.2 61.2C68.6 64.6 70.2 65.7 72 65.7C73.8 65.7 75.4 64.6 76.8 61.2A5.5 6.5 0 0 1 67.2 61.2Z';
/** Pommette : pilule 6 × 2 u à bouts ronds, posée sur le haut de la joue (plus de pointe). */
const CHEEK_PILL_D = 'M39.6 64.4H43.6C44.2 64.4 44.6 64.8 44.6 65.4C44.6 66 44.2 66.4 43.6 66.4H39.6C39 66.4 38.6 66 38.6 65.4C38.6 64.8 39 64.4 39.6 64.4Z';
/** Anses (avatar 9) — variante : arches hautes et étroites, ouverture ≤ 6 u, attaches au-dessus de l'oreille. */
const LOOPS_ARCH_D =
  'M35.4 33.6C30.6 30 28 24.4 28.8 19.6C29.6 14.8 33.8 12.4 37.8 13.8C41.2 15 43.4 18 44.4 21.4M84.6 33.6C89.4 30 92 24.4 91.2 19.6C90.4 14.8 86.2 12.4 82.2 13.8C78.8 15 76.6 18 75.6 21.4';
const LOOPS_ARCH_MARKS_D =
  'M29.6 23.4L32.6 22.4M30.8 17.4L33.6 18.4M35.2 14.2L36.4 16.8M90.4 23.4L87.4 22.4M89.2 17.4L86.4 18.4M84.8 14.2L83.6 16.8';
const LOOPS_ARCH_LIGHT_D = 'M30.4 25.4C29.8 21.4 31.4 17.4 34.8 16';

function LoopsArch({ full }: { full: boolean }) {
  return (
    <>
      <Path d={LOOPS_ARCH_D} stroke={illustration.hair.base} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={LOOPS_ARCH_LIGHT_D} stroke={illustration.hair.light} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      {full ? (
        <Path d={LOOPS_ARCH_MARKS_D} stroke={illustration.hair.light} strokeWidth={1.2} strokeLinecap="round" fill="none" />
      ) : null}
    </>
  );
}

/** Paupière inférieure (calme), version fine : 0,8 u au centre, sur les 7,6 u centraux seulement. */
const LOWER_LID_THIN_D =
  'M44.2 62.7C45.4 64.6 46.6 65.3 48 65.3C49.4 65.3 50.6 64.6 51.8 62.7A5.5 6.5 0 0 1 44.2 62.7ZM68.2 62.7C69.4 64.6 70.6 65.3 72 65.3C73.4 65.3 74.6 64.6 75.8 62.7A5.5 6.5 0 0 1 68.2 62.7Z';
const CHEEKS_D = 'M37.6 69A4 2.4 0 1 1 45.6 69A4 2.4 0 1 1 37.6 69ZM74.4 69A4 2.4 0 1 1 82.4 69A4 2.4 0 1 1 74.4 69Z';
/** Joues à ΔE ≈ 9 sur toutes les peaux (aujourd'hui 17,4 sur ébène, 8,2 sur sable). */
const BLUSH_EQUAL: Record<SkinTone, string> = {
  ebene: '#5d3125',
  cacao: '#753f2d',
  acajou: '#8c4b31',
  cannelle: '#a65c3c',
  miel: '#bc6f49',
  sable: '#ce835c',
};
function FaceFix({ skin, deep }: { skin: SkinTone; deep: boolean }) {
  return (
    <>
      <Path d={CHEEKS_D} fill={BLUSH_EQUAL[skin]} />
      {deep ? <Path d={LOWER_LID_THIN_D} fill={skinTones[skin].light} /> : null}
    </>
  );
}

/** Calotte standard (identique à celle des tresses, du chignon, des anses). */
const CAP_D =
  'M32 55C29.4 53.4 29.4 52 29.4 50C28.3 33.1 42.9 17.4 60 18.4C77.1 17.4 91.7 33.1 90.6 50C90.6 52 90.6 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
/** Avatar 9, piste B : cinq nœuds (nœuds bantous) r 6,6 sur un arc r 31 centré (60, 48). */
const KNOTS_D =
  'M26.6 32.5A6.6 6.6 0 1 1 39.8 32.5A6.6 6.6 0 1 1 26.6 32.5ZM37.9 21.2A6.6 6.6 0 1 1 51.1 21.2A6.6 6.6 0 1 1 37.9 21.2ZM53.4 17A6.6 6.6 0 1 1 66.6 17A6.6 6.6 0 1 1 53.4 17ZM68.9 21.2A6.6 6.6 0 1 1 82.1 21.2A6.6 6.6 0 1 1 68.9 21.2ZM80.2 32.5A6.6 6.6 0 1 1 93.4 32.5A6.6 6.6 0 1 1 80.2 32.5Z';
const KNOTS_CURLS_D =
  'M30.4 31.5A3 3 0 0 1 35.5 30.6M41.7 20.2A3 3 0 0 1 46.8 19.3M57.2 16A3 3 0 0 1 62.3 15.1M72.7 20.2A3 3 0 0 1 77.8 19.3M84 31.5A3 3 0 0 1 89.1 30.6';
const KNOTS_PARTS_D = 'M42 35L38.6 31.4M50 30.6L47.6 25.6M60 29.6V23.6M70 30.6L72.4 25.6M78 35L81.4 31.4';

function KnotsBack() {
  return <Path d={KNOTS_D} fill={illustration.hair.base} />;
}
function KnotsFront({ skin, full }: { skin: SkinTone; full: boolean }) {
  return (
    <>
      <Path d={CAP_D} fill={illustration.hair.base} />
      {full ? <Path d={KNOTS_PARTS_D} stroke={skinTones[skin].light} strokeWidth={1.4} strokeLinecap="round" fill="none" /> : null}
      <Path d={KNOTS_CURLS_D} stroke={illustration.hair.light} strokeWidth={full ? 1.6 : 2} strokeLinecap="round" fill="none" />
    </>
  );
}
const knots = (size: number, extra: Partial<ComposeProps> = {}) => {
  const art = cast('avatar-9');
  const full = size >= 64;
  return <Compose art={art} size={size} hairBack={<KnotsBack />} hairFront={<KnotsFront skin={art.skin} full={full} />} {...extra} />;
};

const black = (node: ReactNode, size: number) => (
  <div style={{ filter: 'brightness(0)', width: size, height: size, lineHeight: 0 }}>{node}</div>
);

/** Le visage seul, agrandi (fenêtre x 26–94, y 38–90). */
const FACE_VIEW = '26 36 68 56';

export default {
  title: 'Critique n° 1 — revue culturelle (regard tchadien)',
  subtitle: 'Recompose les pièces exportées ; aucune modification des fichiers de l’équipe.',
  width: 1500,
  sections: [
    {
      title: 'Taille « scène de profil » 320 px — peaux profondes, calme puis joie (n° 6, 9 ébène ; n° 1, 7 cacao)',
      cellWidth: 336,
      cellHeight: 336,
      cells: ['avatar-6', 'avatar-9', 'avatar-1', 'avatar-7'].flatMap((id) => [
        { label: `${id} calme`, node: <EcolnaAvatar avatarId={id} size={320} /> },
        { label: `${id} joie`, node: <EcolnaAvatar avatarId={id} size={320} expression="joy" /> },
      ]),
    },
    {
      title: 'Visage ×6 (fenêtre 68 × 56 u) — actuel : tiret de pommette en pointe, croissant de paupière (calme) invisible',
      cellWidth: 336,
      cellHeight: 280,
      cells: [
        { label: 'n° 9 ébène calme — actuel', node: <Compose art={cast('avatar-9')} size={336} viewBox={FACE_VIEW} /> },
        { label: 'n° 9 ébène joie — actuel', node: <Compose art={cast('avatar-9')} size={336} viewBox={FACE_VIEW} expression="joy" /> },
        { label: 'n° 3 miel calme — actuel', node: <Compose art={cast('avatar-3')} size={336} viewBox={FACE_VIEW} /> },
        {
          label: 'n° 9 calme — proposé : paupière + pilule',
          node: (
            <Compose
              art={cast('avatar-9')}
              size={336}
              viewBox={FACE_VIEW}
              headLod="small"
              underFeatures={
                <>
                  <Path d={LOWER_LID_FIX_D} fill={skinTones.ebene.light} />
                  <Path d={CHEEK_PILL_D} fill={skinTones.ebene.light} />
                </>
              }
            />
          ),
        },
      ],
    },
    {
      title: 'Proposé, taille réelle : croissant de paupière + pilule de pommette (ébène, cacao) à 40 / 56 / 96 / 160 px',
      cellWidth: 176,
      cellHeight: 176,
      cells: (['avatar-6', 'avatar-9', 'avatar-1'] as const).flatMap((id) =>
        [40, 96, 160].map((size) => {
          const art = cast(id);
          const light = skinTones[art.skin].light;
          return {
            label: `${id} ${size} px proposé`,
            node: (
              <Compose
                art={art}
                size={size}
                headLod="small"
                underFeatures={
                  <>
                    <Path d={LOWER_LID_FIX_D} fill={light} />
                    {size >= 64 ? <Path d={CHEEK_PILL_D} fill={light} /> : null}
                  </>
                }
              />
            ),
          };
        }),
      ),
    },
    {
      title: 'Le nord et le sud sur l’échelle des peaux — ACTUEL (du plus foncé au plus clair)',
      note: 'Les trois indices du nord (jalabiya, boubou, foulard) tombent sur les trois peaux les plus claires ; le pagne du sud sur une peau foncée.',
      cellWidth: 104,
      cellHeight: 104,
      cells: bySkin([...AVATAR_CAST]).map((art) => ({ label: tag(art), node: <EcolnaAvatar avatarId={art.id} size={96} /> })),
    },
    {
      title: 'Le nord et le sud sur l’échelle des peaux — PROPOSÉ (6 peaux permutées, chaque peau = une fille + un garçon)',
      cellWidth: 104,
      cellHeight: 104,
      cells: bySkin(proposedCast).map((art) => ({ label: tag(art), node: <Compose art={art} size={96} /> })),
    },
    {
      title: 'Proposé à 40 px et en niveaux de gris (ordre de la grille)',
      cellWidth: 56,
      cellHeight: 56,
      cells: [
        ...proposedCast.map((art) => ({ label: art.id.replace('avatar-', ''), node: <Compose art={art} size={40} /> })),
        ...proposedCast.map((art) => ({ label: `g${art.id.replace('avatar-', '')}`, node: <Compose art={art} size={40} />, grayscale: true })),
      ],
    },
    {
      title: 'Avatar 9 — anses : actuel (anneaux ronds en haut = oreilles de souris) vs arches étroites tressées',
      cellWidth: 176,
      cellHeight: 176,
      cells: [
        { label: 'actuel 160', node: <EcolnaAvatar avatarId="avatar-9" size={160} /> },
        { label: 'proposé 160', node: <Compose art={cast('avatar-9')} size={160} hairBack={<LoopsArch full />} /> },
        { label: 'actuel silhouette 96', node: black(<EcolnaAvatar avatarId="avatar-9" size={96} backdrop={false} />, 96) },
        { label: 'proposé silhouette 96', node: black(<Compose art={cast('avatar-9')} size={96} backdrop={false} hairBack={<LoopsArch full />} />, 96) },
        { label: 'actuel silhouette 40', node: black(<EcolnaAvatar avatarId="avatar-9" size={40} backdrop={false} />, 40) },
        { label: 'proposé silhouette 40', node: black(<Compose art={cast('avatar-9')} size={40} backdrop={false} hairBack={<LoopsArch full={false} />} />, 40) },
        { label: 'proposé 40', node: <Compose art={cast('avatar-9')} size={40} hairBack={<LoopsArch full={false} />} /> },
      ],
    },
    {
      title: 'Grille « Choisis ton personnage » — 12 tuiles de 120 px sur le fond de l’app (ce que voit l’enfant)',
      cellWidth: 128,
      cellHeight: 128,
      background: '#fbf8ff',
      cells: AVATAR_CAST.map((art) => ({ label: art.id, node: <EcolnaAvatar avatarId={art.id} size={120} /> })),
    },
    {
      title: 'Disques : lavande seulement pour des filles (4, 7), menthe seulement pour des garçons (10, 12)',
      cellWidth: 104,
      cellHeight: 104,
      cells: AVATAR_CAST.filter((a) => a.backdrop === 'lavender' || a.backdrop === 'mint').map((art) => ({
        label: `${art.id} ${art.gender === 'girl' ? 'fille' : 'garçon'} · ${art.backdrop}`,
        node: <EcolnaAvatar avatarId={art.id} size={96} />,
      })),
    },
    {
      title: 'Visage ×6 — correction testée : sans tiret de pommette, paupière fine (peaux profondes), joues à ΔE ≈ 9',
      cellWidth: 336,
      cellHeight: 280,
      cells: [
        { label: 'n° 9 ébène — actuel', node: <Compose art={cast('avatar-9')} size={336} viewBox={FACE_VIEW} /> },
        {
          label: 'n° 9 ébène — corrigé',
          node: <Compose art={cast('avatar-9')} size={336} viewBox={FACE_VIEW} headLod="small" underFeatures={<FaceFix skin="ebene" deep />} />,
        },
        { label: 'n° 1 cacao — actuel', node: <Compose art={cast('avatar-1')} size={336} viewBox={FACE_VIEW} /> },
        {
          label: 'n° 1 cacao — corrigé',
          node: <Compose art={cast('avatar-1')} size={336} viewBox={FACE_VIEW} headLod="small" underFeatures={<FaceFix skin="cacao" deep />} />,
        },
      ],
    },
    {
      title: 'Correction testée à taille réelle : 40 / 96 / 160 / 320 px (ébène n° 6, cacao n° 7)',
      cellWidth: 336,
      cellHeight: 336,
      cells: (['avatar-6', 'avatar-7'] as const).flatMap((id) => {
        const art = cast(id);
        return [
          {
            label: `${id} 320 corrigé`,
            node: <Compose art={art} size={320} headLod="small" underFeatures={<FaceFix skin={art.skin} deep />} />,
          },
          {
            label: `${id} 160 / 96 / 40 corrigé`,
            node: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[160, 96, 40].map((s) => (
                  <Compose key={s} art={art} size={s} headLod="small" underFeatures={<FaceFix skin={art.skin} deep />} />
                ))}
              </div>
            ),
          },
        ];
      }),
    },
    {
      title: 'Avatar 9, piste B — cinq nœuds bantous à la place des anneaux (aucune lecture « oreilles »)',
      cellWidth: 176,
      cellHeight: 176,
      cells: [
        { label: 'nœuds 160', node: knots(160) },
        { label: 'nœuds 160 joie', node: knots(160, { expression: 'joy' }) },
        { label: 'nœuds 96', node: knots(96) },
        { label: 'nœuds 40', node: knots(40) },
        { label: 'nœuds silhouette 96', node: black(knots(96, { backdrop: false }), 96) },
        { label: 'nœuds silhouette 40', node: black(knots(40, { backdrop: false }), 40) },
        { label: 'nœuds gris 96', node: knots(96), grayscale: true },
      ],
    },
    {
      title: 'Silhouettes noires à 40 px des douze, n° 9 en nœuds bantous (comparer à 2, 7, 11)',
      cellWidth: 56,
      cellHeight: 56,
      cells: AVATAR_CAST.map((art) => ({
        label: art.id.replace('avatar-', ''),
        node:
          art.id === 'avatar-9'
            ? black(knots(40, { backdrop: false }), 40)
            : black(<EcolnaAvatar avatarId={art.id} size={40} backdrop={false} />, 40),
      })),
    },
    {
      title: 'Joie, peaux profondes et claires côte à côte à 96 px (la bande de dents à 13:1 sur ébène)',
      cellWidth: 104,
      cellHeight: 104,
      cells: ['avatar-6', 'avatar-9', 'avatar-1', 'avatar-7', 'avatar-5', 'avatar-12'].map((id) => ({
        label: `${id} joie`,
        node: <EcolnaAvatar avatarId={id} size={96} expression="joy" />,
      })),
    },
  ],
};
