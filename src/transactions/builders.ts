import { Connection, PublicKey, Keypair, VersionedTransaction } from '@solana/web3.js';
import { buildBuyInstruction, buildSellInstruction } from '../instructions';
import { setupV0Transaction } from '../utils/transaction';
import {
  createOrGetTokenAccount,
  createTemporaryWSOLAccount,
  getCloseWSOLInstruction,
} from '../utils/token';
import { calculateTokensReceive } from '../utils/calculation';
import { uploadTokenMetadata } from '../utils/metadata';
import { PDAUtils } from '../shared';
import { WSOL_TOKEN, DEFAULT_SUPPLY, DEFAULT_BASE_SELL, DEFAULT_QUOTE_RAISING } from '../constants';
import { LaunchParams, CreateTokenMetadata, PriorityFee } from '../types';
import { createAnchorInitializeInstruction } from './utils';

/**
 * Build a token launch transaction
 * Based on bonk-mcp create_token function
 */
export async function buildCreateTokenTransaction(
  connection: Connection,
  payerKeypair: Keypair,
  mintKeypair: Keypair,
  metadata: CreateTokenMetadata,
  launchParams?: Partial<LaunchParams>,
  priorityFees?: PriorityFee
): Promise<{ transaction: VersionedTransaction; baseTokenAccount: PublicKey }> {
  const { name, symbol, external_url } = metadata;

  // Determine metadata URI: use external_url if provided, otherwise upload to IPFS
  let uri: string;
  if (external_url && external_url.trim() !== '') {
    // Use provided external URL
    uri = external_url;
  } else {
    // Upload metadata to IPFS
    const uploadResult = await uploadTokenMetadata(metadata);
    if (!uploadResult.success) {
      throw new Error(
        `Failed to upload metadata to IPFS: ${uploadResult.error || 'Unknown error'}`
      );
    }
    uri = uploadResult.metadataUri;
  }

  const {
    decimals = 6,
    supply = DEFAULT_SUPPLY,
    baseSell = DEFAULT_BASE_SELL,
    quoteRaising = DEFAULT_QUOTE_RAISING,
  } = launchParams || {};

  // Collect all instructions
  const instructions = [];

  // Use Anchor-generated instruction instead of manual instruction
  const launchIx = await createAnchorInitializeInstruction(
    connection,
    payerKeypair.publicKey,
    payerKeypair.publicKey, // creator
    mintKeypair.publicKey,
    uri,
    name,
    symbol,
    decimals,
    supply,
    baseSell,
    quoteRaising
  );

  instructions.push(launchIx);

  // Create token account for the new mint
  const { address: baseTokenAccount, instruction: baseTokenAccountIx } =
    await createOrGetTokenAccount(connection, payerKeypair.publicKey, mintKeypair.publicKey);

  if (baseTokenAccountIx) {
    instructions.push(baseTokenAccountIx);
  }

  // Setup v0 transaction with ALT support
  const transaction = await setupV0Transaction(connection, payerKeypair.publicKey, instructions, priorityFees);

  return { transaction, baseTokenAccount };
}

/**
 * Build a buy transaction
 * Based on bonk-mcp create_buy_tx function
 */
