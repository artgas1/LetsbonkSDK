import { Connection } from '@solana/web3.js';
import { LetsBonkSDK } from './letsbonk-sdk';
import { LetsBonkConfig } from './core/config';

/**
 * Create LetsBonkSDK from connection
 * 
 * @param connection - Solana connection (REQUIRED)
 * @param config - Additional configuration options (optional)
 * @returns LetsBonkSDK instance
 * 
 * Note: Transaction signing happens via Keypair parameters passed to methods,
 * not via any wallet configured in the SDK.
 */
export function createSDK(
  connection: Connection,
  config: LetsBonkConfig = {}
): LetsBonkSDK {
  return new LetsBonkSDK(connection, config);
}