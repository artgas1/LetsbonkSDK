import { Connection, PublicKey, Keypair, VersionedTransaction } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { LetsBonkIDL } from '../IDL';
import {
  TransactionResult,
  ConstructedTransaction,
  BuyParams,
  SellParams,
  InitializeParams,
  CreateTokenMetadata,
  PriorityFee,
} from '../types';
import { TransactionExecutionOptions } from '../types/managers';
import { SDKLogger } from '../core/logger';
import {
  TransactionError,
  ValidationError,
  TimeoutError,
  Result,
  success,
  failure,
  tryAsync,
} from '../core/errors';
import {
  buildBuyTransaction,
  buildSellTransaction,
  buildTokenTransaction,
  buildInitializeAndBuyTransaction,
  sendAndConfirmTransactionWithRetry,
} from '../transactions';

import { SharedValidators } from '../shared/validators';

/**
 * Transaction Manager - Handles all transaction-related operations
 */
export class TransactionManager {
  private logger: SDKLogger;

  constructor(
    private program: Program<LetsBonkIDL>,
    private connection: Connection,
    logger: SDKLogger
  ) {
    this.logger = logger.child({ manager: 'TransactionManager' });
  }

  /**
   * Helper to get instruction count from any transaction type
   */
  private getInstructionCount(transaction: VersionedTransaction): number {
    return transaction.message.compiledInstructions.length;
  }