export async function buildBuyTransaction(
  connection: Connection,
  payerKeypair: Keypair,
  mintPubkey: PublicKey,
  amountIn: bigint, // Raw SOL amount in lamports
  minimumAmountOut: bigint, // Raw token amount (already includes decimals)
  priorityFees?: PriorityFee
): Promise<{ transaction: VersionedTransaction; additionalSigners: Keypair[] }> {
  const additionalSigners: Keypair[] = [];

  // Get token account for the specified mint
  const { address: baseTokenAccount, instruction: baseTokenInstruction } =
    await createOrGetTokenAccount(connection, payerKeypair.publicKey, mintPubkey);

  // Create temporary WSOL account
  const { address: wsolTokenAccount, instructions: wsolInstructions } =
    await createTemporaryWSOLAccount(
      connection,
      payerKeypair.publicKey,
      Number(amountIn) / Math.pow(10, 9) // Convert lamports to SOL for WSOL account creation
    );

  // Collect all instructions
  const instructions = [];

  // Add base token account creation instructions
  if (baseTokenInstruction) {
    instructions.push(baseTokenInstruction);
  }

  // Add WSOL account creation instructions
  instructions.push(...wsolInstructions);

  // Derive PDAs
  const pdas = PDAUtils.deriveAll(mintPubkey, WSOL_TOKEN);

  // Create buy instruction
  const buyIx = buildBuyInstruction({
    payerPubkey: payerKeypair.publicKey,
    poolStatePDA: pdas.poolState,
    baseVaultPDA: pdas.baseVault,
    quoteVaultPDA: pdas.quoteVault,
    baseMint: mintPubkey,
    baseTokenAccount,
    wsolTokenAccount,
    amountIn, // Pass BigInt directly - no conversion!
    minimumAmountOut, // Pass BigInt directly - no conversion!
  });

  instructions.push(buyIx);

  // Close WSOL account to recover SOL at the end
  const closeWSOLIx = getCloseWSOLInstruction(wsolTokenAccount, payerKeypair.publicKey);
  instructions.push(closeWSOLIx);

  // Setup v0 transaction with ALT support
  const transaction = await setupV0Transaction(connection, payerKeypair.publicKey, instructions, priorityFees);

  return { transaction, additionalSigners };
}

/**
 * Build a sell transaction
 * Similar to buy transaction but for selling tokens
 */
export async function buildSellTransaction(
  connection: Connection,
  payerKeypair: Keypair,
  mintPubkey: PublicKey,
  amountIn: bigint, // Raw token amount (already includes decimals)
  minimumAmountOut: bigint, // Raw SOL amount in lamports
  priorityFees?: PriorityFee
): Promise<{ transaction: VersionedTransaction; additionalSigners: Keypair[] }> {
  const additionalSigners: Keypair[] = [];

  // Get token account for the specified mint
  const { address: baseTokenAccount, instruction: baseTokenInstruction } =
    await createOrGetTokenAccount(connection, payerKeypair.publicKey, mintPubkey);

  // Create temporary WSOL account (for receiving SOL)
  const { address: wsolTokenAccount, instructions: wsolInstructions } =
    await createTemporaryWSOLAccount(
      connection,
      payerKeypair.publicKey,
      0 // No initial SOL needed for sell
    );

  // Collect all instructions
  const instructions = [];

  // Add base token account creation instructions
  if (baseTokenInstruction) {
    instructions.push(baseTokenInstruction);
  }

  // Add WSOL account creation instructions
  instructions.push(...wsolInstructions);

  // Derive PDAs
  const pdas = PDAUtils.deriveAll(mintPubkey, WSOL_TOKEN);

  // Create sell instruction
  const sellIx = buildSellInstruction({
    payerPubkey: payerKeypair.publicKey,
    poolStatePDA: pdas.poolState,
    baseVaultPDA: pdas.baseVault,
    quoteVaultPDA: pdas.quoteVault,
    baseMint: mintPubkey,
    baseTokenAccount,
    wsolTokenAccount,
    amountIn, // Pass BigInt directly - no conversion!
    minimumAmountOut, // Pass BigInt directly - no conversion!
  });

  instructions.push(sellIx);

  // Close WSOL account to recover SOL at the end
  const closeWSOLIx = getCloseWSOLInstruction(wsolTokenAccount, payerKeypair.publicKey);
  instructions.push(closeWSOLIx);

  // Setup v0 transaction with ALT support
  const transaction = await setupV0Transaction(connection, payerKeypair.publicKey, instructions, priorityFees);

  return { transaction, additionalSigners };
}

/**
 * Build initialize and buy transaction without executing
 * Consolidates token creation and buying into a single transaction
 */
