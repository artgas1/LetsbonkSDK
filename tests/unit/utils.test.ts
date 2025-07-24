// Handle BigInt serialization for Jest workers
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

import { describe, test, expect, beforeEach } from '@jest/globals';
import { PublicKey } from '@solana/web3.js';
import {
  calculateSlippageBuy,
  calculateSlippageSell,
  basisPointsToPercentage,
  percentageToBasisPoints,
  isValidPublicKey,
  sleep,
  retryWithBackoff,
} from '../../src/utils';
import { PDAUtils } from '../../src/shared';
import { WSOL_TOKEN } from '../../src/constants';

describe('Utils', () => {
  const mockProgramId = new PublicKey('11111111111111111111111111111112');
  const mockBaseMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  const mockQuoteMint = WSOL_TOKEN;

  describe('PDA derivation functions', () => {
    test('findVaultAuthorityPDA should derive correct PDA', () => {
      const [pda, bump] = PDAUtils.findVaultAuthority(mockProgramId);
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    test('findGlobalConfigPDA should derive correct PDA', () => {
      const quoteMint = new PublicKey('So11111111111111111111111111111111111111112');
      const [pda, bump] = PDAUtils.findGlobalConfig(quoteMint, 0, 0);
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    test('findPlatformConfigPDA should derive correct PDA', () => {
      const [pda, bump] = PDAUtils.findPlatformConfig();
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    test('findPoolStatePDA should derive correct PDA', () => {
      const baseMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      const quoteMint = new PublicKey('So11111111111111111111111111111111111111112');
      const [pda, bump] = PDAUtils.findPoolState(baseMint, quoteMint);
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
      expect(bump).toBeGreaterThanOrEqual(0);
      expect(bump).toBeLessThanOrEqual(255);
    });

    test('findBaseVaultPDA should derive correct PDA', () => {
      const poolState = new PublicKey('11111111111111111111111111111113');
      const [pda, bump] = PDAUtils.findBaseVault(poolState, mockBaseMint, mockProgramId);
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
    });

    test('findQuoteVaultPDA should derive correct PDA', () => {
      const poolState = new PublicKey('11111111111111111111111111111113');
      const [pda, bump] = PDAUtils.findQuoteVault(poolState, mockQuoteMint, mockProgramId);
      
      expect(pda).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
    });

    test('deriveAllPDAs should return all PDAs', () => {
      const pdas = PDAUtils.deriveAll(mockBaseMint, mockQuoteMint, mockProgramId);
      
      expect(pdas).toHaveProperty('authority');
      expect(pdas).toHaveProperty('poolState');
      expect(pdas).toHaveProperty('metadata');
      expect(pdas).toHaveProperty('baseVault');
      expect(pdas).toHaveProperty('quoteVault');
      
      // All should be PublicKey instances
      Object.values(pdas).forEach(pda => {
        expect(pda).toBeInstanceOf(PublicKey);
      });
    });
  });

  describe('Slippage calculations', () => {
    test('calculateSlippageBuy should calculate minimum amount out correctly', () => {
      const expectedAmount = BigInt(1000000);
      const slippageBps = BigInt(500); // 5%
      
      const result = calculateSlippageBuy(expectedAmount, slippageBps);
      
      expect(Number(result)).toBe(950000); // 1000000 - 5% = 950000
    });

    test('calculateSlippageBuy should handle zero slippage', () => {
      const expectedAmount = BigInt(1000000);
      const slippageBps = BigInt(0);
      
      const result = calculateSlippageBuy(expectedAmount, slippageBps);
      
      expect(Number(result)).toBe(1000000);
    });

    test('calculateSlippageSell should calculate minimum amount out correctly', () => {
      const expectedAmount = BigInt(1000000);
      const slippageBps = BigInt(500); // 5%
      
      const result = calculateSlippageSell(expectedAmount, slippageBps);
      
      expect(Number(result)).toBe(950000); // 1000000 - 5% = 950000
    });

    test('calculateSlippageSell should handle high slippage', () => {
      const expectedAmount = BigInt(1000000);
      const slippageBps = BigInt(1000); // 10%
      
      const result = calculateSlippageSell(expectedAmount, slippageBps);
      
      expect(Number(result)).toBe(900000); // 1000000 - 10% = 900000
    });
  });

  describe('Percentage/basis points conversion', () => {
    test('basisPointsToPercentage should convert correctly', () => {
      expect(basisPointsToPercentage(BigInt(100))).toBe(1); // 100 bps = 1%
      expect(basisPointsToPercentage(BigInt(500))).toBe(5); // 500 bps = 5%
      expect(basisPointsToPercentage(BigInt(1000))).toBe(10); // 1000 bps = 10%
      expect(basisPointsToPercentage(BigInt(0))).toBe(0); // 0 bps = 0%
    });

    test('percentageToBasisPoints should convert correctly', () => {
      expect(Number(percentageToBasisPoints(1))).toBe(100); // 1% = 100 bps
      expect(Number(percentageToBasisPoints(5))).toBe(500); // 5% = 500 bps
      expect(Number(percentageToBasisPoints(10))).toBe(1000); // 10% = 1000 bps
      expect(Number(percentageToBasisPoints(0))).toBe(0); // 0% = 0 bps
    });

    test('conversion functions should be reversible', () => {
      const percentage = 7.5;
      const basisPoints = percentageToBasisPoints(percentage);
      const backToPercentage = basisPointsToPercentage(basisPoints);
      
      expect(backToPercentage).toBe(percentage);
    });
  });

  describe('Validation functions', () => {
    test('isValidPublicKey should validate public keys correctly', () => {
      // Valid public key (not system program)
      const validKey = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      expect(isValidPublicKey(validKey)).toBe(true);
      
      // Invalid public key (system program - all zeros)
      const systemProgram = new PublicKey('11111111111111111111111111111111');
      expect(isValidPublicKey(systemProgram)).toBe(false);
    });
  });

  describe('Utility functions', () => {
    test('sleep should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });

    test('retryWithBackoff should retry on failure', async () => {
      let attempts = 0;
      const failingFunction = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await retryWithBackoff(failingFunction, 3, 10);
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
      expect(failingFunction).toHaveBeenCalledTimes(3);
    });

    test('retryWithBackoff should throw after max retries', async () => {
      const alwaysFailingFunction = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryWithBackoff(alwaysFailingFunction, 2, 10)).rejects.toThrow('Always fails');
      expect(alwaysFailingFunction).toHaveBeenCalledTimes(2);
    });

    test('retryWithBackoff should return immediately on success', async () => {
      const successFunction = jest.fn().mockResolvedValue('immediate success');

      const result = await retryWithBackoff(successFunction, 3, 10);
      
      expect(result).toBe('immediate success');
      expect(successFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    test('PDA derivation should handle different program IDs', () => {
      const programId1 = new PublicKey('11111111111111111111111111111112');
      const programId2 = new PublicKey('11111111111111111111111111111113');
      
      const [pda1] = PDAUtils.findVaultAuthority(programId1);
      const [pda2] = PDAUtils.findVaultAuthority(programId2);
      
      expect(pda1.toString()).not.toBe(pda2.toString());
    });

    test('slippage calculation should handle large amounts', () => {
      const largeAmount = BigInt('18446744073709551615'); // Max u64
      const slippageBps = BigInt(100); // 1%
      
      const result = calculateSlippageBuy(largeAmount, slippageBps);
      
      // Should not overflow and should be less than original
      expect(Number(result) < Number(largeAmount)).toBe(true);
    });
  });
}); 