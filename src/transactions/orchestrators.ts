import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { LaunchParams, TransactionResult, CreateTokenMetadata } from '../types';
import { buildCreateTokenTransaction, buildInitializeAndBuyTransaction } from './builders';
import { sendAndConfirmTransactionWithRetry } from './executors';
import { getLogger } from '../core/logger';

const logger = getLogger();

/**
 * Launch token with optional buy in the same transaction
 * High-level orchestrator that delegates to transaction builders (optional buy)
 */
export async function orchestrateTokenLaunch(
  connection: Connection,
  payerKeypair: Keypair,
  mintKeypair: Keypair,
  metadata: CreateTokenMetadata,
  launchParams?: Partial<LaunchParams>,
  buyAmountLamports?: bigint // Raw lamports amount for precision
): Promise<TransactionResult & { baseTokenAccount?: PublicKey }> {
  try {
    logger.info(`Creating token: ${metadata.name} (${metadata.symbol})`, {
      name: metadata.name,
      symbol: metadata.symbol,
      mint: mintKeypair.publicKey.toString(),
      buyAmount: buyAmountLamports?.toString(),
    });

    if (buyAmountLamports && buyAmountLamports > 0n) {
      // Use the new consolidated builder for initialize + buy
      const { transaction, signers, baseTokenAccount } = await buildInitializeAndBuyTransaction(
        connection,
        payerKeypair,
        payerKeypair.publicKey, // creator is same as payer
        mintKeypair,
        metadata,
        buyAmountLamports,
        launchParams
      );

      // Execute the transaction
      const signature = await sendAndConfirmTransactionWithRetry(connection, transaction, signers);

      return {
        success: true,
        signature,
        baseTokenAccount,
        message: `Token ${metadata.symbol} launched and ${buyAmountLamports} lamports worth purchased`,
        transaction,
        signers,
        sentAt: Date.now(),
      };
    } else {
      // Just initialize without buy
      const { transaction: createTokenTxn, baseTokenAccount } = await buildCreateTokenTransaction(
        connection,
        payerKeypair,
        mintKeypair,
        metadata,
        launchParams
      );

      const signature = await sendAndConfirmTransactionWithRetry(connection, createTokenTxn, [
        payerKeypair,
        mintKeypair,
      ]);

      return {
        success: true,
        signature,
        baseTokenAccount,
        message: `Token ${metadata.symbol} launched successfully`,
        transaction: createTokenTxn,
        signers: [payerKeypair, mintKeypair],
        sentAt: Date.now(),
      };
    }
  } catch (error) {
    logger.error('Launch token failed', {
      tokenName: metadata.name,
      symbol: metadata.symbol,
      error,
    });
    return {
      success: false,
      error: `Launch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
