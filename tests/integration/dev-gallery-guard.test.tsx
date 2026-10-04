import { render, screen } from '@testing-library/react-native';

import DevLayout from '../../app/(dev)/_layout';

jest.mock('expo-router', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Stack: () => createElement(MockText, null, 'galerie'),
    // La vraie redirection remplace la route ; ici, elle se montre.
    Redirect: ({ href }: { href: string }) => createElement(MockText, null, `redirection ${href}`),
  };
});

describe('la galerie de développement', () => {
  const scope = globalThis as unknown as { __DEV__: boolean };
  const dev = scope.__DEV__;
  afterEach(() => {
    scope.__DEV__ = dev;
  });

  it('n’existe pas dans un build livré : un lien profond ramène à l’accueil', () => {
    scope.__DEV__ = false;
    render(<DevLayout />);
    expect(screen.queryByText('galerie')).toBeNull();
    expect(screen.getByText('redirection /')).toBeTruthy();
  });

  it('reste ouverte en développement', () => {
    scope.__DEV__ = true;
    render(<DevLayout />);
    expect(screen.getByText('galerie')).toBeTruthy();
  });
});
