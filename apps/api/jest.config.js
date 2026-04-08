const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@user-management-system/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverageFrom: ['src/middleware/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/middleware/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  roots: ['<rootDir>/src'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  verbose: true,
};
