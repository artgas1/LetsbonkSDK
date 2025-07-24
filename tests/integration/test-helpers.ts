import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  TransactionSignature,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export class TestHelpers {
  constructor(private connection: Connection) { }

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
   * Send and confirm transaction with retry logic - optimized for speed
   */
  async sendAndConfirmTransactionWithRetry(
    transaction: Transaction,
    signers: Keypair[],
    maxRetries: number = 3
  ): Promise<TransactionSignature> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get fresh blockhash for each attempt
        const { blockhash } = await this.connection.getLatestBlockhash('processed'); // Use faster commitment
        transaction.recentBlockhash = blockhash;

        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          signers,
          {
            commitment: 'processed', // Faster than 'confirmed'
            maxRetries: 1,
            skipPreflight: false,
          }
        );

        if (attempt > 1) {
          console.log(`✅ Transaction succeeded on attempt ${attempt}`);
        }

        return signature;
      } catch (error: any) {
        lastError = error;

        if (attempt < maxRetries) {
          // Log retry attempt without spamming
          if (attempt === 1) {
            console.log(`⏳ Transaction failed, retrying... (${attempt}/${maxRetries})`);
          }

          // Wait before retry with faster backoff
          const delay = Math.min(500 * Math.pow(2, attempt - 1), 2000); // Reduced max delay from 5s to 2s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    const errorMessage = lastError?.message || 'Unknown error';
    throw new Error(`Transaction failed after ${maxRetries} attempts: ${errorMessage}`);
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
