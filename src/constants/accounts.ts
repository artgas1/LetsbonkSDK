import { Buffer } from 'buffer';

/**
 * Account sizes (in bytes)
 */
export const GLOBAL_CONFIG_SIZE = 64;
export const PLATFORM_CONFIG_SIZE = 64;
export const POOL_STATE_SIZE = 256;

/**
 * PDA seeds - Exact byte arrays from IDL
 */
export const VAULT_AUTH_SEED = Buffer.from('vault_auth_seed');
export const EVENT_AUTHORITY_SEED = Buffer.from('__event_authority');
export const GLOBAL_CONFIG_SEED = Buffer.from('global_config');
export const PLATFORM_CONFIG_SEED = Buffer.from('platform_config');
export const POOL_SEED = Buffer.from('pool');
export const POOL_VAULT_SEED = Buffer.from('pool_vault');
export const POOL_VESTING_SEED = Buffer.from('pool_vesting');
export const METADATA_SEED = Buffer.from('metadata');

/**
 * PDA seeds (legacy string format)
 */
export const PDA_SEEDS = {
  GLOBAL_CONFIG: 'global_config',
  PLATFORM_CONFIG: 'platform_config',
  POOL_STATE: 'pool_state',
  BASE_VAULT: 'base_vault',
  QUOTE_VAULT: 'quote_vault',
  VAULT_AUTHORITY: 'vault_authority',
  EVENT_AUTHORITY: 'event_authority',
} as const;

/**
 * Instruction discriminators (from IDL)
 */
export const INITIALIZE_DISCRIMINATOR = 'afaf6d1f0d989bed'; // initialize instruction
export const BUY_EXACT_IN_DISCRIMINATOR = 'faea0d7bd59c13ec'; // buyExactIn instruction
export const SELL_EXACT_IN_DISCRIMINATOR = '9527de9bd37c981a'; // sellExactIn instruction
