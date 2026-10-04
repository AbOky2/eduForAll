import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';

import ParentLayout from '../../app/(parent)/_layout';
import SettingsLayout from '../../app/(settings)/_layout';
import { useParentSession } from '@/features/parent-space/application/parent-session-store';

type ScreenLayout = (args: { route: { name: string }; children: ReactElement }) => ReactElement;

/** Les props reçues par le dernier `Stack` rendu (celui du layout testé). */
let mockStackProps: { screenLayout?: ScreenLayout } = {};

jest.mock('expo-router', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Stack: (props: { screenLayout?: ScreenLayout }) => {
      mockStackProps = props;
      return null;
    },
    // La vraie redirection remplace la route ; ici, elle se montre.
    Redirect: ({ href }: { href: string }) => createElement(MockText, null, `redirection ${href}`),
  };
});

/** Ce que rend la route `name` du layout, porte ouverte ou fermée. */
function renderRoute(Layout: () => ReactElement, name: string) {
  render(<Layout />);
  const screenLayout = mockStackProps.screenLayout;
  if (!screenLayout) {
    throw new Error('le layout ne pose aucune garde (screenLayout)');
  }
  return render(screenLayout({ route: { name }, children: <Text>{`écran ${name}`}</Text> }));
}

describe('la garde des routes adultes', () => {
  beforeEach(() => {
    mockStackProps = {};
    useParentSession.getState().lock();
  });

  it('laisse toujours la porte accessible', () => {
    renderRoute(ParentLayout, 'gate');
    expect(screen.getByText('écran gate')).toBeTruthy();
  });

  it('renvoie un lien profond vers le tableau de bord à la porte', () => {
    // ecolna:///dashboard, sans être passé par la porte.
    renderRoute(ParentLayout, 'dashboard');
    expect(screen.queryByText('écran dashboard')).toBeNull();
    expect(screen.getByText('redirection /(parent)/gate')).toBeTruthy();
  });

  it.each(['index', 'privacy', 'diagnostics'])(
    'renvoie les paramètres (%s) à la porte tant qu’elle est fermée',
    (name) => {
      renderRoute(SettingsLayout, name);
      expect(screen.queryByText(`écran ${name}`)).toBeNull();
      expect(screen.getByText('redirection /(parent)/gate')).toBeTruthy();
    },
  );

  it('ouvre l’espace parents une fois la porte franchie', () => {
    useParentSession.getState().unlock();
    renderRoute(ParentLayout, 'dashboard');
    expect(screen.getByText('écran dashboard')).toBeTruthy();
    renderRoute(SettingsLayout, 'index');
    expect(screen.getByText('écran index')).toBeTruthy();
  });

  it('referme l’écran ouvert dès que la session se ferme (arrière-plan, délai)', () => {
    useParentSession.getState().unlock();
    renderRoute(SettingsLayout, 'index');
    expect(screen.getByText('écran index')).toBeTruthy();
    act(() => useParentSession.getState().lock());
    expect(screen.queryByText('écran index')).toBeNull();
    expect(screen.getByText('redirection /(parent)/gate')).toBeTruthy();
  });
});
