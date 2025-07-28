import { Connection, PublicKey, Keypair, Commitment, Finality } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { LetsBonkIDL, IDL } from './IDL';

// Configuration and errors
import { 
  LetsBonkConfig, 
  ResolvedConfig, 
  ConfigManager,
  SDKLogger
} from './core';
import { Result, SDKError, ConfigurationError, tryAsync } from './core/errors';

// Types and interfaces
import { 
  GlobalConfig,
  PlatformConfig,
  PoolState,
  TransactionResult,
  ConstructedTransaction,
  BuyParams,
  SellParams,
  InitializeParams,
  InitializeAndBuyParams,
  CreateTokenMetadata,
  PriorityFee
} from './types';

// Managers
import { 
  AccountManager, 
  TransactionManager,
  PoolManager,
  MetadataManager
} from './managers';

// Manager-specific types
import { 
  TransactionExecutionOptions,
  MetadataPreparationParams
} from './types/managers';

// No direct implementation imports - SDK delegates to managers only

/**
 * Main LetsBonkSDK class
 * 
 * A modern, type-safe SDK for interacting with the LetsBonk trading protocol.
 * Features modular architecture, comprehensive error handling, and structured logging.
 */
export class LetsBonkSDK {
  private config: ResolvedConfig;
  private program: Program<LetsBonkIDL>;
  private logger: SDKLogger;
  
  // Public manager instances
  private readonly accounts: AccountManager;
  private readonly transactions: TransactionManager;
  private readonly pools: PoolManager;
  private readonly metadata: MetadataManager;

  /**
   * Create a new LetsBonkSDK instance
   * 
   * @param connection - Solana connection (REQUIRED)
   * @param config - SDK configuration (optional)
   */
  constructor(connection: Connection, config: LetsBonkConfig = {}) {
    // Create resolved configuration
    this.config = ConfigManager.create(connection, config);
    
    // Initialize logging
    this.logger = SDKLogger.create({
      level: this.config.logging?.level || 'info',
      enabled: this.config.logging?.enabled ?? true,
      prettyPrint: this.config.logging?.prettyPrint ?? false,
      context: this.config.logging?.context || {}
    });
    this.logger.info('Initializing LetsBonkSDK', {
      endpoint: this.config.connection.rpcEndpoint
    });

    // Initialize program
    this.program = new Program(
      IDL,
      this.config.provider
    );

    // Initialize managers
    this.accounts = new AccountManager(
      this.program,
      this.config.connection,
      this.logger
    );

    this.transactions = new TransactionManager(
      this.program,
      this.config.connection,
      this.logger
    );

    this.pools = new PoolManager(
      this.program,
      this.config.connection,
      this.logger
    );

    this.metadata = new MetadataManager(
      this.logger
    );

    this.logger.info('LetsBonkSDK initialized successfully', {
      version: '2.0.0',
      programId: this.config.programId.toString()
    });
  }

  // === High-level trading methods ===

  /**
   * Buy tokens - builds and executes buy transaction
   * 
   * @param buyer - Keypair of the buyer
   * @param baseMint - Public key of the base token mint
   * @param amountIn - Amount of quote tokens (SOL) to spend
   * @param minimumAmountOut - Minimum tokens to receive (optional)
   * @param options - Transaction execution options including priority fees
   */
  async buy(
    buyer: Keypair,
    baseMint: PublicKey,
    amountIn: bigint,
    minimumAmountOut?: bigint,
    options?: TransactionExecutionOptions
  ): Promise<Result<TransactionResult, SDKError>> {
    const params: BuyParams = {
      buyer,
      baseMint,
      amountIn,
      minimumAmountOut: minimumAmountOut || 0n,
      priorityFees: options?.priorityFees
    };

    return this.transactions.buyAndExecute(params, options);
  }

