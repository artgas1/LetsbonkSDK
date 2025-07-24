import { Keypair, Commitment, Finality, PublicKey } from '@solana/web3.js';
import { PriorityFee } from './core';

/**
 * Token metadata types
 */
export type CreateTokenMetadata = {
  name: string;
  symbol: string;
  description: string;
  file: Blob;
  twitter?: string;
  telegram?: string;
  website?: string;
  external_url?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
};

/**
 * IPFS Upload Types
 */
export type MetadataUploadResult = {
  metadataUri: string;
  success?: boolean;
  error?: string;
};

/**
 * Token initialization parameters
 */
export type InitializeParams = {
  payer: Keypair;
  creator: PublicKey;
  baseMint: Keypair;
  tokenMetadata: CreateTokenMetadata;
  platformConfigIndex?: number;
  priorityFees?: PriorityFee;
  commitment?: Commitment;
  finality?: Finality;
};

export type InitializeAndBuyParams = InitializeParams & {
  buyAmountLamports: bigint; // Raw lamports amount for precision
  minimumTokensOut?: bigint;
  shareFeeRate?: bigint;
};
