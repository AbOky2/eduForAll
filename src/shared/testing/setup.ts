// Global Jest setup. Keep light: domain tests must not need native modules.

jest.mock('expo-crypto', () => ({
  randomUUID: () => `test-${Math.random().toString(36).slice(2)}`,
}));
