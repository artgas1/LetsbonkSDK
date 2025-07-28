import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  TransactionSignature,
  sendAndConfirmTransaction,
  VersionedTransaction
} from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 * Test helpers for integration tests
 */
export class IntegrationTestHelpers {
  constructor(private connection: Connection) {}

  /**
   * Helper to get instruction count from any transaction type
   */
  getInstructionCount(transaction: Transaction | VersionedTransaction): number {
    if (transaction instanceof VersionedTransaction) {
      return transaction.message.compiledInstructions.length;
    }
    return transaction.instructions.length;
  }

  /**
   * Logs test environment information
   */
  async logTestEnvironment(): Promise<void> {
    try {
      const version = await this.connection.getVersion();
      const balance = await this.connection.getBalance(new PublicKey('11111111111111111111111111111111'));

      console.log('🔧 Test Environment:');
      console.log(`   RPC: ${this.connection.rpcEndpoint}`);
      console.log(`   Solana Version: ${version['solana-core']}`);
      console.log(`   System Account Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
      console.warn('Could not retrieve test environment info:', error);
    }
  }

  /**
   * Send and confirm transaction with retry logic for tests
   */
  async sendAndConfirmTransactionWithRetry(
    transaction: Transaction | VersionedTransaction,
    signers: Keypair[],
    maxRetries: number = 3
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Handle both transaction types
        let signature: string;
        if (transaction instanceof VersionedTransaction) {
          // For VersionedTransaction, we need to sign it first
          transaction.sign(signers);
          signature = await this.connection.sendTransaction(transaction, {
            skipPreflight: true,
            maxRetries: 0, // We handle retries ourselves
          });
          // Confirm the transaction
          await this.connection.confirmTransaction(signature, 'confirmed');
        } else {
          // For legacy Transaction, use the standard method
          signature = await sendAndConfirmTransaction(this.connection, transaction, signers, {
            skipPreflight: true,
            commitment: 'confirmed',
          });
        }

        if (attempt > 1) {
          console.log(`✅ Test transaction succeeded on attempt ${attempt}`, { attempt, signature });
        }
        return signature;
      } catch (error) {
        if (attempt === maxRetries) {
          console.error('Test transaction failed after all retries', { attempt, maxRetries, error });
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error('Test transaction failed after all retries');
  }

  /**
   * Get or create an associated token account - optimized
   */
  async getOrCreateTokenAccount(
    owner: PublicKey,
    mint: PublicKey,
    payer: Keypair
  ): Promise<PublicKey> {
    try {
      const ata = await getOrCreateAssociatedTokenAccount(
        this.connection,
        payer,
        mint,
        owner,
        false, // allowOwnerOffCurve
        'processed', // Faster commitment
        {
          commitment: 'processed',
          maxRetries: 3,
        }
      );

      return ata.address;
    } catch (error) {
      console.error('Failed to get/create token account:', error);
      throw error;
    }
  }

  /**
   * Check account balance
   */
  async getBalance(account: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(account);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.warn('Could not get balance for account:', account.toString());
      return 0;
    }
  }

  /**
   * Check if account exists
   */
  async accountExists(account: PublicKey): Promise<boolean> {
    try {
      const accountInfo = await this.connection.getAccountInfo(account);
      return accountInfo !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for transaction confirmation with timeout - optimized for speed
   */
  async waitForConfirmation(
    signature: TransactionSignature,
    timeout: number = 15000 // Reduced from 30s to 15s
  ): Promise<boolean> {
    try {
      const start = Date.now();

      while (Date.now() - start < timeout) {
        const status = await this.connection.getSignatureStatus(signature);

        if (status.value?.confirmationStatus === 'processed' || // Accept 'processed' for speed
          status.value?.confirmationStatus === 'confirmed' ||
          status.value?.confirmationStatus === 'finalized') {
          return true;
        }

        if (status.value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }

        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1s to 500ms
      }

      return false;
    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      return false;
    }
  }
}
