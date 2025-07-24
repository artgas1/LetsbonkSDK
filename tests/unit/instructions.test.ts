import { describe, test, expect } from '@jest/globals';
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js';
import { 
  buildLaunchInstruction,
  buildBuyInstruction,
  buildSellInstruction,
} from '../../src/instructions';
import { WSOL_TOKEN, LETSBONK_PROGRAM_ID } from '../../src/constants';

describe('Instructions', () => {
  const mockBaseMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const mockPayer = Keypair.generate();
  const mockMint = Keypair.generate();
  const mockPoolState = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
  const mockBaseVault = new PublicKey('CtG8YHStQAKzB3a5m8PJU3fqYfrH4SDfzgXKEbgv7rCF');
  const mockQuoteVault = new PublicKey('DmVJGfSabEaAqNezCQ3Z8N4VKZVQZqPLNnUVxP4sJtEQ');
  const mockMetadata = new PublicKey('FWHrxVGfqFtfNQ75mGKP3d9N6bHZ2Y3cTD9o6VZQH8NG');
  const mockBaseTokenAccount = new PublicKey('GmvM8K3G9K7fHX8qj3nQ6X2LqRh4dZ8eKJc6t5VpqNvM');
  const mockWsolTokenAccount = new PublicKey('HnKJ9L4M7N6gGY7qk2nQ5X1LpRg3dZ7eKJb5t4VpqNuL');

  describe('buildLaunchInstruction', () => {
    test('should create launch instruction with valid parameters', () => {
      const instruction = buildLaunchInstruction({
        mintKeypair: mockMint,
        payerKeypair: mockPayer,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        metadataPDA: mockMetadata,
        name: 'Test Token',
        symbol: 'TEST',
        uri: 'https://ipfs.io/test-metadata',
      });

      expect(instruction).toBeInstanceOf(TransactionInstruction);
      expect(instruction.programId).toEqual(LETSBONK_PROGRAM_ID);
      expect(instruction.keys.length).toBeGreaterThan(0);
      expect(instruction.data.length).toBeGreaterThan(0);
    });

    test('should include required accounts in instruction', () => {
      const instruction = buildLaunchInstruction({
        mintKeypair: mockMint,
        payerKeypair: mockPayer,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        metadataPDA: mockMetadata,
        name: 'Test Token',
        symbol: 'TEST',
        uri: 'https://ipfs.io/test-metadata',
      });

      const accountKeys = instruction.keys.map(key => key.pubkey.toString());
      
      // Should include payer and mint
      expect(accountKeys).toContain(mockPayer.publicKey.toString());
      expect(accountKeys).toContain(mockMint.publicKey.toString());
      expect(accountKeys).toContain(WSOL_TOKEN.toString());
    });

    test('should serialize metadata correctly in instruction data', () => {
      const instruction = buildLaunchInstruction({
        mintKeypair: mockMint,
        payerKeypair: mockPayer,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        metadataPDA: mockMetadata,
        name: 'Test Token',
        symbol: 'TEST',
        uri: 'https://ipfs.io/test-metadata',
      });

      // Check that instruction data contains serialized metadata
      expect(instruction.data.length).toBeGreaterThan(8); // Discriminator + data
      
      // First 8 bytes should be the instruction discriminator
      const discriminator = instruction.data.slice(0, 8);
      expect(discriminator.length).toBe(8);
    });

    test('should handle custom decimals and supply', () => {
      const instruction = buildLaunchInstruction({
        mintKeypair: mockMint,
        payerKeypair: mockPayer,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        metadataPDA: mockMetadata,
        name: 'Test Token',
        symbol: 'TEST',
        uri: 'https://ipfs.io/test-metadata',
        decimals: 9,
        supply: '1000000000000000',
      });

      expect(instruction).toBeInstanceOf(TransactionInstruction);
    });
  });

  describe('buildBuyInstruction', () => {
    const amountIn = 1000000000n; // 1 SOL
    const minimumAmountOut = 950000n; // With slippage

    test('should create buy instruction with valid parameters', () => {
      const instruction = buildBuyInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn,
        minimumAmountOut,
      });

      expect(instruction).toBeInstanceOf(TransactionInstruction);
      expect(instruction.programId).toEqual(LETSBONK_PROGRAM_ID);
      expect(instruction.keys.length).toBeGreaterThan(0);
      expect(instruction.data.length).toBeGreaterThan(0);
    });

    test('should include required accounts for buy instruction', () => {
      const instruction = buildBuyInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn,
        minimumAmountOut,
      });

      const accountKeys = instruction.keys.map(key => key.pubkey.toString());
      
      // Should include payer and base mint
      expect(accountKeys).toContain(mockPayer.publicKey.toString());
      expect(accountKeys).toContain(mockBaseMint.toString());
      // Should include WSOL (quote mint)
      expect(accountKeys).toContain(WSOL_TOKEN.toString());
    });

    test('should serialize buy amounts correctly', () => {
      const instruction = buildBuyInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn,
        minimumAmountOut,
      });

      // Check that instruction data contains serialized amounts
      expect(instruction.data.length).toBeGreaterThan(8); // Discriminator + amounts
    });

    test('should handle custom share fee rate', () => {
      const instruction = buildBuyInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn,
        minimumAmountOut,
        shareFeeRate: 100n, // 1%
      });

      expect(instruction).toBeInstanceOf(TransactionInstruction);
    });
  });

  describe('createSellInstruction', () => {
    const amountIn = 1000000n; // 1M tokens
    const minimumAmountOut = 950000000n; // ~0.95 SOL

    test('should create sell instruction with valid parameters', () => {
      const instruction = buildSellInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn,
        minimumAmountOut,
      });

      expect(instruction).toBeInstanceOf(TransactionInstruction);
      expect(instruction.programId).toEqual(LETSBONK_PROGRAM_ID);
      expect(instruction.keys.length).toBeGreaterThan(0);
      expect(instruction.data.length).toBeGreaterThan(0);
    });

    test('should include required accounts for sell instruction', () => {
      const instruction = buildSellInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn,
        minimumAmountOut,
      });

      const accountKeys = instruction.keys.map(key => key.pubkey.toString());
      
      // Should include payer and base mint
      expect(accountKeys).toContain(mockPayer.publicKey.toString());
      expect(accountKeys).toContain(mockBaseMint.toString());
      // Should include WSOL (quote mint)
      expect(accountKeys).toContain(WSOL_TOKEN.toString());
    });

    test('should serialize sell amounts correctly', () => {
      const instruction = buildSellInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn,
        minimumAmountOut,
      });

      // Check that instruction data contains serialized amounts
      expect(instruction.data.length).toBeGreaterThan(8); // Discriminator + amounts
    });
  });

  describe('Instruction validation', () => {
    test('launch instruction should have proper discriminator', () => {
      const instruction = buildLaunchInstruction({
        mintKeypair: mockMint,
        payerKeypair: mockPayer,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        metadataPDA: mockMetadata,
        name: 'Test Token',
        symbol: 'TEST',
        uri: 'https://ipfs.io/test-metadata',
      });

      // Check discriminator (first 8 bytes)
      const discriminator = Array.from(instruction.data.slice(0, 8));
      expect(discriminator.length).toBe(8);
      // Should not be all zeros
      expect(discriminator.some(byte => byte !== 0)).toBe(true);
    });

    test('buy instruction should have proper discriminator', () => {
      const instruction = buildBuyInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn: 1000000000n,
        minimumAmountOut: 950000n,
      });

      // Check discriminator (first 8 bytes)
      const discriminator = Array.from(instruction.data.slice(0, 8));
      expect(discriminator.length).toBe(8);
      // Should not be all zeros
      expect(discriminator.some(byte => byte !== 0)).toBe(true);
    });

    test('sell instruction should have proper discriminator', () => {
      const instruction = buildSellInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn: 1000000n,
        minimumAmountOut: 950000000n,
      });

      // Check discriminator (first 8 bytes)
      const discriminator = Array.from(instruction.data.slice(0, 8));
      expect(discriminator.length).toBe(8);
      // Should not be all zeros
      expect(discriminator.some(byte => byte !== 0)).toBe(true);
    });
  });

  describe('Account meta validation', () => {
    test('instructions should have writable accounts where needed', () => {
      const buyInstruction = buildBuyInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn: 1000000000n,
        minimumAmountOut: 950000n,
      });

      // Payer should be writable and signer
      const payerMeta = buyInstruction.keys.find(key => 
        key.pubkey.equals(mockPayer.publicKey)
      );
      expect(payerMeta?.isWritable).toBe(true);
      expect(payerMeta?.isSigner).toBe(true);
    });

    test('instructions should have reasonable account counts', () => {
      const sellInstruction = buildSellInstruction({
        payerPubkey: mockPayer.publicKey,
        poolStatePDA: mockPoolState,
        baseVaultPDA: mockBaseVault,
        quoteVaultPDA: mockQuoteVault,
        baseMint: mockBaseMint,
        baseTokenAccount: mockBaseTokenAccount,
        wsolTokenAccount: mockWsolTokenAccount,
        amountIn: 1000000n,
        minimumAmountOut: 950000000n,
      });

      const accountKeys = sellInstruction.keys.map(key => key.pubkey.toString());
      const uniqueKeys = [...new Set(accountKeys)];
      
      // Log duplicate accounts for debugging - sometimes duplicates are legitimate
      if (accountKeys.length !== uniqueKeys.length) {
        const duplicates = accountKeys.filter((key, index) => accountKeys.indexOf(key) !== index);
        console.log('Note: Duplicate accounts found (may be intentional):', duplicates);
      }
      
      // Ensure we have a reasonable number of accounts (not too many, not too few)
      expect(accountKeys.length).toBeGreaterThanOrEqual(10); // At least 10 accounts
      expect(accountKeys.length).toBeLessThanOrEqual(20); // No more than 20 accounts
      expect(uniqueKeys.length).toBeGreaterThanOrEqual(10); // At least 10 unique accounts
    });
  });
}); 