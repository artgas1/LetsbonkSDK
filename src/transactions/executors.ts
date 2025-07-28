import { Connection, VersionedTransaction, Keypair } from '@solana/web3.js';
import { getLogger } from '../core/logger';

const logger = getLogger();

/**
 * Send and confirm transaction with retry logic
 * Includes retry mechanism for handling network failures
 */
export async function sendAndConfirmTransactionWithRetry(
  connection: Connection,
  transaction: VersionedTransaction,
  signers: Keypair[],
  skipPreflight: boolean = true,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Sign the VersionedTransaction
      transaction.sign(signers);
      const signature = await connection.sendTransaction(transaction, {
        skipPreflight,
        maxRetries: 0, // We handle retries ourselves
      });
      // Confirm the transaction
      await connection.confirmTransaction(signature, 'confirmed');

      if (attempt > 1) {
        logger.info(`✅ Transaction succeeded on attempt ${attempt}`, { attempt, signature });
      }
      return signature;
    } catch (error) {
      if (attempt === 1) {
        logger.warn(`⏳ Transaction failed, retrying...`, { attempt });
      }

      if (attempt === maxRetries) {
        logger.error('Transaction failed after all retries', { attempt, maxRetries, error });
        throw error; // Re-throw the error instead of returning null
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // This should never be reached, but throw an error just in case
  throw new Error('Transaction failed after all retries');
}
