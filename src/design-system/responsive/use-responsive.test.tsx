import { Text, useWindowDimensions } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { EcolnaExerciseLayout } from '../primitives/ecolna-exercise-layout';
import { useResponsive, windowSizeOf } from './use-responsive';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');

const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

function setWindow(width: number, height: number): void {
  mockedDimensions.mockReturnValue({ width, height, scale: 2, fontScale: 1 });
}

function Probe() {
  const responsive = useResponsive();
  return (
    <Text testID="probe">
      {JSON.stringify({
        windowSize: responsive.windowSize,
        isTablet: responsive.isTablet,
        isLandscape: responsive.isLandscape,
        splitPanes: responsive.splitPanes,
        contentMaxWidth: responsive.contentMaxWidth,
        scale: responsive.scale,
      })}
    </Text>
  );
}

function probeValue() {
  return JSON.parse(screen.getByTestId('probe').props.children as string);
}

describe('window size classes', () => {
  it.each([
    [359, 'compact'],
    [599, 'compact'],
    [600, 'medium'],
    [904, 'medium'],
    [905, 'expanded'],
    [1280, 'expanded'],
  ])('classes %i dp as %s', (width, expected) => {
    expect(windowSizeOf(width)).toBe(expected);
  });
});

describe('useResponsive', () => {
  it('treats a phone in portrait as compact, at base scale', () => {
    setWindow(412, 917);
    render(<Probe />);
    const value = probeValue();
    expect(value.windowSize).toBe('compact');
    expect(value.isTablet).toBe(false);
    expect(value.splitPanes).toBe(false);
    expect(value.scale).toBe(1);
  });

  it('scales up on a tablet in portrait but keeps a single column', () => {
    setWindow(800, 1280);
    render(<Probe />);
    const value = probeValue();
    expect(value.isTablet).toBe(true);
    expect(value.scale).toBeGreaterThan(1);
    // Portrait has the height to stack: no reason to split.
    expect(value.splitPanes).toBe(false);
  });

  it('splits the panes on a tablet held in landscape', () => {
    setWindow(1280, 800);
    render(<Probe />);
    const value = probeValue();
    expect(value.windowSize).toBe('expanded');
    expect(value.isLandscape).toBe(true);
    expect(value.splitPanes).toBe(true);
  });

  it.each([
    // A phone held sideways is "expanded" by its width, not by its height.
    [915, 412, 1],
    // A 7" tablet in landscape: the exercises have to fit in 600 dp.
    [1024, 600, 1.15],
    // A 10" tablet in landscape keeps the full scale.
    [1280, 800, 1.3],
  ])(
    'caps the scale of a %i × %i window at what its height can carry',
    (width, height, expected) => {
      setWindow(width, height);
      render(<Probe />);
      expect(probeValue().scale).toBe(expected);
    },
  );

  it('never lets the readable column grow with the screen', () => {
    setWindow(1920, 1200);
    render(<Probe />);
    // A line of text spanning a whole tablet is unreadable for a beginner.
    expect(probeValue().contentMaxWidth).toBeLessThanOrEqual(1000);
  });
});

describe('EcolnaExerciseLayout', () => {
  it('shows both the prompt and the answers whatever the window', () => {
    for (const [width, height] of [
      [412, 917],
      [800, 1280],
      [1280, 800],
    ] as const) {
      setWindow(width, height);
      const view = render(
        <EcolnaExerciseLayout
          prompt={<Text>Que viens-tu d’entendre ?</Text>}
          answers={<Text>ba</Text>}
        />,
      );
      expect(screen.getByText('Que viens-tu d’entendre ?')).toBeTruthy();
      expect(screen.getByText('ba')).toBeTruthy();
      view.unmount();
    }
  });
});
