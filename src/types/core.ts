import { PublicKey, Commitment, Finality, Transaction, VersionedTransaction, Keypair, Connection } from '@solana/web3.js';

/**
 * SDK Configuration
 */
export type LetsBonkSDKConfig = {
  connection?: Connection; // Connection from @solana/web3.js
  programId?: PublicKey;
  commitment?: Commitment;
  finality?: Finality;
};

/**
 * Priority fee configuration
 */
export type PriorityFee = {
  unitLimit?: number;
  unitPrice?: number;
};

/**
 * Base result type for operations
 */
export type TransactionResult = {
  success: boolean;
  signature?: string;
  results?: Record<string, unknown>;
  sentAt?: number;
  error?: string;
  message?: string;
  transaction?: Transaction | VersionedTransaction;
  signers?: Keypair[];
  description?: string;
};
