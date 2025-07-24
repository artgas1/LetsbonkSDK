/**
 * Network endpoints
 */
export const MAINNET_ENDPOINT = 'https://api.mainnet-beta.solana.com';
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';
export const TESTNET_ENDPOINT = 'https://api.testnet.solana.com';
export const LOCALNET_ENDPOINT = 'http://localhost:8899';

/**
 * Error codes
 */
export const ERROR_CODES = {
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  ACCOUNT_ERROR: 'ACCOUNT_ERROR',
  PROGRAM_ERROR: 'PROGRAM_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const;

/**
 * Log levels
 */
export const LOG_LEVEL_NAMES = {
  SILENT: 'silent',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
} as const;

/**
 * Event names
 */
export const EVENT_NAMES = {
  // Configuration events
  CONFIG_CREATED: 'config:created',
  CONFIG_UPDATED: 'config:updated',

  // Transaction events
  TRANSACTION_BUILDING: 'transaction:building',
  TRANSACTION_BUILT: 'transaction:built',
  TRANSACTION_SIGNING: 'transaction:signing',
  TRANSACTION_SENDING: 'transaction:sending',
  TRANSACTION_SENT: 'transaction:sent',
  TRANSACTION_CONFIRMING: 'transaction:confirming',
  TRANSACTION_CONFIRMED: 'transaction:confirmed',
  TRANSACTION_FAILED: 'transaction:failed',

  // Trade events
  TRADE_BUY_STARTED: 'trade:buy_started',
  TRADE_BUY_COMPLETED: 'trade:buy_completed',
  TRADE_SELL_STARTED: 'trade:sell_started',
  TRADE_SELL_COMPLETED: 'trade:sell_completed',

  // Pool events
  POOL_INITIALIZING: 'pool:initializing',
  POOL_INITIALIZED: 'pool:initialized',
  POOL_STATE_FETCHED: 'pool:state_fetched',

  // Account events
  ACCOUNT_CREATED: 'account:created',
  ACCOUNT_FETCHED: 'account:fetched',

  // Metadata events
  METADATA_UPLOADING: 'metadata:uploading',
  METADATA_UPLOADED: 'metadata:uploaded',

  // Error events
  ERROR: 'error',

  // Performance events
  PERFORMANCE_MEASUREMENT: 'performance:measurement',
} as const;
