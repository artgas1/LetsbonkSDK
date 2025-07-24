import {
  Connection,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { BN } from 'bn.js';
import { LetsBonkIDL, IDL } from '../IDL/';
import { PDAUtils } from '../shared';
import {
  WSOL_TOKEN,
  LETSBONK_PROGRAM_ID,
  METAPLEX_PROGRAM,
  RENT_SYSVAR,
  DEFAULT_SUPPLY,
  DEFAULT_BASE_SELL,
  DEFAULT_QUOTE_RAISING,
} from '../constants';

/**
 * Create an Anchor-generated initialize instruction
 * This provides better type safety and follows Anchor patterns
 */
export async function createAnchorInitializeInstruction(
  connection: Connection,
  payer: PublicKey,
  creator: PublicKey,
  baseMint: PublicKey,
  metadataUri: string,
  name: string,
  symbol: string,
  decimals: number = 6,
  supply: string = DEFAULT_SUPPLY,
  baseSell: string = DEFAULT_BASE_SELL,
  quoteRaising: string = DEFAULT_QUOTE_RAISING
): Promise<TransactionInstruction> {
  // Create a minimal provider for instruction building
  const mockWallet = {
    publicKey: payer,
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => tx,
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(
      txs: T[]
    ): Promise<T[]> => txs,
  } as Wallet;

  const provider = new AnchorProvider(connection, mockWallet, {});

  const program = new Program(IDL as LetsBonkIDL, provider);

  // Derive required PDAs
  const quoteMint = WSOL_TOKEN;
  const [authority] = PDAUtils.findVaultAuthority(LETSBONK_PROGRAM_ID);
  const [globalConfigPDA] = PDAUtils.findGlobalConfig();
  const [platformConfig] = PDAUtils.findPlatformConfig();
  const [eventAuthority] = PDAUtils.findEventAuthority(LETSBONK_PROGRAM_ID);

  const pdas = PDAUtils.deriveAll(baseMint, quoteMint);

  // Create mint params
  const baseMintParam = {
    decimals,
    name,
    symbol,
    uri: metadataUri,
  };

  // Create curve params
  const curveParam = {
    constant: {
      data: {
        supply: new BN(supply),
        totalBaseSell: new BN(baseSell),
        totalQuoteFundRaising: new BN(quoteRaising),
        migrateType: 1,
      },
    },
  };

  // Create vesting params
  const vestingParam = {
    totalLockedAmount: new BN(0),
    cliffPeriod: new BN(0),
    unlockPeriod: new BN(0),
  };

  return await program.methods
    .initialize(baseMintParam, curveParam, vestingParam)
    .accountsPartial({
      payer,
      creator,
      globalConfig: globalConfigPDA,
      platformConfig,
      authority,
      poolState: pdas.poolState,
      baseMint,
      quoteMint,
      baseVault: pdas.baseVault,
      quoteVault: pdas.quoteVault,
      metadataAccount: pdas.metadata,
      baseTokenProgram: TOKEN_PROGRAM_ID,
      quoteTokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      tokenMetadataProgram: METAPLEX_PROGRAM,
      rent: RENT_SYSVAR,
      eventAuthority,
      program: LETSBONK_PROGRAM_ID,
    })
    .instruction();
}
