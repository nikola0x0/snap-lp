import { Connection, PublicKey } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { RPC_ENDPOINT } from "@/constants/strategy-templates";

// Real DLMM SDK types
interface RealPoolMetadata {
  poolAddress: string;
  baseMint: string;
  quoteMint: string;
  baseReserve: string;
  quoteReserve: string;
  tradeFee: number;
  extra: {
    tokenBaseDecimal: number;
    tokenQuoteDecimal: number;
    hook?: string;
  };
}

interface RealPairAccount {
  binStep: number;
  activeId: number;
  tokenMintX: string;
  tokenMintY: string;
  staticFeeParameters: any;
  dynamicFeeParameters: any;
  protocolFeesX: string;
  protocolFeesY: string;
}

// Known DLMM pool addresses (Devnet pools)
const KNOWN_POOLS = [
  {
    address: "DMb8Xta7STwCkHwdWQSazjoJWG1vnNYkk2Pnenj9kPV",
    baseToken: {
      mintAddress: "So11111111111111111111111111111111111111112",
      symbol: "WSOL",
      name: "Wrapped SOL",
      decimals: 9,
    },
    quoteToken: {
      mintAddress: "mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
    }
  },
  {
    address: "3jPMRAaibizCW1nZhyyuSsDSy7beSP4yAfJZtxCBsYuD",
    baseToken: {
      mintAddress: "9WNGiZEescNbYYRh8iFNLwXerk6Cxvs4Lo5tckQDpJDt",
      symbol: "TKN1",
      name: "Test Token 1",
      decimals: 9,
    },
    quoteToken: {
      mintAddress: "So11111111111111111111111111111111111111112",
      symbol: "WSOL",
      name: "Wrapped SOL",
      decimals: 9,
    }
  },
  {
    address: "7zzwywSok1HLmpqd2SpctCUbDR6oV4RYZmmMPgNxWDs5",
    baseToken: {
      mintAddress: "FAg5dMk72hEBkohyirpvVmiTQmoRNwZsKhYF4ar8EcUL",
      symbol: "TKN2",
      name: "Test Token 2",
      decimals: 9,
    },
    quoteToken: {
      mintAddress: "So11111111111111111111111111111111111111112",
      symbol: "WSOL",
      name: "Wrapped SOL",
      decimals: 9,
    }
  },
];

/**
 * Optimized Real DLMM Service - Uses actual Saros DLMM SDK methods
 */
export class RealDLMMService {
  private connection: Connection;
  private dlmm: LiquidityBookServices;
  private poolsCache: any = null;
  private priceCache = new Map<string, { data: any; timestamp: number }>();

  // Cache durations (in milliseconds)
  private readonly POOLS_CACHE_DURATION = 30000; // 30 seconds
  private readonly PRICE_CACHE_DURATION = 10000; // 10 seconds

  // Rate limiting
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 100; // 100ms between requests

  constructor(connection?: Connection) {
    this.connection = connection || new Connection(RPC_ENDPOINT, {
      commitment: "confirmed",
      wsEndpoint: undefined,
    });

    this.dlmm = new LiquidityBookServices({
      mode: MODE.DEVNET,
      options: {
        rpcUrl: RPC_ENDPOINT,
      },
    });
  }

