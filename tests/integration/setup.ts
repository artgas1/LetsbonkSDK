import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { PDAUtils } from '../../src/shared';

// Environment configuration for integration tests
export const LOCALNET_URL = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
export const INTEGRATION_TEST_TIMEOUT = 30000; // Reduced from 60s to 30s

// Required programs that must be available
export const REQUIRED_PROGRAMS = {
  LETSBONK_PROGRAM: 'LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj',
  METAPLEX_PROGRAM: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
} as const;

// Global test connection with optimized settings
export let testConnection: Connection;

// Test wallets that will be funded
export const testWallets = {
  payer: Keypair.generate(),
  creator: Keypair.generate(),
  buyer: Keypair.generate(),
  seller: Keypair.generate(),
};

// Helper function to get a funded test wallet
export function getFundedKeypair(walletName: keyof typeof testWallets): Keypair {
  return testWallets[walletName];
}

// Helper function to wait for transaction confirmation with faster commitment
export async function waitForTransaction(signature: string): Promise<void> {
  await testConnection.confirmTransaction(signature, 'processed'); // Changed from 'confirmed' to 'processed' for speed
}

// Setup before all tests
beforeAll(async () => {
  // Create connection to localnet with optimized settings (no WebSocket)
  testConnection = new Connection(LOCALNET_URL, {
    commitment: 'processed', // Faster than 'confirmed'
    confirmTransactionInitialTimeout: 10000, // 10s timeout
    disableRetryOnRateLimit: true, // Disable features that might create WebSocket connections
    httpHeaders: { 'User-Agent': 'letsbonk-sdk-test' }, // Custom headers to help identify test traffic
  });
  
  // Verify localnet is accessible
  await verifyLocalnetConnection();
  
  // Verify required programs are deployed
  await verifyRequiredPrograms();
  
  // Fund test wallets with smaller amounts for faster airdrop
  await fundTestWallets();

  // Verify configuration accounts (don't try to create them)
  await verifyConfigurationAccounts();
  
  console.log('✅ Integration test environment initialized');
  console.log(`🔗 Connected to: ${LOCALNET_URL}`);
  console.log(`💰 Funded ${Object.keys(testWallets).length} test wallets`);
}, INTEGRATION_TEST_TIMEOUT);

// Helper function to verify localnet connection
async function verifyLocalnetConnection(): Promise<void> {
  try {
    const version = await testConnection.getVersion();
    if (!version) {
      throw new Error('Could not get validator version');
    }
  } catch (error) {
    console.error('❌ Failed to connect to localnet:', error);
    throw new Error(`Cannot connect to localnet at ${LOCALNET_URL}. Make sure solana-test-validator is running.`);
  }
}

// Helper function to verify required programs are deployed
async function verifyRequiredPrograms(): Promise<void> {
  console.log('🔍 Verifying required programs are deployed...');
  
  const missingPrograms: string[] = [];
  
  for (const [name, programId] of Object.entries(REQUIRED_PROGRAMS)) {
    try {
      const programAccount = await testConnection.getAccountInfo(new PublicKey(programId));
      if (!programAccount) {
        missingPrograms.push(`${name} (${programId})`);
      } else {
        console.log(`✅ Found ${name}: ${programId}`);
      }
    } catch (error) {
      missingPrograms.push(`${name} (${programId})`);
    }
  }
  
  if (missingPrograms.length > 0) {
    console.error('❌ Missing required programs:');
    missingPrograms.forEach(program => console.error(`   - ${program}`));
    console.error('\n💡 To fix this, run: npm run test:localnet');
    console.error('   This will automatically deploy all required programs.');
    throw new Error('Required programs not deployed. Run the full test suite with automated deployment.');
  }
  
  console.log('✅ All required programs are deployed');
}

// Helper function to fund test wallets with optimized amounts
async function fundTestWallets() {
  const fundingAmount = 2 * LAMPORTS_PER_SOL; // Reduced from 10 SOL to 2 SOL for faster airdrops
  
  try {
    // Fund wallets in parallel for speed
    const fundingPromises = Object.entries(testWallets).map(async ([name, keypair]) => {
      const signature = await testConnection.requestAirdrop(
        keypair.publicKey,
        fundingAmount
      );
      
      await testConnection.confirmTransaction(signature, 'processed'); // Faster commitment
      console.log(`💰 Funded ${name}: ${keypair.publicKey.toString()}`);
    });
    
    await Promise.all(fundingPromises);
  } catch (error) {
    console.error('❌ Failed to fund test wallets:', error);
    throw new Error('Could not fund test wallets. Make sure solana-test-validator is running with sufficient SOL.');
  }
}

// Helper function to verify configuration accounts exist (read-only check)
async function verifyConfigurationAccounts(): Promise<void> {
  console.log('🔍 Checking configuration accounts...');
  
  try {
    const [globalConfigPDA] = PDAUtils.findGlobalConfig();
    const [platformConfigPDA] = PDAUtils.findPlatformConfig();
    
    // Check both accounts in parallel
    const [globalAccount, platformAccount] = await Promise.all([
      testConnection.getAccountInfo(globalConfigPDA),
      testConnection.getAccountInfo(platformConfigPDA)
    ]);
    
    if (!globalAccount) {
      console.warn('⚠️ Global Config account not found - tests may fail');
      console.warn(`   Expected at: ${globalConfigPDA.toString()}`);
    } else {
      console.log('✅ Global Config account found');
    }
    
    if (!platformAccount) {
      console.warn('⚠️ Platform Config account not found - tests may fail');
      console.warn(`   Expected at: ${platformConfigPDA.toString()}`);
    } else {
      console.log('✅ Platform Config account found');
    }
    
    // Don't throw error if accounts don't exist - let individual tests handle the error
    // This allows us to see what specific errors occur during token creation
    
  } catch (error) {
    console.warn('⚠️ Could not verify configuration accounts:', error);
    console.warn('   Tests will proceed but may fail due to missing accounts');
  }
}

// Helper function to check if localnet is running
export async function checkLocalnetHealth(): Promise<boolean> {
  try {
    const health = await testConnection.getVersion();
    return !!health;
  } catch (error) {
    return false;
  }
}

// Set optimized timeout for integration tests
jest.setTimeout(INTEGRATION_TEST_TIMEOUT);

// Cleanup after all tests
afterAll(async () => {
  try {
    // Close any open connections
    if (testConnection) {
      // Force cleanup of any pending operations
      console.log('🧹 Cleaning up test connections...');
      
      // Clear any cached connection state
      (testConnection as any)._rpcEndpoint = null;
    }
    
    // Clear test wallet references to free memory
    Object.keys(testWallets).forEach(key => {
      delete (testWallets as any)[key];
    });
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Reduced cleanup wait time but ensure all pending operations complete
    await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 500ms to 100ms
    
    console.log('✅ Integration test cleanup completed');
  } catch (error) {
    console.warn('Warning during test cleanup:', error);
  }
});

// Handle BigInt serialization
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
}; 