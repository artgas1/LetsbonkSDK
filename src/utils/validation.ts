import { PublicKey, SystemProgram } from '@solana/web3.js';

/**
 * Check if a PublicKey is valid (not the default/zero key)
 */
export function isValidPublicKey(key: PublicKey): boolean {
  return !key.equals(SystemProgram.programId);
}
