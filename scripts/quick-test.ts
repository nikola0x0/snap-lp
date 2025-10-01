import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { PublicKey } from "@solana/web3.js";

async function test() {
  const dlmm = new LiquidityBookServices({
    mode: MODE.DEVNET,
    options: { rpcUrl: "https://api.devnet.solana.com" },
  });

  const pool = new PublicKey("H9EPqQKCvv9ddzK6KHjo8vvUPMLMJXmMmru9KUYNaDFQ");

  try {
    const pair = await dlmm.getPairAccount(pool);
    console.log("✅ Pair data:", JSON.stringify(pair, null, 2));
  } catch (e: any) {
    console.error("❌ Error:", e.message);
  }
}

test();
