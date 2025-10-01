/**
 * Test script to discover what real data we can get from DLMM SDK
 * Run with: npx ts-node scripts/test-dlmm-data.ts
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Test pool address (from your constants - PYUSD/WSOL on devnet)
const TEST_POOL = "H9EPqQKCvv9ddzK6KHjo8vvUPMLMJXmMmru9KUYNaDFQ";

async function testDLMMData() {
  console.log("🔍 Testing DLMM SDK Data Availability\n");

  try {
    const sarosDLMM = new LiquidityBookServices({
      mode: MODE.DEVNET,
      options: { rpcUrl: RPC_ENDPOINT }
    });
    const connection = sarosDLMM.connection;
    const poolPubkey = new PublicKey(TEST_POOL);

    // Test 1: Get pair account (basic pool info)
    console.log("📊 Test 1: Basic Pool Info");
    const pairAccount = await sarosDLMM.getPairAccount(poolPubkey);
    console.log({
      activeId: pairAccount.activeId,
      binStep: pairAccount.binStep,
      baseFee: pairAccount.baseFee,
      maxFee: pairAccount.maxFee,
      protocolFee: pairAccount.protocolFee,
      tokenXMint: pairAccount.tokenXMint.toString(),
      tokenYMint: pairAccount.tokenYMint.toString(),
      reserveX: pairAccount.reserveX?.toString(),
      reserveY: pairAccount.reserveY?.toString(),
    });

    // Test 2: Get bin arrays around active bin
    console.log("\n📦 Test 2: Bin Array Data");
    const activeBin = pairAccount.activeId;
    const binArrayIndex = Math.floor(activeBin / 64); // 64 bins per array

    try {
      const binArray = await sarosDLMM.getBinArray({
        binArrayIndex,
        pair: poolPubkey,
        payer: poolPubkey, // dummy payer for reading
      });

      console.log("Bin Array found:", {
        index: binArrayIndex,
        hasBins: binArray ? "yes" : "no",
      });

      // Check bins structure
      if (binArray && typeof binArray === 'object') {
        console.log("Bin Array keys:", Object.keys(binArray));
      }
    } catch (e: any) {
      console.log("Could not fetch bin array (may need transaction):", e?.message || e);
    }

    // Test 3: Check available methods on service
    console.log("\n🛠️ Test 3: Available SDK Methods");
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sarosDLMM))
      .filter(m => m !== 'constructor' && typeof (sarosDLMM as any)[m] === 'function');
    console.log("Available methods:", methods.slice(0, 20));

    // Test 4: Try to get price from reserves
    console.log("\n💰 Test 4: Price Calculation");
    if (pairAccount.reserveX && pairAccount.reserveY) {
      const price = Number(pairAccount.reserveY) / Number(pairAccount.reserveX);
      console.log({
        reserveX: pairAccount.reserveX.toString(),
        reserveY: pairAccount.reserveY.toString(),
        calculatedPrice: price,
      });
    }

    console.log("\n✅ Data test complete!");

  } catch (error: any) {
    console.error("❌ Error:", error?.message || error);
    console.error(error);
  }
}

testDLMMData().catch(console.error);
