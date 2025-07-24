import { Connection, PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { LetsBonkIDL } from '../IDL';
import { GlobalConfig, PlatformConfig, PoolState } from '../types';
import { WSOL_TOKEN } from '../constants';
import { SDKLogger } from '../core/logger';
import { AccountError, ValidationError, Result, success, failure, tryAsync } from '../core/errors';
import { PDAUtils } from '../shared';
import { isValidPublicKey } from '../utils/validation';

/**
 * Global config fetch options
 */
export interface GlobalConfigOptions {
  quoteMint: PublicKey;
  curveType: number;
  index: number;
}

/**
 * Platform config fetch options
 */
export interface PlatformConfigOptions {
  platformAdmin?: PublicKey;
  index: number;
}

/**
 * Account fetch options (for batch operations)
 */
export interface AccountFetchOptions {
  quoteMint: PublicKey;
  curveType: number;
  index: number;
}

/**
 * Account Manager - Handles all account-related operations
 */
export class AccountManager {
  private logger: SDKLogger;

  constructor(
    private program: Program<LetsBonkIDL>,
    private connection: Connection,
    logger: SDKLogger
  ) {
    this.logger = logger.child({ manager: 'AccountManager' });
  }

  /**
   * Get global configuration account
   */
  async getGlobalConfig(
    quoteMint: PublicKey = WSOL_TOKEN,
    curveType: number = 0,
    index: number = 0
  ): Promise<Result<GlobalConfig, AccountError>> {
    const timer = this.logger.startTimer('getGlobalConfig');

    try {
      this.logger.debug('Fetching global config', {
        quoteMint: quoteMint.toString(),
        curveType,
        index,
      });

      const [globalConfigPDA] = PDAUtils.findGlobalConfig(quoteMint, curveType, index);

      const result = await tryAsync(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.program.account as any).globalConfig.fetch(globalConfigPDA),
        error =>
          new AccountError(
            `Failed to fetch global config: ${error.message}`,
            globalConfigPDA.toString(),
            'GlobalConfig',
            error
          )
      );

      if (!result.success) {
        this.logger.error('Failed to fetch global config', {
          address: globalConfigPDA.toString(),
          error: result.error.message,
        });
        return failure(result.error as AccountError);
      }

      // Note: IDL returns different structure than SDK types - adapt as needed
      const globalConfig = result.data as unknown as GlobalConfig;

      this.logger.info('Global config fetched successfully', {
        address: globalConfigPDA.toString(),
        tradeFeeRate: globalConfig.tradeFeeRate?.toString(),
        protocolFeeRate: globalConfig.protocolFeeRate?.toString(),
      });

      timer.end({ success: true });
      return success(globalConfig);
    } catch (error) {
      const accountError = new AccountError(
        `Unexpected error fetching global config: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'GlobalConfig',
        error instanceof Error ? error : undefined
      );

      this.logger.logError(accountError);
      timer.end({ success: false, error: accountError.message });

      return failure(accountError);
    }
  }

  /**
   * Get platform configuration account
   */
  async getPlatformConfig(
    platformAdmin?: PublicKey,
    index: number = 0
  ): Promise<Result<PlatformConfig, AccountError>> {
    const timer = this.logger.startTimer('getPlatformConfig');

    try {
      this.logger.debug('Fetching platform config', {
        platformAdmin: platformAdmin?.toString(),
        index,
      });

      const [platformConfigPDA] = PDAUtils.findPlatformConfig(platformAdmin);

      const result = await tryAsync(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.program.account as any).platformConfig.fetch(platformConfigPDA),
        error =>
          new AccountError(
            `Failed to fetch platform config: ${error.message}`,
            platformConfigPDA.toString(),
            'PlatformConfig',
            error
          )
      );

      if (!result.success) {
        this.logger.error('Failed to fetch platform config', {
          address: platformConfigPDA.toString(),
          error: result.error.message,
        });
        return failure(result.error as AccountError);
      }

      const platformConfig = result.data as unknown as PlatformConfig;

      this.logger.info('Platform config fetched successfully', {
        address: platformConfigPDA.toString(),
        name: platformConfig.name,
        feeRate: platformConfig.feeRate?.toString(),
      });

      timer.end({ success: true });
      return success(platformConfig);
    } catch (error) {
      const accountError = new AccountError(
        `Unexpected error fetching platform config: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'PlatformConfig',
        error instanceof Error ? error : undefined
      );

      this.logger.logError(accountError);
      timer.end({ success: false, error: accountError.message });

      return failure(accountError);
    }
  }

  /**
   * Get pool state account
   */
  async getPoolState(
    baseMint: PublicKey,
    quoteMint: PublicKey = WSOL_TOKEN
  ): Promise<Result<PoolState | null, AccountError | ValidationError>> {
    const timer = this.logger.startTimer('getPoolState');

    try {
      // Validate inputs
      if (!isValidPublicKey(baseMint)) {
        const validationError = new ValidationError(
          'Invalid base mint provided',
          'baseMint',
          baseMint
        );
        this.logger.error('Invalid base mint', { baseMint: baseMint.toString() });
        return failure(validationError);
      }

      this.logger.debug('Fetching pool state', {
        baseMint: baseMint.toString(),
        quoteMint: quoteMint.toString(),
      });

      const [poolStatePDA] = PDAUtils.findPoolState(baseMint, quoteMint);

      const result = await tryAsync(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.program.account as any).poolState.fetch(poolStatePDA),
        error =>
          new AccountError(
            `Failed to fetch pool state: ${error.message}`,
            poolStatePDA.toString(),
            'PoolState',
            error
          )
      );

      if (!result.success) {
        // Check if it's a "not found" error vs a real error
        if (result.error.message.includes('Account does not exist')) {
          this.logger.debug('Pool state not found (not initialized)', {
            poolAddress: poolStatePDA.toString(),
          });
          timer.end({ success: true, found: false });
          return success(null);
        }

        this.logger.error('Failed to fetch pool state', {
          poolAddress: poolStatePDA.toString(),
          error: result.error.message,
        });
        return failure(result.error as AccountError);
      }

      const poolState = result.data as unknown as PoolState;

      this.logger.info('Pool state fetched successfully', {
        poolAddress: poolStatePDA.toString(),
        baseMint: poolState.baseMint.toString(),
        quoteMint: poolState.quoteMint.toString(),
        realBase: poolState.realBase?.toString(),
        realQuote: poolState.realQuote?.toString(),
      });

      timer.end({ success: true, found: true });
      return success(poolState);
    } catch (error) {
      const accountError = new AccountError(
        `Unexpected error fetching pool state: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'PoolState',
        error instanceof Error ? error : undefined
      );

      this.logger.logError(accountError);
      timer.end({ success: false, error: accountError.message });

      return failure(accountError);
    }
  }

  /**
   * Check if pool exists
   */
  async poolExists(
    baseMint: PublicKey,
    quoteMint: PublicKey = WSOL_TOKEN
  ): Promise<Result<boolean, AccountError | ValidationError>> {
    const result = await this.getPoolState(baseMint, quoteMint);

    if (!result.success) {
      return result;
    }

    return success(result.data !== null);
  }

  /**
   * Get multiple account states in parallel
   */
  async getMultipleAccountStates(
    requests: {
      address: PublicKey;
      type: 'GlobalConfig' | 'PlatformConfig' | 'PoolState';
    }[]
  ): Promise<Result<unknown[], AccountError>> {
    const timer = this.logger.startTimer('getMultipleAccountStates');

    try {
      this.logger.debug('Fetching multiple account states', {
        accountCount: requests.length,
      });

      const promises = requests.map(async ({ address, type }) => {
        try {
          let account;
          switch (type) {
            case 'GlobalConfig':
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              account = await (this.program.account as any).globalConfig.fetch(address);
              break;
            case 'PlatformConfig':
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              account = await (this.program.account as any).platformConfig.fetch(address);
              break;
            case 'PoolState':
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              account = await (this.program.account as any).poolState.fetch(address);
              break;
            default:
              throw new Error(`Unknown account type: ${type}`);
          }
          return { address, type, data: account, success: true };
        } catch (error) {
          return {
            address,
            type,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          };
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;

      this.logger.info('Multiple account states fetched', {
        total: requests.length,
        successful: successCount,
        failed: requests.length - successCount,
      });

      timer.end({ success: true });
      return success(results);
    } catch (error) {
      const accountError = new AccountError(
        `Unexpected error fetching multiple account states: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'MultipleAccounts',
        error instanceof Error ? error : undefined
      );

      this.logger.logError(accountError);
      timer.end({ success: false, error: accountError.message });

      return failure(accountError);
    }
  }
}
