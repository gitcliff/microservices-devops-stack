/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Discover tests inside any service sub-directory
  roots: ['<rootDir>/services'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],

  // Measure coverage across all service source files
  collectCoverageFrom: [
    'services/**/*.ts',
    '!services/**/*.d.ts',
    '!services/**/index.ts',       // entry-point wiring, not logic
    '!services/**/server.ts',      // server bootstrap, not logic
  ],

  // Emit lcov for SonarQube + human-readable summary
  coverageReporters: ['lcov', 'text', 'text-summary'],
  coverageDirectory: 'coverage',

  // Fail the CI job if any metric drops below 80 %
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
