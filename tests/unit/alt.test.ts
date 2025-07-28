import { PublicKey } from '@solana/web3.js';
import { getAltAccountPublicKey } from '../../src/utils/transaction';
import { ALT_ACCOUNT_ADDRESS } from '../../src/constants';

describe('ALT Utilities', () => {
  describe('ALT_ACCOUNT_ADDRESS constant', () => {
    it('should be a valid Solana address', () => {
      expect(ALT_ACCOUNT_ADDRESS).toBe('AcL1Vo8oy1ULiavEcjSUcwfBSForXMudcZvDZy5nzJkU');
      expect(ALT_ACCOUNT_ADDRESS).toHaveLength(44); // Standard Solana address length
      
      // Should be able to create a PublicKey from it
      expect(() => new PublicKey(ALT_ACCOUNT_ADDRESS)).not.toThrow();
    });

    it('should be a valid PublicKey format', () => {
      const pubkey = new PublicKey(ALT_ACCOUNT_ADDRESS);
      expect(pubkey.toString()).toBe(ALT_ACCOUNT_ADDRESS);
      expect(pubkey.toBuffer()).toBeDefined();
      expect(pubkey.toBuffer().length).toBe(32);
    });
  });

  describe('getAltAccountPublicKey', () => {
    it('should return a PublicKey instance', () => {
      const altPubkey = getAltAccountPublicKey();
      
      expect(altPubkey).toBeInstanceOf(PublicKey);
      expect(altPubkey.toString()).toBe(ALT_ACCOUNT_ADDRESS);
    });

    it('should return the same PublicKey on multiple calls', () => {
      const altPubkey1 = getAltAccountPublicKey();
      const altPubkey2 = getAltAccountPublicKey();
      
      expect(altPubkey1.toString()).toBe(altPubkey2.toString());
      expect(altPubkey1.equals(altPubkey2)).toBe(true);
    });

    it('should return a valid base58 encoded public key', () => {
      const altPubkey = getAltAccountPublicKey();
      const base58String = altPubkey.toString();
      
      // Should be valid base58 and proper length
      expect(base58String).toMatch(/^[1-9A-HJ-NP-Za-km-z]{43,44}$/);
      expect(base58String).toBe(ALT_ACCOUNT_ADDRESS);
    });
  });

  describe('ALT Integration with VersionedTransaction', () => {
    it('should handle ALT address correctly in transaction context', () => {
      const altPubkey = getAltAccountPublicKey();
      
      // Verify the ALT address is consistent
      expect(altPubkey.toString()).toBe(ALT_ACCOUNT_ADDRESS);
      
      // Verify it can be used in transaction contexts
      expect(altPubkey.toBuffer()).toHaveLength(32);
      expect(altPubkey.toBase58()).toBe(ALT_ACCOUNT_ADDRESS);
    });

    it('should maintain ALT address immutability', () => {
      const altPubkey1 = getAltAccountPublicKey();
      const altPubkey2 = getAltAccountPublicKey();
      
      // Should return equivalent but potentially different instances
      expect(altPubkey1.equals(altPubkey2)).toBe(true);
      expect(altPubkey1.toString()).toBe(altPubkey2.toString());
    });
  });

  describe('ALT Address Validation', () => {
    it('should have the correct ALT address format', () => {
      // Verify this is a real Solana address format
      const altAddress = ALT_ACCOUNT_ADDRESS;
      
      // Length check (Solana addresses are 32 bytes = 44 base58 chars)
      expect(altAddress.length).toBe(44);
      
      // Character set check (base58)
      expect(altAddress).toMatch(/^[1-9A-HJ-NP-Za-km-z]+$/);
      
      // Should not contain confusing characters (0, O, I, l)
      expect(altAddress).not.toMatch(/[0OIl]/);
    });

    it('should create consistent PublicKey instances', () => {
      const pubkey1 = new PublicKey(ALT_ACCOUNT_ADDRESS);
      const pubkey2 = getAltAccountPublicKey();
      const pubkey3 = new PublicKey(ALT_ACCOUNT_ADDRESS);
      
      expect(pubkey1.equals(pubkey2)).toBe(true);
      expect(pubkey1.equals(pubkey3)).toBe(true);
      expect(pubkey2.equals(pubkey3)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle ALT address parsing correctly', () => {
      // This should not throw
      expect(() => {
        const pubkey = getAltAccountPublicKey();
        pubkey.toString();
        pubkey.toBuffer();
        pubkey.toBase58();
      }).not.toThrow();
    });

    it('should maintain consistency across multiple calls', () => {
      const addresses = Array.from({ length: 10 }, () => getAltAccountPublicKey().toString());
      const uniqueAddresses = new Set(addresses);
      
      // All calls should return the same address
      expect(uniqueAddresses.size).toBe(1);
      expect(uniqueAddresses.has(ALT_ACCOUNT_ADDRESS)).toBe(true);
    });
  });
}); 