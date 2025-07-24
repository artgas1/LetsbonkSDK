/**
 * Trading constants
 */
export const MIN_SOL_AMOUNT = 0.001; // Minimum SOL amount for transactions
export const MAX_SLIPPAGE_BASIS_POINTS = 5000n; // 50% maximum slippage
export const DEFAULT_PRIORITY_FEE = 5000; // 5000 micro-lamports

/**
 * Pool constants
 */
export const INITIAL_VIRTUAL_BASE_RESERVES = 1073000000n; // 1.073 billion tokens
export const INITIAL_VIRTUAL_QUOTE_RESERVES = 30000000000n; // 30 SOL
export const INITIAL_REAL_BASE_RESERVES = 0n;
export const INITIAL_REAL_QUOTE_RESERVES = 0n;

/**
 * Fee constants
 */
export const PLATFORM_FEE_BASIS_POINTS = 100n; // 1%
export const PROTOCOL_FEE_BASIS_POINTS = 25n; // 0.25%
