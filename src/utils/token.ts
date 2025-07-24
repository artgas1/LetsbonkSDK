import {
  PublicKey,
  SystemProgram,
  Connection,
  TransactionInstruction,
  Keypair,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeAccountInstruction,
  createCloseAccountInstruction,
} from '@solana/spl-token';
import { WSOL_TOKEN, SOL_DECIMAL, TOKEN_PROGRAM_ID } from '../constants';

/**
 * Create or get associated token account
 */
export async function createOrGetTokenAccount(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey
): Promise<{ address: PublicKey; instruction?: TransactionInstruction }> {
  try {
    // Check if account already exists
    const tokenAccount = await getAssociatedTokenAddress(mint, owner);
    const accountInfo = await connection.getAccountInfo(tokenAccount);

    if (accountInfo) {
      return { address: tokenAccount };
    }

    // Create instruction if account doesn't exist
    const instruction = createAssociatedTokenAccountInstruction(
      owner, // payer
      tokenAccount, // associatedToken
      owner, // owner
      mint // mint
    );

    return { address: tokenAccount, instruction };
  } catch (error) {
    throw new Error(`Failed to create or get token account: ${error}`);
  }
}

/**
 * Create temporary WSOL account using createAccountWithSeed approach
 * This matches the efficient pattern used by Raydium LaunchLab
 */
export async function createTemporaryWSOLAccount(
  connection: Connection,
  payer: PublicKey,
  amount: number
): Promise<{ address: PublicKey; instructions: TransactionInstruction[]; keypair?: Keypair }> {
  // Generate a unique seed for this transaction
  const seed = Math.random().toString(36).substring(2, 15);

  // Create deterministic account address using createWithSeed
  const wsolAccount = await PublicKey.createWithSeed(payer, seed, TOKEN_PROGRAM_ID);

  // Calculate lamports needed (amount + rent exemption)
  const lamports = Math.floor(amount * Math.pow(10, SOL_DECIMAL));
  const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(165);
  const totalLamports = lamports + rentExemptBalance;

  const instructions: TransactionInstruction[] = [
    // Create account with seed - no additional signers needed
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer,
      basePubkey: payer,
      seed,
      newAccountPubkey: wsolAccount,
      lamports: totalLamports,
      space: 165,
      programId: TOKEN_PROGRAM_ID,
    }),
    // Initialize as WSOL token account
    createInitializeAccountInstruction(wsolAccount, WSOL_TOKEN, payer),
  ];

  return { address: wsolAccount, instructions, keypair: undefined };
}

/**
 * Get close WSOL instruction
 */
export function getCloseWSOLInstruction(
  wsolAccount: PublicKey,
  owner: PublicKey
): TransactionInstruction {
  return createCloseAccountInstruction(wsolAccount, owner, owner);
}
