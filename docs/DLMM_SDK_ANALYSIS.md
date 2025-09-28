# Saros DLMM SDK Analysis & Implementation Guide

**Date**: 2025-01-28  
**Project**: SnapLP - DLMM Strategy Templates Platform  
**SDK Version**: @saros-finance/dlmm-sdk@^1.4.0  

## Executive Summary

This document analyzes the Saros DLMM SDK to understand its API structure, capabilities, and limitations for implementing our SnapLP platform. The goal is to create a clear implementation roadmap that uses **only real DLMM data** without any mock/fallback data.

## Our Use Case Requirements

### Primary Features Needed

1. **Pool Discovery & Information**
   - List all available DLMM pools
   - Get pool metadata (token pairs, active bins, liquidity, fees)
   - Real-time pool price data for charts
   - Pool liquidity distribution across bins

2. **Position Creation & Management**
   - Create DLMM positions with specific bin ranges
   - Add liquidity to positions with custom distributions
   - Query user positions by wallet
   - Calculate position values and performance metrics

3. **Real-time Data for UI**
   - Current pool prices and 24h changes
   - Active bin information
   - Volume and liquidity metrics
   - Price history for chart visualization

4. **Strategy Templates**
   - Simulate position performance before deployment
   - Calculate impermanent loss and fee estimates
   - Validate bin ranges and distributions

## SDK API Analysis

### Core Service Class

```typescript
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

const liquidityBookServices = new LiquidityBookServices({
  mode: MODE.MAINNET, // or MODE.DEVNET
});
```

### Available Methods (from documentation)

#### 1. Pool Discovery
```typescript
// Get all pool addresses
const poolAddresses = await liquidityBookServices.fetchPoolAddresses();

// Get specific pool metadata
const metadata = await liquidityBookServices.fetchPoolMetadata(poolAddress);

// Get pool pair account data
const pairInfo = await liquidityBookServices.getPairAccount(new PublicKey(poolAddress));
```

#### 2. Position Management
```typescript
// Get user positions
const positions = await liquidityBookServices.getUserPositions({
  payer: userPublicKey,
  pair: poolPublicKey,
});

// Create position (returns transaction instructions)
const createResult = await liquidityBookServices.createPosition({
  payer: userPublicKey,
  relativeBinIdLeft: -10,
  relativeBinIdRight: 10,
  pair: poolPublicKey,
  binArrayIndex: calculatedIndex,
  positionMint: positionKeypair.publicKey,
  transaction: transaction
});

// Add liquidity to position
await liquidityBookServices.addLiquidityIntoPosition({
  positionMint: positionPublicKey,
  payer: userPublicKey,
  pair: poolPublicKey,
  transaction: transaction,
  liquidityDistribution: distributionArray,
  amountX: tokenXAmount,
  amountY: tokenYAmount,
  binArrayLower: binArrayLowerPublicKey,
  binArrayUpper: binArrayUpperPublicKey
});
```

#### 3. Utility Methods
```typescript
// Get bin arrays
const binArray = await liquidityBookServices.getBinArray({
  pair: poolPublicKey,
  binArrayIndex: index,
  payer: userPublicKey,
  transaction: transaction
});
```

## Data Structure Analysis

### Pool Metadata Structure (Inferred from SDK usage)
Based on the documentation and TypeScript errors, the actual metadata structure appears to be different from what we assumed:

```typescript
// What we need to determine:
interface ActualPoolMetadata {
  // Token information - need to find correct property names
  tokenX?: string;  // First token mint address
  tokenY?: string;  // Second token mint address  
  baseMint?: string; // Alternative naming?
  quoteMint?: string; // Alternative naming?
  
  // Reserve information
  reserveX?: BN | number; // Token X reserves
  reserveY?: BN | number; // Token Y reserves
  
  // Decimals
  baseDecimals?: number;
  quoteDecimals?: number;
  
  // Pool configuration
  binStep?: number;     // Price step between bins
  activeBin?: number;   // Currently active bin ID
  
  // Additional metadata
  // Need to explore what else is available
}
```

### Pool Pair Account Structure
```typescript
interface PairAccount {
  activeId: number;    // Active bin ID
  binStep: number;     // Price step between bins
  // Additional fields to be determined
}
```

## Implementation Strategy

### Phase 1: SDK Structure Discovery
1. **Investigate actual metadata structure**
   - Create test script to fetch real pool metadata
   - Log all available properties
   - Document the actual API response format

2. **Test core SDK methods**
   - `fetchPoolAddresses()` - confirm it works and returns valid addresses
   - `fetchPoolMetadata(address)` - understand response structure
   - `getPairAccount(address)` - understand pair data structure

### Phase 2: Real Data Integration
1. **Pool Service Implementation**
   ```typescript
   class DLMMService {
     async getRealPools() {
       // Use only fetchPoolAddresses() + fetchPoolMetadata()
       // No fallback to mock data
     }
     
     async getRealPoolCurrentPrice(address: string) {
       // Use getPairAccount() + price calculation from bins
       // No fallback pricing
     }
     
     async getRealPoolPriceHistory(address: string) {
       // Implementation depends on what historical data SDK provides
       // May need to store/aggregate current prices over time
     }
   }
   ```

2. **Error Handling Strategy**
   - If SDK call fails → return null/throw error
   - If data missing → return null/throw error  
   - No mock data fallbacks
   - Clear error messages to user