  /**
   * Sell tokens - builds and executes sell transaction
   * 
   * @param seller - Keypair of the seller
   * @param baseMint - Public key of the base token mint
   * @param amountIn - Amount of base tokens to sell
   * @param minimumAmountOut - Minimum quote tokens (SOL) to receive (optional)
   * @param options - Transaction execution options including priority fees
   */
  async sell(
    seller: Keypair,
    baseMint: PublicKey,
    amountIn: bigint,
    minimumAmountOut?: bigint,
    options?: TransactionExecutionOptions
  ): Promise<Result<TransactionResult, SDKError>> {
    const params: SellParams = {
      seller,
      baseMint,
      amountIn,
      minimumAmountOut: minimumAmountOut || 0n,
      priorityFees: options?.priorityFees
    };

    return this.transactions.sellAndExecute(params, options);
  }

  /**
   * Initialize a new token pool
   * 
   * @param payer - Keypair that pays for initialization
   * @param creator - Public key of the token creator
   * @param baseMint - Keypair for the new token mint
   * @param tokenMetadata - Metadata for the new token
   * @param options - Transaction execution options including priority fees
   */
  async initialize(
    payer: Keypair,
    creator: PublicKey,
    baseMint: Keypair,
    tokenMetadata: CreateTokenMetadata,
    options?: TransactionExecutionOptions
  ): Promise<Result<TransactionResult, SDKError>> {
    const params: InitializeParams = {
      payer,
      creator,
      baseMint,
      tokenMetadata,
      priorityFees: options?.priorityFees
    };

    return this.transactions.initializeAndExecute(params, options);
  }

  /**
   * Initialize and buy tokens in a single transaction
   * This is a convenience method that builds and executes the transaction
   * 
   * @param payer - Keypair that pays for the transaction
   * @param creator - Public key of the token creator
   * @param baseMint - Keypair for the new token mint  
   * @param tokenMetadata - Metadata for the new token
   * @param buyAmountLamports - Amount of lamports to spend on buying tokens
   * @param options - Transaction execution options
   */
  async initializeAndBuy(
    payer: Keypair,
    creator: PublicKey,
    baseMint: Keypair,
    tokenMetadata: CreateTokenMetadata,
    buyAmountLamports: bigint,
    options?: TransactionExecutionOptions
  ): Promise<Result<TransactionResult, SDKError>> {
    this.logger.info('Starting atomic initializeAndBuy operation', {
      baseMint: baseMint.publicKey.toString(),
      creator: creator.toString(),
      buyAmountLamports: buyAmountLamports.toString()
    });

    return this.transactions.initializeAndBuyAndExecute(
      payer,
      creator,
      baseMint,
      tokenMetadata,
      buyAmountLamports,
      options
    );
  }



  // === Transaction building (for advanced usage) ===

  /**
   * Build buy transaction without executing
   * Note: Priority fees can be specified in the BuyParams.priorityFees field
   * 
   * @param params - Buy parameters including optional priority fees
   */
  async buildBuy(params: BuyParams): Promise<Result<ConstructedTransaction, SDKError>> {
    return this.transactions.buildBuy(params);
  }

  /**
   * Build sell transaction without executing
   * Note: Priority fees can be specified in the SellParams.priorityFees field
   * 
   * @param params - Sell parameters including optional priority fees
   */
  async buildSell(params: SellParams): Promise<Result<ConstructedTransaction, SDKError>> {
    return this.transactions.buildSell(params);
  }

  /**
   * Build initialize transaction without executing
   * Note: Priority fees can be specified in the InitializeParams.priorityFees field
   * 
   * @param params - Initialize parameters including optional priority fees
   */
  async buildInitialize(params: InitializeParams): Promise<Result<ConstructedTransaction, SDKError>> {
    return this.transactions.buildInitialize(params);
  }

  /**
   * Build initialize and buy transaction without executing
   * 
   * @param params - Initialize and buy parameters including optional priority fees
   */
  async buildInitializeAndBuy(
    params: InitializeAndBuyParams
  ): Promise<Result<ConstructedTransaction, SDKError>> {
    return this.transactions.buildInitializeAndBuy(
      params.payer, 
      params.creator, 
      params.baseMint, 
      params.tokenMetadata, 
      params.buyAmountLamports, 
      params.priorityFees
    );
  }

  /**
   * Execute a pre-built transaction
   * 
   * @param transaction - Pre-built transaction to execute
   * @param options - Transaction execution options including priority fees
   */
  async executeTransaction(
    transaction: ConstructedTransaction,
    options?: TransactionExecutionOptions
  ): Promise<Result<TransactionResult, SDKError>> {
    return this.transactions.execute(transaction, options);
  }

