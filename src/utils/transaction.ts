import { PublicKey, Connection, Transaction, TransactionInstruction } from '@solana/web3.js';
import { UNIT_PRICE, UNIT_BUDGET } from '../constants';
import { PriorityFee } from '../types/core';

/**
 * Setup transaction with compute budget (from bonk-mcp)
 */
export async function setupTransaction(
  connection: Connection,
  payer: PublicKey,
  priorityFees?: PriorityFee
): Promise<Transaction> {
  const { blockhash } = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    feePayer: payer,
    recentBlockhash: blockhash,
  });

  // Use provided priority fees or fall back to defaults
  const unitPrice = priorityFees?.unitPrice ?? UNIT_PRICE;
  const unitBudget = priorityFees?.unitLimit ?? UNIT_BUDGET;

  // Add compute budget instructions
  transaction.add(
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
  );

  return transaction;
}