  /**
   * Build a buy transaction without executing it
   */
  async buildBuy(
    params: BuyParams
  ): Promise<Result<ConstructedTransaction, TransactionError | ValidationError>> {
    const timer = this.logger.startTimer('buildBuy');
    const operation = 'buy';

    try {
      this.logger.debug('Building buy transaction', {
        operation,
        buyer: params.buyer.publicKey.toString(),
        baseMint: params.baseMint.toString(),
        amountIn: params.amountIn.toString(),
      });

      // Validate parameters
      const validation = this.validateBuyParams(params);
      if (!validation.success) {
        return failure(validation.error);
      }

      // Create transaction - pass BigInt amounts directly (no conversion!)
      const buildResult = await tryAsync(
        buildBuyTransaction(
          this.connection,
          params.buyer,
          params.baseMint,
          params.amountIn, // Use raw BigInt directly - no precision loss!
          params.minimumAmountOut, // Use raw BigInt directly - no precision loss!
          params.priorityFees
        ),
        error =>
          new TransactionError(
            `Failed to build buy transaction: ${error.message}`,
            undefined,
            undefined,
            error
          )
      );

      if (!buildResult.success) {
        timer.end({ success: false, error: buildResult.error.message });
        return failure(buildResult.error as TransactionError);
      }

      const { transaction, additionalSigners } = buildResult.data;
      const constructedTransaction: ConstructedTransaction = {
        transaction,
        signers: [params.buyer, ...additionalSigners],
        description: `Buy ${params.amountIn} tokens for ${params.baseMint.toString().slice(0, 8)}...`,
      };

      timer.end({ success: true });

      this.logger.info('Buy transaction built successfully', {
        operation,
        instructionCount: this.getInstructionCount(transaction),
        signerCount: constructedTransaction.signers.length,
      });

      return success(constructedTransaction);
    } catch (error) {
      const txError = new TransactionError(
        `Unexpected error building buy transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(txError, { operation });
      timer.end({ success: false, error: txError.message });

      return failure(txError);
    }
  }

  /**
   * Build a sell transaction without executing it
   */
  async buildSell(
    params: SellParams
  ): Promise<Result<ConstructedTransaction, TransactionError | ValidationError>> {
    const timer = this.logger.startTimer('buildSell');
    const operation = 'sell';

    try {
      this.logger.debug('Building sell transaction', {
        operation,
        seller: params.seller.publicKey.toString(),
        baseMint: params.baseMint.toString(),
        amountIn: params.amountIn.toString(),
      });

      // Validate parameters
      const validation = this.validateSellParams(params);
      if (!validation.success) {
        return failure(validation.error);
      }

      // Create transaction - pass BigInt amounts directly (no conversion!)
      const buildResult = await tryAsync(
        buildSellTransaction(
          this.connection,
          params.seller,
          params.baseMint,
          params.amountIn, // Use raw BigInt directly - no precision loss!
          params.minimumAmountOut, // Use raw BigInt directly - no precision loss!
          params.priorityFees
        ),
        error =>
          new TransactionError(
            `Failed to build sell transaction: ${error.message}`,
            undefined,
            undefined,
            error
          )
      );

      if (!buildResult.success) {
        timer.end({ success: false, error: buildResult.error.message });
        return failure(buildResult.error as TransactionError);
      }

      const { transaction, additionalSigners } = buildResult.data;
      const constructedTransaction: ConstructedTransaction = {
        transaction,
        signers: [params.seller, ...additionalSigners],
        description: `Sell ${params.amountIn} tokens of ${params.baseMint.toString().slice(0, 8)}...`,
      };

      timer.end({ success: true });

      this.logger.info('Sell transaction built successfully', {
        operation,
        instructionCount: this.getInstructionCount(transaction),
        signerCount: constructedTransaction.signers.length,
      });

      return success(constructedTransaction);
    } catch (error) {
      const txError = new TransactionError(
        `Unexpected error building sell transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(txError, { operation });
      timer.end({ success: false, error: txError.message });

      return failure(txError);
    }
  }

  /**
   * Build an initialize transaction without executing it
   */
  async buildInitialize(
    params: InitializeParams
  ): Promise<Result<ConstructedTransaction, TransactionError | ValidationError>> {
    const timer = this.logger.startTimer('buildInitialize');
    const operation = 'initialize';

    try {
      this.logger.debug('Building initialize transaction', {
        operation,
        creator: params.creator.toString(),
        baseMint: params.baseMint.toString(),
      });

      // Validate parameters
      const validation = this.validateInitializeParams(params);
      if (!validation.success) {
        return failure(validation.error);
      }

      // Create transaction
      const buildResult = await tryAsync(
        buildTokenTransaction(this.connection, params.payer, params.baseMint, params.tokenMetadata),
        error =>
          new TransactionError(
            `Failed to build initialize transaction: ${error.message}`,
            undefined,
            undefined,
            error
          )
      );

      if (!buildResult.success) {
        timer.end({ success: false, error: buildResult.error.message });
        return failure(buildResult.error as TransactionError);
      }

      const { transaction, baseTokenAccount } = buildResult.data;
      const constructedTransaction: ConstructedTransaction = {
        transaction,
        signers: [params.payer, params.baseMint],
        description: `Initialize pool for ${params.tokenMetadata.symbol}`,
      };

      timer.end({ success: true });

      this.logger.info('Initialize transaction built successfully', {
        operation,
        baseMint: params.baseMint.toString(),
        baseTokenAccount: baseTokenAccount?.toString(),
        instructionCount: this.getInstructionCount(transaction),
      });

      return success(constructedTransaction);
    } catch (error) {
      const txError = new TransactionError(
        `Unexpected error building initialize transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(txError, { operation });
      timer.end({ success: false, error: txError.message });

      return failure(txError);
    }
  }

  /**
   * Execute a pre-built transaction
   */
  async execute(
    constructedTransaction: ConstructedTransaction,
    options: TransactionExecutionOptions = {}
  ): Promise<Result<TransactionResult, TransactionError | TimeoutError>> {
    const timer = this.logger.startTimer('executeTransaction');
    const operation = constructedTransaction.description || 'transaction';

    try {
      const {
        skipPreflight = false,
        maxRetries = 3,
        commitment = 'confirmed',
        timeout = 60000,
      } = options;

      this.logger.info('Executing transaction', {
        operation,
        instructionCount: this.getInstructionCount(constructedTransaction.transaction),
        skipPreflight,
        maxRetries,
        commitment,
      });

      // Execute with retry logic and timeout
      const executeResult = await tryAsync(
        Promise.race([
          sendAndConfirmTransactionWithRetry(
            this.connection,
            constructedTransaction.transaction,
            constructedTransaction.signers,
            skipPreflight,
            maxRetries
          ),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Transaction timeout')), timeout)
          ),
        ]),
        error => {
          if (error.message.includes('timeout')) {
            return new TimeoutError('Transaction execution timed out', timeout, operation, error);
          }
          return new TransactionError(
            `Transaction execution failed: ${error.message}`,
            undefined,
            undefined,
            error
          );
        }
      );

      if (!executeResult.success) {
        timer.end({ success: false, error: executeResult.error.message });
        return failure(executeResult.error as TransactionError | TimeoutError);
      }

      const signature = executeResult.data as string;
      const result: TransactionResult = {
        success: true,
        signature,
        sentAt: Date.now(),
        transaction: constructedTransaction.transaction,
        signers: constructedTransaction.signers,
        description: constructedTransaction.description,
      };

      timer.end({ success: true });

      this.logger.info('Transaction executed successfully', {
        operation,
        signature,
        commitment,
      });

      return success(result);
    } catch (error) {
      const txError = new TransactionError(
        `Unexpected error executing transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(txError, { operation });
      timer.end({ success: false, error: txError.message });

      return failure(txError);
    }
  }

  /**
   * Build and execute a buy transaction in one call
   */
  async buyAndExecute(
    params: BuyParams,
    options: TransactionExecutionOptions = {}
  ): Promise<Result<TransactionResult, TransactionError | ValidationError | TimeoutError>> {
    const buildResult = await this.buildBuy(params);
    if (!buildResult.success) {
      return buildResult;
    }

    return this.execute(buildResult.data, options);
  }

  /**
   * Build and execute a sell transaction in one call
   */
  async sellAndExecute(
    params: SellParams,
    options: TransactionExecutionOptions = {}
  ): Promise<Result<TransactionResult, TransactionError | ValidationError | TimeoutError>> {
    const buildResult = await this.buildSell(params);
    if (!buildResult.success) {
      return buildResult;
    }

    return this.execute(buildResult.data, options);
  }

  /**
   * Build and execute an initialize transaction in one call
   */
  async initializeAndExecute(
    params: InitializeParams,
    options: TransactionExecutionOptions = {}
  ): Promise<Result<TransactionResult, TransactionError | ValidationError | TimeoutError>> {
    const buildResult = await this.buildInitialize(params);
    if (!buildResult.success) {
      return buildResult;
    }

    return this.execute(buildResult.data, options);
  }

  /**
   * Build and execute an initialize and buy transaction in one call
   */
  async initializeAndBuyAndExecute(
    payer: Keypair,
    creator: PublicKey,
    baseMint: Keypair,
    tokenMetadata: CreateTokenMetadata,
    buyAmountLamports: bigint, // Raw lamports amount for precision
    options: TransactionExecutionOptions = {}
  ): Promise<Result<TransactionResult, TransactionError | ValidationError | TimeoutError>> {
    const buildResult = await this.buildInitializeAndBuy(
      payer,
      creator,
      baseMint,
      tokenMetadata,
      buyAmountLamports,
      options.priorityFees
    );
    if (!buildResult.success) {
      return buildResult;
    }

    return this.execute(buildResult.data, options);
  }

  /**
   * Validate buy transaction parameters
   */
  private validateBuyParams(params: BuyParams): Result<void, ValidationError> {
    return SharedValidators.validateBuyParams(params);
  }

  /**
   * Validate sell transaction parameters
   */
  private validateSellParams(params: SellParams): Result<void, ValidationError> {
    return SharedValidators.validateSellParams(params);
  }

  /**
   * Validate initialize transaction parameters
   */
  private validateInitializeParams(params: InitializeParams): Result<void, ValidationError> {
    return SharedValidators.validateInitializeParams(params);
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(signature: string): Promise<Result<unknown, TransactionError>> {
    const timer = this.logger.startTimer('getTransactionStatus');

    try {
      this.logger.debug('Fetching transaction status', { signature });

      const result = await tryAsync(
        this.connection.getTransaction(signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        }),
        error =>
          new TransactionError(
            `Failed to fetch transaction status: ${error.message}`,
            signature,
            undefined,
            error
          )
      );

      timer.end({ success: result.success });
      return result as Result<unknown, TransactionError>;
    } catch (error) {
      const txError = new TransactionError(
        `Unexpected error fetching transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        signature,
        undefined,
        error instanceof Error ? error : undefined
      );

      this.logger.logError(txError);
      timer.end({ success: false, error: txError.message });

      return failure(txError);
    }
  }

  /**
   * Build initialize and buy transaction without executing
   *
   * @param payer - Keypair that pays for initialization and buys tokens
   * @param creator - Public key of the token creator
   * @param baseMint - Keypair for the new token mint
   * @param tokenMetadata - Metadata for the new token
   * @param buyAmountLamports - Amount of lamports to spend on buying tokens (in lamports)
   * @param priorityFees - Optional priority fees configuration
   */
  async buildInitializeAndBuy(
    payer: Keypair,
    creator: PublicKey,
    baseMint: Keypair,
    tokenMetadata: CreateTokenMetadata,
    buyAmountLamports: bigint, // Raw lamports amount for precision
    priorityFees?: PriorityFee
  ): Promise<Result<ConstructedTransaction, ValidationError>> {
    const timer = this.logger.startTimer('buildInitializeAndBuy');
    const operation = 'buildInitializeAndBuy';

    try {
      this.logger.debug('Building initialize and buy transaction', {
        operation,
        baseMint: baseMint.publicKey.toString(),
        creator: creator.toString(),
        buyAmountLamports: buyAmountLamports.toString(),
      });

      // Delegate to transaction layer - proper layered architecture
      const buildResult = await tryAsync(
        buildInitializeAndBuyTransaction(
          this.connection,
          payer,
          creator,
          baseMint,
          tokenMetadata,
          buyAmountLamports,
          undefined, // launchParams
          priorityFees
        ),
        (error: Error) =>
          new ValidationError(
            `Failed to build initialize and buy transaction: ${error.message}`,
            undefined,
            { originalError: error.message }
          )
      );

      if (!buildResult.success) {
        timer.end({ success: false, error: buildResult.error.message });
        return failure(buildResult.error);
      }

      const { transaction, signers } = buildResult.data;

      const constructedTransaction: ConstructedTransaction = {
        transaction,
        signers,
        description:
          buyAmountLamports > 0n
            ? `Initialize ${tokenMetadata.symbol} and buy ${buyAmountLamports} lamports worth of tokens`
            : `Initialize ${tokenMetadata.symbol}`,
      };

      timer.end({ success: true });
      this.logger.info('Initialize and buy transaction built successfully', {
        operation,
        baseMint: baseMint.publicKey.toString(),
        buyAmountLamports: buyAmountLamports.toString(),
        instructionCount: this.getInstructionCount(transaction),
        signerCount: constructedTransaction.signers.length,
      });

      return success(constructedTransaction);
    } catch (error) {
      const txError = new ValidationError(
        `Unexpected error building initialize and buy transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error instanceof Error ? { originalError: error.message } : undefined
      );

      this.logger.logError(txError, { operation });
      timer.end({ success: false, error: txError.message });

      return failure(txError);
    }
  }
}