    // === Account operations ===

  /**
   * Get global configuration
   */
  async getGlobalConfig(
    quoteMint?: PublicKey,
    curveType: number = 0,
    index: number = 0
  ): Promise<Result<GlobalConfig, SDKError>> {
    return this.accounts.getGlobalConfig(quoteMint, curveType, index);
  }

  /**
   * Get platform configuration
   */
  async getPlatformConfig(
    platformAdmin?: PublicKey,
    index: number = 0
  ): Promise<Result<PlatformConfig, SDKError>> {
    return this.accounts.getPlatformConfig(platformAdmin, index);
  }

  /**
   * Get pool state
   */
  async getPoolState(
    baseMint: PublicKey,
    quoteMint?: PublicKey
  ): Promise<Result<PoolState | null, SDKError>> {
    return this.accounts.getPoolState(baseMint, quoteMint);
  }

  /**
   * Check if pool exists
   */
  async isPoolExists(
    baseMint: PublicKey,
    quoteMint?: PublicKey
  ): Promise<Result<boolean, SDKError>> {
    return this.accounts.poolExists(baseMint, quoteMint);
  }

  // === Metadata operations ===

  /**
   * Prepare metadata from various inputs
   */
  async prepareMetadata(
    params: MetadataPreparationParams
  ): Promise<Result<CreateTokenMetadata, SDKError>> {
    return this.metadata.prepareMetadata(params);
  }

  /**
   * Upload metadata to IPFS
   */
  async uploadMetadata(
    metadata: CreateTokenMetadata
  ): Promise<Result<any, SDKError>> {
    return this.metadata.uploadMetadata(metadata);
  }

  // === Pool utilities ===

  /**
   * Calculate slippage for buy operations
   */
  calculateBuySlippage(
    amountIn: bigint,
    slippageBasisPoints: bigint = 500n
  ) {
    return this.pools.calculateBuySlippage(amountIn, slippageBasisPoints);
  }

  /**
   * Calculate slippage for sell operations
   */
  calculateSellSlippage(
    amountIn: bigint,
    slippageBasisPoints: bigint = 500n
  ) {
    return this.pools.calculateSellSlippage(amountIn, slippageBasisPoints);
  }

  /**
   * Calculate tokens received for SOL amount
   */
  calculateTokensForSOL(
    solAmount: number,
    previousSol: number = 30,
    slippage: number = 5
  ) {
    return this.pools.calculateTokensForSOL(solAmount, previousSol, slippage);
  }

  // === Getter properties for backward compatibility ===

  /**
   * Get connection instance
   */
  get connection(): Connection {
    return this.config.connection;
  }

  /**
   * Get commitment level
   */
  get commitment(): Commitment {
    return this.config.commitment;
  }

  /**
   * Get finality level
   */
  get finality(): Finality {
    return this.config.finality;
  }

  // === Configuration access methods ===

  /**
   * Get full resolved configuration
   */
  getConfig(): ResolvedConfig {
    return this.config;
  }

  /**
   * Get connection instance
   */
  getConnection(): Connection {
    return this.config.connection;
  }

  /**
   * Get program instance
   */
  getProgram(): Program<LetsBonkIDL> {
    return this.program;
  }

  /**
   * Get logger instance
   */
  getLogger(): SDKLogger {
    return this.logger;
  }

  /**
   * Get all managers
   */
  getManagers(): { accounts: AccountManager; transactions: TransactionManager; pools: PoolManager; metadata: MetadataManager } {
    return {
      accounts: this.accounts,
      transactions: this.transactions,
      pools: this.pools,
      metadata: this.metadata
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LetsBonkConfig>): void {
    this.logger.info('Updating SDK configuration', { newConfig });
    
    // This would require reinitializing managers
    // For now, we'll just log a warning
    this.logger.warn('Configuration updates require SDK reinitialization');
  }

  /**
   * Dispose resources and cleanup
   */
  dispose(): void {
    this.logger.info('Disposing LetsBonkSDK');
    
    // Reset singletons
    SDKLogger.reset();
    
    this.logger.info('LetsBonkSDK disposed');
  }
} 