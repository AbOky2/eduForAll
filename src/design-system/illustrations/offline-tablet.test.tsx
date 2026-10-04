import { render, screen } from '@testing-library/react-native';

import { Circle, Rect } from 'react-native-svg';

import { EcolnaAvatar } from '../avatars';
import { SubjectArt } from '../icons/subject-art';
import { colors } from '../tokens';
import {
  OFFLINE_TABLET_DEFAULT_AVATAR,
  OfflineTabletArt,
  offlineTabletMetrics,
} from './offline-tablet';

/** Le point d'un rectangle arrondi le plus loin du centre du disque, coins compris. */
function farthestCorner(
  rect: { left: number; top: number; width: number; height: number; radius: number },
  size: number,
) {
  const c = size / 2;
  // Le centre de l'arrondi de chaque coin, puis son rayon.
  const xs = [rect.left + rect.radius, rect.left + rect.width - rect.radius];
  const ys = [rect.top + rect.radius, rect.top + rect.height - rect.radius];
  return Math.max(...xs.flatMap((x) => ys.map((y) => Math.hypot(x - c, y - c)))) + rect.radius;
}

/** La distance au centre du disque du bord le plus lointain d'une pastille ronde. */
function discReach(left: number, top: number, diameter: number, size: number) {
  return Math.hypot(left + diameter / 2 - size / 2, top + diameter / 2 - size / 2) + diameter / 2;
}

/** Le composant sous `memo` : c'est lui que l'arbre rendu contient. */
const inner = <P,>(component: React.ComponentType<P>) =>
  (component as unknown as { type: React.ComponentType<P> }).type;

describe('la tablette de la promesse « sans internet »', () => {
  it.each([240, 312, 398, 416, 460])(
    'compose la tablette, l’enfant et la pastille (Ø %i dp)',
    (size) => {
      const m = offlineTabletMetrics(size);
      // Une tablette couchée (4:3), aux coins arrondis à 12 % de sa largeur…
      expect(m.tablet.width / m.tablet.height).toBeCloseTo(4 / 3, 1);
      expect(m.tablet.radius / m.tablet.width).toBeCloseTo(0.12, 2);
      // … dont l'écran est en retrait de 7 % de la largeur, sur les quatre côtés.
      const bezel = m.screen.left - m.tablet.left;
      expect(bezel / m.tablet.width).toBeCloseTo(0.07, 1);
      expect(m.screen.top - m.tablet.top).toBe(bezel);
      expect(m.tablet.left + m.tablet.width - (m.screen.left + m.screen.width)).toBe(bezel);
      expect(m.tablet.top + m.tablet.height - (m.screen.top + m.screen.height)).toBe(bezel);
      // Les quatre emblèmes tiennent dans l'écran, en une rangée.
      expect(m.emblemLeft).toBeGreaterThanOrEqual(m.screen.left);
      expect(m.emblemLeft + m.emblem * 4 + m.emblemGap * 3).toBeLessThanOrEqual(
        m.screen.left + m.screen.width,
      );
      expect(m.emblemTop).toBeGreaterThanOrEqual(m.screen.top);
      expect(m.emblemTop + m.emblem).toBeLessThanOrEqual(m.screen.top + m.screen.height);
      // L'enfant ne cache aucun emblème : il commence sous la rangée.
      expect(m.avatarTop).toBeGreaterThan(m.emblemTop + m.emblem);
      // Tout tient dans le disque : la tablette, l'enfant et la pastille.
      expect(farthestCorner(m.tablet, size)).toBeLessThan(size / 2);
      const avatarDisc = m.avatar + m.avatarRing * 2;
      expect(discReach(m.avatarLeft, m.avatarTop, avatarDisc, size)).toBeLessThan(size / 2);
      expect(discReach(m.badgeLeft, m.badgeTop, m.badge, size)).toBeLessThan(size / 2);
    },
  );

  it('montre les quatre disciplines et l’enfant en joie — celui du profil s’il est donné', () => {
    const { rerender } = render(<OfflineTabletArt size={320} />);
    const subjects = screen
      .UNSAFE_getAllByType(inner(SubjectArt))
      .map((node) => node.props.subject);
    expect(subjects).toEqual(['language', 'reading', 'writing', 'math']);
    expect(screen.UNSAFE_getByType(inner(EcolnaAvatar)).props).toMatchObject({
      avatarId: OFFLINE_TABLET_DEFAULT_AVATAR,
      expression: 'joy',
    });
    rerender(<OfflineTabletArt size={320} avatarId="avatar-7" />);
    expect(screen.UNSAFE_getByType(inner(EcolnaAvatar)).props.avatarId).toBe('avatar-7');
  });

  it('peint la tablette de nuit sur un disque bleu : le vert ne reste que sur la coche', () => {
    render(<OfflineTabletArt size={320} />);
    const fills = [...screen.UNSAFE_getAllByType(Circle), ...screen.UNSAFE_getAllByType(Rect)].map(
      (node) => node.props.fill as string | undefined,
    );
    expect(fills).toContain(colors.brandTint);
    expect(fills).toContain(colors.night);
    expect(fills.filter((fill) => fill === colors.success)).toHaveLength(1);
    expect(fills).not.toContain(colors.successTint);
  });

  it('est décorative : les mots de l’écran la disent au lecteur d’écran', () => {
    render(<OfflineTabletArt size={320} />);
    // Invisible pour l'arbre d'accessibilité, mais bien rendue.
    expect(screen.queryByTestId('offline-tablet-art')).toBeNull();
    expect(screen.getByTestId('offline-tablet-art', { includeHiddenElements: true })).toBeTruthy();
  });
});
