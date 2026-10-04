import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { colors } from '@/design-system/tokens';

import { LevelCard, StepDots } from './ceremony-parts';

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
