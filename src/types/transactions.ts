import { VersionedTransaction, Keypair, Commitment, Finality, PublicKey } from '@solana/web3.js';
import { PriorityFee } from './core';

/**
 * Transaction construction types
 */
export type ConstructedTransaction = {
  transaction: VersionedTransaction;
  signers: Keypair[];
  description?: string;
};

export type TransactionConstructionResult = {
  success: boolean;
  constructedTransaction?: ConstructedTransaction;
  error?: string;
  metadata?: Record<string, unknown>; // For additional info like PDAs, token accounts, etc.
};

/**
 * Trade parameters
 */
export type BuyParams = {
  buyer: Keypair;
  baseMint: PublicKey;
  amountIn: bigint; // Amount of quote tokens (SOL) to spend
  minimumAmountOut: bigint; // Minimum tokens to receive
  shareFeeRate?: bigint;
  priorityFees?: PriorityFee;
  commitment?: Commitment;
  finality?: Finality;
};

export type SellParams = {
  seller: Keypair;
  baseMint: PublicKey;
  amountIn: bigint; // Amount of base tokens to sell
  minimumAmountOut: bigint; // Minimum quote tokens (SOL) to receive
  shareFeeRate?: bigint;
  priorityFees?: PriorityFee;
  commitment?: Commitment;
  finality?: Finality;
};

/**
 * Slippage calculation result
 */
export type SlippageResult = {
  minimumAmountOut: bigint;
  priceImpact: number;
  effectivePrice: number;
};
