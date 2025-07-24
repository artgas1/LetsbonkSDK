import { PublicKey } from '@solana/web3.js';
import { LETSBONK_PROGRAM_ID, WSOL_TOKEN, METAPLEX_PROGRAM, PLATFORM_ADMIN } from '../constants';
import {
  VAULT_AUTH_SEED,
  POOL_SEED,
  POOL_VAULT_SEED,
  POOL_VESTING_SEED,
  METADATA_SEED,
  EVENT_AUTHORITY_SEED,
  GLOBAL_CONFIG_SEED,
  PLATFORM_CONFIG_SEED,
} from '../constants';

export interface PDABundle {
  poolState: PublicKey;
  baseVault: PublicKey;
  quoteVault: PublicKey;
  metadata: PublicKey;
  authority: PublicKey;
}

/**
 * Centralized PDA utilities class to eliminate duplicate PDA finding logic
 */
export class PDAUtils {
  private static readonly DEFAULT_PROGRAM_ID = LETSBONK_PROGRAM_ID;
  private static readonly DEFAULT_QUOTE_MINT = WSOL_TOKEN;
  private static readonly DEFAULT_METAPLEX_PROGRAM = METAPLEX_PROGRAM;
  private static readonly DEFAULT_PLATFORM_ADMIN = PLATFORM_ADMIN;

  /**
   * Find the vault authority PDA
   */
  static findVaultAuthority(
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([VAULT_AUTH_SEED], programId);
  }

  /**
   * Find the pool state PDA for given base and quote mints
   */
  static findPoolState(
    baseMint: PublicKey,
    quoteMint: PublicKey = PDAUtils.DEFAULT_QUOTE_MINT,
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [POOL_SEED, baseMint.toBuffer(), quoteMint.toBuffer()],
      programId
    );
  }

  /**
   * Find the base vault PDA for a pool
   */
  static findBaseVault(
    poolState: PublicKey,
    baseMint: PublicKey,
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [POOL_VAULT_SEED, poolState.toBuffer(), baseMint.toBuffer()],
      programId
    );
  }

  /**
   * Find the quote vault PDA for a pool
   */
  static findQuoteVault(
    poolState: PublicKey,
    quoteMint: PublicKey,
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [POOL_VAULT_SEED, poolState.toBuffer(), quoteMint.toBuffer()],
      programId
    );
  }

  /**
   * Find the vesting record PDA for a pool and beneficiary
   */
  static findVestingRecord(
    poolState: PublicKey,
    beneficiary: PublicKey,
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [POOL_VESTING_SEED, poolState.toBuffer(), beneficiary.toBuffer()],
      programId
    );
  }

  /**
   * Find the metadata PDA for a token
   */
  static findMetadata(
    mint: PublicKey,
    programId: PublicKey = PDAUtils.DEFAULT_METAPLEX_PROGRAM
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [METADATA_SEED, programId.toBuffer(), mint.toBuffer()],
      programId
    );
  }

  /**
   * Find the event authority PDA
   */
  static findEventAuthority(
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync([EVENT_AUTHORITY_SEED], programId);
  }

  /**
   * Find the global config PDA
   */
  static findGlobalConfig(
    quoteMint: PublicKey = PDAUtils.DEFAULT_QUOTE_MINT,
    curveType: number = 0,
    index: number = 0,
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): [PublicKey, number] {
    const curveTypeBuffer = Buffer.alloc(1);
    curveTypeBuffer.writeUInt8(curveType, 0);

    const indexBuffer = Buffer.alloc(2);
    indexBuffer.writeUInt16LE(index, 0);

    return PublicKey.findProgramAddressSync(
      [GLOBAL_CONFIG_SEED, quoteMint.toBuffer(), curveTypeBuffer, indexBuffer],
      programId
    );
  }

  /**
   * Find the platform config PDA
   */
  static findPlatformConfig(
    platformAdmin: PublicKey = PDAUtils.DEFAULT_PLATFORM_ADMIN,
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [PLATFORM_CONFIG_SEED, platformAdmin.toBuffer()],
      programId
    );
  }

  /**
   * Derive all PDAs for a given mint in one call
   */
  static deriveAll(
    mint: PublicKey,
    quoteMint: PublicKey = PDAUtils.DEFAULT_QUOTE_MINT,
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ): PDABundle {
    const [poolState] = PDAUtils.findPoolState(mint, quoteMint, programId);
    const [baseVault] = PDAUtils.findBaseVault(poolState, mint, programId);
    const [quoteVault] = PDAUtils.findQuoteVault(poolState, quoteMint, programId);
    const [metadata] = PDAUtils.findMetadata(mint);
    const [authority] = PDAUtils.findVaultAuthority(programId);

    return {
      poolState,
      baseVault,
      quoteVault,
      metadata,
      authority,
    };
  }

  /**
   * Get all required PDAs for trading operations
   */
  static forTrading(
    baseMint: PublicKey,
    quoteMint: PublicKey = PDAUtils.DEFAULT_QUOTE_MINT,
    programId: PublicKey = PDAUtils.DEFAULT_PROGRAM_ID
  ) {
    const core = PDAUtils.deriveAll(baseMint, quoteMint, programId);
    const [globalConfig] = PDAUtils.findGlobalConfig(quoteMint, 0, 0, programId);
    const [platformConfig] = PDAUtils.findPlatformConfig(
      PDAUtils.DEFAULT_PLATFORM_ADMIN,
      programId
    );
    const [eventAuthority] = PDAUtils.findEventAuthority(programId);

    return {
      ...core,
      globalConfig,
      platformConfig,
      eventAuthority,
    };
  }
}
