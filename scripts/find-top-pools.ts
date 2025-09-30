/**
 * Script to find the top DLMM pools by volume from Saros Finance API
 * Usage: npx tsx scripts/find-top-pools.ts
 */

interface PoolData {
  address: string;
  baseToken: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  quoteToken: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  volume24h?: number;
  liquidity?: number;
  tvl?: number;
}

async function findTopPools() {
  try {
    console.log("🔍 Fetching DLMM pools from Saros Finance API...\n");

    const response = await fetch(
      "https://api-service-dev.saros.finance/v0/dlmm/pools"
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const pools: PoolData[] = data.pools || [];

    console.log(`📊 Total pools found: ${pools.length}\n`);

    // Sort by volume24h
    const sortedByVolume = [...pools]
      .filter(p => p.volume24h && p.volume24h > 0)
      .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
      .slice(0, 10);

    console.log("🔥 Top 10 Pools by 24h Volume:");
    console.log("=" .repeat(80));
    sortedByVolume.forEach((pool, index) => {
      const pair = `${pool.baseToken?.symbol || "?"} / ${pool.quoteToken?.symbol || "?"}`;
      const volume = pool.volume24h?.toLocaleString() || "0";
      const liquidity = pool.liquidity?.toLocaleString() || "N/A";

      console.log(`${index + 1}. ${pair.padEnd(20)} | Vol: $${volume.padEnd(15)} | Liq: $${liquidity}`);
      console.log(`   Address: ${pool.address}`);
      console.log();
    });

    // Sort by liquidity
    const sortedByLiquidity = [...pools]
      .filter(p => p.liquidity && p.liquidity > 0)
      .sort((a, b) => (b.liquidity || 0) - (a.liquidity || 0))
      .slice(0, 5);

    console.log("\n💰 Top 5 Pools by Liquidity:");
    console.log("=".repeat(80));
    sortedByLiquidity.forEach((pool, index) => {
      const pair = `${pool.baseToken?.symbol || "?"} / ${pool.quoteToken?.symbol || "?"}`;
      const liquidity = pool.liquidity?.toLocaleString() || "N/A";
      const volume = pool.volume24h?.toLocaleString() || "0";

      console.log(`${index + 1}. ${pair.padEnd(20)} | Liq: $${liquidity.padEnd(15)} | Vol: $${volume}`);
      console.log(`   Address: ${pool.address}`);
      console.log();
    });

    // Generate code for constants file
    console.log("\n📝 Suggested SUPPORTED_POOLS constant:");
    console.log("=".repeat(80));
    console.log("export const SUPPORTED_POOLS = [");

    const topPools = sortedByVolume.slice(0, 5);
    topPools.forEach((pool, index) => {
      const pair = `${pool.baseToken?.symbol || "TOKEN"}/${pool.quoteToken?.symbol || "TOKEN"}`;
      console.log(`  {`);
      console.log(`    address: "${pool.address}",`);
      console.log(`    name: "${pair}",`);
      console.log(`    description: "${pool.baseToken?.symbol} / ${pool.quoteToken?.symbol} - High volume pair",`);
      console.log(`  }${index < topPools.length - 1 ? "," : ""}`);
    });
    console.log("];");

  } catch (error) {
    console.error("❌ Error fetching pools:", error);
    process.exit(1);
  }
}

findTopPools();