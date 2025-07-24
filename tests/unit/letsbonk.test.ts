// @ts-nocheck
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';
import { LetsBonkSDK } from '../../src/letsbonk-sdk';
import { CreateTokenMetadata, TransactionResult } from '../../src/types';

// Mock the entire metadata module
jest.mock('../../src/utils/metadata', () => ({
  uploadTokenMetadata: jest.fn(),
  prepareTokenMetadata: jest.fn(),
}));

// Mock the transactions module
jest.mock('../../src/transactions', () => ({
  orchestrateTokenLaunch: jest.fn(),
  buildBuyTransaction: jest.fn(),
  buildSellTransaction: jest.fn(),
  sendAndConfirmTransactionWithRetry: jest.fn(),
}));

// Mock the transaction manager
jest.mock('../../src/managers/transaction-manager', () => ({
  TransactionManager: jest.fn().mockImplementation(() => ({
    initializeAndBuyAndExecute: jest.fn(),
    buyAndExecute: jest.fn(),
    sellAndExecute: jest.fn(),
  }))
}));

// Mock the metadata manager
jest.mock('../../src/managers/metadata-manager', () => ({
  MetadataManager: jest.fn().mockImplementation(() => ({
    uploadAndPrepare: jest.fn(),
    prepare: jest.fn(),
  }))
}));

// Mock the account manager  
jest.mock('../../src/managers/account-manager', () => ({
  AccountManager: jest.fn().mockImplementation(() => ({
    getGlobalConfig: jest.fn(),
    getPlatformConfig: jest.fn(),
    getPoolState: jest.fn(),
  }))
}));

import { uploadTokenMetadata, prepareTokenMetadata } from '../../src/utils/metadata';
import { 
  orchestrateTokenLaunch, 
  buildBuyTransaction, 
  buildSellTransaction, 
  sendAndConfirmTransactionWithRetry 
} from '../../src/transactions';

