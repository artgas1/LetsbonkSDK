import { describe, test, expect } from '@jest/globals';
import { LetsBonkSDK } from '../../src/letsbonk-sdk';
import { PDAUtils } from '../../src/shared';
import { LETSBONK_PROGRAM_ID, WSOL_TOKEN } from '../../src/constants';
import { PublicKey } from '@solana/web3.js';

describe('LetsBonkSDK Integration', () => {
  describe('Exports', () => {
    test('should export main SDK class', () => {
      expect(LetsBonkSDK).toBeDefined();
      expect(typeof LetsBonkSDK).toBe('function');
    });

    test('should export utility functions', () => {
      expect(PDAUtils.findVaultAuthority).toBeDefined();
      expect(typeof PDAUtils.findVaultAuthority).toBe('function');
    });

    test('should export constants', () => {
      expect(LETSBONK_PROGRAM_ID).toBeDefined();
      expect(WSOL_TOKEN).toBeDefined();
      expect(LETSBONK_PROGRAM_ID).toBeInstanceOf(PublicKey);
      expect(WSOL_TOKEN).toBeInstanceOf(PublicKey);
    });
  });
}); 