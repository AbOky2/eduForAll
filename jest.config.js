// L'app tourne au Tchad (Africa/Ndjamena, UTC+1 toute l'année). Les règles qui
// découpent les journées — série de jours, « leçons faites aujourd'hui » — sont
// fausses si les tests les évaluent depuis un autre fuseau.
process.env.TZ = 'Africa/Ndjamena';

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/src', '<rootDir>/tests', '<rootDir>/app'],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|zustand))',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/shared/testing/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/shared/testing/**',
    '!src/content/**',
  ],
};
