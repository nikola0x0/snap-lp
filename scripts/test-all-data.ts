/**
 * Comprehensive test of all data sources for AI Strategy Advisor
 */
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { PublicKey } from "@solana/web3.js";

const POOL = "H9EPqQKCvv9ddzK6KHjo8vvUPMLMJXmMmru9KUYNaDFQ"; // PYUSD/WSOL

async function testAllData() {
  console.log("🔍 Testing Data Availability for AI Strategy Advisor\n");

  // 1. DLMM SDK Data
  console.log("=".repeat(50));
  console.log("1️⃣  DLMM SDK DATA (Available)");
  console.log("=".repeat(50));

  const dlmm = new LiquidityBookServices({
    mode: MODE.DEVNET,
    options: { rpcUrl: "https://api.devnet.solana.com" },
  });

  const pool = new PublicKey(POOL);
  const pair = await dlmm.getPairAccount(pool);

  console.log("\n✅ Basic Pool Info:");
  console.log(`  - Active Bin ID: ${pair.activeId}`);
  console.log(`  - Bin Step: ${pair.binStep}`);
  console.log(`  - Base Factor: ${pair.staticFeeParameters.baseFactor}`);
  console.log(
    `  - Volatility: ${pair.dynamicFeeParameters.volatilityAccumulator}`,
  );
  console.log(`  - Token X: ${pair.tokenMintX}`);
  console.log(`  - Token Y: ${pair.tokenMintY}`);

  // 2. CEX Price Data (Jupiter API)
  console.log("\n" + "=".repeat(50));
  console.log("2️⃣  CEX PRICE DATA (Testing Jupiter API)");
  console.log("=".repeat(50));

  try {
    // Jupiter Price API v2 - for SOL/USDC
    const jupiterUrl = "https://price.jup.ag/v4/price?ids=SOL";
    const jupResponse = await fetch(jupiterUrl);
    const jupData = await jupResponse.json();

    console.log("\n✅ Jupiter Price API:");
    console.log(JSON.stringify(jupData, null, 2));
  } catch (e: any) {
    console.log("\n❌ Jupiter API failed:", e.message);
  }

  // 3. Binance Public API (No auth required)
  console.log("\n" + "=".repeat(50));
  console.log("3️⃣  BINANCE 24H DATA (Testing Public API)");
  console.log("=".repeat(50));

  try {
    const binanceUrl =
      "https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT";
    const binResponse = await fetch(binanceUrl);
    const binData = await binResponse.json();

    console.log("\n✅ Binance 24h Stats:");
    console.log(`  - Price: $${binData.lastPrice}`);
    console.log(`  - 24h Volume: ${binData.volume} SOL`);
    console.log(`  - 24h Quote Volume: $${binData.quoteVolume}`);
    console.log(`  - Price Change 24h: ${binData.priceChangePercent}%`);
    console.log(`  - 24h High: $${binData.highPrice}`);
    console.log(`  - 24h Low: $${binData.lowPrice}`);
  } catch (e: any) {
    console.log("\n❌ Binance API failed:", e.message);
  }

  // 4. CoinGecko API (Free tier)
  console.log("\n" + "=".repeat(50));
  console.log("4️⃣  COINGECKO DATA (Testing Free API)");
  console.log("=".repeat(50));

  try {
    const cgUrl =
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true";
    const cgResponse = await fetch(cgUrl);
    const cgData = await cgResponse.json();

    console.log("\n✅ CoinGecko Data:");
    console.log(JSON.stringify(cgData, null, 2));
  } catch (e: any) {
    console.log("\n❌ CoinGecko API failed:", e.message);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY: What Data Is Available for AI");
  console.log("=".repeat(50));
  console.log(`
✅ FROM DLMM SDK (Current State):
  - Active bin ID & bin step
  - Fee parameters
  - Volatility metrics
  - Token mints
  - [CAN GET] Bin arrays & liquidity distribution
  - [CAN GET] User positions in bins

✅ FROM CEX APIs (Free):
  - Current market price (Jupiter, Binance)
  - 24h trading volume
  - 24h price change %
  - 24h high/low
  - Real-time volatility indicators

❌ NOT AVAILABLE:
  - Historical pool data (Saros doesn't track)
  - Past bin distributions
  - Historical APY/fees

💡 RECOMMENDATION FOR AI:
  Use CURRENT STATE analysis combining:
  1. DLMM pool structure & liquidity distribution
  2. CEX volatility metrics (24h change, volume)
  3. Compare pool price vs CEX price (efficiency)
  4. User's template bins vs current active bin

  This is ENOUGH for intelligent analysis without historical data!
  `);
}

testAllData().catch(console.error);
