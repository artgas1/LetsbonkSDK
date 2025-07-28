# LetsBonkSDK 🚀

A modern TypeScript SDK for the LetsBonk trading protocol on Solana.

## Features

- 🔥 **Buy/Sell tokens** with slippage protection
- 🚀 **Launch new tokens** with metadata
- 🏊 **Pool management** and state queries
- 🛡️ **Type-safe** with full TypeScript support
- ⚡ **High performance** with structured logging
- 🔧 **Modular architecture** for optimal bundle size

## Installation

```bash
npm install letsbonkdotfun-sdk
```

## Quick Start

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { createSDK } from 'letsbonkdotfun-sdk';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const sdk = createSDK(connection);

// Buy tokens
const buyer = Keypair.fromSecretKey(/* your private key */);
const result = await sdk.buy(
  buyer,
  mintAddress,
  BigInt(1000000), // amount in lamports
  BigInt(0) // minimum tokens out
);

if (result.success) {
  console.log('Buy successful:', result.data.signature);
}
```

## API Overview

### Core Methods

- `sdk.buy(buyer, mint, amountIn, minimumOut)` - Buy tokens
- `sdk.sell(seller, mint, amountIn, minimumOut)` - Sell tokens  
- `sdk.initialize(payer, creator, mint, metadata)` - Create new token pool
- `sdk.initializeAndBuy(...)` - Launch token and buy in one transaction

### Managers (Advanced Usage)

- `sdk.accounts` - Account management and queries
- `sdk.transactions` - Transaction building and execution
- `sdk.pools` - Pool state and operations
- `sdk.metadata` - Token metadata handling

## Configuration

```typescript
const sdk = createSDK(connection, {
  commitment: 'confirmed',
  skipPreflight: true,
  logging: { level: 'info' }
});
```

## Examples

See the `examples/` directory for complete working examples:
- Token launch and trading
- Pool queries
- Error handling patterns

## Requirements

- Node.js 18+
- Solana Web3.js dependencies

## Authors

- **Artem Gasparyan** - *Initial work and core development*

## Acknowledgments

Special thanks to the following projects and contributors:

- **[bonk-mcp](https://github.com/letsbonk-ai/bonk-mcp/)**
- **[pumpdotfun-sdk](https://github.com/rckprtr/pumpdotfun-sdk)**

## License

MIT - see [LICENSE](./LICENSE) file.
