import { PublicKey, TransactionInstruction, AccountMeta, Keypair } from '@solana/web3.js';
import {
  LETSBONK_PROGRAM_ID,
  WSOL_TOKEN,
  TOKEN_PROGRAM_ID,
  METAPLEX_PROGRAM,
  SYSTEM_PROGRAM_ID,
  RENT_SYSVAR,
  INITIALIZE_DISCRIMINATOR,
  DEFAULT_SUPPLY,
  DEFAULT_BASE_SELL,
  DEFAULT_QUOTE_RAISING,
} from '../constants';
import { bufferFromString } from '../utils/formatting';
import { PDAUtils } from '../shared';

/**
 * Create a launch instruction for a new token on Raydium Launchpad
 * Based on bonk-mcp create_launch_instruction
 */
export function buildLaunchInstruction(params: {
  mintKeypair: Keypair;
  payerKeypair: Keypair;
  poolStatePDA: PublicKey;
  baseVaultPDA: PublicKey;
  quoteVaultPDA: PublicKey;
  metadataPDA: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  decimals?: number;
  supply?: string;
  baseSell?: string;
  quoteRaising?: string;
}): TransactionInstruction {
  const {
    mintKeypair,
    payerKeypair,
    poolStatePDA,
    baseVaultPDA,
    quoteVaultPDA,
    metadataPDA,
    name,
    symbol,
    uri,
    decimals = 6,
    supply = DEFAULT_SUPPLY,
    baseSell = DEFAULT_BASE_SELL,
    quoteRaising = DEFAULT_QUOTE_RAISING,
  } = params;

  // Serialize mint parameters
  const mintParams = Buffer.concat([
    Buffer.from([decimals]), // decimals (u8)
    bufferFromString(name), // name (string)
    bufferFromString(symbol), // symbol (string)
    bufferFromString(uri), // uri (string)
  ]);

  // Serialize curve parameters
  const curveParams = Buffer.concat([
    Buffer.from([0]), // variant discriminator for Constant (0)
    Buffer.from(new BigUint64Array([BigInt(supply)]).buffer), // supply (u64)
    Buffer.from(new BigUint64Array([BigInt(baseSell)]).buffer), // total base sell (u64)
    Buffer.from(new BigUint64Array([BigInt(quoteRaising)]).buffer), // total quote fund raising (u64)
    Buffer.from([1]), // migrate type (u8)
  ]);

  // Serialize vesting parameters
  const vestingParams = Buffer.concat([
    Buffer.from(new BigUint64Array([BigInt(0)]).buffer), // total locked amount (u64)
    Buffer.from(new BigUint64Array([BigInt(0)]).buffer), // cliff period (u64)
    Buffer.from(new BigUint64Array([BigInt(0)]).buffer), // unlock period (u64)
  ]);

  // Instruction discriminator
  const instructionDiscriminator = Buffer.from(INITIALIZE_DISCRIMINATOR, 'hex');

  // Combine all data
  const data = Buffer.concat([instructionDiscriminator, mintParams, curveParams, vestingParams]);

  // Derive required PDAs
  const [globalConfigPDA] = PDAUtils.findGlobalConfig();
  const [platformConfigPDA] = PDAUtils.findPlatformConfig();
  const [vaultAuthorityPDA] = PDAUtils.findVaultAuthority();
  const [eventAuthorityPDA] = PDAUtils.findEventAuthority();

  // Account metas based on bonk-mcp implementation
  const keys: AccountMeta[] = [
    // Payer
    {
      pubkey: payerKeypair.publicKey,
      isSigner: true,
      isWritable: true,
    },
    // Creator
    {
      pubkey: payerKeypair.publicKey,
      isSigner: true,
      isWritable: true,
    },
    // Global Config
    {
      pubkey: globalConfigPDA,
      isSigner: false,
      isWritable: false,
    },
    // Platform Config
    {
      pubkey: platformConfigPDA,
      isSigner: false,
      isWritable: false,
    },
    // Authority
    {
      pubkey: vaultAuthorityPDA,
      isSigner: false,
      isWritable: false,
    },
    // Pool state
    {
      pubkey: poolStatePDA,
      isSigner: false,
      isWritable: true,
    },
    // Base mint (new token mint)
    {
      pubkey: mintKeypair.publicKey,
      isSigner: true,
      isWritable: true,
    },
    // Quote token (WSOL)
    {
      pubkey: WSOL_TOKEN,
      isSigner: false,
      isWritable: false,
    },
    // Base vault
    {
      pubkey: baseVaultPDA,
      isSigner: false,
      isWritable: true,
    },
    // Quote vault
    {
      pubkey: quoteVaultPDA,
      isSigner: false,
      isWritable: true,
    },
    // Metadata account
    {
      pubkey: metadataPDA,
      isSigner: false,
      isWritable: true,
    },
    // Base token program
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    // Quote token program
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    // Metadata program
    {
      pubkey: METAPLEX_PROGRAM,
      isSigner: false,
      isWritable: false,
    },
    // System program
    {
      pubkey: SYSTEM_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    // Rent sysvar
    {
      pubkey: RENT_SYSVAR,
      isSigner: false,
      isWritable: false,
    },
    // Event authority
    {
      pubkey: eventAuthorityPDA,
      isSigner: false,
      isWritable: false,
    },
    // Raydium program
    {
      pubkey: LETSBONK_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: LETSBONK_PROGRAM_ID,
    data,
  });
}
