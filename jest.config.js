module.exports = {
  projects: [
    '<rootDir>/jest.config.unit.js',
    '<rootDir>/jest.config.integration.js'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/IDL/**',
  ]
}; 