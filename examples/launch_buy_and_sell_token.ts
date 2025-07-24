#!/usr/bin/env ts-node

import { Connection, Keypair } from '@solana/web3.js';
// Import from local source files to test our changes
import { createSDK } from 'letsbonk-sdk';
import type { CreateTokenMetadata } from 'letsbonk-sdk';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.CONNECTION_URL) {
  console.error('❌ CONNECTION_URL environment variable is required');
  console.error('💡 Copy .env.example to .env and set your Helius API key');
  process.exit(1);
}

if (!process.env.KEYPAIR_SECRET_KEY) {
  console.error('❌ KEYPAIR_SECRET_KEY environment variable is required');
  console.error('💡 Copy .env.example to .env and set your base58 private key');
  process.exit(1);
}

// Now we can safely use these as strings since we've validated they exist
const CONNECTION_URL = process.env.CONNECTION_URL!;
const KEYPAIR_SECRET_KEY = process.env.KEYPAIR_SECRET_KEY!;

async function main() {
  console.log('🚀 Starting LetsBonkSDK Launch and Sell Demo (Library Version)');
  console.log('================================================================');

  try {
    console.log('\n🔑 Setting up wallets...');

    const payerKeypair = Keypair.fromSecretKey(bs58.decode(KEYPAIR_SECRET_KEY));
    const mintKeypair = Keypair.generate();

    // === 2. Setup Connection and SDK ===
    console.log('\n📡 Setting up connection and SDK...');

    const connection = new Connection(CONNECTION_URL, 'confirmed');

    const sdk = createSDK(connection, {
      commitment: 'confirmed',
      skipPreflight: true,
    });

    if (CONNECTION_URL.includes('localhost') || CONNECTION_URL.includes('127.0.0.1')) {
      console.log('🔑 Using localnet connection');
      // check if payer has enough SOL
      const balance = await connection.getBalance(payerKeypair.publicKey);
      if (balance == 0) {
        console.log('🔑 Airdropping 1 SOL to payer');
        const signature = await connection.requestAirdrop(payerKeypair.publicKey, 10e9);
        console.log('🔑 Airdrop signature:', signature);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ SDK created successfully from library');
    console.log('Note: Transactions are signed by the Keypair objects passed to each method');

    console.log(`Payer: ${payerKeypair.publicKey.toString()}`);
    console.log(`New Token Mint: ${mintKeypair.publicKey.toString()}`);

    // === 4. Prepare Token Metadata ===
    console.log('\n📝 Preparing token metadata...');


    // Randomly generate a name and symbol
    const name = Math.random().toString(36).substring(2, 15);
    const symbol = Math.random().toString(36).substring(2, 5);
    const description = Math.random().toString(36).substring(2, 15);
    const imageUrl = `https://${name}.com`;

    const metadata: CreateTokenMetadata = {
      name: name,
      symbol: symbol,
      description: description,
      file: new Blob(['demo'], { type: 'image/png' }), // In real usage, use actual image file
      external_url: imageUrl,
      twitter: imageUrl,
      telegram: imageUrl,
      website: imageUrl
    };

    console.log(`Token: ${metadata.name} (${metadata.symbol})`);
    console.log(`Description: ${metadata.description}`);

    // === 5. Launch Token and Buy Immediately ===
    console.log('\n🚀 Launching token and buying in one transaction...');

    // All amounts in the SDK are now in raw lamports for maximum precision
    // You can use: import { solToLamports } from 'letsbonk-sdk'; 
    // const buyAmountLamports = solToLamports(0.00001); // Convert 0.00001 SOL to lamports
    const buyAmountLamports = BigInt(10000); // Buy 10,000 lamports (0.00001 SOL) worth of tokens immediately

    const launchResult = await sdk.initializeAndBuy(
      payerKeypair,           // Payer (signs and pays for transaction)
      payerKeypair.publicKey, // Creator (can be different from payer)
      mintKeypair,            // New token mint keypair
      metadata,               // Token metadata
      buyAmountLamports,      // Amount of lamports to spend buying tokens
      {
        commitment: 'confirmed',
        skipPreflight: true,
        maxRetries: 1
      }
    );
    console.log('launchResult', launchResult);
    if (!launchResult.success) {
      console.error('❌ Launch failed:', launchResult.error);
      process.exit(1);
    }


    const transactionDetails = await connection.getParsedTransaction(launchResult.data.signature!);
    const tokensReceived = transactionDetails?.meta?.postTokenBalances?.find(token => token.mint === mintKeypair.publicKey.toString() && token.owner === payerKeypair.publicKey.toString())?.uiTokenAmount.amount;
    if (!tokensReceived) {
      console.error('❌ No tokens received');
      process.exit(1);
    }
    console.log('tokensReceived', tokensReceived);


    console.log('✅ Token launched successfully!');
    console.log(`Transaction: ${launchResult.data.signature}`);
    console.log(`Bought ${buyAmountLamports} lamports worth of ${tokensReceived} ${metadata.symbol} tokens`);

    // === 6. Wait a moment (optional) ===
    console.log('\n⏳ Waiting a moment before selling...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // === 7. Sell Some Tokens ===
    console.log('\n💸 Selling tokens...');

    const sellResult = await sdk.sell(
      payerKeypair,           // Seller (who has the tokens)
      mintKeypair.publicKey,  // Token mint to sell,
      BigInt(tokensReceived),
      undefined,
      {
        commitment: 'confirmed',
        skipPreflight: true,
        maxRetries: 1
      }
    );

    if (!sellResult.success) {
      console.error('❌ Sell failed:', sellResult.error);
      process.exit(1);
    }

    console.log('✅ Tokens sold successfully!');
    console.log(`Transaction: ${sellResult.data.signature}`);

    // === 8. Summary ===
    console.log('\n📊 Summary');
    console.log('============');
    console.log(`✅ Token Created: ${metadata.name} (${metadata.symbol})`);
    console.log(`✅ Mint Address: ${mintKeypair.publicKey.toString()}`);
    console.log(`✅ Launch + Buy Transaction: ${launchResult.data.signature}`);
    console.log(`✅ Sell Transaction: ${sellResult.data.signature}`);
    console.log(`✅ Bought: ${buyAmountLamports} lamports worth of tokens`);
    console.log(`✅ Sold: All purchased tokens`);
    console.log('✅ Library import working correctly!');
    
    // Explicitly exit the process to prevent hanging
    process.exit(0);

  } catch (error) {
    console.error('❌ Script failed:', error);
    console.error('\n💡 Common issues:');
    console.error('  - Make sure letsbonk-sdk is installed: npm install letsbonk-sdk');
    console.error('  - Make sure solana-test-validator is running for localnet');
    console.error('  - Ensure you have SOL in your wallet');
    console.error('  - Check that required programs are deployed');
    process.exit(1);
  }
}

// Run the main demo
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} 