import { render, screen } from '@testing-library/react-native';

import { OfflineTabletArt, offlineTabletMetrics } from './offline-tablet';

describe('la tablette de la promesse « sans internet »', () => {
  it.each([240, 312, 416, 460])(
    'garde son écran et sa pastille dans le disque (Ø %i dp)',
    (size) => {
      const m = offlineTabletMetrics(size);
      // L'écran est dans la tablette…
      expect(m.screen.left + m.screen.width).toBeLessThanOrEqual(m.tablet);
      expect(m.screen.top + m.screen.height).toBeLessThanOrEqual(m.tablet);
      // … les deux rangées de deux emblèmes tiennent dans l'écran…
      expect(m.emblem * 2 + m.emblemGap).toBeLessThanOrEqual(m.screen.width);
      expect(m.emblem * 2 + m.emblemGap).toBeLessThanOrEqual(m.screen.height);
      // … et la pastille, posée sur le coin, ne sort pas du disque.
      const offset = (size - m.tablet) / 2;
      const cx = offset + m.badgeLeft + m.badge / 2 - size / 2;
      const cy = offset + m.badgeTop + m.badge / 2 - size / 2;
      expect(Math.hypot(cx, cy) + m.badge / 2).toBeLessThan(size / 2);
    },
  );

  it('est décorative : les mots de l’écran la disent au lecteur d’écran', () => {
    render(<OfflineTabletArt size={320} />);
    // Invisible pour l'arbre d'accessibilité, mais bien rendue.
    expect(screen.queryByTestId('offline-tablet-art')).toBeNull();
    expect(screen.getByTestId('offline-tablet-art', { includeHiddenElements: true })).toBeTruthy();
  });
});
