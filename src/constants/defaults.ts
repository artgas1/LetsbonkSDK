/**
 * Default configuration values
 */
export const DEFAULT_COMMITMENT = 'confirmed' as const;
export const DEFAULT_FINALITY = 'confirmed' as const;
export const DEFAULT_SLIPPAGE_BASIS_POINTS = 500n; // 5%
export const DEFAULT_SHARE_FEE_RATE = 0; // 0% - No share fee by default
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_TIMEOUT_MS = 60000; // 60 seconds

/**
 * Alt account for transaction tracking
 */
export const ALT_ACCOUNT_ADDRESS = 'AcL1Vo8oy1ULiavEcjSUcwfBSForXMudcZvDZy5nzJkU';

/**
 * Decimals
 */
export const TOKEN_DECIMAL = 6;
export const SOL_DECIMAL = 9;

/**
 * Compute budget settings
 */
export const UNIT_PRICE = 2_500_000;
export const UNIT_BUDGET = 400_000;

/**
 * Default launch parameters
 */
export const DEFAULT_SUPPLY = '1000000000000000'; // 1 quadrillion
export const DEFAULT_BASE_SELL = '793100000000000'; // 79.31% of supply
export const DEFAULT_QUOTE_RAISING = '85000000000'; // 85 SOL

/**
 * SDK version
 */
export const SDK_VERSION = '2.0.0';
export const SDK_NAME = 'LetsBonkSDK';
