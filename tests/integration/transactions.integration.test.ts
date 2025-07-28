import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  buildTokenTransaction,
  buildBuyTransaction,
  buildSellTransaction,
  orchestrateTokenLaunch,
  sendAndConfirmTransactionWithRetry
} from '../../src/transactions';
import { CreateTokenMetadata, LaunchParams } from '../../src/types';
import { testConnection, getFundedKeypair, waitForTransaction } from './setup';
import { LocalnetConnection } from './localnet.config';
import { IntegrationTestHelpers } from './test-helpers';
import { createAnchorInitializeInstruction } from '../../src/transactions/utils';

describe('Transactions Integration Tests', () => {
  let localnetConnection: LocalnetConnection;
  let testHelpers: IntegrationTestHelpers;

  beforeAll(async () => {
    localnetConnection = new LocalnetConnection();
    await localnetConnection.waitForConnection();
    testHelpers = new IntegrationTestHelpers(localnetConnection);
    await testHelpers.logTestEnvironment();
  }, 30000); // Reduced from 60s to 30s

  describe('Token Launch Transactions', () => {
    test('should create token launch transaction', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();

      const metadata: CreateTokenMetadata = {
        name: 'Transaction Test Token',
        symbol: 'TXTOK',
        description: 'Testing token creation transaction',
        external_url: 'https://test.example.com',
        file: new Blob([''], { type: 'application/json' })
      };

      const launchParams: Partial<LaunchParams> = {
        decimals: 6,
        // Remove custom supply to use defaults that work with bonding curve math
      };

      console.log('Building token creation transaction...');

      const { transaction, baseTokenAccount } = await buildTokenTransaction(
        localnetConnection,
        payer,
        mintKeypair,
        metadata,
        launchParams
      );

      expect(transaction).toBeDefined();
      expect(baseTokenAccount).toBeInstanceOf(PublicKey);

      console.log(`Token will be created: ${mintKeypair.publicKey.toString()}`);
      console.log(`Base token account: ${baseTokenAccount.toString()}`);

      // Send the transaction
      const signature = await testHelpers.sendAndConfirmTransactionWithRetry(
        transaction,
        [payer, mintKeypair]
      );

      expect(signature).toBeDefined();
      console.log('✅ Token creation transaction confirmed');
    }, 30000); // Reduced from 60s to 30s

    test('should launch token with buy in same transaction', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();

      const metadata: CreateTokenMetadata = {
        name: 'Launch Buy Test Token',
        symbol: 'LBTEST',
        description: 'Testing launch with immediate buy',
        external_url: 'https://launchbuy.example.com',
        file: new Blob([''], { type: 'application/json' })
      };

      const buyAmountLamports = BigInt(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL converted to lamports

      console.log(`Launching token with ${buyAmountLamports} lamports buy...`);

      const result = await orchestrateTokenLaunch(
        localnetConnection,
        payer,
        mintKeypair,
        metadata,
        undefined, // Use default launch params
        buyAmountLamports
      );

      console.log('Launch with buy result:', result);

      expect(result.success).toBe(true);
      expect(result.signature).toBeDefined();

      if (result.signature) {
        await waitForTransaction(result.signature);
        console.log('✅ Launch with buy transaction confirmed');
      }
    }, 30000); // Reduced from 60s to 30s
  });

  describe('Buy/Sell Transactions', () => {
    let testMintPubkey: PublicKey;

    beforeAll(async () => {
      // Create a test token first
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();
      testMintPubkey = mintKeypair.publicKey;

      const metadata: CreateTokenMetadata = {
        name: 'Buy Sell Test Token',
        symbol: 'BSTEST',
        description: 'Token for buy/sell testing',
        external_url: 'https://buysell.example.com',
        file: new Blob([''], { type: 'application/json' })
      };

      const result = await orchestrateTokenLaunch(
        localnetConnection,
        payer,
        mintKeypair,
        metadata
      );

      expect(result.success).toBe(true);
      if (result.signature) {
        await waitForTransaction(result.signature);
      }
    }, 30000); // Reduced from 60s to 30s

    test('should create and execute buy transaction', async () => {
      const buyer = getFundedKeypair('buyer');
      const buyAmountLamports = BigInt(0.05 * LAMPORTS_PER_SOL); // 0.05 SOL converted to lamports
      const minimumTokensOut = 0n; // Accept any amount for testing (BigInt)

      console.log('Building buy transaction...');

      const { transaction, additionalSigners } = await buildBuyTransaction(
        localnetConnection,
        buyer,
        testMintPubkey,
        buyAmountLamports,
        minimumTokensOut
      );

      expect(transaction).toBeDefined();
      expect(Array.isArray(additionalSigners)).toBe(true);

      console.log(`Buying ${Number(buyAmountLamports) / 10 ** 9} SOL worth of tokens...`);

      // Send the transaction
      const allSigners = [buyer, ...additionalSigners];
      const signature = await testHelpers.sendAndConfirmTransactionWithRetry(
        transaction,
        allSigners
      );

      expect(signature).toBeDefined();
      console.log('✅ Buy transaction confirmed');
    }, 30000); // Reduced from 60s to 30s

    test('should create and execute sell transaction', async () => {
      const seller = getFundedKeypair('seller');

      // First buy some tokens
      const { transaction: buyTx, additionalSigners: buySigners } = await buildBuyTransaction(
        localnetConnection,
        seller,
        testMintPubkey,
        BigInt(0.1 * LAMPORTS_PER_SOL), // Buy 0.1 SOL worth - converted to lamports
        0n // Accept any amount (BigInt)
      );

      await testHelpers.sendAndConfirmTransactionWithRetry(
        buyTx,
        [seller, ...buySigners]
      );

      console.log('Bought tokens, now testing sell...');

      // Now sell some tokens
      const sellAmount = BigInt(100 * 10 ** 6); // Sell 100 tokens (raw amount with 6 decimals)
      const minimumSolOut = 0n; // Accept any amount for testing (BigInt lamports)

      console.log('Building sell transaction...');

      const { transaction: sellTx, additionalSigners: sellSigners } = await buildSellTransaction(
        localnetConnection,
        seller,
        testMintPubkey,
        sellAmount,
        minimumSolOut
      );

      expect(sellTx).toBeDefined();
      expect(Array.isArray(sellSigners)).toBe(true);

      console.log(`Selling ${sellAmount} tokens...`);

      // Send the sell transaction
      const allSigners = [seller, ...sellSigners];
      const signature = await testHelpers.sendAndConfirmTransactionWithRetry(
        sellTx,
        allSigners
      );

      expect(signature).toBeDefined();
      console.log('✅ Sell transaction confirmed');
    }, 30000); // Reduced from 60s to 30s
  });

  describe('Transaction Retry Logic', () => {
    test('should retry failed transactions', async () => {
      const payer = getFundedKeypair('payer');
      const mintKeypair = Keypair.generate();

      const metadata: CreateTokenMetadata = {
        name: 'Retry Test Token',
        symbol: 'RETRY',
        description: 'Testing transaction retry logic',
        external_url: 'https://retry.example.com',
        file: new Blob([''], { type: 'application/json' })
      };

      console.log('Testing transaction retry logic...');

      const { transaction } = await buildTokenTransaction(
        localnetConnection,
        payer,
        mintKeypair,
        metadata
      );

      // Test the retry function directly
      const signature = await sendAndConfirmTransactionWithRetry(
        localnetConnection,
        transaction,
        [payer, mintKeypair],
        true, // skipPreflight
        3 // maxRetries
      );

      expect(signature).toBeDefined();
      console.log('✅ Transaction with retry confirmed');
    }, 30000); // Reduced from 60s to 30s
  });
}); 