/**
 * Convert string to buffer with length prefix (from bonk-mcp)
 */
export function bufferFromString(stringData: string): Buffer {
  const strBytes = Buffer.from(stringData, 'utf-8');
  const length = strBytes.length;
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(length, 0);
  return Buffer.concat([lengthBuffer, strBytes]);
}

/**
 * Convert basis points to percentage
 */
export function basisPointsToPercentage(basisPoints: bigint): number {
  return Number(basisPoints) / 100;
}

/**
 * Convert percentage to basis points
 */
export function percentageToBasisPoints(percentage: number): bigint {
  return BigInt(Math.floor(percentage * 100));
}
