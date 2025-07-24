import { SlippageResult } from '../types';

/**
 * Calculate tokens to receive based on SOL amount (from bonk-mcp)
 */
export function calculateTokensReceive(
  solAmount: number,
  previousSol: number = 30,
  slippage: number = 5
): { tokenAmount: number; priceImpact: number } {
  // Based on bonk-mcp implementation
  const k = 1073000000 * previousSol;
  const newSol = previousSol + solAmount;
  const newTokens = k / newSol;
  const tokenAmount = 1073000000 - newTokens;

  // Apply slippage
  const slippageFactor = (100 - slippage) / 100;
  const adjustedTokenAmount = tokenAmount * slippageFactor;

  // Calculate price impact
  const priceImpact = (solAmount / previousSol) * 100;

  return {
    tokenAmount: adjustedTokenAmount,
    priceImpact,
  };
}

/**
 * Calculate slippage for buy operations
 */
export function calculateSlippageBuy(amount: bigint, slippageBasisPoints: bigint): bigint {
  return amount - (amount * slippageBasisPoints) / 10000n;
}

/**
 * Calculate slippage for sell operations
 */
export function calculateSlippageSell(amount: bigint, slippageBasisPoints: bigint): bigint {
  return amount - (amount * slippageBasisPoints) / 10000n;
}

/**
 * Calculate minimum amount out with slippage
 */
export function calculateMinimumAmountOut(
  expectedAmount: bigint,
  slippageBasisPoints: bigint
): SlippageResult {
  const minimumAmountOut = calculateSlippageSell(expectedAmount, slippageBasisPoints);
  const priceImpact = Number(slippageBasisPoints) / 100; // Convert basis points to percentage
  const effectivePrice = Number(expectedAmount) / Number(minimumAmountOut);

  return {
    minimumAmountOut,
    priceImpact,
    effectivePrice,
  };
}
