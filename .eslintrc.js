module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended'],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  rules: {
    // Basic ESLint rules
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    // 'no-unused-vars': 'off', // Turn off base rule to use TypeScript version
    
    // TypeScript-specific rules (manual configuration)
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    '*.mjs',
    'jest.config.*',
    'tsup.config.*',
  ],
}; 