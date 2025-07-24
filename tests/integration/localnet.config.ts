import { Connection, Commitment, Finality } from '@solana/web3.js';

export interface LocalnetConfig {
  rpcUrl: string;
  commitment: Commitment;
  finality: Finality;
  airdropAmount: number;
  maxRetries: number;
  confirmationTimeout: number;
}

export const defaultLocalnetConfig: LocalnetConfig = {
  rpcUrl: process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899',
  commitment: 'confirmed',
  finality: 'confirmed',
  airdropAmount: 10, // SOL
  maxRetries: 3,
  confirmationTimeout: 30000, // 30 seconds
};

export class LocalnetConnection extends Connection {
  constructor(config: Partial<LocalnetConfig> = {}) {
    const finalConfig = { ...defaultLocalnetConfig, ...config };
    super(finalConfig.rpcUrl, finalConfig.commitment);
  }

  /**
   * Enhanced connection health check with retries
   */
  async waitForConnection(maxAttempts: number = 10, delayMs: number = 1000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.getVersion();
        console.log(`✅ Connected to localnet on attempt ${attempt}`);
        return true;
      } catch (error) {
        console.log(`⏳ Connection attempt ${attempt}/${maxAttempts} failed, retrying...`);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    console.error('❌ Failed to connect to localnet after all attempts');
    return false;
  }

  /**
   * Check if we're connected to localnet (not devnet/mainnet)
   */
  async isLocalnet(): Promise<boolean> {
    try {
      const version = await this.getVersion();
      // Check if we're on a local validator by looking at the RPC URL
      return this.rpcEndpoint.includes('127.0.0.1') || this.rpcEndpoint.includes('localhost');
    } catch (error) {
      return false;
    }
  }
}

export const PROGRAM_IDS = {
  // Add your program IDs here when you deploy to localnet
  // LETSBONK_PROGRAM: new PublicKey('...'),
};

export const TEST_TOKENS = {
  // Define test token addresses that will be created during tests
  // TEST_TOKEN_1: new PublicKey('...'),
}; 