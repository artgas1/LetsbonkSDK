import { Commitment } from '@solana/web3.js';
import { PriorityFee } from './core';

/**
 * Transaction execution options
 */
export interface TransactionExecutionOptions {
  skipPreflight?: boolean;
  maxRetries?: number;
  commitment?: Commitment;
  timeout?: number;
  priorityFees?: PriorityFee;
}

/**
 * Metadata preparation parameters
 */
export interface MetadataPreparationParams {
  name: string;
  symbol: string;
  description: string;
  imageInput: Blob | string; // Can be Blob, base64 string, or URL
  twitter?: string;
  telegram?: string;
  website?: string;
}
