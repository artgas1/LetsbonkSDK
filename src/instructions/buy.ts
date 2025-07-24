import { PublicKey, TransactionInstruction, AccountMeta } from '@solana/web3.js';
import {
  LETSBONK_PROGRAM_ID,
  WSOL_TOKEN,
  TOKEN_PROGRAM_ID,
  BUY_EXACT_IN_DISCRIMINATOR,
} from '../constants';
import { PDAUtils } from '../shared';

/**
 * Create a buy instruction for Raydium Launchpad
 * Based on bonk-mcp create_buy_instruction
 */
export function buildBuyInstruction(params: {
  payerPubkey: PublicKey;
  poolStatePDA: PublicKey;
  baseVaultPDA: PublicKey;
  quoteVaultPDA: PublicKey;
  baseMint: PublicKey;
  baseTokenAccount: PublicKey;
  wsolTokenAccount: PublicKey;
  amountIn: bigint; // Raw SOL amount in lamports
  minimumAmountOut: bigint; // Raw token amount (already includes decimals)
  shareFeeRate?: bigint;
}): TransactionInstruction {
  const {
    payerPubkey,
    poolStatePDA,
    baseVaultPDA,
    quoteVaultPDA,
    baseMint,
    baseTokenAccount,
    wsolTokenAccount,
    amountIn,
    minimumAmountOut,
    shareFeeRate = 0n,
  } = params;

  // Instruction discriminator for buyExactIn
  const instructionDiscriminator = Buffer.from(BUY_EXACT_IN_DISCRIMINATOR, 'hex');

  // Serialize parameters
  const data = Buffer.concat([
    instructionDiscriminator,
    // Amount in (u64) - use raw lamports directly (no conversion needed!)
    Buffer.from(new BigUint64Array([amountIn]).buffer),
    // Minimum amount out (u64) - use raw token amount directly (no conversion needed!)
    Buffer.from(new BigUint64Array([minimumAmountOut]).buffer),
    // Share fee rate (u64)
    Buffer.from(new BigUint64Array([shareFeeRate]).buffer),
  ]);

  // Derive required PDAs
  const [globalConfigPDA] = PDAUtils.findGlobalConfig();
  const [platformConfigPDA] = PDAUtils.findPlatformConfig();
  const [vaultAuthorityPDA] = PDAUtils.findVaultAuthority();
  const [eventAuthorityPDA] = PDAUtils.findEventAuthority();

  // Account metas
  const keys: AccountMeta[] = [
    // Payer
    {
      pubkey: payerPubkey,
      isSigner: true,
      isWritable: true,
    },
    // Authority
    {
      pubkey: vaultAuthorityPDA,
      isSigner: false,
      isWritable: false,
    },
    // Global config
    {
      pubkey: globalConfigPDA,
      isSigner: false,
      isWritable: false,
    },
    // Platform config
    {
      pubkey: platformConfigPDA,
      isSigner: false,
      isWritable: false,
    },
    // Pool state
    {
      pubkey: poolStatePDA,
      isSigner: false,
      isWritable: true,
    },
    // Base token account (user)
    {
      pubkey: baseTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    // WSOL token account (user)
    {
      pubkey: wsolTokenAccount,
      isSigner: false,
      isWritable: true,
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
    // Base mint
    {
      pubkey: baseMint,
      isSigner: false,
      isWritable: true,
    },
    // Quote mint (WSOL)
    {
      pubkey: WSOL_TOKEN,
      isSigner: false,
      isWritable: false,
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
