import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { colors } from '@/design-system/tokens';

import { LevelCard, StepDots, ceremonyColumns, ceremonyFooterBottom } from './ceremony-parts';

describe('l’indicateur d’étapes', () => {
  it('montre les étapes à venir en gris lisible, l’étape en cours en pilule bleue', () => {
    render(<StepDots step={2} total={3} />);
    const active = StyleSheet.flatten(screen.getByTestId('step-dot-active').props.style);
    expect(active.backgroundColor).toBe(colors.brand);
    const others = screen.getAllByTestId('step-dot');
    expect(others).toHaveLength(2);
    for (const dot of others) {
      const style = StyleSheet.flatten(dot.props.style);
      // inkDisabled (2,2:1 sur la toile), pas un gris pâle qui disparaît au soleil.
      expect(style.backgroundColor).toBe(colors.inkDisabled);
      expect(style.width).toBe(style.height);
      expect(active.width).toBeGreaterThan(style.width);
    }
  });

  it('se lit « Étape 2 sur 3 », ou le libellé donné (pages de l’onboarding)', () => {
    const { rerender } = render(<StepDots step={2} total={3} />);
    expect(screen.getByLabelText('Étape 2 sur 3')).toBeTruthy();
    rerender(<StepDots step={1} total={3} accessibilityLabel="Page 1 sur 3" />);
    expect(screen.getByLabelText('Page 1 sur 3')).toBeTruthy();
  });
});

describe('la carte de classe', () => {
  it('dit le niveau deux fois — le chiffre et « CP1 » —, pas trois', () => {
    render(<LevelCard level="CP1" selected={false} onSelect={() => {}} width={240} height={250} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('CP1')).toBeTruthy();
    expect(screen.queryByText(/année/)).toBeNull();
  });
});

describe('les deux volets de l’entrée à l’école', () => {
  // Les fenêtres du banc : grande tablette couchée, 7" couchée (gouttière,
  // échelle de useResponsive).
  it.each([
    ['iPad 11" couché', 1180, 1.3, 90],
    ['7" couchée', 1024, 1.15, 48],
    ['iPad 13" couché', 1376, 1.3, 188],
  ])('le pied tombe sur la gouttière de droite (%s)', (_name, width, scale, gutter) => {
    const columns = ceremonyColumns(width, scale, gutter);
    // La colonne commence après la scène (44 % de la largeur) et sa marge…
    expect(columns.left).toBeGreaterThan(columns.stage);
    expect(columns.stage).toBe(Math.round(width * 0.44));
    // … et s'arrête sur la gouttière, comme « Passer » au-dessus.
    expect(columns.left + columns.width).toBe(width - gutter);
  });

  it('ne dépasse jamais 760 dp de large, ni ne devient négative', () => {
    expect(ceremonyColumns(3000, 1.3, 48).width).toBe(760);
    expect(ceremonyColumns(0, 1, 20).width).toBe(0);
  });

  it('pose le pied au même endroit au-dessus du bord, avec ou sans encoche', () => {
    expect(ceremonyFooterBottom(0)).toBe(24);
    expect(ceremonyFooterBottom(34)).toBe(42);
  });
});
