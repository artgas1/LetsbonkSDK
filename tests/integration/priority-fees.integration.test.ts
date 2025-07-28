import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { LetsBonkSDK } from '../../src/letsbonk-sdk';
import { CreateTokenMetadata, PriorityFee } from '../../src/types';
import { testConnection, getFundedKeypair } from './setup';
import { LocalnetConnection } from './localnet.config';
import { IntegrationTestHelpers } from './test-helpers';

describe('Priority Fees Integration Tests', () => {
  let sdk: LetsBonkSDK;
  let payer: Keypair;
  let buyer: Keypair;
  let seller: Keypair;
  let sharedTokenMint: Keypair;

  const priorityFees: PriorityFee = {
    unitPrice: 1000, // 0.001 lamports per compute unit
    unitLimit: 200000 // 200k compute units for simple operations
  };

  const highComputePriorityFees: PriorityFee = {
    unitPrice: 1000, // 0.001 lamports per compute unit
    unitLimit: 400000 // 400k compute units for complex operations like initializeAndBuy
  };

  beforeAll(async () => {
    // Initialize SDK with test connection
    sdk = new LetsBonkSDK(testConnection);

    // Get funded test wallets
    payer = getFundedKeypair('payer');
    buyer = getFundedKeypair('buyer');
    seller = getFundedKeypair('seller');

    // Create a shared token for buy/sell tests
    sharedTokenMint = Keypair.generate();
    const metadata: CreateTokenMetadata = {
      name: 'Priority Fee Test Token',
      symbol: 'PFTEST',
      description: 'Token for testing priority fees',
      file: new Blob(['test'], { type: 'text/plain' })
    };

    console.log('🚀 Creating shared token for priority fee tests...');
    const initResult = await sdk.initialize(
      payer,
      payer.publicKey,
      sharedTokenMint,
      metadata
    );

    expect(initResult.success).toBe(true);
    console.log('✅ Shared token created:', sharedTokenMint.publicKey.toString());
  }, 60000);

  afterAll(async () => {
    // Cleanup is handled by global setup
    console.log('🧹 Priority fees test cleanup completed');
  });

  test('Buy operation with priority fees', async () => {
    console.log('🔸 Testing buy with priority fees...');

    const amountIn = BigInt(0.05 * LAMPORTS_PER_SOL); // 0.05 SOL

    const result = await sdk.buy(
      buyer,
      sharedTokenMint.publicKey,
      amountIn,
      0n, // minimumAmountOut
      {
        priorityFees,
        timeout: 30000
      }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      console.log('✅ Buy with priority fees successful:', result.data.signature);
    }
  }, 45000);

  test('Sell operation with priority fees', async () => {
    console.log('🔸 Testing sell with priority fees...');

    // First buy some tokens to sell
    const buyAmount = BigInt(0.03 * LAMPORTS_PER_SOL);
    const buyResult = await sdk.buy(seller, sharedTokenMint.publicKey, buyAmount);
    expect(buyResult.success).toBe(true);

    // Now sell with priority fees
    const sellAmount = BigInt(500000); // 500k tokens

    const result = await sdk.sell(
      seller,
      sharedTokenMint.publicKey,
      sellAmount,
      0n, // minimumAmountOut
      {
        priorityFees,
        timeout: 30000
      }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      console.log('✅ Sell with priority fees successful:', result.data.signature);
    }
  }, 45000);

  test('Initialize operation with priority fees', async () => {
    console.log('🔸 Testing initialize with priority fees...');

    const mintKeypair = Keypair.generate();
    const metadata: CreateTokenMetadata = {
      name: 'Init Priority Fee Token',
      symbol: 'INITPF',
      description: 'Token created with priority fees',
      file: new Blob(['test'], { type: 'text/plain' })
    };

    const result = await sdk.initialize(
      payer,
      payer.publicKey,
      mintKeypair,
      metadata,
      {
        priorityFees,
        timeout: 30000
      }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      console.log('✅ Initialize with priority fees successful:', result.data.signature);
    }
  }, 45000);

  test('Initialize and buy operation with priority fees', async () => {
    console.log('🔸 Testing initializeAndBuy with priority fees...');

    const mintKeypair = Keypair.generate();
    const metadata: CreateTokenMetadata = {
      name: 'Init Buy Priority Fee Token',
      symbol: 'IBPF',
      description: 'Token created and bought with priority fees',
      file: new Blob(['test'], { type: 'text/plain' })
    };

    const buyAmountLamports = BigInt(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL converted to lamports

    const result = await sdk.initializeAndBuy(
      payer,
      payer.publicKey,
      mintKeypair,
      metadata,
      buyAmountLamports,
      {
        priorityFees: highComputePriorityFees, // Use higher compute limit
        timeout: 45000
      }
    );

    expect(result.success).toBe(true);
    if (result.success) {
      console.log('✅ InitializeAndBuy with priority fees successful:', result.data.signature);
    }
  }, 60000);

  test('Build and execute pattern with priority fees', async () => {
    console.log('🔸 Testing build and execute pattern with priority fees...');

    const mintKeypair = Keypair.generate();
    const metadata: CreateTokenMetadata = {
      name: 'Build Execute Priority Fee Token',
      symbol: 'BEPF',
      description: 'Token built and executed with priority fees',
      file: new Blob(['test'], { type: 'text/plain' })
    };

    // Build transaction with priority fees
    const buildResult = await sdk.buildInitializeAndBuy({
      payer,
      creator: payer.publicKey,
      baseMint: mintKeypair,
      tokenMetadata: metadata,
      buyAmountLamports: BigInt(0.08 * LAMPORTS_PER_SOL),
      priorityFees: highComputePriorityFees // Use higher compute limit
    });

    expect(buildResult.success).toBe(true);
    if (!buildResult.success) return;

    console.log('✅ Build with priority fees successful');

    // Execute the built transaction
    const executeResult = await sdk.executeTransaction(
      buildResult.data,
      {
        priorityFees: highComputePriorityFees, // Use higher compute limit for execution too
        timeout: 45000
      }
    );

    expect(executeResult.success).toBe(true);
    if (executeResult.success) {
      console.log('✅ Execute with priority fees successful:', executeResult.data.signature);
    }
  }, 60000);
}); 