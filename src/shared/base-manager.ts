import { Connection } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { LetsBonkIDL } from '../IDL';
import { SDKLogger } from '../core/logger';
import { Result, SDKError, tryAsync } from '../core/errors';

/**
 * Base manager class providing common functionality for all SDK managers
 */
export abstract class BaseManager {
  protected readonly program: Program<LetsBonkIDL>;
  protected readonly connection: Connection;
  protected readonly logger: SDKLogger;

  constructor(program: Program<LetsBonkIDL>, connection: Connection, logger: SDKLogger) {
    this.program = program;
    this.connection = connection;
    this.logger = logger;
  }

  /**
   * Execute an operation with standardized error handling, logging, and timing
   */
  protected async executeOperation<T, E extends SDKError>(
    operationName: string,
    operation: () => Promise<T>,
    errorMapper: (error: Error) => E,
    context?: Record<string, unknown>
  ): Promise<Result<T, E>> {
    const timer = this.logger.startTimer(operationName);

    try {
      this.logger.debug(`Starting ${operationName}`, context);

      const result = await tryAsync(operation(), errorMapper);

      if (result.success) {
        this.logger.info(`${operationName} completed successfully`, context);
        timer.end({ success: true });
      } else {
        this.logger.error(`${operationName} failed`, {
          ...context,
          error: result.error.message,
        });
        timer.end({ success: false, error: result.error.message });
      }

      return result;
    } catch (error) {
      const mappedError = errorMapper(error as Error);
      this.logger.logError(mappedError, context);
      timer.end({ success: false, error: mappedError.message });

      return { success: false, error: mappedError };
    }
  }

  /**
   * Execute a synchronous operation with standardized error handling
   */
  protected executeSync<T, E extends SDKError>(
    operationName: string,
    operation: () => T,
    errorMapper: (error: Error) => E,
    context?: Record<string, unknown>
  ): Result<T, E> {
    try {
      this.logger.debug(`Starting ${operationName}`, context);

      const result = operation();

      this.logger.debug(`${operationName} completed successfully`, context);
      return { success: true, data: result };
    } catch (error) {
      const mappedError = errorMapper(error as Error);
      this.logger.logError(mappedError, context);

      return { success: false, error: mappedError };
    }
  }
}
