import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { EcolnaAvatar } from '../avatars';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { SubjectArt } from '../icons/subject-art';
import { colors } from '../tokens';

/** Les quatre disciplines, dans l'ordre du programme : comme les tuiles de l'accueil couché. */
const SUBJECTS = ['language', 'reading', 'writing', 'math'] as const;

/** L'enfant de la première page de l'onboarding : le même, de l'orbite à sa tablette. */
export const OFFLINE_TABLET_DEFAULT_AVATAR = 'avatar-2';

/**
 * Les mesures de l'illustration dans un carré de `size` dp, en fractions de
 * `size` (le disque de fond en est le cercle inscrit). Exportées pour les
 * tests : la tablette, l'enfant et la pastille restent dans le disque, et
 * l'enfant ne cache jamais un emblème, à toutes les tailles.
 */
export function offlineTabletMetrics(size: number) {
  const at = (fraction: number) => Math.round(size * fraction);
  // La tablette, couchée (4:3), un peu au-dessus et à droite du centre :
  // l'enfant se tient en bas à gauche, la pastille sur le coin opposé.
  const width = at(0.63);
  const height = Math.round((width * 3) / 4);
  const left = at(0.54) - Math.round(width / 2);
  const top = at(0.45) - Math.round(height / 2);
  const corner = Math.round(width * 0.12);
  // L'écran, en retrait de 7 % de la largeur sur les quatre côtés.
  const bezel = Math.round(width * 0.07);
  const screen = {
    left: left + bezel,
    top: top + bezel,
    width: width - bezel * 2,
    height: height - bezel * 2,
    radius: Math.max(2, corner - bezel),
  };
  // Les quatre emblèmes en une rangée, au milieu de l'écran.
  const emblem = Math.round(screen.width * 0.19);
  const emblemGap = Math.round((screen.width * 0.86 - emblem * 4) / 3);
  const rowWidth = emblem * 4 + emblemGap * 3;
  const avatar = at(0.3);
  const avatarRing = Math.max(2, Math.round(size * 0.012));
  const badge = at(0.16);
  // Le même filet blanc que l'enfant : la coche peinte laisse déjà un liseré
  // de 8/256 de sa boîte autour de son disque.
  const badgeRing = Math.max(1, avatarRing - Math.round((badge * 8) / 256));
  return {
    tablet: { left, top, width, height, radius: corner },
    screen,
    // La caméra, au milieu du bord haut : ce qui fait une tablette d'un cadre.
    camera: { cx: left + Math.round(width / 2), cy: top + bezel / 2, r: Math.max(1, bezel * 0.16) },
    emblem,
    emblemGap,
    emblemLeft: screen.left + Math.round((screen.width - rowWidth) / 2),
    emblemTop: screen.top + Math.round((screen.height - emblem) / 2),
    // L'enfant, cerclé de blanc, à cheval sur le coin bas gauche.
    avatar,
    avatarRing,
    avatarLeft: at(0.28) - Math.round(avatar / 2) - avatarRing,
    avatarTop: at(0.7) - Math.round(avatar / 2) - avatarRing,
    // La pastille de réussite, sur le coin haut droit.
    badge,
    badgeRing,
    badgeLeft: at(0.82) - Math.round(badge / 2),
    badgeTop: at(0.255) - Math.round(badge / 2),
  };
}

/**
 * La promesse « sans internet », en une seule image pour toute l'app
 * (l'onboarding et l'écran hors connexion) — une illustration en aplats,
 * de la même main que les autres : sur un disque bleu très clair, la
 * tablette de nuit couchée, dont l'écran blanc montre les quatre
 * disciplines — tout y est déjà ; l'enfant en joie à côté, et la pastille
 * verte de réussite sur le coin (le vert ne dit que « ça marche »).
 * Décorative : les mots de l'écran disent la même chose au lecteur d'écran.
 */
export const OfflineTabletArt = memo(function OfflineTabletArt({
  size,
  avatarId = OFFLINE_TABLET_DEFAULT_AVATAR,
}: {
  size: number;
  /** L'enfant à côté de la tablette (l'enfant actif sur l'écran hors connexion). */
  avatarId?: string;
}) {
  const m = offlineTabletMetrics(size);
  return (
    <View
      testID="offline-tablet-art"
      style={{ width: size, height: size }}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={colors.brandTint} />
        <Rect
          x={m.tablet.left}
          y={m.tablet.top}
          width={m.tablet.width}
          height={m.tablet.height}
          rx={m.tablet.radius}
          fill={colors.night}
        />
        <Rect
          x={m.screen.left}
          y={m.screen.top}
          width={m.screen.width}
          height={m.screen.height}
          rx={m.screen.radius}
          fill={colors.white}
        />
        <Circle cx={m.camera.cx} cy={m.camera.cy} r={m.camera.r} fill={colors.nightSoft} />
      </Svg>
      {SUBJECTS.map((subject, index) => (
        <View
          key={subject}
          style={[
            styles.absolute,
            { left: m.emblemLeft + index * (m.emblem + m.emblemGap), top: m.emblemTop },
          ]}
        >
          <SubjectArt subject={subject} size={m.emblem} />
        </View>
      ))}
      <View
        style={[
          styles.ring,
          {
            left: m.avatarLeft,
            top: m.avatarTop,
            padding: m.avatarRing,
            borderRadius: m.avatar / 2 + m.avatarRing,
          },
        ]}
      >
        <EcolnaAvatar avatarId={avatarId} size={m.avatar} expression="joy" />
      </View>
      <View
        style={[
          styles.ring,
          {
            left: m.badgeLeft,
            top: m.badgeTop,
            padding: m.badgeRing,
            borderRadius: m.badge / 2,
          },
        ]}
      >
        <EcolnaIcon name="check" filled size={m.badge - m.badgeRing * 2} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  absolute: { position: 'absolute' },
  // Un filet blanc détache l'enfant et la pastille de la tablette.
  ring: { position: 'absolute', backgroundColor: colors.white },
});
