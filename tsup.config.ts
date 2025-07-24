import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'managers/index': 'src/managers/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false, // Keep readable for debugging
  external: [
    '@solana/web3.js',
    '@solana/spl-token',
    '@coral-xyz/anchor',
    'buffer',
    'bs58',
  ],
  banner: {
    js: '/* LetsBonkSDK - Modern TypeScript Web3 SDK */',
  },
  esbuildOptions: (options) => {
    options.conditions = ['module'];
  },
}); 