# Using LetsBonkSDK as a Library

This directory contains examples showing how to use LetsBonkSDK as a library rather than importing from source files.

## Key Differences

### Source Import (Original)
```typescript
import { createSDK } from '../src/factory';
import { CreateTokenMetadata } from '../src/types';
```

### Library Import (Updated)
```typescript
import { createSDK, CreateTokenMetadata } from 'letsbonk-sdk';
```

## Setup Methods

### Method 1: Install from Local Directory (Recommended for Development)

1. **Build the SDK first:**
   ```bash
   cd LetsBonkSDK
   npm run build
   ```

2. **Install from examples directory:**
   ```bash
   cd examples
   npm install
   ```

   The `package.json` uses `"letsbonk-sdk": "file:../"` to install from the parent directory.

3. **Run the library example:**
   ```bash
   npm run launch-and-sell
   ```

### Method 2: Using npm link (Alternative for Development)

1. **In the LetsBonkSDK root directory:**
   ```bash
   npm run build
   npm link
   ```

2. **In your project directory:**
   ```bash
   npm link letsbonk-sdk
   npm install @solana/web3.js bs58 dotenv
   ```

3. **Use in your TypeScript files:**
   ```typescript
   import { createSDK, CreateTokenMetadata } from 'letsbonk-sdk';
   ```

### Method 3: Install from npm (If Published)

```bash
npm install letsbonk-sdk
```

## Available Imports

The LetsBonkSDK library exports everything you need:

```typescript
// Main SDK factory
import { createSDK } from 'letsbonk-sdk';

// Types
import { CreateTokenMetadata, SDKResult } from 'letsbonk-sdk';

// Core functionality (if needed separately)
import { TokenManager } from 'letsbonk-sdk/core';
import { TransactionManager } from 'letsbonk-sdk/managers';

// Everything at once
import * as LetsBonk from 'letsbonk-sdk';
```

## Examples

- `temp_launch_and_sell_script.ts` - Original script using source imports
- `temp_launch_and_sell_script_library.ts` - Updated script using library imports

## Benefits of Library Import

1. **Cleaner imports** - No relative paths
2. **Proper versioning** - Use specific SDK versions
3. **Better type safety** - Compiled TypeScript definitions
4. **Distribution ready** - Can be published to npm
5. **Tree shaking** - Import only what you need

## Development Workflow

1. Make changes to SDK source code
2. Run `npm run build` to rebuild the library
3. Test with examples using library imports
4. No need to reinstall if using `file:../` dependency

## Troubleshooting

### "Module not found" errors
- Make sure the SDK is built: `npm run build`
- Check that dependencies are installed: `npm install`

### Type errors
- Ensure TypeScript can find the types: check `dist/*.d.ts` files exist
- Verify tsconfig.json includes node_modules for type resolution

### Import errors
- Use the exact import names from the library exports
- Check available exports in `dist/index.d.ts` 