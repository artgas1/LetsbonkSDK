import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';
import { LoggingConfig } from './config';

/**
 * Log levels supported by the SDK
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Log context for structured logging
 */
export interface LogContext {
  operation?: string;
  transactionId?: string;
  signature?: string;
  address?: string;
  mint?: string;
  amount?: string;
  slippage?: number;
  duration?: number;
  error?: unknown;
  [key: string]: unknown;
}

/**
 * Performance measurement interface
 */
export interface PerformanceTimer {
  end(context?: LogContext): void;
}

/**
 * SDK Logger class with structured logging and performance monitoring
 */
export class SDKLogger {
  private logger: PinoLogger;
  private config: LoggingConfig;
  private static instance: SDKLogger | undefined;

  constructor(config: LoggingConfig) {
    this.config = config;
    this.logger = this.createLogger();
  }

  /**
   * Get singleton instance (used internally by SDK)
   */
  static getInstance(config?: LoggingConfig): SDKLogger {
    if (!SDKLogger.instance && config) {
      SDKLogger.instance = new SDKLogger(config);
    }
    if (!SDKLogger.instance) {
      // Fallback to silent logger if no config provided
      SDKLogger.instance = new SDKLogger({
        level: 'silent',
        enabled: false,
        prettyPrint: false,
      });
    }
    return SDKLogger.instance;
  }

  /**
   * Create a new logger instance
   */
  static create(config: LoggingConfig): SDKLogger {
    return new SDKLogger(config);
  }

  /**
   * Reset singleton instance
   */
  static reset(): void {
    SDKLogger.instance = undefined;
  }

  /**
   * Create pino logger with configuration
   */
  private createLogger(): PinoLogger {
    if (!this.config.enabled) {
      return pino({ level: 'silent' });
    }

    const pinoOptions: LoggerOptions = {
      level: this.config.level,
      name: 'letsbonkdotfun-sdk',
      base: {
        version: '1.0.0',
        sdk: 'letsbonk',
        ...this.config.context,
      },
    };

    // Only use pretty printing in non-test environments or when explicitly enabled
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
    const shouldUsePrettyPrint = this.config.prettyPrint && !isTestEnv;

    if (shouldUsePrettyPrint) {
      try {
        pinoOptions.transport = {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            messageFormat: '{sdk} [{level}] {operation}: {msg}',
          },
        };
        return pino(pinoOptions);
      } catch (error) {
        // Fallback to simple logging if pino-pretty fails
        // eslint-disable-next-line no-console
        console.warn('pino-pretty transport failed, falling back to simple logging:', error);
      }
    }

    // Create simple logger without transport
    return pino(pinoOptions);
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): SDKLogger {
    const childLogger = this.logger.child(context);
    const childInstance = Object.create(this);
    childInstance.logger = childLogger;
    return childInstance;
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext): void {
    this.logger.error(context || {}, message);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(context || {}, message);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(context || {}, message);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(context || {}, message);
  }

  /**
   * Log trace message
   */
  trace(message: string, context?: LogContext): void {
    this.logger.trace(context || {}, message);
  }

  /**
   * Start performance timer
   */
  startTimer(operation: string, context?: LogContext): PerformanceTimer {
    const startTime = Date.now();

    this.debug(`Starting ${operation}`, {
      operation,
      timestamp: startTime,
      ...context,
    });

    return {
      end: (endContext?: LogContext) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.info(`Completed ${operation}`, {
          operation,
          duration,
          startTime,
          endTime,
          ...context,
          ...endContext,
        });
      },
    };
  }

  /**
   * Log transaction lifecycle events
   */
  logTransaction(event: TransactionEvent, context: LogContext): void {
    const logContext = {
      ...context,
      event,
      timestamp: Date.now(),
    };

    switch (event) {
      case 'building':
        this.debug('Building transaction', logContext);
        break;
      case 'built':
        this.info('Transaction built successfully', logContext);
        break;
      case 'signing':
        this.debug('Signing transaction', logContext);
        break;
      case 'sending':
        this.info('Sending transaction', logContext);
        break;
      case 'sent':
        this.info('Transaction sent', logContext);
        break;
      case 'confirming':
        this.debug('Confirming transaction', logContext);
        break;
      case 'confirmed':
        this.info('Transaction confirmed', logContext);
        break;
      case 'failed':
        this.error('Transaction failed', logContext);
        break;
      default:
        this.debug('Transaction event', logContext);
    }
  }

  /**
   * Log API calls
   */
  logApiCall(method: string, endpoint: string, context?: LogContext): PerformanceTimer {
    return this.startTimer(`API ${method}`, {
      method,
      endpoint,
      ...context,
    });
  }

  /**
   * Log account operations
   */
  logAccount(operation: AccountOperation, address: string, context?: LogContext): void {
    this.info(`Account ${operation}`, {
      operation,
      address,
      ...context,
    });
  }

  /**
   * Log pool operations
   */
  logPool(operation: PoolOperation, poolAddress: string, context?: LogContext): void {
    this.info(`Pool ${operation}`, {
      operation,
      poolAddress,
      ...context,
    });
  }

  /**
   * Log trade operations
   */
  logTrade(operation: TradeOperation, context: TradeContext): void {
    this.info(`Trade ${operation}`, {
      operation,
      ...context,
    });
  }

  /**
   * Log errors with stack trace
   */
  logError(error: Error, context?: LogContext): void {
    this.error(error.message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }

  /**
   * Log configuration changes
   */
  logConfig(message: string, config: unknown): void {
    this.info(message, { config });
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Check if logging is enabled for a level
   */
  isLevelEnabled(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return this.logger.isLevelEnabled(level);
  }

  /**
   * Update logger configuration
   */
  updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger = this.createLogger();
  }
}

/**
 * Transaction lifecycle events
 */
export type TransactionEvent =
  | 'building'
  | 'built'
  | 'signing'
  | 'sending'
  | 'sent'
  | 'confirming'
  | 'confirmed'
  | 'failed';

/**
 * Account operations
 */
export type AccountOperation = 'creating' | 'fetching' | 'updating' | 'closing';

/**
 * Pool operations
 */
export type PoolOperation = 'initializing' | 'fetching' | 'updating' | 'migrating';

/**
 * Trade operations
 */
export type TradeOperation = 'buying' | 'selling' | 'swapping';

/**
 * Trade context for logging
 */
export interface TradeContext extends LogContext {
  mint?: string;
  amountIn?: string;
  amountOut?: string;
  slippage?: number;
  fee?: string;
}

/**
 * Create a logger instance (utility function)
 */
export function createLogger(config: LoggingConfig): SDKLogger {
  return SDKLogger.create(config);
}

/**
 * Get the default logger instance
 */
export function getLogger(): SDKLogger {
  return SDKLogger.getInstance();
}

/**
 * Log level priorities for external configuration
 */
export const LOG_LEVEL_PRIORITIES: Record<LogLevel, number> = {
  silent: 70,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};
