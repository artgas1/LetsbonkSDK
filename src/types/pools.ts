import { PublicKey } from '@solana/web3.js';

/**
 * Curve parameters for token launch
 */
export type CurveParams = {
  variant: number; // 0 = Constant
  supply: bigint;
  totalBaseSell: bigint;
  totalQuoteRaising: bigint;
  migrateType: number;
};

/**
 * Vesting parameters
 */
export type VestingParams = {
  totalLockedAmount: bigint;
  cliffPeriod: bigint;
  unlockPeriod: bigint;
};

/**
 * Launch parameters
 */
export type LaunchParams = {
  name: string;
  symbol: string;
  uri: string;
  decimals?: number;
  supply?: string;
  baseSell?: string;
  quoteRaising?: string;
};

/**
 * Pool status types
 */
export type PoolStatus =
  | {
      trading: {};
    }
  | {
      migrated: {};
    };

/**
 * Trade direction
 */
export type TradeDirection =
  | {
      buy: {};
    }
  | {
      sell: {};
    };

/**
 * Protocol configuration types
 */
export type GlobalConfig = {
  bump: number;
  curveType: number;
  tradeFeeRate: bigint;
  protocolFeeRate: bigint;
  quoteMint: PublicKey;
  protocolFeeOwner: PublicKey;
};

export type PlatformConfig = {
  bump: number;
  name: string;
  web: string;
  img: string;
  feeRate: bigint;
  feeRecipient: PublicKey;
};

/**
 * Pool state
 */
export type PoolState = {
  bump: number;
  baseMint: PublicKey;
  quoteMint: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  creator: PublicKey;
  totalBaseSell: bigint;
  virtualBase: bigint;
  virtualQuote: bigint;
  realBase: bigint;
  realQuote: bigint;
  poolStatus: PoolStatus;
};

/**
 * Trade event
 */
export type TradeEvent = {
  poolState: PublicKey;
  totalBaseSell: bigint;
  virtualBase: bigint;
  virtualQuote: bigint;
  realBaseBefore: bigint;
  realQuoteBefore: bigint;
  realBaseAfter: bigint;
  realQuoteAfter: bigint;
  amountIn: bigint;
  amountOut: bigint;
  protocolFee: bigint;
  platformFee: bigint;
  shareFee: bigint;
  tradeDirection: TradeDirection;
  poolStatus: PoolStatus;
};
