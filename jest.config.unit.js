module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: 'Unit Tests',
  roots: ['<rootDir>/src', '<rootDir>/tests/unit'],
  testMatch: [
    '**/tests/unit/**/*.test.ts',
    '**/tests/unit/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/IDL/**',
  ],
  coverageDirectory: 'coverage/unit',
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],
  maxWorkers: '50%',
  // Optimize unit test execution
  clearMocks: true,
  restoreMocks: true
}; 