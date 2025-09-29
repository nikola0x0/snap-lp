#!/usr/bin/env npx tsx

/**
 * DLMM SDK Investigation Script
 *
 * This script connects to the real Saros DLMM SDK and investigates:
 * 1. What pool addresses are available
 * 2. What the actual metadata structure looks like
 * 3. What pair account data contains
 * 4. How to properly calculate prices
 *
 * Run with: npx tsx scripts/investigate-sdk.ts
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

const log = (title: string, data: any) => {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
};

const logError = (title: string, error: any) => {
  console.log(`\n❌ ERROR: ${title}`);
  console.log(error.message || error);
};

async function investigateSDK() {
  console.log("🔍 Starting Saros DLMM SDK Investigation...\n");

  // Initialize SDK
  const dlmm = new LiquidityBookServices({
    mode: MODE.DEVNET, // Start with devnet for safety
  });

  console.log("✅ SDK initialized in DEVNET mode");
  console.log(`   Connection: ${dlmm.connection?.rpcEndpoint || "unknown"}`);

  try {
    // 1. Investigate pool addresses
    console.log("\n📋 1. Fetching pool addresses...");
    const poolAddresses = await dlmm.fetchPoolAddresses();
    log("Pool Addresses", {
      count: poolAddresses?.length || 0,
      addresses: poolAddresses?.slice(0, 5), // Show first 5
      type: typeof poolAddresses,
      isArray: Array.isArray(poolAddresses),
    });

    if (!poolAddresses || poolAddresses.length === 0) {
      console.log("⚠️  No pool addresses found, trying mainnet...");

      // Try mainnet
      const mainnetDlmm = new LiquidityBookServices({
        mode: MODE.MAINNET,
      });

      const mainnetPools = await mainnetDlmm.fetchPoolAddresses();
      log("Mainnet Pool Addresses", {
        count: mainnetPools?.length || 0,
        addresses: mainnetPools?.slice(0, 5),
      });

      if (mainnetPools && mainnetPools.length > 0) {
        console.log("✅ Using mainnet for further investigation");
        // Switch to mainnet SDK
        const dlmmToUse = mainnetDlmm;
        const poolsToUse = mainnetPools;
        await investigatePoolDetails(dlmmToUse, poolsToUse);
      }
    } else {
      await investigatePoolDetails(dlmm, poolAddresses);
    }
  } catch (error) {
    logError("Pool Address Fetching", error);
  }
}

async function investigatePoolDetails(
  dlmm: LiquidityBookServices,
  poolAddresses: string[],
) {
  // 2. Investigate pool metadata
  console.log("\n📊 2. Investigating pool metadata...");

  for (let i = 0; i < Math.min(3, poolAddresses.length); i++) {
    const poolAddress = poolAddresses[i];
    console.log(`\n   Pool ${i + 1}: ${poolAddress}`);

    try {
      // Test fetchPoolMetadata
      const metadata = await dlmm.fetchPoolMetadata(poolAddress);
      log(`Pool ${i + 1} Metadata`, {
        address: poolAddress,
        metadata: metadata,
        keys: metadata ? Object.keys(metadata) : [],
        hasTokenX: "tokenX" in (metadata || {}),
        hasTokenY: "tokenY" in (metadata || {}),
        hasBaseMint: "baseMint" in (metadata || {}),
        hasQuoteMint: "quoteMint" in (metadata || {}),
      });

      // Test getPairAccount
      try {
        const pairAccount = await dlmm.getPairAccount(
          new PublicKey(poolAddress),
        );
        log(`Pool ${i + 1} Pair Account`, {
          address: poolAddress,
          pairData: pairAccount,
          keys: pairAccount ? Object.keys(pairAccount) : [],
          hasActiveId: "activeId" in (pairAccount || {}),
          hasActiveBin: "activeBin" in (pairAccount || {}),
          hasBinStep: "binStep" in (pairAccount || {}),
        });

        // Test price calculation if we have the data
        if (
          pairAccount &&
          "activeId" in pairAccount &&
          "binStep" in pairAccount
        ) {
          const { activeId, binStep } = pairAccount as any;
          console.log(`\n   💰 Price calculation test for Pool ${i + 1}:`);
          console.log(`      activeId: ${activeId}`);
          console.log(`      binStep: ${binStep}`);

          try {
            const price = Math.pow(1 + binStep / 10000, activeId);
            console.log(`      calculated price: ${price}`);
            console.log(`      is finite: ${Number.isFinite(price)}`);
            console.log(`      scientific notation: ${price.toExponential()}`);
          } catch (priceError) {
            console.log(`      ❌ Price calculation failed: ${priceError}`);
          }
        }
      } catch (pairError) {
        logError(`Pool ${i + 1} Pair Account`, pairError);
      }
    } catch (metadataError) {
      logError(`Pool ${i + 1} Metadata`, metadataError);
    }

    // Don't overwhelm the RPC
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Additional investigations
async function investigateAdvanced() {
  console.log("\n🔬 3. Advanced SDK features investigation...");

  // Test what other methods are available on the SDK
  const dlmm = new LiquidityBookServices({ mode: MODE.DEVNET });

  const availableMethods = Object.getOwnPropertyNames(
    Object.getPrototypeOf(dlmm),
  ).filter(
    (name) =>
      typeof (dlmm as any)[name] === "function" && name !== "constructor",
  );

  log("Available SDK Methods", availableMethods);

  // Check connection details
  log("SDK Connection Info", {
    endpoint: dlmm.connection?.rpcEndpoint,
    commitment: dlmm.connection?.commitment,
  });

  // Check if SDK has any constants or configs
  try {
    const proto = Object.getPrototypeOf(dlmm);
    const properties = Object.getOwnPropertyNames(proto);
    log("SDK Properties", properties);
  } catch (error) {
    logError("SDK Properties Investigation", error);
  }
}

// Main execution
async function main() {
  try {
    await investigateSDK();
    await investigateAdvanced();

    console.log("\n✅ Investigation complete!");
    console.log("\n📝 Summary:");
    console.log("   - Check the logged data structures above");
    console.log("   - Update DLMM_SDK_ANALYSIS.md with findings");
    console.log("   - Implement proper TypeScript interfaces");
    console.log("   - Remove mock data based on real API structure");
  } catch (error) {
    logError("Investigation", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { investigateSDK };
