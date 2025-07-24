module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: 'Integration Tests',
  roots: ['<rootDir>/src', '<rootDir>/tests/integration'],
  testMatch: [
    '**/tests/integration/**/*.test.ts',
    '**/tests/integration/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  maxWorkers: 1, // Run integration tests sequentially
  // Only run if INTEGRATION_TESTS env var is set
  testPathIgnorePatterns: process.env.INTEGRATION_TESTS ? [] : ['<rootDir>/tests/integration/'],
  // Properly handle async cleanup
  detectOpenHandles: true,
  // Optimize test execution
  workerIdleMemoryLimit: '512MB',
  clearMocks: true,
  restoreMocks: true
}; 