#!/usr/bin/env npx tsx

/**
 * Investigate DLMM SDK method signatures
 * This script will examine the actual method signatures and types
 */

import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { PublicKey } from "@solana/web3.js";

async function investigateSDKMethods() {
  const dlmm = new LiquidityBookServices({ mode: MODE.DEVNET });
  
  console.log("🔍 Investigating SDK method signatures...\n");
  
  // Get a real pool address from our previous investigation
  const poolAddress = "76DAnaRfMuTgJt1rhMzvt3MfZLtXS5V8fdCKvGepNWFV";
  
  try {
    console.log("1. Testing getQuote method signature...");
    
    // Try to examine the getQuote method
    console.log("getQuote method:", typeof dlmm.getQuote);
    console.log("getQuote function:", dlmm.getQuote.toString().substring(0, 200) + "...");
    
    // Test with minimal parameters
    try {
      const result1 = await dlmm.getQuote(new PublicKey(poolAddress), 1000000); // Just 2 params
      console.log("✅ getQuote with 2 params succeeded:", typeof result1);
    } catch (error) {
      console.log("❌ getQuote with 2 params failed:", error.message);
    }
    
    // Test quote method (alternative)
    console.log("\n2. Testing quote method signature...");
    console.log("quote method:", typeof dlmm.quote);
    
    try {
      const result2 = await dlmm.quote(new PublicKey(poolAddress), 1000000);
      console.log("✅ quote with 2 params succeeded:", typeof result2);
    } catch (error) {
      console.log("❌ quote with 2 params failed:", error.message);
    }
    
    // Test getBinsReserveInformation
    console.log("\n3. Testing getBinsReserveInformation method signature...");
    console.log("getBinsReserveInformation method:", typeof dlmm.getBinsReserveInformation);
    
    try {
      const result3 = await dlmm.getBinsReserveInformation(new PublicKey(poolAddress));
      console.log("✅ getBinsReserveInformation with 1 param succeeded:", typeof result3);
    } catch (error) {
      console.log("❌ getBinsReserveInformation with 1 param failed:", error.message);
    }
    
    // Test getMaxAmountOutWithFee
    console.log("\n4. Testing getMaxAmountOutWithFee method signature...");
    console.log("getMaxAmountOutWithFee method:", typeof dlmm.getMaxAmountOutWithFee);
    
    try {
      const result4 = await dlmm.getMaxAmountOutWithFee(new PublicKey(poolAddress), 1000000);
      console.log("✅ getMaxAmountOutWithFee with 2 params succeeded:", typeof result4);
    } catch (error) {
      console.log("❌ getMaxAmountOutWithFee with 2 params failed:", error.message);
    }
    
  } catch (error) {
    console.error("Investigation failed:", error);
  }
}

// Run investigation
investigateSDKMethods().catch(console.error);