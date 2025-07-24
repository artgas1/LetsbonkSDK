import { PublicKey } from '@solana/web3.js';

/**
 * PDA collection
 */
export type PDAs = {
  poolState: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  metadata: PublicKey;
  authority: PublicKey;
};

/**
 * Token info for calculations
 */
export type TokenInfo = {
  mint: PublicKey;
  decimals: number;
  symbol?: string;
  name?: string;
};
