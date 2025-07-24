import { Connection, PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { LetsBonkIDL } from '../IDL';
import { SlippageResult } from '../types';
import { SDKLogger } from '../core/logger';
import {
  calculateSlippageBuy,
  calculateSlippageSell,
  calculateTokensReceive,
} from '../utils/calculation';
import { PDAUtils } from '../shared';

/**
 * Pool Manager - Handles pool-specific operations
 */
export class PoolManager {
  private logger: SDKLogger;

  constructor(
    private program: Program<LetsBonkIDL>,
    private connection: Connection,
    logger: SDKLogger
  ) {
    this.logger = logger.child({ manager: 'PoolManager' });
  }

  /**
   * Calculate slippage for buy operations
   */
  calculateBuySlippage(amountIn: bigint, slippageBasisPoints: bigint = 500n): SlippageResult {
    this.logger.debug('Calculating buy slippage', {
      amountIn: amountIn.toString(),
      slippageBasisPoints: slippageBasisPoints.toString(),
    });

    const minimumAmountOut = calculateSlippageBuy(amountIn, slippageBasisPoints);
    const priceImpact = Number(slippageBasisPoints) / 10000; // Convert basis points to decimal
    const effectivePrice = Number(amountIn) / Number(minimumAmountOut);

    return {
      minimumAmountOut,
      priceImpact,
      effectivePrice,
    };
  }

  /**
   * Calculate slippage for sell operations
   */
  calculateSellSlippage(amountIn: bigint, slippageBasisPoints: bigint = 500n): SlippageResult {
    this.logger.debug('Calculating sell slippage', {
      amountIn: amountIn.toString(),
      slippageBasisPoints: slippageBasisPoints.toString(),
    });

    const minimumAmountOut = calculateSlippageSell(amountIn, slippageBasisPoints);
    const priceImpact = Number(slippageBasisPoints) / 10000; // Convert basis points to decimal
    const effectivePrice = Number(amountIn) / Number(minimumAmountOut);

    return {
      minimumAmountOut,
      priceImpact,
      effectivePrice,
    };
  }

  /**
   * Calculate tokens received for SOL amount
   */
  calculateTokensForSOL(solAmount: number, previousSol: number = 30, slippage: number = 5) {
    this.logger.debug('Calculating tokens for SOL', {
      solAmount,
      previousSol,
      slippage,
    });

    return calculateTokensReceive(solAmount, previousSol, slippage);
  }

  /**
   * Get pool PDAs
   */
  getPoolPDAs(baseMint: PublicKey, quoteMint: PublicKey) {
    this.logger.debug('Getting pool PDAs', {
      baseMint: baseMint.toString(),
      quoteMint: quoteMint.toString(),
    });

    return PDAUtils.deriveAll(baseMint, quoteMint);
  }
}
