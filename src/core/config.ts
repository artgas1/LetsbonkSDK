import { Connection, Commitment, Finality, PublicKey } from '@solana/web3.js';
import { Provider, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { z } from 'zod';
import { ConfigurationError, ValidationError } from './errors';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  connection: number;
  transaction: number;
  confirmation: number;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  enabled: boolean;
  prettyPrint: boolean;
  context?: Record<string, unknown>;
}

/**
 * SDK Configuration interface - simplified to only include non-connection settings
 */
export interface LetsBonkConfig {
  // Program configuration
  programId?: PublicKey;

  // Connection settings
  commitment?: Commitment;
  finality?: Finality;

  // Performance configuration
  retries?: Partial<RetryConfig>;
  timeouts?: Partial<TimeoutConfig>;

  // Logging configuration
  logging?: Partial<LoggingConfig>;

  // Advanced configuration
  skipPreflight?: boolean;
  maxConcurrentRequests?: number;
}

/**
 * Validation schema using Zod
 */
const LetsBonkConfigSchema = z.object({
  // Program configuration
  programId: z.instanceof(PublicKey).optional(),

  // Connection settings
  commitment: z.enum(['processed', 'confirmed', 'finalized']).optional(),
  finality: z.enum(['confirmed', 'finalized']).optional(),

  // Performance configuration
  retries: z
    .object({
      maxRetries: z.number().min(0).optional(),
      baseDelay: z.number().min(0).optional(),
      maxDelay: z.number().min(0).optional(),
      backoffMultiplier: z.number().min(1).optional(),
    })
    .optional(),

  timeouts: z
    .object({
      connection: z.number().min(0).optional(),
      transaction: z.number().min(0).optional(),
      confirmation: z.number().min(0).optional(),
    })
    .optional(),

  logging: z
    .object({
      level: z.enum(['silent', 'error', 'warn', 'info', 'debug', 'trace']).optional(),
      enabled: z.boolean().optional(),
      prettyPrint: z.boolean().optional(),
      context: z.record(z.any()).optional(),
    })
    .optional(),

  // Advanced configuration
  skipPreflight: z.boolean().optional(),
  maxConcurrentRequests: z.number().min(1).optional(),
});

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<LetsBonkConfig> = {
  commitment: 'confirmed',
  finality: 'confirmed',
  programId: new PublicKey('11111111111111111111111111111111'), // Placeholder
  retries: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
  timeouts: {
    connection: 30000,
    transaction: 60000,
    confirmation: 120000,
  },
  logging: (() => {
    // Detect test environment and adjust defaults
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
    return {
      level: isTestEnv ? 'error' : ('info' as const),
      enabled: true,
      prettyPrint: !isTestEnv,
      context: {},
    };
  })(),
  skipPreflight: false,
  maxConcurrentRequests: 10,
};

/**
 * Resolved configuration after applying defaults and validation
 */
export interface ResolvedConfig extends Required<LetsBonkConfig> {
  provider: Provider;
  connection: Connection;
}

/**
 * Configuration manager class
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: ResolvedConfig | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Create configuration from connection and optional config
   */
  static create(connection: Connection, userConfig: LetsBonkConfig = {}): ResolvedConfig {
    const manager = ConfigManager.getInstance();
    return manager.createConfig(connection, userConfig);
  }

  /**
   * Internal method to create and validate configuration
   */
  private createConfig(connection: Connection, userConfig: LetsBonkConfig): ResolvedConfig {
    try {
      // Validate user configuration
      const validatedConfig = this.validateConfig(userConfig);

      // Merge with defaults
      const mergedConfig = this.mergeWithDefaults(validatedConfig);

      // Create provider with dummy wallet for Anchor
      const provider = this.createProvider(connection, mergedConfig);

      // Create final resolved configuration
      const resolvedConfig: ResolvedConfig = {
        ...mergedConfig,
        provider,
        connection,
      };

      // Cache the configuration
      this.config = resolvedConfig;

      return resolvedConfig;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          `Configuration validation failed: ${error.errors.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          'config',
          userConfig,
          error
        );
      }
      throw new ConfigurationError(
        'Failed to create configuration',
        error instanceof Error ? error : new Error(String(error)),
        { userConfig }
      );
    }
  }

  /**
   * Validate user configuration
   */
  private validateConfig(config: LetsBonkConfig): LetsBonkConfig {
    return LetsBonkConfigSchema.parse(config);
  }

  /**
   * Merge user configuration with defaults
   */
  private mergeWithDefaults(config: LetsBonkConfig): Required<LetsBonkConfig> {
    return {
      commitment: config.commitment || DEFAULT_CONFIG.commitment,
      finality: config.finality || DEFAULT_CONFIG.finality,
      programId: config.programId || DEFAULT_CONFIG.programId,
      retries: { ...DEFAULT_CONFIG.retries, ...config.retries },
      timeouts: { ...DEFAULT_CONFIG.timeouts, ...config.timeouts },
      logging: { ...DEFAULT_CONFIG.logging, ...config.logging },
      skipPreflight: config.skipPreflight ?? DEFAULT_CONFIG.skipPreflight,
      maxConcurrentRequests: config.maxConcurrentRequests || DEFAULT_CONFIG.maxConcurrentRequests,
    };
  }

  /**
   * Create provider with dummy wallet for Anchor program initialization
   */
  private createProvider(connection: Connection, config: Required<LetsBonkConfig>): Provider {
    // Create a dummy wallet for read-only operations
    const dummyWallet = {
      publicKey: new PublicKey('11111111111111111111111111111111'),
      signTransaction: () => Promise.reject(new Error('Read-only wallet')),
      signAllTransactions: () => Promise.reject(new Error('Read-only wallet')),
      payer: new PublicKey('11111111111111111111111111111111'),
    } as unknown as Wallet;

    return new AnchorProvider(connection, dummyWallet, {
      commitment: config.commitment,
      skipPreflight: config.skipPreflight,
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): ResolvedConfig | null {
    return this.config;
  }

  /**
   * Reset configuration
   */
  reset(): void {
    this.config = null;
  }
}
