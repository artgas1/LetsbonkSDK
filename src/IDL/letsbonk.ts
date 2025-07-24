/**
 * Program IDL in camelCase format in order to be used in JS/TS with Anchor.
 * Complete TypeScript version matching letsbonk.json
 * Generated from letsbonk.json
 */
export type LetsBonkIDL = {
  address: 'LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj';
  metadata: {
    name: 'raydiumLaunchpad';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'buyExactIn';
      accounts: [
        {
          name: 'payer';
          docs: [
            'The user performing the swap operation',
            'Must sign the transaction and pay for fees',
          ];
          signer: true;
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault operations',
            'Generated using AUTH_SEED',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'globalConfig';
          docs: [
            'Global configuration account containing protocol-wide settings',
            'Used to read protocol fee rates and curve type',
          ];
        },
        {
          name: 'platformConfig';
          docs: [
            'Platform configuration account containing platform-wide settings',
            'Used to read platform fee rate',
          ];
        },
        {
          name: 'poolState';
          docs: [
            'The pool state account where the swap will be performed',
            'Contains current pool parameters and balances',
          ];
          writable: true;
        },
        {
          name: 'userBaseToken';
          docs: [
            "The user's token account for base tokens (tokens being bought)",
            'Will receive the output tokens after the swap',
          ];
          writable: true;
        },
        {
          name: 'userQuoteToken';
          docs: [
            "The user's token account for quote tokens (tokens being sold)",
            'Will be debited for the input amount',
          ];
          writable: true;
        },
        {
          name: 'baseVault';
          docs: ["The pool's vault for base tokens", 'Will be debited to send tokens to the user'];
          writable: true;
        },
        {
          name: 'quoteVault';
          docs: [
            "The pool's vault for quote tokens",
            'Will receive the input tokens from the user',
          ];
          writable: true;
        },
        {
          name: 'baseTokenMint';
          docs: ['The mint of the base token', 'Used for transfer fee calculations if applicable'];
        },
        {
          name: 'quoteTokenMint';
          docs: ['The mint of the quote token'];
        },
        {
          name: 'baseTokenProgram';
          docs: ['SPL Token program for base token transfers'];
        },
        {
          name: 'quoteTokenProgram';
          docs: ['SPL Token program for quote token transfers'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'eventAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'program';
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minimumAmountOut';
          type: 'u64';
        },
        {
          name: 'shareFeeRate';
          type: 'u64';
        },
      ];
      docs: [
        'Use the given amount of quote tokens to purchase base tokens.',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '* `amount_in` - Amount of quote token to purchase',
        '* `minimum_amount_out` - Minimum amount of base token to receive (slippage protection)',
        '* `share_fee_rate` - Fee rate for the share',
        '',
      ];
      discriminator: [250, 234, 13, 123, 213, 156, 19, 236];
    },
    {
      name: 'buyExactOut';
      accounts: [
        {
          name: 'payer';
          docs: [
            'The user performing the swap operation',
            'Must sign the transaction and pay for fees',
          ];
          signer: true;
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault operations',
            'Generated using AUTH_SEED',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'globalConfig';
          docs: [
            'Global configuration account containing protocol-wide settings',
            'Used to read protocol fee rates and curve type',
          ];
        },
        {
          name: 'platformConfig';
          docs: [
            'Platform configuration account containing platform-wide settings',
            'Used to read platform fee rate',
          ];
        },
        {
          name: 'poolState';
          docs: [
            'The pool state account where the swap will be performed',
            'Contains current pool parameters and balances',
          ];
          writable: true;
        },
        {
          name: 'userBaseToken';
          docs: [
            "The user's token account for base tokens (tokens being bought)",
            'Will receive the output tokens after the swap',
          ];
          writable: true;
        },
        {
          name: 'userQuoteToken';
          docs: [
            "The user's token account for quote tokens (tokens being sold)",
            'Will be debited for the input amount',
          ];
          writable: true;
        },
        {
          name: 'baseVault';
          docs: ["The pool's vault for base tokens", 'Will be debited to send tokens to the user'];
          writable: true;
        },
        {
          name: 'quoteVault';
          docs: [
            "The pool's vault for quote tokens",
            'Will receive the input tokens from the user',
          ];
          writable: true;
        },
        {
          name: 'baseTokenMint';
          docs: ['The mint of the base token', 'Used for transfer fee calculations if applicable'];
        },
        {
          name: 'quoteTokenMint';
          docs: ['The mint of the quote token'];
        },
        {
          name: 'baseTokenProgram';
          docs: ['SPL Token program for base token transfers'];
        },
        {
          name: 'quoteTokenProgram';
          docs: ['SPL Token program for quote token transfers'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'eventAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'program';
        },
      ];
      args: [
        {
          name: 'amountOut';
          type: 'u64';
        },
        {
          name: 'maximumAmountIn';
          type: 'u64';
        },
        {
          name: 'shareFeeRate';
          type: 'u64';
        },
      ];
      docs: [
        'Use quote tokens to purchase the given amount of base tokens.',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '* `amount_out` - Amount of base token to receive',
        '* `maximum_amount_in` - Maximum amount of quote token to purchase (slippage protection)',
        '* `share_fee_rate` - Fee rate for the share',
      ];
      discriminator: [24, 211, 116, 40, 105, 3, 153, 56];
    },
    {
      name: 'claimPlatformFee';
      accounts: [
        {
          name: 'platformFeeWallet';
          docs: ['Only the wallet stored in platform_config can collect platform fees'];
          writable: true;
          signer: true;
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault and mint operations',
            'Generated using AUTH_SEED',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'poolState';
          docs: [
            "Account that stores the pool's state and parameters",
            'PDA generated using POOL_SEED and both token mints',
          ];
          writable: true;
        },
        {
          name: 'platformConfig';
          docs: ['The platform config account'];
        },
        {
          name: 'quoteVault';
          writable: true;
        },
        {
          name: 'recipientTokenAccount';
          docs: ['The address that receives the collected quote token fees'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'platform_fee_wallet';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'quote_mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'quoteMint';
          docs: ['The mint of quote token vault'];
        },
        {
          name: 'tokenProgram';
          docs: ['SPL program for input token transfers'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'systemProgram';
          docs: ['Required for account creation'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'associatedTokenProgram';
          docs: ['Required for associated token program'];
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [];
      docs: ['Claim platform fee', '# Arguments', '', '* `ctx` - The context of accounts', ''];
      discriminator: [156, 39, 208, 135, 76, 237, 61, 72];
    },
    {
      name: 'claimVestedToken';
      accounts: [
        {
          name: 'beneficiary';
          docs: ['The beneficiary of the vesting account'];
          writable: true;
          signer: true;
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault and mint operations',
            'Generated using AUTH_SEED',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'poolState';
          docs: [
            "Account that stores the pool's state and parameters",
            'PDA generated using POOL_SEED and both token mints',
          ];
          writable: true;
        },
        {
          name: 'vestingRecord';
          docs: ['The vesting record account'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 118, 101, 115, 116, 105, 110, 103];
              },
              {
                kind: 'account';
                path: 'pool_state';
              },
              {
                kind: 'account';
                path: 'beneficiary';
              },
            ];
          };
        },
        {
          name: 'baseVault';
          docs: ["The pool's vault for base tokens", 'Will be debited to send tokens to the user'];
          writable: true;
        },
        {
          name: 'userBaseToken';
          writable: true;
          signer: true;
        },
        {
          name: 'baseTokenMint';
          docs: [
            'The mint for the base token (token being sold)',
            'Created in this instruction with specified decimals',
          ];
        },
        {
          name: 'baseTokenProgram';
          docs: ['SPL Token program for the base token', 'Must be the standard Token program'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'systemProgram';
          docs: ['Required for account creation'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'associatedTokenProgram';
          docs: ['Required for associated token program'];
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [];
      docs: ['Claim vested token', '# Arguments'];
      discriminator: [49, 33, 104, 30, 189, 157, 79, 35];
    },
    {
      name: 'collectFee';
      accounts: [
        {
          name: 'owner';
          docs: ['Only protocol_fee_owner saved in global_config can collect protocol fee now'];
          signer: true;
        },
        {
          name: 'authority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'poolState';
          docs: ['Pool state stores accumulated protocol fee amount'];
          writable: true;
        },
        {
          name: 'globalConfig';
          docs: ['Global config account stores owner'];
        },
        {
          name: 'quoteVault';
          docs: ['The address that holds pool tokens for quote token'];
          writable: true;
        },
        {
          name: 'quoteMint';
          docs: ['The mint of quote token vault'];
        },
        {
          name: 'recipientTokenAccount';
          docs: ['The address that receives the collected quote token fees'];
          writable: true;
        },
        {
          name: 'tokenProgram';
          docs: ['SPL program for input token transfers'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [];
      docs: [
        'Collects accumulated fees from the pool',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '',
      ];
      discriminator: [60, 173, 247, 103, 4, 93, 130, 48];
    },
    {
      name: 'collectMigrateFee';
      accounts: [
        {
          name: 'owner';
          docs: ['Only migrate_fee_owner saved in global_config can collect migrate fee now'];
          signer: true;
        },
        {
          name: 'authority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'poolState';
          docs: ['Pool state stores accumulated protocol fee amount'];
          writable: true;
        },
        {
          name: 'globalConfig';
          docs: ['Global config account stores owner'];
        },
        {
          name: 'quoteVault';
          docs: ['The address that holds pool tokens for quote token'];
          writable: true;
        },
        {
          name: 'quoteMint';
          docs: ['The mint of quote token vault'];
        },
        {
          name: 'recipientTokenAccount';
          docs: ['The address that receives the collected quote token fees'];
          writable: true;
        },
        {
          name: 'tokenProgram';
          docs: ['SPL program for input token transfers'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [];
      docs: [
        'Collects  migrate fees from the pool',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '',
      ];
      discriminator: [255, 186, 150, 223, 235, 118, 201, 186];
    },
    {
      name: 'createConfig';
      accounts: [
        {
          name: 'owner';
          docs: [
            'The protocol owner/admin account',
            'Must match the predefined admin address',
            'Has authority to create and modify protocol configurations',
          ];
          writable: true;
          signer: true;
          address: 'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ';
        },
        {
          name: 'globalConfig';
          docs: [
            'Global configuration account that stores protocol-wide settings',
            'PDA generated using GLOBAL_CONFIG_SEED, quote token mint, and curve type',
            'Stores fee rates and protocol parameters',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108, 95, 99, 111, 110, 102, 105, 103];
              },
              {
                kind: 'account';
                path: 'quote_token_mint';
              },
              {
                kind: 'arg';
                path: 'curve_type';
              },
              {
                kind: 'arg';
                path: 'index';
              },
            ];
          };
        },
        {
          name: 'quoteTokenMint';
          docs: [
            'The mint address of the quote token (token used for buying)',
            'This will be the standard token used for all pools with this config',
          ];
        },
        {
          name: 'protocolFeeOwner';
          docs: ['Account that will receive protocol fees'];
        },
        {
          name: 'migrateFeeOwner';
          docs: ['Account that will receive migrate fees'];
        },
        {
          name: 'migrateToAmmWallet';
          docs: ['The control wallet address for migrating to amm'];
        },
        {
          name: 'migrateToCpswapWallet';
          docs: ['The control wallet address for migrating to cpswap'];
        },
        {
          name: 'systemProgram';
          docs: ['Required for account creation'];
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'curveType';
          type: 'u8';
        },
        {
          name: 'index';
          type: 'u16';
        },
        {
          name: 'migrateFee';
          type: 'u64';
        },
        {
          name: 'tradeFeeRate';
          type: 'u64';
        },
      ];
      docs: [
        'Creates a new configuration',
        '# Arguments',
        '',
        '* `ctx` - The accounts needed by instruction',
        '* `curve_type` - The type of bonding curve (0: ConstantProduct)',
        '* `index` - The index of config, there may be multiple config with the same curve type.',
        '* `trade_fee_rate` - Trade fee rate, must be less than RATE_DENOMINATOR_VALUE',
        '',
      ];
      discriminator: [201, 207, 243, 114, 75, 111, 47, 189];
    },
    {
      name: 'createPlatformConfig';
      accounts: [
        {
          name: 'platformAdmin';
          docs: ['The account paying for the initialization costs'];
          writable: true;
          signer: true;
        },
        {
          name: 'platformFeeWallet';
        },
        {
          name: 'platformNftWallet';
        },
        {
          name: 'platformConfig';
          docs: ['The platform config account'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109, 95, 99, 111, 110, 102, 105, 103];
              },
              {
                kind: 'account';
                path: 'platform_admin';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          docs: ['Required for account creation'];
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'platformParams';
          type: {
            defined: {
              name: 'PlatformParams';
            };
          };
        },
      ];
      docs: [
        'Create platform config account',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '# Fields',
        '* `fee_rate` - Fee rate of the platform',
        '* `name` - Name of the platform',
        '* `web` - Website of the platform',
        '* `img` - Image link of the platform',
        '',
      ];
      discriminator: [176, 90, 196, 175, 253, 113, 220, 20];
    },
    {
      name: 'createVestingAccount';
      accounts: [
        {
          name: 'creator';
          docs: [
            'The account paying for the initialization costs',
            'This can be any account with sufficient SOL to cover the transaction',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'beneficiary';
          writable: true;
        },
        {
          name: 'poolState';
          docs: ['The pool state account'];
          writable: true;
        },
        {
          name: 'vestingRecord';
          docs: ['The vesting record account'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 118, 101, 115, 116, 105, 110, 103];
              },
              {
                kind: 'account';
                path: 'pool_state';
              },
              {
                kind: 'account';
                path: 'beneficiary';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          docs: ['Required for account creation'];
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'shareAmount';
          type: 'u64';
        },
      ];
      docs: [
        'Create vesting account',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '* `share` - The share amount of base token to be vested',
        '',
      ];
      discriminator: [129, 178, 2, 13, 217, 172, 230, 218];
    },
    {
      name: 'initialize';
      accounts: [
        {
          name: 'payer';
          docs: [
            'The account paying for the initialization costs',
            'This can be any account with sufficient SOL to cover the transaction',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'creator';
        },
        {
          name: 'globalConfig';
          docs: [
            'Global configuration account containing protocol-wide settings',
            'Includes settings like quote token mint and fee parameters',
          ];
        },
        {
          name: 'platformConfig';
          docs: [
            'Platform configuration account containing platform info',
            'Includes settings like the fee_rate, name, web, img of the platform',
          ];
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault and mint operations',
            'Generated using AUTH_SEED',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'poolState';
          docs: [
            "Account that stores the pool's state and parameters",
            'PDA generated using POOL_SEED and both token mints',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'base_mint';
              },
              {
                kind: 'account';
                path: 'quote_mint';
              },
            ];
          };
        },
        {
          name: 'baseMint';
          docs: [
            'The mint for the base token (token being sold)',
            'Created in this instruction with specified decimals',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'quoteMint';
          docs: [
            'The mint for the quote token (token used to buy)',
            'Must match the quote_mint specified in global config',
          ];
        },
        {
          name: 'baseVault';
          docs: [
            "Token account that holds the pool's base tokens",
            'PDA generated using POOL_VAULT_SEED',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: 'account';
                path: 'pool_state';
              },
              {
                kind: 'account';
                path: 'base_mint';
              },
            ];
          };
        },
        {
          name: 'quoteVault';
          docs: [
            "Token account that holds the pool's quote tokens",
            'PDA generated using POOL_VAULT_SEED',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: 'account';
                path: 'pool_state';
              },
              {
                kind: 'account';
                path: 'quote_mint';
              },
            ];
          };
        },
        {
          name: 'metadataAccount';
          docs: [
            "Account to store the base token's metadata",
            'Created using Metaplex metadata program',
          ];
          writable: true;
        },
        {
          name: 'baseTokenProgram';
          docs: ['SPL Token program for the base token', 'Must be the standard Token program'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'quoteTokenProgram';
          docs: ['SPL Token program for the quote token'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'metadataProgram';
          docs: ['Metaplex Token Metadata program', 'Used to create metadata for the base token'];
          address: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
        },
        {
          name: 'systemProgram';
          docs: ['Required for account creation'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rentProgram';
          docs: ['Required for rent exempt calculations'];
          address: 'SysvarRent111111111111111111111111111111111';
        },
        {
          name: 'eventAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'program';
        },
      ];
      args: [
        {
          name: 'baseMintParam';
          type: {
            defined: {
              name: 'MintParams';
            };
          };
        },
        {
          name: 'curveParam';
          type: {
            defined: {
              name: 'CurveParams';
            };
          };
        },
        {
          name: 'vestingParam';
          type: {
            defined: {
              name: 'VestingParams';
            };
          };
        },
      ];
      docs: [
        'Initializes a new trading pool',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts containing pool and token information',
        '',
      ];
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
    },
    {
      name: 'migrateToAmm';
      accounts: [
        {
          name: 'payer';
          docs: [
            'Only migrate_to_amm_wallet can migrate to cpswap pool',
            'This signer must match the migrate_to_amm_wallet saved in global_config',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'baseMint';
          docs: ['The mint for the base token (token being sold)'];
        },
        {
          name: 'quoteMint';
          docs: ['The mint for the quote token (token used to buy)'];
        },
        {
          name: 'openbookProgram';
          address: 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX';
        },
        {
          name: 'market';
          docs: ['Account created and asigned to openbook_program but not been initialized'];
          writable: true;
        },
        {
          name: 'requestQueue';
          docs: ['Account created and asigned to openbook_program but not been initialized'];
          writable: true;
        },
        {
          name: 'eventQueue';
          docs: ['Account created and asigned to openbook_program but not been initialized'];
          writable: true;
        },
        {
          name: 'bids';
          docs: ['Account created and asigned to openbook_program but not been initialized'];
          writable: true;
        },
        {
          name: 'asks';
          docs: ['Account created and asigned to openbook_program but not been initialized'];
          writable: true;
        },
        {
          name: 'marketVaultSigner';
        },
        {
          name: 'marketBaseVault';
          docs: ["Token account that holds the market's base tokens"];
          writable: true;
        },
        {
          name: 'marketQuoteVault';
          docs: ["Token account that holds the market's quote tokens"];
          writable: true;
        },
        {
          name: 'ammProgram';
          address: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
        },
        {
          name: 'ammPool';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'amm_program';
              },
              {
                kind: 'account';
                path: 'market';
              },
              {
                kind: 'const';
                value: [
                  97,
                  109,
                  109,
                  95,
                  97,
                  115,
                  115,
                  111,
                  99,
                  105,
                  97,
                  116,
                  101,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'amm_program';
            };
          };
        },
        {
          name: 'ammAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [97, 109, 109, 32, 97, 117, 116, 104, 111, 114, 105, 116, 121];
              },
            ];
            program: {
              kind: 'account';
              path: 'amm_program';
            };
          };
        },
        {
          name: 'ammOpenOrders';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'amm_program';
              },
              {
                kind: 'account';
                path: 'market';
              },
              {
                kind: 'const';
                value: [
                  111,
                  112,
                  101,
                  110,
                  95,
                  111,
                  114,
                  100,
                  101,
                  114,
                  95,
                  97,
                  115,
                  115,
                  111,
                  99,
                  105,
                  97,
                  116,
                  101,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'amm_program';
            };
          };
        },
        {
          name: 'ammLpMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'amm_program';
              },
              {
                kind: 'account';
                path: 'market';
              },
              {
                kind: 'const';
                value: [
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  115,
                  115,
                  111,
                  99,
                  105,
                  97,
                  116,
                  101,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'amm_program';
            };
          };
        },
        {
          name: 'ammBaseVault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'amm_program';
              },
              {
                kind: 'account';
                path: 'market';
              },
              {
                kind: 'const';
                value: [
                  99,
                  111,
                  105,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  115,
                  115,
                  111,
                  99,
                  105,
                  97,
                  116,
                  101,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'amm_program';
            };
          };
        },
        {
          name: 'ammQuoteVault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'amm_program';
              },
              {
                kind: 'account';
                path: 'market';
              },
              {
                kind: 'const';
                value: [
                  112,
                  99,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  115,
                  115,
                  111,
                  99,
                  105,
                  97,
                  116,
                  101,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'amm_program';
            };
          };
        },
        {
          name: 'ammTargetOrders';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'amm_program';
              },
              {
                kind: 'account';
                path: 'market';
              },
              {
                kind: 'const';
                value: [
                  116,
                  97,
                  114,
                  103,
                  101,
                  116,
                  95,
                  97,
                  115,
                  115,
                  111,
                  99,
                  105,
                  97,
                  116,
                  101,
                  100,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'amm_program';
            };
          };
        },
        {
          name: 'ammConfig';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  97,
                  109,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'amm_program';
            };
          };
        },
        {
          name: 'ammCreateFeeDestination';
          writable: true;
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault operations',
            'Generated using AUTH_SEED',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'poolState';
          docs: [
            "Account that stores the pool's state and parameters",
            'PDA generated using POOL_SEED and both token mints',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'base_mint';
              },
              {
                kind: 'account';
                path: 'quote_mint';
              },
            ];
          };
        },
        {
          name: 'globalConfig';
          docs: ['Global config account stores owner'];
        },
        {
          name: 'baseVault';
          docs: ["The pool's vault for base tokens", 'Will be fully drained during migration'];
          writable: true;
        },
        {
          name: 'quoteVault';
          docs: ["The pool's vault for quote tokens", 'Will be fully drained during migration'];
          writable: true;
        },
        {
          name: 'poolLpToken';
          writable: true;
        },
        {
          name: 'splTokenProgram';
          docs: ['SPL Token program for the base token', 'Must be the standard Token program'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          docs: ['Program to create an ATA for receiving fee NFT'];
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'systemProgram';
          docs: ['Required for account creation'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rentProgram';
          docs: ['Required for rent exempt calculations'];
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'baseLotSize';
          type: 'u64';
        },
        {
          name: 'quoteLotSize';
          type: 'u64';
        },
        {
          name: 'marketVaultSignerNonce';
          type: 'u8';
        },
      ];
      docs: ['# Arguments', '', '* `ctx` - The context of accounts', ''];
      discriminator: [207, 82, 192, 145, 254, 207, 145, 223];
    },
    {
      name: 'migrateToCpswap';
      accounts: [
        {
          name: 'payer';
          docs: [
            'Only migrate_to_cpswap_wallet can migrate to cpswap pool',
            'This signer must match the migrate_to_cpswap_wallet saved in global_config',
          ];
          writable: true;
          signer: true;
        },
        {
          name: 'baseMint';
          docs: ['The mint for the base token (token being sold)'];
        },
        {
          name: 'quoteMint';
          docs: ['The mint for the quote token (token used to buy)'];
        },
        {
          name: 'platformConfig';
          docs: [
            'Platform configuration account containing platform-wide settings',
            'Used to read platform fee rate',
          ];
        },
        {
          name: 'cpswapProgram';
          address: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C';
        },
        {
          name: 'cpswapPool';
          docs: [
            'PDA account:',
            'seeds = [',
            'b"pool",',
            'cpswap_config.key().as_ref(),',
            'token_0_mint.key().as_ref(),',
            'token_1_mint.key().as_ref(),',
            '],',
            'seeds::program = cpswap_program,',
            '',
            'Or random account: must be signed by cli',
          ];
          writable: true;
        },
        {
          name: 'cpswapAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'cpswap_program';
            };
          };
        },
        {
          name: 'cpswapLpMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 108, 112, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'cpswap_pool';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpswap_program';
            };
          };
        },
        {
          name: 'cpswapBaseVault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: 'account';
                path: 'cpswap_pool';
              },
              {
                kind: 'account';
                path: 'base_mint';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpswap_program';
            };
          };
        },
        {
          name: 'cpswapQuoteVault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: 'account';
                path: 'cpswap_pool';
              },
              {
                kind: 'account';
                path: 'quote_mint';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpswap_program';
            };
          };
        },
        {
          name: 'cpswapConfig';
        },
        {
          name: 'cpswapCreatePoolFee';
          writable: true;
        },
        {
          name: 'cpswapObservation';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 98, 115, 101, 114, 118, 97, 116, 105, 111, 110];
              },
              {
                kind: 'account';
                path: 'cpswap_pool';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpswap_program';
            };
          };
        },
        {
          name: 'lockProgram';
          address: 'LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE';
        },
        {
          name: 'lockAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  108,
                  111,
                  99,
                  107,
                  95,
                  99,
                  112,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'lock_program';
            };
          };
        },
        {
          name: 'lockLpVault';
          writable: true;
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault operations',
            'Generated using AUTH_SEED',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'poolState';
          docs: [
            "Account that stores the pool's state and parameters",
            'PDA generated using POOL_SEED and both token mints',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'base_mint';
              },
              {
                kind: 'account';
                path: 'quote_mint';
              },
            ];
          };
        },
        {
          name: 'globalConfig';
          docs: ['Global config account stores owner'];
        },
        {
          name: 'baseVault';
          docs: ["The pool's vault for base tokens", 'Will be fully drained during migration'];
          writable: true;
        },
        {
          name: 'quoteVault';
          docs: ["The pool's vault for quote tokens", 'Will be fully drained during migration'];
          writable: true;
        },
        {
          name: 'poolLpToken';
          writable: true;
        },
        {
          name: 'baseTokenProgram';
          docs: ['SPL Token program for the base token', 'Must be the standard Token program'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'quoteTokenProgram';
          docs: ['SPL Token program for the quote token'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          docs: ['Program to create an ATA for receiving fee NFT'];
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'systemProgram';
          docs: ['Required for account creation'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rentProgram';
          docs: ['Required for rent exempt calculations'];
          address: 'SysvarRent111111111111111111111111111111111';
        },
        {
          name: 'metadataProgram';
          docs: ['Program to create NFT metadata accunt'];
          address: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
        },
      ];
      args: [];
      docs: ['# Arguments', '', '* `ctx` - The context of accounts', ''];
      discriminator: [136, 92, 200, 103, 28, 218, 144, 140];
    },
    {
      name: 'sellExactIn';
      accounts: [
        {
          name: 'payer';
          docs: [
            'The user performing the swap operation',
            'Must sign the transaction and pay for fees',
          ];
          signer: true;
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault operations',
            'Generated using AUTH_SEED',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'globalConfig';
          docs: [
            'Global configuration account containing protocol-wide settings',
            'Used to read protocol fee rates and curve type',
          ];
        },
        {
          name: 'platformConfig';
          docs: [
            'Platform configuration account containing platform-wide settings',
            'Used to read platform fee rate',
          ];
        },
        {
          name: 'poolState';
          docs: [
            'The pool state account where the swap will be performed',
            'Contains current pool parameters and balances',
          ];
          writable: true;
        },
        {
          name: 'userBaseToken';
          docs: [
            "The user's token account for base tokens (tokens being bought)",
            'Will receive the output tokens after the swap',
          ];
          writable: true;
        },
        {
          name: 'userQuoteToken';
          docs: [
            "The user's token account for quote tokens (tokens being sold)",
            'Will be debited for the input amount',
          ];
          writable: true;
        },
        {
          name: 'baseVault';
          docs: ["The pool's vault for base tokens", 'Will be debited to send tokens to the user'];
          writable: true;
        },
        {
          name: 'quoteVault';
          docs: [
            "The pool's vault for quote tokens",
            'Will receive the input tokens from the user',
          ];
          writable: true;
        },
        {
          name: 'baseTokenMint';
          docs: ['The mint of the base token', 'Used for transfer fee calculations if applicable'];
        },
        {
          name: 'quoteTokenMint';
          docs: ['The mint of the quote token'];
        },
        {
          name: 'baseTokenProgram';
          docs: ['SPL Token program for base token transfers'];
        },
        {
          name: 'quoteTokenProgram';
          docs: ['SPL Token program for quote token transfers'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'eventAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'program';
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minimumAmountOut';
          type: 'u64';
        },
        {
          name: 'shareFeeRate';
          type: 'u64';
        },
      ];
      docs: [
        'Use the given amount of base tokens to sell for quote tokens.',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '* `amount_in` - Amount of base token to sell',
        '* `minimum_amount_out` - Minimum amount of quote token to receive (slippage protection)',
        '* `share_fee_rate` - Fee rate for the share',
        '',
      ];
      discriminator: [149, 39, 222, 155, 211, 124, 152, 26];
    },
    {
      name: 'sellExactOut';
      accounts: [
        {
          name: 'payer';
          docs: [
            'The user performing the swap operation',
            'Must sign the transaction and pay for fees',
          ];
          signer: true;
        },
        {
          name: 'authority';
          docs: [
            'PDA that acts as the authority for pool vault operations',
            'Generated using AUTH_SEED',
          ];
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [118, 97, 117, 108, 116, 95, 97, 117, 116, 104, 95, 115, 101, 101, 100];
              },
            ];
          };
        },
        {
          name: 'globalConfig';
          docs: [
            'Global configuration account containing protocol-wide settings',
            'Used to read protocol fee rates and curve type',
          ];
        },
        {
          name: 'platformConfig';
          docs: [
            'Platform configuration account containing platform-wide settings',
            'Used to read platform fee rate',
          ];
        },
        {
          name: 'poolState';
          docs: [
            'The pool state account where the swap will be performed',
            'Contains current pool parameters and balances',
          ];
          writable: true;
        },
        {
          name: 'userBaseToken';
          docs: [
            "The user's token account for base tokens (tokens being bought)",
            'Will receive the output tokens after the swap',
          ];
          writable: true;
        },
        {
          name: 'userQuoteToken';
          docs: [
            "The user's token account for quote tokens (tokens being sold)",
            'Will be debited for the input amount',
          ];
          writable: true;
        },
        {
          name: 'baseVault';
          docs: ["The pool's vault for base tokens", 'Will be debited to send tokens to the user'];
          writable: true;
        },
        {
          name: 'quoteVault';
          docs: [
            "The pool's vault for quote tokens",
            'Will receive the input tokens from the user',
          ];
          writable: true;
        },
        {
          name: 'baseTokenMint';
          docs: ['The mint of the base token', 'Used for transfer fee calculations if applicable'];
        },
        {
          name: 'quoteTokenMint';
          docs: ['The mint of the quote token'];
        },
        {
          name: 'baseTokenProgram';
          docs: ['SPL Token program for base token transfers'];
        },
        {
          name: 'quoteTokenProgram';
          docs: ['SPL Token program for quote token transfers'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'eventAuthority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: 'program';
        },
      ];
      args: [
        {
          name: 'amountOut';
          type: 'u64';
        },
        {
          name: 'maximumAmountIn';
          type: 'u64';
        },
        {
          name: 'shareFeeRate';
          type: 'u64';
        },
      ];
      docs: [
        'Sell base tokens for the given amount of quote tokens.',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '* `amount_out` - Amount of quote token to receive',
        '* `maximum_amount_in` - Maximum amount of base token to purchase (slippage protection)',
        '* `share_fee_rate` - Fee rate for the share',
        '',
      ];
      discriminator: [95, 200, 71, 34, 8, 9, 11, 166];
    },
    {
      name: 'updateConfig';
      accounts: [
        {
          name: 'owner';
          docs: ['The global config owner or admin'];
          signer: true;
          address: 'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ';
        },
        {
          name: 'globalConfig';
          docs: ['Global config account to be changed'];
          writable: true;
        },
      ];
      args: [
        {
          name: 'param';
          type: 'u8';
        },
        {
          name: 'value';
          type: 'u64';
        },
      ];
      docs: [
        'Updates configuration parameters',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '* `param` - Parameter to update:',
        '- 0: Update trade_fee_rate',
        '- 1: Update fee owner',
        '* `value` - New value for the selected parameter',
        '',
      ];
      discriminator: [29, 158, 252, 191, 10, 83, 219, 99];
    },
    {
      name: 'updatePlatformConfig';
      accounts: [
        {
          name: 'platformAdmin';
          docs: ['The account paying for the initialization costs'];
          signer: true;
        },
        {
          name: 'platformConfig';
          docs: ['Platform config account to be changed'];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 108, 97, 116, 102, 111, 114, 109, 95, 99, 111, 110, 102, 105, 103];
              },
              {
                kind: 'account';
                path: 'platform_admin';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'param';
          type: {
            defined: {
              name: 'PlatformConfigParam';
            };
          };
        },
      ];
      docs: [
        'Update platform config',
        '# Arguments',
        '',
        '* `ctx` - The context of accounts',
        '* `param` - Parameter to update',
        '',
      ];
      discriminator: [195, 60, 76, 129, 146, 45, 67, 143];
    },
  ];
  accounts: [
    {
      name: 'GlobalConfig';
      discriminator: [149, 8, 156, 202, 160, 252, 176, 217];
    },
    {
      name: 'PlatformConfig';
      discriminator: [160, 78, 128, 0, 248, 83, 230, 160];
    },
    {
      name: 'PoolState';
      discriminator: [247, 237, 227, 245, 215, 195, 222, 70];
    },
    {
      name: 'VestingRecord';
      discriminator: [106, 243, 221, 205, 230, 126, 85, 83];
    },
  ];
  events: [
    {
      name: 'ClaimVestedEvent';
      discriminator: [21, 194, 114, 87, 120, 211, 226, 32];
    },
    {
      name: 'CreateVestingEvent';
      discriminator: [150, 152, 11, 179, 52, 210, 191, 125];
    },
    {
      name: 'PoolCreateEvent';
      discriminator: [151, 215, 226, 9, 118, 161, 115, 174];
    },
    {
      name: 'TradeEvent';
      discriminator: [189, 219, 127, 211, 78, 230, 97, 238];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'NotApproved';
      msg: 'Not approved';
    },
    {
      code: 6001;
      name: 'InvalidOwner';
      msg: 'Input account owner is not the program address';
    },
    {
      code: 6002;
      name: 'InvalidInput';
      msg: 'InvalidInput';
    },
    {
      code: 6003;
      name: 'InputNotMatchCurveConfig';
      msg: 'The input params are not match with curve type in config';
    },
    {
      code: 6004;
      name: 'ExceededSlippage';
      msg: 'Exceeds desired slippage limit';
    },
    {
      code: 6005;
      name: 'PoolFunding';
      msg: 'Pool funding';
    },
    {
      code: 6006;
      name: 'PoolMigrated';
      msg: 'Pool migrated';
    },
    {
      code: 6007;
      name: 'MigrateTypeNotMatch';
      msg: 'Migrate type not match';
    },
    {
      code: 6008;
      name: 'MathOverflow';
      msg: 'Math overflow';
    },
    {
      code: 6009;
      name: 'NoAssetsToCollect';
      msg: 'No assets to collect';
    },
    {
      code: 6010;
      name: 'VestingRatioTooHigh';
      msg: 'Vesting ratio too high';
    },
    {
      code: 6011;
      name: 'VestingSettingEnded';
      msg: 'Vesting setting ended';
    },
    {
      code: 6012;
      name: 'VestingNotStarted';
      msg: 'Vesting not started';
    },
    {
      code: 6013;
      name: 'NoVestingSchedule';
      msg: 'No vesting schedule';
    },
    {
      code: 6014;
      name: 'InvalidPlatformInfo';
      msg: 'The platform info input is invalid';
    },
    {
      code: 6015;
      name: 'PoolNotMigrated';
      msg: 'Pool not migrated';
    },
  ];
  types: [
    {
      name: 'ClaimVestedEvent';
      docs: ['Emitted when vesting token claimed by beneficiary'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'poolState';
            type: 'pubkey';
          },
          {
            name: 'beneficiary';
            type: 'pubkey';
          },
          {
            name: 'claimAmount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'ConstantCurve';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'supply';
            type: 'u64';
          },
          {
            name: 'totalBaseSell';
            type: 'u64';
          },
          {
            name: 'totalQuoteFundRaising';
            type: 'u64';
          },
          {
            name: 'migrateType';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'CreateVestingEvent';
      docs: ['Emitted when vest_account created'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'poolState';
            type: 'pubkey';
          },
          {
            name: 'beneficiary';
            type: 'pubkey';
          },
          {
            name: 'shareAmount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'CurveParams';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Constant';
            fields: [
              {
                name: 'data';
                type: {
                  defined: {
                    name: 'ConstantCurve';
                  };
                };
              },
            ];
          },
          {
            name: 'Fixed';
            fields: [
              {
                name: 'data';
                type: {
                  defined: {
                    name: 'FixedCurve';
                  };
                };
              },
            ];
          },
          {
            name: 'Linear';
            fields: [
              {
                name: 'data';
                type: {
                  defined: {
                    name: 'LinearCurve';
                  };
                };
              },
            ];
          },
        ];
      };
    },
    {
      name: 'FixedCurve';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'supply';
            type: 'u64';
          },
          {
            name: 'totalQuoteFundRaising';
            type: 'u64';
          },
          {
            name: 'migrateType';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'GlobalConfig';
      docs: ['Holds the current owner of the factory'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'epoch';
            type: 'u64';
            docs: ['Account update epoch'];
          },
          {
            name: 'curveType';
            type: 'u8';
            docs: ['0: Constant Product Curve', '1: Fixed Price Curve', '2: Linear Price Curve'];
          },
          {
            name: 'index';
            type: 'u16';
            docs: ['Config index'];
          },
          {
            name: 'migrateFee';
            type: 'u64';
            docs: ['The fee of migrate to amm'];
          },
          {
            name: 'tradeFeeRate';
            type: 'u64';
            docs: ['The trade fee rate, denominated in hundredths of a bip (10^-6)'];
          },
          {
            name: 'maxShareFeeRate';
            type: 'u64';
            docs: ['The maximum share fee rate, denominated in hundredths of a bip (10^-6)'];
          },
          {
            name: 'minBaseSupply';
            type: 'u64';
            docs: ['The minimum base supply, the value without decimals'];
          },
          {
            name: 'maxLockRate';
            type: 'u64';
            docs: ['The maximum lock rate, denominated in hundredths of a bip (10^-6)'];
          },
          {
            name: 'minBaseSellRate';
            type: 'u64';
            docs: ['The minimum base sell rate, denominated in hundredths of a bip (10^-6)'];
          },
          {
            name: 'minBaseMigrateRate';
            type: 'u64';
            docs: ['The minimum base migrate rate, denominated in hundredths of a bip (10^-6)'];
          },
          {
            name: 'minQuoteFundRaising';
            type: 'u64';
            docs: ['The minimum quote fund raising, the value with decimals'];
          },
          {
            name: 'quoteMint';
            type: 'pubkey';
            docs: ['Mint information for quote token'];
          },
          {
            name: 'protocolFeeOwner';
            type: 'pubkey';
            docs: ['Protocol Fee owner'];
          },
          {
            name: 'migrateFeeOwner';
            type: 'pubkey';
            docs: ['Migrate Fee owner'];
          },
          {
            name: 'migrateToAmmWallet';
            type: 'pubkey';
            docs: ['Migrate to amm control wallet'];
          },
          {
            name: 'migrateToCpswapWallet';
            type: 'pubkey';
            docs: ['Migrate to cpswap wallet'];
          },
          {
            name: 'padding';
            type: {
              array: ['u64', 16];
            };
            docs: ['padding for future updates'];
          },
        ];
      };
    },
    {
      name: 'LinearCurve';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'supply';
            type: 'u64';
          },
          {
            name: 'totalQuoteFundRaising';
            type: 'u64';
          },
          {
            name: 'migrateType';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'MigrateNftInfo';
      docs: [
        'Represents the parameters for initializing a platform config account(Only support MigrateType::CPSWAP)',
        '# Fields',
        '* `platform_scale` - Scale of the platform liquidity quantity rights will be converted into NFT',
        '* `creator_scale` - Scale of the token creator liquidity quantity rights will be converted into NFT',
        '* `burn_scale` - Scale of liquidity directly to burn',
        '',
        '* platform_scale + creator_scale + burn_scale = RATE_DENOMINATOR_VALUE',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'platformScale';
            type: 'u64';
          },
          {
            name: 'creatorScale';
            type: 'u64';
          },
          {
            name: 'burnScale';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'MintParams';
      docs: [
        'Represents the parameters for initializing a new token mint',
        '# Fields',
        '* `decimals` - Number of decimal places for the token',
        '* `name` - Name of the token',
        '* `symbol` - Symbol/ticker of the token',
        '* `uri` - URI pointing to token metadata',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'decimals';
            type: 'u8';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'symbol';
            type: 'string';
          },
          {
            name: 'uri';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'PlatformConfig';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'epoch';
            type: 'u64';
            docs: ['The epoch for update interval'];
          },
          {
            name: 'platformFeeWallet';
            type: 'pubkey';
            docs: ['The platform fee wallet'];
          },
          {
            name: 'platformNftWallet';
            type: 'pubkey';
            docs: [
              'The platform nft wallet to receive the platform NFT after migration if platform_scale is not 0(Only support MigrateType::CPSWAP)',
            ];
          },
          {
            name: 'platformScale';
            type: 'u64';
            docs: [
              'Scale of the platform liquidity quantity rights will be converted into NFT(Only support MigrateType::CPSWAP)',
            ];
          },
          {
            name: 'creatorScale';
            type: 'u64';
            docs: [
              'Scale of the token creator liquidity quantity rights will be converted into NFT(Only support MigrateType::CPSWAP)',
            ];
          },
          {
            name: 'burnScale';
            type: 'u64';
            docs: ['Scale of liquidity directly to burn'];
          },
          {
            name: 'feeRate';
            type: 'u64';
            docs: ['The platform fee rate'];
          },
          {
            name: 'name';
            type: {
              array: ['u8', 64];
            };
            docs: ['The platform name'];
          },
          {
            name: 'web';
            type: {
              array: ['u8', 256];
            };
            docs: ['The platform website'];
          },
          {
            name: 'img';
            type: {
              array: ['u8', 256];
            };
            docs: ['The platform img link'];
          },
          {
            name: 'padding';
            type: {
              array: ['u8', 256];
            };
            docs: ['padding for future updates'];
          },
        ];
      };
    },
    {
      name: 'PlatformConfigParam';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'FeeWallet';
            fields: ['pubkey'];
          },
          {
            name: 'NFTWallet';
            fields: ['pubkey'];
          },
          {
            name: 'MigrateNftInfo';
            fields: [
              {
                defined: {
                  name: 'MigrateNftInfo';
                };
              },
            ];
          },
          {
            name: 'FeeRate';
            fields: ['u64'];
          },
          {
            name: 'Name';
            fields: ['string'];
          },
          {
            name: 'Web';
            fields: ['string'];
          },
          {
            name: 'Img';
            fields: ['string'];
          },
        ];
      };
    },
    {
      name: 'PlatformParams';
      docs: [
        'Represents the parameters for initializing a platform config account',
        '# Fields',
        '* `migrate_nft_info` - The platform configures liquidity info during migration(Only support MigrateType::CPSWAP)',
        '* `fee_rate` - Fee rate of the platform',
        '* `name` - Name of the platform',
        '* `web` - Website of the platform',
        '* `img` - Image link of the platform',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'migrateNftInfo';
            type: {
              defined: {
                name: 'MigrateNftInfo';
              };
            };
          },
          {
            name: 'feeRate';
            type: 'u64';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'web';
            type: 'string';
          },
          {
            name: 'img';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'PoolCreateEvent';
      docs: ['Emitted when pool created'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'poolState';
            type: 'pubkey';
          },
          {
            name: 'creator';
            type: 'pubkey';
          },
          {
            name: 'config';
            type: 'pubkey';
          },
          {
            name: 'baseMintParam';
            type: {
              defined: {
                name: 'MintParams';
              };
            };
          },
          {
            name: 'curveParam';
            type: {
              defined: {
                name: 'CurveParams';
              };
            };
          },
          {
            name: 'vestingParam';
            type: {
              defined: {
                name: 'VestingParams';
              };
            };
          },
        ];
      };
    },
    {
      name: 'PoolState';
      docs: [
        'Represents the state of a trading pool in the protocol',
        'Stores all essential information about pool balances, fees, and configuration',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'epoch';
            type: 'u64';
            docs: ['Account update epoch'];
          },
          {
            name: 'authBump';
            type: 'u8';
            docs: ['Bump seed used for PDA address derivation'];
          },
          {
            name: 'status';
            type: 'u8';
            docs: [
              'Current status of the pool',
              '* 0: Pool is funding',
              '* 1: Pool funding is end, waiting for migration',
              '* 2: Pool migration is done',
            ];
          },
          {
            name: 'baseDecimals';
            type: 'u8';
            docs: ['Decimals of the pool base token'];
          },
          {
            name: 'quoteDecimals';
            type: 'u8';
            docs: ['Decimals of the pool quote token'];
          },
          {
            name: 'migrateType';
            type: 'u8';
            docs: ['Migrate to AMM or CpSwap'];
          },
          {
            name: 'supply';
            type: 'u64';
            docs: ['Supply of the pool base token'];
          },
          {
            name: 'totalBaseSell';
            type: 'u64';
            docs: ['Total sell amount of the base token'];
          },
          {
            name: 'virtualBase';
            type: 'u64';
            docs: [
              'For different curves, virtual_base and virtual_quote have different meanings',
              'For constant product curve, virtual_base and virtual_quote are virtual liquidity, virtual_quote/virtual_base is the initial price',
              'For linear price curve, virtual_base is the price slope parameter a, virtual_quote has no effect',
              'For fixed price curve, virtual_quote/virtual_base is the initial price',
            ];
          },
          {
            name: 'virtualQuote';
            type: 'u64';
          },
          {
            name: 'realBase';
            type: 'u64';
            docs: [
              'Actual base token amount in the pool',
              'Represents the real tokens available for trading',
            ];
          },
          {
            name: 'realQuote';
            type: 'u64';
            docs: [
              'Actual quote token amount in the pool',
              'Represents the real tokens available for trading',
            ];
          },
          {
            name: 'totalQuoteFundRaising';
            type: 'u64';
            docs: ['The total quote fund raising of the pool'];
          },
          {
            name: 'quoteProtocolFee';
            type: 'u64';
            docs: [
              'Accumulated trading fees in quote tokens',
              'Can be collected by the protocol fee owner',
            ];
          },
          {
            name: 'platformFee';
            type: 'u64';
            docs: [
              'Accumulated platform fees in quote tokens',
              'Can be collected by the platform wallet stored in platform config',
            ];
          },
          {
            name: 'migrateFee';
            type: 'u64';
            docs: ['The fee of migrate to amm'];
          },
          {
            name: 'vestingSchedule';
            type: {
              defined: {
                name: 'VestingSchedule';
              };
            };
            docs: ['Vesting schedule for the base token'];
          },
          {
            name: 'globalConfig';
            type: 'pubkey';
            docs: [
              'Public key of the global configuration account',
              'Contains protocol-wide settings this pool adheres to',
            ];
          },
          {
            name: 'platformConfig';
            type: 'pubkey';
            docs: [
              'Public key of the platform configuration account',
              'Contains platform-wide settings this pool adheres to',
            ];
          },
          {
            name: 'baseMint';
            type: 'pubkey';
            docs: ['Public key of the base mint address'];
          },
          {
            name: 'quoteMint';
            type: 'pubkey';
            docs: ['Public key of the quote mint address'];
          },
          {
            name: 'baseVault';
            type: 'pubkey';
            docs: [
              'Public key of the base token vault',
              'Holds the actual base tokens owned by the pool',
            ];
          },
          {
            name: 'quoteVault';
            type: 'pubkey';
            docs: [
              'Public key of the quote token vault',
              'Holds the actual quote tokens owned by the pool',
            ];
          },
          {
            name: 'creator';
            type: 'pubkey';
            docs: ['The creator of base token'];
          },
          {
            name: 'padding';
            type: {
              array: ['u64', 8];
            };
            docs: ['padding for future updates'];
          },
        ];
      };
    },
    {
      name: 'PoolStatus';
      docs: [
        'Represents the different states a pool can be in',
        '* Fund - Initial state where pool is accepting funds',
        '* Migrate - Pool funding has ended and waiting for migration',
        '* Trade - Pool migration is complete and amm trading is enabled',
      ];
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Fund';
          },
          {
            name: 'Migrate';
          },
          {
            name: 'Trade';
          },
        ];
      };
    },
    {
      name: 'TradeDirection';
      docs: [
        'Specifies the direction of a trade in the bonding curve',
        'This is important because curves can treat tokens differently through weights or offsets',
      ];
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Buy';
          },
          {
            name: 'Sell';
          },
        ];
      };
    },
    {
      name: 'TradeEvent';
      docs: ['Emitted when trade process'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'poolState';
            type: 'pubkey';
          },
          {
            name: 'totalBaseSell';
            type: 'u64';
          },
          {
            name: 'virtualBase';
            type: 'u64';
          },
          {
            name: 'virtualQuote';
            type: 'u64';
          },
          {
            name: 'realBaseBefore';
            type: 'u64';
          },
          {
            name: 'realQuoteBefore';
            type: 'u64';
          },
          {
            name: 'realBaseAfter';
            type: 'u64';
          },
          {
            name: 'realQuoteAfter';
            type: 'u64';
          },
          {
            name: 'amountIn';
            type: 'u64';
          },
          {
            name: 'amountOut';
            type: 'u64';
          },
          {
            name: 'protocolFee';
            type: 'u64';
          },
          {
            name: 'platformFee';
            type: 'u64';
          },
          {
            name: 'shareFee';
            type: 'u64';
          },
          {
            name: 'tradeDirection';
            type: {
              defined: {
                name: 'TradeDirection';
              };
            };
          },
          {
            name: 'poolStatus';
            type: {
              defined: {
                name: 'PoolStatus';
              };
            };
          },
        ];
      };
    },
    {
      name: 'VestingParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'totalLockedAmount';
            type: 'u64';
          },
          {
            name: 'cliffPeriod';
            type: 'u64';
          },
          {
            name: 'unlockPeriod';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'VestingRecord';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'epoch';
            type: 'u64';
            docs: ['Account update epoch'];
          },
          {
            name: 'pool';
            type: 'pubkey';
            docs: ['The pool state account'];
          },
          {
            name: 'beneficiary';
            type: 'pubkey';
            docs: ['The beneficiary of the vesting account'];
          },
          {
            name: 'claimedAmount';
            type: 'u64';
            docs: ['The amount of tokens claimed'];
          },
          {
            name: 'tokenShareAmount';
            type: 'u64';
            docs: ['The share amount of the token to be vested'];
          },
          {
            name: 'padding';
            type: {
              array: ['u64', 8];
            };
            docs: ['padding for future updates'];
          },
        ];
      };
    },
    {
      name: 'VestingSchedule';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'totalLockedAmount';
            type: 'u64';
          },
          {
            name: 'cliffPeriod';
            type: 'u64';
          },
          {
            name: 'unlockPeriod';
            type: 'u64';
          },
          {
            name: 'startTime';
            type: 'u64';
          },
          {
            name: 'allocatedShareAmount';
            type: 'u64';
            docs: [
              'Total allocated share amount of the base token, not greater than total_locked_amount',
            ];
          },
        ];
      };
    },
  ];
};
