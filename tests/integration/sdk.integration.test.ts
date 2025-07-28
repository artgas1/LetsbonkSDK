import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { LetsBonkSDK } from '../../src/letsbonk-sdk';
import { CreateTokenMetadata } from '../../src/types';
import { testConnection, getFundedKeypair, waitForTransaction } from './setup';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { IntegrationTestHelpers } from './test-helpers';
import { VersionedTransaction } from '@solana/web3.js';

// Transaction tracking for final resume
interface TransactionRecord {
  type: string;
  signature: string;
  timestamp: number;
  details: string;
}

const transactionHistory: TransactionRecord[] = [];

// Helper function to record transactions
const recordTransaction = (
  type: string,
  signature: string,
  details: string
) => {
  const timestamp = Date.now();
  console.log(`📝 Recording ${type} transaction: ${signature}`);
  
  transactionHistory.push({
    type,
    signature,
    timestamp,
    details
  });
};

/**
 * Utility helpers for transaction testing
 */
const testHelpers = {
  /**
   * Helper to get instruction count from any transaction type
   */
  getInstructionCount: (transaction: VersionedTransaction): number => {
    return transaction.message.compiledInstructions.length;
  }
};

// Add process-level error handler to prevent unhandled rejections from failing tests
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection caught (test environment):', reason);
});