export async function buildInitializeAndBuyTransaction(
  connection: Connection,
  payer: Keypair,
  creator: PublicKey,
  baseMint: Keypair,
  tokenMetadata: CreateTokenMetadata,
  buyAmountLamports: bigint, // Raw lamports amount for precision
  launchParams?: Partial<LaunchParams>,
  priorityFees?: PriorityFee
): Promise<{ transaction: VersionedTransaction; signers: Keypair[]; baseTokenAccount: PublicKey }> {
  const { name, symbol, external_url } = tokenMetadata;

  // Determine metadata URI: use external_url if provided, otherwise upload to IPFS
  let uri: string;
  if (external_url && external_url.trim() !== '') {
    // Use provided external URL
    uri = external_url;
  } else {
    // Upload metadata to IPFS
    const uploadResult = await uploadTokenMetadata(tokenMetadata);
    if (!uploadResult.success) {
      throw new Error(
        `Failed to upload metadata to IPFS: ${uploadResult.error || 'Unknown error'}`
      );
    }
    uri = uploadResult.metadataUri;
  }

  const {
    decimals = 6,
    supply = DEFAULT_SUPPLY,
    baseSell = DEFAULT_BASE_SELL,
    quoteRaising = DEFAULT_QUOTE_RAISING,
  } = launchParams || {};

  // Collect all instructions
  const instructions = [];

  // Create launch instruction
  const launchIx = await createAnchorInitializeInstruction(
    connection,
    payer.publicKey,
    creator,
    baseMint.publicKey,
    uri,
    name,
    symbol,
    decimals,
    supply,
    baseSell,
    quoteRaising
  );

  instructions.push(launchIx);

  // Create token account for the new mint
  const { address: baseTokenAccount, instruction: baseTokenAccountIx } =
    await createOrGetTokenAccount(connection, payer.publicKey, baseMint.publicKey);

  if (baseTokenAccountIx) {
    instructions.push(baseTokenAccountIx);
  }

  // Add buy instructions if buyAmountLamports > 0
  if (buyAmountLamports && buyAmountLamports > 0n) {
    // Calculate minimum tokens to receive (5% slippage)
    // Convert lamports to SOL for calculation, then back to raw tokens
    const buyAmountSol = Number(buyAmountLamports) / Math.pow(10, 9);
    const tokenInfo = calculateTokensReceive(buyAmountSol, 30, 5);

    // Convert tokens to raw amount with precise BigInt conversion
    const tokenDecimals = 6;
    const minimumAmountOutRaw = BigInt(
      Math.round(tokenInfo.tokenAmount * Math.pow(10, tokenDecimals))
    );

    // Get PDAs for the buy operation
    const pdas = PDAUtils.deriveAll(baseMint.publicKey, WSOL_TOKEN);

    // Create temporary WSOL account for buy
    const { address: wsolTokenAccount, instructions: wsolInstructions } =
      await createTemporaryWSOLAccount(
        connection,
        payer.publicKey,
        buyAmountSol // Still need SOL amount for WSOL account creation
      );

    // Add WSOL account creation instructions
    instructions.push(...wsolInstructions);

    // Create buy instruction
    const buyIx = buildBuyInstruction({
      payerPubkey: payer.publicKey,
      poolStatePDA: pdas.poolState,
      baseVaultPDA: pdas.baseVault,
      quoteVaultPDA: pdas.quoteVault,
      baseMint: baseMint.publicKey,
      baseTokenAccount,
      wsolTokenAccount,
      amountIn: buyAmountLamports, // Pass BigInt lamports directly
      minimumAmountOut: minimumAmountOutRaw, // Pass BigInt raw token amount
    });

    instructions.push(buyIx);

    // Close WSOL account
    const closeWSOLIx = getCloseWSOLInstruction(wsolTokenAccount, payer.publicKey);
    instructions.push(closeWSOLIx);
  }

  // Setup v0 transaction with ALT support
  const transaction = await setupV0Transaction(connection, payer.publicKey, instructions, priorityFees);

  return {
    transaction,
    signers: [payer, baseMint],
    baseTokenAccount,
  };
}