describe('LetsBonkSDK', () => {
  let sdk: LetsBonkSDK;
  let mockProvider: AnchorProvider;
  let mockConnection: Connection;
  let mockWallet: Keypair;
  let mockBaseMint: Keypair;

  const mockUploadTokenMetadata = uploadTokenMetadata as jest.MockedFunction<typeof uploadTokenMetadata>;
  const mockPrepareTokenMetadata = prepareTokenMetadata as jest.MockedFunction<typeof prepareTokenMetadata>;
  const mockOrchestrateLaunch = orchestrateTokenLaunch as jest.MockedFunction<typeof orchestrateTokenLaunch>;
  const mockBuildBuyTransaction = buildBuyTransaction as jest.MockedFunction<typeof buildBuyTransaction>;
const mockBuildSellTransaction = buildSellTransaction as jest.MockedFunction<typeof buildSellTransaction>;
  const mockSendAndConfirmTransaction = sendAndConfirmTransactionWithRetry as jest.MockedFunction<typeof sendAndConfirmTransactionWithRetry>;

  beforeEach(() => {
    // Create mock connection
    mockConnection = {
      // @ts-ignore
      getAccountInfo: jest.fn().mockResolvedValue(null),
      // @ts-ignore
      getLatestBlockhash: jest.fn().mockResolvedValue({
        blockhash: 'mock-blockhash',
        lastValidBlockHeight: 123456789,
      }),
    } as any as Connection;

    // Create mock wallet and base mint
    mockWallet = Keypair.generate();
    mockBaseMint = Keypair.generate();

    // Create mock provider
    mockProvider = {
      connection: mockConnection,
      wallet: mockWallet,
    } as any;

    // Create SDK instance
    sdk = new LetsBonkSDK(mockConnection);

    // Set up manager mocks with default return values
    (sdk as any).transactions.initializeAndBuyAndExecute = jest.fn().mockResolvedValue({ success: false, error: 'Mocked failure' });
    (sdk as any).transactions.buyAndExecute = jest.fn().mockResolvedValue({ success: false, error: 'Mocked failure' });
    (sdk as any).transactions.sellAndExecute = jest.fn().mockResolvedValue({ success: false, error: 'Mocked failure' });
    (sdk as any).metadata.uploadAndPrepare = jest.fn().mockResolvedValue({ success: false, error: 'Mocked failure' });
    (sdk as any).metadata.prepare = jest.fn().mockResolvedValue({ success: false, error: 'Mocked failure' });
    (sdk as any).metadata.uploadMetadata = jest.fn().mockResolvedValue({ success: false, error: 'Mocked failure' });
    (sdk as any).metadata.prepareMetadata = jest.fn().mockResolvedValue({ success: false, error: 'Mocked failure' });
    (sdk as any).accounts.getGlobalConfig = jest.fn().mockResolvedValue({ bump: 1, curveType: 0, tradeFeeRate: 100, quoteMint: 'mocked' });
    (sdk as any).accounts.getPlatformConfig = jest.fn().mockResolvedValue({ bump: 1, name: 'LetsBonk', feeRate: 100 });
    (sdk as any).accounts.getPoolState = jest.fn().mockResolvedValue(null);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(sdk.connection).toBe(mockConnection);
      expect(sdk.commitment).toBe('confirmed');
      expect(sdk.finality).toBe('confirmed');
    });

    test('should accept custom configuration', () => {
      const customConfig = {
        commitment: 'finalized' as const,
        finality: 'finalized' as const,
      };

      const customSdk = new LetsBonkSDK(mockConnection, customConfig);
      
      expect(customSdk.commitment).toBe('finalized');
      expect(customSdk.finality).toBe('finalized');
    });
  });

  describe('initializeAndBuy', () => {
    const mockMetadata: CreateTokenMetadata = {
      name: 'Test Token',
      symbol: 'TEST',
      description: 'A test token',
      file: new Blob(['test-image-data'], { type: 'image/jpeg' }),
      twitter: 'https://twitter.com/test',
    };

    test('should launch token with metadata upload', async () => {
      const mockResult: TransactionResult = {
        success: true,
        signature: 'mock-signature',
        message: 'Success',
      };

      // Mock the manager methods
      ((sdk as any).transactions.initializeAndBuyAndExecute as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await sdk.initializeAndBuy(
        mockWallet,
        mockWallet.publicKey,
        mockBaseMint,
        mockMetadata,
        BigInt(1000000000) // 1 SOL
      );

      expect(result.success).toBe(true);
      expect(result.signature).toBe('mock-signature');
      expect((sdk as any).transactions.initializeAndBuyAndExecute).toHaveBeenCalled();
    });

    test('should use existing external_url if provided', async () => {
      const metadataWithUri = {
        ...mockMetadata,
        external_url: 'https://existing-uri.com',
      };

      const mockResult: TransactionResult = {
        success: true,
        signature: 'mock-signature',
        message: 'Success',
      };

      // Mock the manager methods
      ((sdk as any).transactions.initializeAndBuyAndExecute as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await sdk.initializeAndBuy(
        mockWallet,
        mockWallet.publicKey,
        mockBaseMint,
        metadataWithUri,
        BigInt(1000000000)
      );

      expect(result.success).toBe(true);
      expect(mockUploadTokenMetadata).not.toHaveBeenCalled();
      expect((sdk as any).transactions.initializeAndBuyAndExecute).toHaveBeenCalled();
    });

    test('should handle metadata upload failure', async () => {
      mockUploadTokenMetadata.mockResolvedValueOnce({
        metadataUri: '',
        success: false,
        error: 'Upload failed',
      });

      const result = await sdk.initializeAndBuy(
        mockWallet,
        mockWallet.publicKey,
        mockBaseMint,
        mockMetadata,
        BigInt(1000000000)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Mocked failure');
    });

    test('should handle transaction failure', async () => {
      mockUploadTokenMetadata.mockResolvedValueOnce({
        metadataUri: 'https://ipfs.io/test-uri',
        success: true,
      });

      mockOrchestrateLaunch.mockResolvedValueOnce({
        success: false,
        error: 'Transaction failed',
      });

      const result = await sdk.initializeAndBuy(
        mockWallet,
        mockWallet.publicKey,
        mockBaseMint,
        mockMetadata,
        BigInt(1000000000)
      );

      expect(result.success).toBe(false);
    });
  });

  describe('buy', () => {
    test('should execute buy transaction successfully', async () => {
      const mockResult: TransactionResult = {
        success: true,
        signature: 'mock-buy-signature',
        message: 'Buy successful',
      };

      // Mock the manager method
      ((sdk as any).transactions.buyAndExecute as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await sdk.buy(
        mockWallet,
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        BigInt(1000000000), // 1 SOL
        BigInt(950000) // With slippage
      );

      expect(result.success).toBe(true);
      expect(result.signature).toBe('mock-buy-signature');
      expect((sdk as any).transactions.buyAndExecute).toHaveBeenCalled();
    });

    test('should handle buy transaction failure', async () => {
      // Mock the manager method to return failure
      ((sdk as any).transactions.buyAndExecute as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Transaction failed to send'
      });

      const result = await sdk.buy(
        mockWallet,
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        BigInt(1000000000),
        BigInt(950000)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction failed to send');
    });

    test('should handle transaction creation error', async () => {
      // Mock the manager method to return creation error
      ((sdk as any).transactions.buyAndExecute as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Creation failed'
      });

      const result = await sdk.buy(
        mockWallet,
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        BigInt(1000000000),
        BigInt(950000)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('sell', () => {
    test('should execute sell transaction successfully', async () => {
      const mockResult = {
        success: true,
        signature: 'mock-sell-signature',
        message: 'Sell successful'
      };

      // Mock the manager method
      ((sdk as any).transactions.sellAndExecute as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await sdk.sell(
        mockWallet,
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        BigInt(1000000), // 1M tokens
        BigInt(950000000) // With slippage
      );

      expect(result.success).toBe(true);
      expect(result.signature).toBe('mock-sell-signature');
      expect((sdk as any).transactions.sellAndExecute).toHaveBeenCalled();
    });

    test('should handle sell transaction failure', async () => {
      // Mock the manager method to return failure
      ((sdk as any).transactions.sellAndExecute as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Transaction failed to send'
      });

      const result = await sdk.sell(
        mockWallet,
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        BigInt(1000000),
        BigInt(950000000)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction failed to send');
    });
  });

  describe('uploadMetadata', () => {
    test('should upload metadata successfully', async () => {
      const mockMetadata: CreateTokenMetadata = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        file: new Blob(['test-data']),
      };

      // Mock the manager method
      ((sdk as any).metadata.uploadMetadata as jest.Mock).mockResolvedValueOnce({
        metadataUri: 'https://ipfs.io/test-uri',
        success: true,
      });

      const result = await sdk.uploadMetadata(mockMetadata);

      expect(result.success).toBe(true);
      expect(result.metadataUri).toBe('https://ipfs.io/test-uri');
      expect((sdk as any).metadata.uploadMetadata).toHaveBeenCalledWith(mockMetadata);
    });

    test('should handle upload failure', async () => {
      const mockMetadata: CreateTokenMetadata = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        file: new Blob(['test-data']),
      };

      // Mock the manager method to return failure
      ((sdk as any).metadata.uploadMetadata as jest.Mock).mockResolvedValueOnce({
        metadataUri: '',
        success: false,
        error: 'Upload failed',
      });

      const result = await sdk.uploadMetadata(mockMetadata);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });
  });

  describe('prepareMetadata', () => {
    test('should prepare metadata successfully', async () => {
      const mockPreparedMetadata: CreateTokenMetadata = {
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        file: new Blob(['test-data']),
      };

      // Mock the manager method
      ((sdk as any).metadata.prepareMetadata as jest.Mock).mockResolvedValueOnce({
        success: true,
        metadata: mockPreparedMetadata,
      });

      const result = await sdk.prepareMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: 'data:image/jpeg;base64,test-data',
      });

      expect(result.success).toBe(true);
      expect(result.metadata).toEqual(mockPreparedMetadata);
      expect((sdk as any).metadata.prepareMetadata).toHaveBeenCalled();
    });

    test('should handle preparation failure', async () => {
      // Mock the manager method to return failure
      ((sdk as any).metadata.prepareMetadata as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Preparation failed',
      });

      const result = await sdk.prepareMetadata({
        name: 'Test Token',
        symbol: 'TEST',
        description: 'A test token',
        imageInput: 'invalid-input',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Preparation failed');
    });
  });

  describe('getGlobalConfig', () => {
    test('should return default config when account not found', async () => {
      mockConnection.getAccountInfo = jest.fn().mockResolvedValue(null);

      const config = await sdk.getGlobalConfig();

      expect(config).toHaveProperty('bump');
      expect(config).toHaveProperty('curveType');
      expect(config).toHaveProperty('tradeFeeRate');
      expect(config).toHaveProperty('quoteMint');
    });

    test('should handle connection errors gracefully', async () => {
      mockConnection.getAccountInfo = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const config = await sdk.getGlobalConfig();

      expect(config).toHaveProperty('bump');
      expect(config.curveType).toBe(0);
    });
  });

  describe('getPlatformConfig', () => {
    test('should return default config when account not found', async () => {
      mockConnection.getAccountInfo = jest.fn().mockResolvedValue(null);

      const config = await sdk.getPlatformConfig();

      expect(config).toHaveProperty('bump');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('feeRate');
      expect(config.name).toBe('LetsBonk');
    });
  });

  describe('getPoolState', () => {
    test('should return null when pool not found', async () => {
      mockConnection.getAccountInfo = jest.fn().mockResolvedValue(null);

      const poolState = await sdk.getPoolState(new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'));

      expect(poolState).toBeNull();
    });

    test('should handle connection errors gracefully', async () => {
      mockConnection.getAccountInfo = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const poolState = await sdk.getPoolState(new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'));

      expect(poolState).toBeNull();
    });
  });

  describe('Error handling', () => {
    test('should handle thrown errors in initializeAndBuy', async () => {
      const result = await sdk.initializeAndBuy(
        mockWallet,
        mockWallet.publicKey,
        mockBaseMint,
        undefined as any, // Invalid metadata
        BigInt(1000000000)
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Mocked failure');
    });
  });
}); 