### Phase 3: Advanced Features
1. **Real Position Creation**
   - Use actual `createPosition()` and `addLiquidityIntoPosition()`
   - Handle real transaction signing and submission
   - Real error handling for on-chain failures

2. **Real-time Updates**
   - Implement WebSocket or polling for live price updates
   - Real bin state changes
   - Actual volume and liquidity metrics

## Current Implementation Issues

### 1. Type Mismatches
Our current code assumes metadata properties (`tokenX`, `tokenY`, etc.) that may not exist on the actual SDK response. We need to:
- Remove all hardcoded property access
- Investigate actual property names
- Update TypeScript interfaces

### 2. Mock Data Dependencies  
Current code falls back to mock data when SDK calls fail. This violates the "real data only" requirement. We need to:
- Remove all mock data generation
- Remove all fallback pricing
- Let failures bubble up as errors

### 3. Price Calculation Issues
The current price calculation `Math.pow(1 + binStep / 10000, activeBin)` causes overflow for extreme bin values. We need to:
- Understand how Saros actually calculates prices
- Use SDK-provided price calculation methods if available
- Implement proper bounds checking without fallbacks

## Action Plan

### Immediate Next Steps (Today)
1. **Create SDK Investigation Script**
   ```typescript
   // scripts/investigate-sdk.ts
   // - Connect to real pools
   // - Log all metadata structures
   // - Test all core methods
   // - Document findings
   ```

2. **Update Type Definitions**
   - Create accurate interfaces based on real API responses
   - Remove incorrect property assumptions

3. **Implement Real-Only Service**
   - Remove all mock data
   - Remove all fallbacks
   - Use only actual SDK responses

### Success Criteria
- [ ] All pool data comes from real DLMM SDK calls
- [ ] No mock data or fallbacks anywhere in the codebase
- [ ] Price calculations work with real pool data
- [ ] Token symbols resolve correctly from actual metadata
- [ ] Charts display real DLMM pool price data
- [ ] Position creation works with real on-chain transactions

## SDK Investigation Results ✅

**Completed**: 2025-01-28 via `scripts/investigate-sdk.ts`

### Key Findings

#### 1. Real API Structure ✅
**Pool Metadata**:
```typescript
interface RealPoolMetadata {
  poolAddress: string;
  baseMint: string;        // ✅ Correct property name (not tokenX)
  quoteMint: string;       // ✅ Correct property name (not tokenY)
  baseReserve: string;     // String representation of BN
  quoteReserve: string;    // String representation of BN
  tradeFee: number;        // Decimal fee (e.g., 0.8 = 0.8%)
  extra: {
    tokenBaseDecimal: number;  // Token decimals
    tokenQuoteDecimal: number; // Token decimals
    hook?: string;            // Optional hook address
  }
}
```

**Pair Account** (from `getPairAccount()`):
```typescript
interface RealPairAccount {
  binStep: number;         // ✅ Price step (e.g., 20, 100)
  activeId: number;        // ✅ Active bin ID (e.g., 8388608)
  tokenMintX: string;      // First token mint
  tokenMintY: string;      // Second token mint
  staticFeeParameters: FeeParams;
  dynamicFeeParameters: DynamicFeeParams;
  // ... other fields
}
```

#### 2. Price Calculation Issue ❌ 
**Problem**: The formula `Math.pow(1 + binStep / 10000, activeId)` produces `Infinity` with real data:
- `activeId: 8388608` (very large number)  
- `binStep: 20-100` 
- Result: `1.002^8388608 = Infinity`

**Root Cause**: The `activeId` values are extremely large (8M+) causing mathematical overflow.

#### 3. Available SDK Methods ✅
The SDK has these useful methods we weren't using:
- `getQuote()` - Get price quotes
- `getBinsReserveInformation()` - Bin liquidity data  
- `quote()` - Alternative price calculation
- `getMaxAmountOutWithFee()` - Fee-adjusted calculations

#### 4. Real Pool Data ✅
- **323 pools found** on devnet
- **Real addresses** like `76DAnaRfMuTgJt1rhMzvt3MfZLtXS5V8fdCKvGepNWFV`
- **Real token pairs** like SOL/USDT, various test tokens
- **Real reserves and fees**

### Questions Resolved

1. ✅ **Pool Metadata**: `baseMint`/`quoteMint` (not `tokenX`/`tokenY`)
2. ❓ **Price Calculation**: May need SDK's `getQuote()` instead of manual calculation
3. ❓ **Historical Data**: Not available directly, may need to track over time
4. ❓ **Real-time Updates**: `listenNewPoolAddress()` exists for new pools
5. ✅ **Volume Data**: Not in basic metadata, may be in reserves  
6. ✅ **Liquidity Distribution**: `getBinsReserveInformation()` method exists

## Risk Assessment

### High Risk
- **SDK API Changes**: Documentation may be outdated
- **Network Issues**: Devnet vs Mainnet differences  
- **Data Availability**: Some data may not be available via SDK

### Medium Risk
- **Performance**: Real-time data polling may be slow
- **Rate Limits**: Too many SDK calls may get throttled

### Low Risk
- **TypeScript Issues**: Can be resolved with proper types
- **UI Updates**: Interface can be adjusted based on real data

---

**Next Action**: Create investigation script to explore real SDK responses and update our implementation accordingly.