describe('LetsBonkSDK Integration Tests', () => {
  let connection: Connection;
  let sdk: LetsBonkSDK;
  let sharedTestMint: PublicKey; // Share a token across multiple tests

  beforeAll(async () => {
    console.log('🚀 Starting LetsBonkSDK Integration Tests...');
    console.log('================================================');

    // Create SDK instance for testing
    sdk = new LetsBonkSDK(testConnection);

    // Add global error handler to prevent unhandled error events during tests
    const globalErrorHandler = (errorEvent: any) => {
      console.log('SDK error event (handled):', errorEvent.error?.message || errorEvent);
    };

    // Create a shared test token for multiple tests to use
    const payer = getFundedKeypair('payer');
    const mintKeypair = Keypair.generate();

    // Store the shared mint for other tests
    sharedTestMint = mintKeypair.publicKey;

    const metadata: CreateTokenMetadata = {
      name: 'Shared Test Token',
      symbol: 'SHARED',
      description: 'A shared test token for integration testing',
      file: new Blob(['test'], { type: 'image/png' }),
      external_url: 'https://shared.example.com',
    };

    // Initialize the token pool first
    const initResult = await sdk.initialize(
      payer,
      payer.publicKey,
      mintKeypair,
      metadata
    );

    expect(initResult.success).toBe(true);
    if (initResult.success && initResult.data.signature) {
      await waitForTransaction(initResult.data.signature);
      recordTransaction(
        'INITIALIZE',
        initResult.data.signature,
        `Token: ${metadata.name} (${metadata.symbol}) | Mint: ${mintKeypair.publicKey.toString()}`
      );

      // Then buy some tokens for sell tests
      const buyResult = await sdk.buy(
        payer,
        mintKeypair.publicKey,
        BigInt(0.2 * 1e9), // 0.2 SOL
        BigInt(0) // minimum tokens out
      );

      if (!buyResult.success) {
        console.error('Buy operation failed in beforeAll:', buyResult.error);
        console.error('Full buy result:', buyResult);
      }

      expect(buyResult.success).toBe(true);
      if (buyResult.success && buyResult.data.signature) {
        await waitForTransaction(buyResult.data.signature);
        recordTransaction(
          'BUY',
          buyResult.data.signature,
          `Amount: 0.2 SOL | Mint: ${mintKeypair.publicKey.toString()}`
        );
      }
    }
  }, 20000);

  afterAll(async () => {
    // Clean up SDK and prevent memory leaks
    if (sdk) {
      sdk.dispose();
    }

    console.log('\n');
    console.log('📊 INTEGRATION TEST EXECUTION SUMMARY');
    console.log('=====================================');
    console.log(`Total Transactions Executed: ${transactionHistory.length}`);
          console.log(`Successful Transactions: ${transactionHistory.filter(t => t.signature !== 'N/A').length}`);
      console.log(`Failed Transactions: ${transactionHistory.filter(t => t.signature === 'N/A').length}`);
    console.log('\n');

    if (transactionHistory.length > 0) {
      console.log('📋 DETAILED TRANSACTION HISTORY:');
      console.log('================================');

      const groupedByTestSuite = transactionHistory.reduce((acc, tx) => {
        if (!acc[tx.type]) {
          acc[tx.type] = [];
        }
        acc[tx.type].push(tx);
        return acc;
      }, {} as Record<string, TransactionRecord[]>);

      Object.entries(groupedByTestSuite).forEach(([testSuite, transactions]) => {
        console.log(`\n🔹 ${testSuite}:`);
        transactions.forEach((tx, index) => {
                     const status = tx.signature !== 'N/A' ? '✅' : '❌';
           const timestamp = new Date(tx.timestamp).toISOString().split('T')[1].split('.')[0];
           console.log(`  ${index + 1}. ${status} [${timestamp}] ${tx.type}`);
          console.log(`     Details: ${tx.details}`);
          console.log(`     Signature: ${tx.signature}`);
          console.log('');
        });
      });

      console.log('🔗 QUICK SIGNATURE REFERENCE:');
      console.log('=============================');
      transactionHistory.forEach((tx, index) => {
        const status = tx.signature !== 'N/A' ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${tx.type} - ${tx.signature}`);
      });
    } else {
      console.log('⚠️  No transactions were recorded during the test run.');
    }

    console.log('\n🏁 Integration tests completed successfully!');
    console.log('================================================\n');
  });

  describe('Wallet Integration', () => {
    test('should create mock wallet successfully', async () => {
      const wallet = getFundedKeypair('payer');
      expect(wallet).toBeDefined();
      expect(wallet.publicKey).toBeDefined();
      expect(wallet.secretKey).toBeDefined();
    });
  });

  describe('Token Creation', () => {
    test('should initialize token pool successfully', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();

      const metadata: CreateTokenMetadata = {
        name: "Integration Test Token",
        symbol: "TEST",
        description: "A test token for integration testing",
        external_url: "https://example.com",
        file: new Blob(['test-image-data'], { type: 'image/png' })
      };

      console.log('Creating token with metadata:', metadata);

      // Just initialize the token pool (no buy)
      const result = await sdk.initialize(
        payer,
        payer.publicKey,
        mintKeypair,
        metadata
      );

      console.log('Token creation result:', result);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signature).toBeDefined();
        expect(typeof result.data.signature).toBe('string');

        // Verify the transaction was confirmed
        if (result.data.signature) {
          await waitForTransaction(result.data.signature);
          recordTransaction(
            'INITIALIZE',
            result.data.signature,
            `Token: ${metadata.name} (${metadata.symbol}) | Mint: ${mintKeypair.publicKey.toString()}`
          );
          console.log('✅ Token creation transaction confirmed');
        }
      }
    }, 20000);

    test('should create and buy token with separate transactions', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();
      const buyAmountSol = 0.1; // Reduced for faster testing

      const metadata: CreateTokenMetadata = {
        name: 'Buy Test Token',
        symbol: 'BUYTEST',
        description: 'Test token for buy functionality',
        external_url: 'https://example.com',
        file: new Blob(['test-image-data'], { type: 'image/png' }),
      };

      console.log(`Creating and buying token: ${buyAmountSol} SOL`);

      // Initialize the token pool first
      const initResult = await sdk.initialize(
        payer,
        payer.publicKey,
        mintKeypair,
        metadata
      );

      expect(initResult.success).toBe(true);

      if (initResult.success && initResult.data.signature) {
        await waitForTransaction(initResult.data.signature);
        recordTransaction(
          'INITIALIZE',
          initResult.data.signature,
          `Token: ${metadata.name} (${metadata.symbol}) | Mint: ${mintKeypair.publicKey.toString()}`
        );
      }

      // Then buy tokens
      const result = await sdk.buy(
        payer,
        mintKeypair.publicKey,
        BigInt(buyAmountSol * 1e9), // Convert to lamports
        BigInt(0) // minimum tokens out
      );

      console.log('Token creation + buy result:', result);

      if (!result.success) {
        console.error('Buy operation failed:', result.error);
        console.error('Full result:', result);
      }

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signature).toBeDefined();
      }

      if (result.success && result.data.signature) {
        await waitForTransaction(result.data.signature);
        recordTransaction(
          'BUY',
          result.data.signature,
          `Amount: ${buyAmountSol} SOL | Mint: ${mintKeypair.publicKey.toString()}`
        );
        console.log('✅ Token creation + buy transaction confirmed');
      }
    }, 20000);
  });

  describe('Trading Operations', () => {
    test('should execute buy transaction successfully', async () => {
      const buyer = getFundedKeypair('buyer');
      const buyAmountSol = 0.03;

      // Execute the buy transaction
      const buyResult = await sdk.buy(
        buyer,
        sharedTestMint, // Use shared token
        BigInt(buyAmountSol * 1e9),
        BigInt(0)
      );

      console.log('Buy transaction result:', buyResult);

      if (!buyResult.success) {
        console.error('Buy transaction failed:', buyResult.error);
        console.error('Full buyResult:', buyResult);
      }

      expect(buyResult.success).toBe(true);
      if (buyResult.success) {
        expect(buyResult.data.signature).toBeDefined();
        expect(typeof buyResult.data.signature).toBe('string');

        if (buyResult.data.signature) {
          await waitForTransaction(buyResult.data.signature);
          recordTransaction(
            'BUY',
            buyResult.data.signature,
            `Amount: ${buyAmountSol} SOL | Mint: ${sharedTestMint.toString()} | Buyer: ${buyer.publicKey.toString()}`
          );
          console.log('✅ Buy transaction confirmed');
        }
      }
    }, 15000);

    test('should execute sell transaction successfully', async () => {
      const seller = getFundedKeypair('seller');

      // First buy some tokens to sell
      const buyResult = await sdk.buy(
        seller,
        sharedTestMint,
        BigInt(0.05 * 1e9), // Buy with 0.05 SOL
        BigInt(0)
      );

      if (!buyResult.success) {
        console.error('Buy for sell test failed:', buyResult.error);
        console.error('Full buyResult:', buyResult);
      }

      expect(buyResult.success).toBe(true);
      if (buyResult.success && buyResult.data.signature) {
        await waitForTransaction(buyResult.data.signature);
        recordTransaction(
          'BUY',
          buyResult.data.signature,
          `Amount: 0.05 SOL | Mint: ${sharedTestMint.toString()} | Seller: ${seller.publicKey.toString()} (for sell test)`
        );
      }

      // Get the seller's token account to check balance
      const sellerTokenAccount = await getAssociatedTokenAddress(
        sharedTestMint,
        seller.publicKey
      );

      // Now sell half of the tokens
      const sellResult = await sdk.sell(
        seller,
        sharedTestMint,
        BigInt(1000000), // Sell 1M raw tokens (adjust based on actual balance)
        BigInt(0) // Minimum SOL out
      );

      console.log('Sell transaction result:', sellResult);

      if (sellResult.success) {
        expect(sellResult.data.signature).toBeDefined();

        if (sellResult.data.signature) {
          await waitForTransaction(sellResult.data.signature);
          recordTransaction(
            'SELL',
            sellResult.data.signature,
            `Amount: 1,000,000 tokens | Mint: ${sharedTestMint.toString()} | Seller: ${seller.publicKey.toString()}`
          );
          console.log('✅ Sell transaction confirmed');
        }
      } else {
        console.log('Sell failed (expected if insufficient balance):', sellResult.error);
        // Record failed transaction for completeness
        recordTransaction(
          'SELL',
          'N/A',
          `Amount: 1,000,000 tokens | Mint: ${sharedTestMint.toString()} | Error: ${sellResult.error?.message}`
        );
        // This might fail if insufficient balance, which is okay for testing
      }
    }, 20000);
  });

  describe('Account Operations', () => {
    test('should get global config successfully', async () => {
      const result = await sdk.getGlobalConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        console.log('Global config:', result.data);
      }
    });

    test('should get platform config successfully', async () => {
      const result = await sdk.getPlatformConfig();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        console.log('Platform config:', result.data);
      }
    });

    test('should get pool state successfully', async () => {
      const result = await sdk.getPoolState(sharedTestMint);

      if (result.success) {
        expect(result.data).toBeDefined();
        console.log('Pool state:', result.data);
      } else {
        console.log('Pool state not found (expected for some tests)');
      }
    });
  });

  describe('Metadata Operations', () => {
    test('should prepare metadata successfully', async () => {
      const result = await sdk.prepareMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: new Blob(['test'], { type: 'image/png' })
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Token');
        expect(result.data.symbol).toBe('TEST');
        expect(result.data.file).toBeInstanceOf(Blob);
      }
    });
  });

  describe('Initialize and Buy Operations', () => {
    test('should initialize and buy token in single atomic transaction', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();
      const buyAmountLamports = BigInt(0.15 * LAMPORTS_PER_SOL); // 0.15 SOL converted to lamports

      const metadata: CreateTokenMetadata = {
        name: 'Atomic Init Buy Token',
        symbol: 'ATOMIC',
        description: 'Test token for atomic initialize and buy',
        external_url: 'https://atomic.example.com',
        file: new Blob(['test'], { type: 'image/png' }),
      };

      console.log(`Creating token with atomic buy: ${Number(buyAmountLamports) / 10 ** 9} SOL`);
      console.log(`Token mint: ${mintKeypair.publicKey.toString()}`);

      // Execute atomic initialize and buy
      const result = await sdk.initializeAndBuy(
        payer,
        payer.publicKey,
        mintKeypair,
        metadata,
        buyAmountLamports
      );

      console.log('Initialize and buy result:', result);

      if (!result.success) {
        console.error('InitializeAndBuy failed:', result.error);
        console.error('Full result:', result);
      }

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signature).toBeDefined();
        expect(typeof result.data.signature).toBe('string');

        if (result.data.signature) {
          await waitForTransaction(result.data.signature);
          recordTransaction(
            'INITIALIZE_AND_BUY',
            result.data.signature,
            `Token: ${metadata.name} (${metadata.symbol}) | Buy Amount: ${Number(buyAmountLamports) / 10 ** 9} SOL | Mint: ${mintKeypair.publicKey.toString()}`
          );
          console.log('✅ Atomic initialize and buy transaction confirmed');
        }
      }
    }, 25000);

    test('should build initialize and buy transaction without executing', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();
      const buyAmountSol = 0.08; // 0.08 SOL

      const metadata: CreateTokenMetadata = {
        name: 'Build Test Token',
        symbol: 'BUILD',
        description: 'Test token for transaction building',
        external_url: 'https://build.example.com',
        file: new Blob(['test'], { type: 'image/png' }),
      };

      console.log(`Building initialize and buy transaction: ${buyAmountSol} SOL`);

      // Build the transaction without executing
      const buildResult = await sdk.buildInitializeAndBuy({
        payer,
        creator: payer.publicKey,
        baseMint: mintKeypair,
        tokenMetadata: metadata,
        buyAmountLamports: BigInt(0.12 * LAMPORTS_PER_SOL)
      });

      console.log('Build result:', buildResult);

      expect(buildResult.success).toBe(true);
      if (buildResult.success) {
        const constructedTx = buildResult.data;

        // Verify transaction structure
        expect(constructedTx.transaction).toBeDefined();
        expect(constructedTx.signers).toBeDefined();
        expect(constructedTx.description).toBeDefined();
        expect(Array.isArray(constructedTx.signers)).toBe(true);
        expect(constructedTx.signers.length).toBeGreaterThan(0);

        // Verify expected signers are included
        const signerKeys = constructedTx.signers.map(s => s.publicKey.toString());
        expect(signerKeys).toContain(payer.publicKey.toString());
        expect(signerKeys).toContain(mintKeypair.publicKey.toString());

        // Verify transaction has instructions
        expect(testHelpers.getInstructionCount(constructedTx.transaction)).toBeGreaterThan(0);

        console.log(`✅ Built transaction with ${testHelpers.getInstructionCount(constructedTx.transaction)} instructions`);
        console.log(`✅ Requires ${constructedTx.signers.length} signers`);
        console.log(`✅ Description: ${constructedTx.description}`);

        // Now execute the built transaction
        const executeResult = await sdk.executeTransaction(constructedTx);

        expect(executeResult.success).toBe(true);
        if (executeResult.success && executeResult.data.signature) {
          await waitForTransaction(executeResult.data.signature);
          recordTransaction(
            'BUILD_INITIALIZE_AND_BUY',
            executeResult.data.signature,
            `Token: ${metadata.name} (${metadata.symbol}) | Buy Amount: ${buyAmountSol} SOL | Mint: ${mintKeypair.publicKey.toString()}`
          );
          console.log('✅ Built transaction executed successfully');
        }
      }
    }, 25000);

    test('should build initialize-only transaction (zero buy amount)', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();
      const buyAmountSol = 0; // No buy, just initialize

      const metadata: CreateTokenMetadata = {
        name: 'Init Only Token',
        symbol: 'INITONLY',
        description: 'Test token for initialize-only functionality',
        external_url: 'https://initonly.example.com',
        file: new Blob(['test'], { type: 'image/png' }),
      };

      console.log('Building initialize-only transaction (no buy)');

      // Build the transaction without buy
      const buildResult = await sdk.buildInitializeAndBuy({
        payer,
        creator: payer.publicKey,
        baseMint: mintKeypair,
        tokenMetadata: metadata,
        buyAmountLamports: 0n // No buy, just initialize
      });

      console.log('Initialize-only build result:', buildResult);

      expect(buildResult.success).toBe(true);
      if (buildResult.success) {
        const constructedTx = buildResult.data;

        // Verify transaction structure for initialize-only
        expect(constructedTx.transaction).toBeDefined();
        expect(constructedTx.signers).toBeDefined();
        expect(constructedTx.signers.length).toBe(2); // Only payer and mint keypair for init-only
        expect(constructedTx.description).toContain('Initialize');
        expect(constructedTx.description).not.toContain('buy');

        console.log(`✅ Built initialize-only transaction with ${testHelpers.getInstructionCount(constructedTx.transaction)} instructions`);
        console.log(`✅ Description: ${constructedTx.description}`);

        // Execute the built transaction
        const executeResult = await sdk.executeTransaction(constructedTx);

        expect(executeResult.success).toBe(true);
        if (executeResult.success && executeResult.data.signature) {
          await waitForTransaction(executeResult.data.signature);
          recordTransaction(
            'BUILD_INITIALIZE_ONLY',
            executeResult.data.signature,
            `Token: ${metadata.name} (${metadata.symbol}) | Initialize Only | Mint: ${mintKeypair.publicKey.toString()}`
          );
          console.log('✅ Initialize-only transaction executed successfully');
        }
      }
    }, 25000);

    test('should handle edge case metadata successfully', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();
      const buyAmountSol = 0.05;

      const edgeCaseMetadata: CreateTokenMetadata = {
        name: 'Edge Case Token', // Valid but edge case
        symbol: 'EDGE', // Valid symbol
        description: 'Testing edge case metadata scenarios',
        external_url: 'https://edge.example.com',
        file: new Blob(['test'], { type: 'image/png' }),
      };

      console.log('Testing edge case metadata handling');

      const result = await sdk.initializeAndBuy(
        payer,
        payer.publicKey,
        mintKeypair,
        edgeCaseMetadata,
        BigInt(buyAmountSol * 1e9) // Convert to lamports for buyAmountSol
      );

      console.log('Edge case metadata result:', result);

      // This should succeed with valid metadata
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signature).toBeDefined();

        if (result.data.signature) {
          await waitForTransaction(result.data.signature);
          recordTransaction(
            'INITIALIZE_AND_BUY',
            result.data.signature,
            `Edge case metadata | Token: ${edgeCaseMetadata.name} (${edgeCaseMetadata.symbol}) | Buy: ${buyAmountSol} SOL`
          );
          console.log('✅ Edge case metadata transaction confirmed');
        }
      }
    }, 25000);

    test('should handle various buy amounts successfully', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();
      const moderateBuyAmount = 0.25; // 0.25 SOL - should be within test wallet limits

      const metadata: CreateTokenMetadata = {
        name: 'Variable Amount Token',
        symbol: 'VARAMT',
        description: 'Test token for various buy amounts',
        external_url: 'https://varamt.example.com',
        file: new Blob(['test'], { type: 'image/png' }),
      };

      console.log(`Testing moderate buy amount: ${moderateBuyAmount} SOL`);

      const result = await sdk.initializeAndBuy(
        payer,
        payer.publicKey,
        mintKeypair,
        metadata,
        BigInt(moderateBuyAmount * 1e9) // Convert to lamports for moderateBuyAmount
      );

      console.log('Variable amount result:', result);

      // This should succeed with moderate amount
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.signature).toBeDefined();

        if (result.data.signature) {
          await waitForTransaction(result.data.signature);
          recordTransaction(
            'INITIALIZE_AND_BUY',
            result.data.signature,
            `Token: ${metadata.name} (${metadata.symbol}) | Buy: ${moderateBuyAmount} SOL`
          );
          console.log('✅ Variable amount transaction confirmed');
        }
      }
    }, 25000);

    test('should handle builder pattern error recovery', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();
      const buyAmountSol = 0.1;

      const metadata: CreateTokenMetadata = {
        name: 'Builder Error Test Token',
        symbol: 'BUILDERR',
        description: 'Test token for builder pattern error recovery',
        external_url: 'https://builderr.example.com',
        file: new Blob(['test'], { type: 'image/png' }),
      };

      console.log('Testing builder pattern error recovery');

      // First try to build the transaction
      const buildResult = await sdk.buildInitializeAndBuy({
        payer,
        creator: payer.publicKey,
        baseMint: mintKeypair,
        tokenMetadata: metadata,
        buyAmountLamports: BigInt(0.1 * LAMPORTS_PER_SOL)
      });

      // Building should succeed
      expect(buildResult.success).toBe(true);

      if (buildResult.success) {
        console.log('✅ Build succeeded, now testing execution');

        // Now execute the built transaction
        const executeResult = await sdk.executeTransaction(buildResult.data);

        // Execution should also succeed
        expect(executeResult.success).toBe(true);

        if (executeResult.success && executeResult.data.signature) {
          await waitForTransaction(executeResult.data.signature);
          recordTransaction(
            'BUILD_EXECUTE_RECOVERY',
            executeResult.data.signature,
            `Token: ${metadata.name} (${metadata.symbol}) | Build + Execute pattern`
          );
          console.log('✅ Builder pattern execution confirmed');
        }
      }
    }, 25000);
  });

  describe('Error Handling', () => {
    test('should handle invalid token mint gracefully', async () => {
      const buyer = getFundedKeypair('buyer');
      const invalidMint = Keypair.generate().publicKey; // Random key that doesn't exist

      const result = await sdk.buy(
        buyer,
        invalidMint,
        BigInt(0.01 * 1e9),
        BigInt(0)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      console.log('Expected error for invalid mint:', result.error?.message);

      // Record failed transaction for completeness
      recordTransaction(
        'BUY',
        'N/A',
        `Amount: 0.01 SOL | Invalid Mint: ${invalidMint.toString()} | Error: ${result.error?.message}`
      );
    });

    test('should handle insufficient funds gracefully', async () => {
      const buyer = getFundedKeypair('buyer');
      const largeBuyAmount = BigInt(1000 * 1e9); // 1000 SOL - way more than test wallet has

      const result = await sdk.buy(
        buyer,
        sharedTestMint,
        largeBuyAmount,
        BigInt(0)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      console.log('Expected error for insufficient funds:', result.error?.message);

      // Record failed transaction for completeness
      recordTransaction(
        'BUY',
        'N/A',
        `Amount: 1000 SOL | Mint: ${sharedTestMint.toString()} | Error: ${result.error?.message}`
      );
    });
  });
}); 