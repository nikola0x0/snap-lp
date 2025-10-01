import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

const WSOL_MINT = "So11111111111111111111111111111111111111112";

// Initialize DLMM service
const sarosDLMM = new LiquidityBookServices({
  mode: MODE.DEVNET,
  options: {
    rpcUrl:
      "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7",
  },
});

async function findWSOLPools() {
  try {
    console.log("🔍 Fetching all DLMM pool addresses...\n");

    const allPoolAddresses = await sarosDLMM.fetchPoolAddresses();
    console.log(`📊 Total pools found: ${allPoolAddresses.length}\n`);

    console.log("🔎 Filtering for WSOL pairs...\n");

    const wsolPools = [];

    // Check each pool for WSOL
    for (const poolAddress of allPoolAddresses) {
      try {
        const metadata = await sarosDLMM.fetchPoolMetadata(poolAddress);

        // Check if either base or quote token is WSOL
        if (
          metadata.baseMint === WSOL_MINT ||
          metadata.quoteMint === WSOL_MINT
        ) {
          wsolPools.push({
            address: poolAddress,
            baseMint: metadata.baseMint,
            quoteMint: metadata.quoteMint,
            metadata,
          });

          console.log(`✅ Found WSOL pool: ${poolAddress}`);
          console.log(`   Base: ${metadata.baseMint}`);
          console.log(`   Quote: ${metadata.quoteMint}`);
          console.log();
        }
      } catch (error) {
        // Skip pools that can't be fetched
        console.error(
          `❌ Error fetching ${poolAddress}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    console.log(`\n🎯 Found ${wsolPools.length} WSOL pools\n`);
    console.log("=".repeat(80));

    // Print results
    console.log("\n📝 Add these to SUPPORTED_POOLS:");
    console.log("=".repeat(80));
    console.log("export const SUPPORTED_POOLS = [");

    wsolPools.slice(0, 5).forEach((pool, index) => {
      const isWSOLBase = pool.baseMint === WSOL_MINT;
      const otherToken = isWSOLBase
        ? pool.quoteMint.slice(0, 8)
        : pool.baseMint.slice(0, 8);

      console.log(`  {`);
      console.log(`    address: "${pool.address}",`);
      console.log(
        `    name: "${isWSOLBase ? "WSOL" : otherToken}/${isWSOLBase ? otherToken : "WSOL"}",`,
      );
      console.log(`    description: "Wrapped SOL pair",`);
      console.log(`  }${index < Math.min(wsolPools.length, 5) - 1 ? "," : ""}`);
    });
    console.log("];");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

findWSOLPools();
