import { 
  PublicKey, 
  Connection, 
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableAccount
} from '@solana/web3.js';
import { UNIT_PRICE, UNIT_BUDGET, ALT_ACCOUNT_ADDRESS } from '../constants';
import { PriorityFee } from '../types/core';

/**
 * Get the ALT address
 */
export function getAltAccountPublicKey(): PublicKey {
  return new PublicKey(ALT_ACCOUNT_ADDRESS);
}

/**
 * Fetch the ALT account from the blockchain
 */
export async function fetchAltAccount(connection: Connection): Promise<AddressLookupTableAccount | null> {
  try {
    const altAddress = getAltAccountPublicKey();
    const result = await connection.getAddressLookupTable(altAddress);
    return result.value;
  } catch {
    // Failed to fetch ALT account, returning null to continue without ALT
    return null;
  }
}

/**
 * Setup v0 transaction with compute budget and ALT support
 */
export async function setupV0Transaction(
  connection: Connection,
  payer: PublicKey,
  instructions: TransactionInstruction[],
  priorityFees?: PriorityFee
): Promise<VersionedTransaction> {
  const { blockhash } = await connection.getLatestBlockhash();

  // Use provided priority fees or fall back to defaults
  const unitPrice = priorityFees?.unitPrice ?? UNIT_PRICE;
  const unitBudget = priorityFees?.unitLimit ?? UNIT_BUDGET;

  // Create compute budget instructions
  const computeBudgetInstructions = [
    // Set compute unit price
    new TransactionInstruction({
      keys: [],
      programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
      data: Buffer.concat([
        Buffer.from([3]), // SetComputeUnitPrice instruction
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(unitPrice)]).buffer)),
      ]),
    }),
    // Set compute unit limit
    new TransactionInstruction({
      keys: [],
      programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
      data: Buffer.concat([
        Buffer.from([2]), // SetComputeUnitLimit instruction
        Buffer.from(new Uint8Array(new Uint32Array([unitBudget]).buffer)),
      ]),
    })
  ];

  // Combine compute budget instructions with provided instructions
  const allInstructions = [...computeBudgetInstructions, ...instructions];

  // Fetch ALT account - skip on localnet for reliability  
  const altAccount = await fetchAltAccount(connection);
  
  // Create transaction message
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: allInstructions,
  }).compileToV0Message(altAccount ? [altAccount] : []);

  // Create versioned transaction
  const transaction = new VersionedTransaction(messageV0);

  return transaction;
}