  // Rate limiting helper
  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  // Get all DLMM pools using known pool addresses
  async getPools() {
    console.log("🔍 Fetching real DLMM pools from SDK...");
    
    // Check cache first
    if (this.poolsCache && (Date.now() - this.poolsCache.timestamp < this.POOLS_CACHE_DURATION)) {
      console.log("📄 Returning cached pools data");
      return this.poolsCache.data;
    }

    await this.throttleRequest();

    try {
      console.log(`📊 Checking ${KNOWN_POOLS.length} known pool addresses`);
      
      const poolsWithMetadata = [];
      
      for (const pool of KNOWN_POOLS) {
        try {
          await this.throttleRequest();
          
          // Get pair account information
          const pairAccount = await this.dlmm.getPairAccount(new PublicKey(pool.address));
          
          if (!pairAccount) {
            console.log(`⏭️  Skipping pool ${pool.address.slice(0, 8)}... (no pair account)`);
            continue;
          }

          // Use actual mints from pair account (fetched from blockchain)
          const actualBaseMint = pairAccount.tokenMintX.toString();
          const actualQuoteMint = pairAccount.tokenMintY.toString();

          console.log(`  📋 Pool ${pool.address.slice(0, 8)} token mints:`, {
            baseMint: actualBaseMint,
            quoteMint: actualQuoteMint,
            baseSymbol: this.getTokenSymbolFromAddress(actualBaseMint),
            quoteSymbol: this.getTokenSymbolFromAddress(actualQuoteMint),
          });

          // Create metadata object from pair account info
          const metadataObj: RealPoolMetadata = {
            poolAddress: pool.address,
            baseMint: actualBaseMint,
            quoteMint: actualQuoteMint,
            baseReserve: "1000000", // Mock reserves for demo - in real implementation would get from reserves
            quoteReserve: "2000000",
            tradeFee: 0.003, // 0.3% fee
            extra: {
              tokenBaseDecimal: pool.baseToken.decimals,
              tokenQuoteDecimal: pool.quoteToken.decimals,
            }
          };

          console.log(`✅ Found active pool ${pool.address.slice(0, 8)}... (${pool.baseToken.symbol}/${pool.quoteToken.symbol})`);

          poolsWithMetadata.push({
            address: pool.address,
            metadata: metadataObj,
            reserves: { baseReserveNum: 1000000, quoteReserveNum: 2000000 },
            pairAccount: {
              binStep: pairAccount.binStep,
              activeId: pairAccount.activeId,
              tokenMintX: pairAccount.tokenMintX.toString(),
              tokenMintY: pairAccount.tokenMintY.toString(),
            }
          });
          
        } catch (error) {
          console.log(`❌ Failed to fetch data for pool ${pool.address}: ${error}`);
          continue;
        }
      }

      const result = {
        pools: poolsWithMetadata,
        totalCount: poolsWithMetadata.length,
        processedCount: KNOWN_POOLS.length
      };

      // Cache the result
      this.poolsCache = { data: result, timestamp: Date.now() };
      
      console.log(`✅ Successfully fetched ${result.totalCount} DLMM pools with metadata`);
      return result;
      
    } catch (error) {
      console.error("❌ Error fetching DLMM pools:", error);
      return { pools: [], totalCount: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get pool price data for charts
  async getPoolPriceData(poolAddress: string, days: number = 7) {
    const cacheKey = `${poolAddress}-${days}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < this.PRICE_CACHE_DURATION)) {
      return cached.data;
    }

    await this.throttleRequest();

    try {
      // For demo purposes, generate some realistic price data
      // In a real implementation, you would need to fetch historical data from an indexer
      const now = Date.now();
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const dataPoints = Math.min(days * 24, 168); // Max 1 week of hourly data
      
      const priceData = [];
      let basePrice = 100 + Math.random() * 50; // Start with a random base price
      
      for (let i = dataPoints - 1; i >= 0; i--) {
        const time = new Date(now - (i * millisecondsPerDay / 24)).toISOString();
        
        // Add some realistic price movement
        const change = (Math.random() - 0.5) * 0.05; // ±2.5% change
        basePrice *= (1 + change);
        
        priceData.push({
          time,
          price: basePrice,
          volume: Math.random() * 1000000,
          activeBin: 8388608 + Math.floor((Math.random() - 0.5) * 100)
        });
      }

      const result = priceData;
      this.priceCache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
      
    } catch (error) {
      console.error("Error fetching pool price data:", error);
      return [];
    }
  }

  // Get current pool price using real DLMM SDK
  async getPoolCurrentPrice(poolAddress: string) {
    const cacheKey = `current-${poolAddress}`;
    const cached = this.priceCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < this.PRICE_CACHE_DURATION)) {
      return cached.data;
    }

    await this.throttleRequest();

    try {
      // Get pair account to calculate current price
      const pairAccount = await this.dlmm.getPairAccount(new PublicKey(poolAddress));
      
      if (!pairAccount) {
        throw new Error("Pool pair account not found");
      }

      // Calculate price from active bin
      // This is a simplified calculation - in reality you'd need to consider bin step and other factors
      const activeBin = pairAccount.activeId;
      const binStep = pairAccount.binStep;
      
      // Convert active bin to price (simplified)
      // Real price calculation would be more complex and use proper DLMM formulas
      const price = (1 + binStep / 10000) ** (activeBin - 8388608);
      
      const result = {
        price: Math.abs(price), // Ensure positive price
        activeBin,
        binStep,
        tokenMintX: pairAccount.tokenMintX.toString(),
        tokenMintY: pairAccount.tokenMintY.toString(),
      };

      this.priceCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
      
    } catch (error) {
      console.error("Error fetching pool current price:", error);
      // Return fallback price data
      return {
        price: 100 + Math.random() * 50,
        activeBin: 8388608,
        binStep: 20,
        tokenMintX: "",
        tokenMintY: "",
      };
    }
  }

  // Get pool metrics
  async getPoolMetrics(poolAddress: string) {
    await this.throttleRequest();

    try {
      // Get basic pool data
      const currentPrice = await this.getPoolCurrentPrice(poolAddress);
      
      // Generate realistic metrics for demo
      const volume24h = Math.random() * 10000000; // Random volume
      const volume7d = volume24h * 7 * (0.8 + Math.random() * 0.4); // 7-day volume
      const tvl = Math.random() * 5000000; // Random TVL
      const fees24h = volume24h * 0.003; // 0.3% fee
      const apr = (fees24h * 365 / tvl) * 100; // Annualized
      
      return {
        liquidity: tvl,
        volume24h,
        volume7d,
        feeRate: 0.003, // 0.3%
        apr,
        price: currentPrice.price,
        priceChange24h: (Math.random() - 0.5) * 10, // ±5%
        activeBin: currentPrice.activeBin || 8388608,
      };
      
    } catch (error) {
      console.error("Error fetching pool metrics:", error);
      return {
        liquidity: 0,
        volume24h: 0,
        volume7d: 0,
        feeRate: 0.003,
        apr: 0,
        price: 0,
        priceChange24h: 0,
        activeBin: 8388608,
      };
    }
  }

  // Get volume history
  async getVolumeHistory(_poolAddress: string, days: number = 7) {
    await this.throttleRequest();

    try {
      // Generate realistic volume data for demo
      const now = Date.now();
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      
      const volumeData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now - (i * millisecondsPerDay)).toISOString().split('T')[0];
        const volume = Math.random() * 1000000;
        
        volumeData.push({
          date,
          volume,
          trades: Math.floor(volume / 1000), // Approximate number of trades
        });
      }

      return volumeData;
      
    } catch (error) {
      console.error("Error fetching volume history:", error);
      return [];
    }
  }

  // Get liquidity history
  async getLiquidityHistory(_poolAddress: string, days: number = 7) {
    await this.throttleRequest();

    try {
      // Generate realistic liquidity data for demo
      const now = Date.now();
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      
      const liquidityData = [];
      let baseLiquidity = 1000000 + Math.random() * 4000000;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now - (i * millisecondsPerDay)).toISOString().split('T')[0];
        
        // Add some realistic liquidity movement
        const change = (Math.random() - 0.5) * 0.1; // ±5% change
        baseLiquidity *= (1 + change);
        
        liquidityData.push({
          date,
          liquidity: baseLiquidity,
          providers: Math.floor(baseLiquidity / 50000), // Approximate number of LP providers
        });
      }

      return liquidityData;
      
    } catch (error) {
      console.error("Error fetching liquidity history:", error);
      return [];
    }
  }

  // Test connection using real DLMM SDK
  async testConnection() {
    console.log("🧪 Testing DLMM connection...");
    
    try {
      await this.throttleRequest();
      
      // Test connection by trying to get info about a known pool
      const testPool = KNOWN_POOLS[0];
      const pairAccount = await this.dlmm.getPairAccount(new PublicKey(testPool.address));
      
      const result = {
        success: true,
        connection: "Connected to Solana RPC",
        dlmmService: "DLMM SDK initialized successfully", 
        poolsFound: KNOWN_POOLS.length,
        testPool: pairAccount ? {
          address: testPool.address,
          baseMint: testPool.baseToken.mintAddress,
          quoteMint: testPool.quoteToken.mintAddress,
          activeId: pairAccount.activeId,
          binStep: pairAccount.binStep,
        } : null,
        timestamp: new Date().toISOString()
      };
      
      console.log("✅ DLMM connection test successful");
      return result;
      
    } catch (error) {
      console.error("❌ DLMM connection test failed:", error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        connection: "Failed to connect to Solana RPC",
        dlmmService: "DLMM SDK initialization failed",
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper method to get token symbol from mint address
  getTokenSymbolFromAddress(mintAddress: string): string {
    // First check KNOWN_POOLS for symbol mapping
    for (const pool of KNOWN_POOLS) {
      if (pool.baseToken.mintAddress === mintAddress) {
        return pool.baseToken.symbol;
      }
      if (pool.quoteToken.mintAddress === mintAddress) {
        return pool.quoteToken.symbol;
      }
    }

    // Fallback to known tokens map (Devnet tokens)
    const knownTokens: Record<string, string> = {
      // SOL
      "So11111111111111111111111111111111111111112": "WSOL",
      // Stablecoins (Devnet)
      "mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9": "USDT",
      "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM": "PYUSD",
      "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr": "USDC",
      // Test tokens (Devnet)
      "9WNGiZEescNbYYRh8iFNLwXerk6Cxvs4Lo5tckQDpJDt": "TKN1",
      "FAg5dMk72hEBkohyirpvVmiTQmoRNwZsKhYF4ar8EcUL": "TKN2",
    };

    return knownTokens[mintAddress] || `TOKEN_${mintAddress.slice(0, 8)}`;
  }
}

// Export singleton instance
export const realDlmmService = new RealDLMMService();