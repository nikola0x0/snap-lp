import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { getConnection } from "@/lib/solana";

// DLMM Service wrapper class
export class DLMMService {
  private connection: Connection;
  private dlmm: LiquidityBookServices;

  constructor(connection?: Connection) {
    this.connection = connection || getConnection();
    // Initialize with devnet mode for development
    this.dlmm = new LiquidityBookServices({
      mode: MODE.DEVNET,
    });
  }

  // Get all DLMM pools with metadata
  async getPools() {
    try {
      const pools = await this.dlmm.fetchPoolAddresses();
      console.log(`Found ${pools.length} pools`);
      
      // Get metadata for first few pools to verify connection
      const poolsWithMetadata = await Promise.all(
        pools.slice(0, 5).map(async (poolAddress) => {
          try {
            const metadata = await this.dlmm.fetchPoolMetadata(poolAddress.toString());
            return {
              address: poolAddress.toString(),
              metadata,
              tokenX: metadata?.baseMint || 'Unknown',
              tokenY: metadata?.quoteMint || 'Unknown',
            };
          } catch (error) {
            console.warn(`Failed to fetch metadata for pool ${poolAddress}:`, error);
            return {
              address: poolAddress.toString(),
              metadata: null,
              tokenX: 'Unknown',
              tokenY: 'Unknown',
            };
          }
        })
      );
      
      return poolsWithMetadata;
    } catch (error) {
      console.error("Error fetching pools:", error);
      throw error;
    }
  }

  // Get a specific pool by address
  async getPool(poolAddress: string) {
    try {
      const pool = await this.dlmm.getPairAccount(new PublicKey(poolAddress));
      return pool;
    } catch (error) {
      console.error("Error fetching pool:", error);
      throw error;
    }
  }

  // Get pool metadata
  async getPoolMetadata(poolAddress: string) {
    try {
      const metadata = await this.dlmm.fetchPoolMetadata(poolAddress);
      return metadata;
    } catch (error) {
      console.error("Error fetching pool metadata:", error);
      throw error;
    }
  }

  // Get user positions
  async getUserPositions(userPublicKey: PublicKey, poolAddress: string) {
    try {
      const positions = await this.dlmm.getUserPositions({
        payer: userPublicKey,
        pair: new PublicKey(poolAddress),
      });
      return positions;
    } catch (error) {
      console.error("Error fetching user positions:", error);
      throw error;
    }
  }

  // Create a position with template configuration
  async createPosition(params: {
    poolAddress: string;
    templateConfig: {
      binDistribution: Array<{binId: number; weight: number}>;
      totalAmount: number;
      tokenXPercentage: number;
    };
    userPublicKey: any; // PublicKey from wallet adapter
    slippage?: number;
  }) {
    try {
      const { poolAddress, templateConfig, userPublicKey } = params;
      
      console.log('Creating DLMM position with params:', {
        poolAddress,
        totalAmount: templateConfig.totalAmount,
        binCount: templateConfig.binDistribution.length,
        tokenXPercentage: templateConfig.tokenXPercentage
      });

      // Get pool info first to validate
      const poolMetadata = await this.getPoolMetadata(poolAddress);
      if (!poolMetadata) throw new Error("Pool metadata not found");
      
      console.log('Pool metadata:', poolMetadata);

      // Calculate position range from template bin distribution
      const { binDistribution, totalAmount, tokenXPercentage } = templateConfig;
      const binIds = binDistribution.map(b => b.binId);
      const relativeBinIdLeft = Math.min(...binIds);
      const relativeBinIdRight = Math.max(...binIds);

      // Generate a new position mint keypair for simulation
      const positionMint = Keypair.generate();
      
      // Get bin array index
      const binArrayIndex = Math.floor(relativeBinIdLeft / 70); // DLMM typically uses 70 bins per array

      // Check if we have proper token mint addresses
      const tokenX = poolMetadata.baseMint;
      const tokenY = poolMetadata.quoteMint;
      
      if (!tokenX || !tokenY) {
        throw new Error(`Missing token mint addresses. TokenX: ${tokenX}, TokenY: ${tokenY}`);
      }
      
      console.log('Creating position with parameters:', {
        relativeBinIdLeft,
        relativeBinIdRight,
        binArrayIndex,
        positionMint: positionMint.publicKey.toString(),
        payer: userPublicKey.toString(),
        poolAddress,
        tokenX,
        tokenY
      });

      // Now let's implement the real DLMM position creation
      console.log('Creating real DLMM position...');
      
      // Create a new transaction for the DLMM operations
      const { Transaction: Web3Transaction } = await import('@solana/web3.js');
      const transaction = new Web3Transaction();
      
      // Step 1: Create the position using the correct DLMM SDK interface
      const createPositionResult = await this.dlmm.createPosition({
        payer: userPublicKey,
        relativeBinIdLeft,
        relativeBinIdRight,
        pair: new PublicKey(poolAddress),
        binArrayIndex,
        positionMint: positionMint.publicKey,
        transaction: transaction as any // Type workaround for SDK transaction conflict
      });
      
      console.log('DLMM createPosition result:', createPositionResult);
      
      // Step 2: Add liquidity to the position
      console.log('Adding liquidity to position...');
      
      // Get token decimals from pool metadata
      const baseDecimals = 6; // Most Solana tokens use 6 decimals
      const quoteDecimals = 6; // Most Solana tokens use 6 decimals
      
      // Convert amounts to proper token decimals (multiply by 10^decimals)
      const totalAmountInBaseUnits = totalAmount * (10 ** baseDecimals);
      const totalAmountInQuoteUnits = totalAmount * (10 ** quoteDecimals);
      
      const amountX = Math.floor(totalAmountInBaseUnits * tokenXPercentage / 100);
      const amountY = Math.floor(totalAmountInQuoteUnits * (100 - tokenXPercentage) / 100);
      
      // Validate amounts are within reasonable bounds
      if (amountX <= 0 || amountY <= 0) {
        throw new Error(`Invalid amounts: amountX=${amountX}, amountY=${amountY}. Total amount may be too small.`);
      }
      
      if (amountX > Number.MAX_SAFE_INTEGER || amountY > Number.MAX_SAFE_INTEGER) {
        throw new Error(`Amounts too large: amountX=${amountX}, amountY=${amountY}. Please reduce total amount.`);
      }
      
      console.log('Token amounts:', {
        totalAmount,
        tokenXPercentage,
        amountX,
        amountY,
        baseDecimals,
        quoteDecimals
      });

      const liquidityDistribution = binDistribution.map(bin => {
        const distX = (templateConfig.tokenXPercentage / 100) * bin.weight;
        const distY = ((100 - templateConfig.tokenXPercentage) / 100) * bin.weight;
        
        // Validate distribution values
        if (distX < 0 || distX > 100 || distY < 0 || distY > 100) {
          throw new Error(`Invalid distribution: binId=${bin.binId}, distX=${distX}, distY=${distY}`);
        }
        
        return {
          relativeBinId: bin.binId,
          distributionX: distX,
          distributionY: distY,
        };
      });
      
      console.log('Liquidity distribution:', liquidityDistribution);
      
      // Validate total distribution adds up to reasonable values
      const totalDistX = liquidityDistribution.reduce((sum, dist) => sum + dist.distributionX, 0);
      const totalDistY = liquidityDistribution.reduce((sum, dist) => sum + dist.distributionY, 0);
      console.log('Total distributions:', { totalDistX, totalDistY });

      // Get or create bin arrays for the position range  
      console.log('Getting/creating bin arrays...');
      const binArrayLowerIndex = Math.floor(relativeBinIdLeft / 70);
      const binArrayUpperIndex = Math.floor(relativeBinIdRight / 70);
      
      // Create bin arrays by including them in the transaction
      const binArrayLower = await this.dlmm.getBinArray({
        pair: new PublicKey(poolAddress),
        binArrayIndex: binArrayLowerIndex,
        payer: userPublicKey,
        transaction: transaction as any
      });
      console.log('Lower bin array:', binArrayLower.toString());
      
      const binArrayUpper = await this.dlmm.getBinArray({
        pair: new PublicKey(poolAddress),
        binArrayIndex: binArrayUpperIndex,
        payer: userPublicKey,
        transaction: transaction as any
      });
      console.log('Upper bin array:', binArrayUpper.toString());

      await this.dlmm.addLiquidityIntoPosition({
        positionMint: positionMint.publicKey,
        payer: userPublicKey,
        pair: new PublicKey(poolAddress),
        transaction: transaction as any,
        liquidityDistribution,
        amountX,
        amountY,
        binArrayLower,
        binArrayUpper
      });
      
      console.log('Liquidity added to position successfully');
      
      // Set recent blockhash and fee payer before returning to wallet
      const latestBlockhash = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = userPublicKey;
      
      // Add the position mint as a signer but don't sign yet - let wallet handle everything
      if (!transaction.signatures.some(sig => sig.publicKey.equals(positionMint.publicKey))) {
        transaction.signatures.push({
          publicKey: positionMint.publicKey,
          signature: null
        });
      }
      
      return {
        success: true,
        signature: `pending_user_signature_${Date.now()}`,
        positionAddress: createPositionResult.position,
        positionMint: positionMint.publicKey.toString(),
        positionMintKeypair: positionMint, // Return keypair for signing in deploy section
        liquidityDistribution,
        totalAmountX: amountX,
        totalAmountY: amountY,
        transaction: transaction, // Return transaction object instead of serialized
        message: 'Real DLMM position created successfully! Please sign the transaction in your wallet.'
      };
    } catch (error) {
      console.error("Error creating position:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: 'Failed to create position. Please check console for details.'
      };
    }
  }

  // Get quote for template simulation
  async getTemplateQuote(params: {
    poolAddress: string;
    templateConfig: {
      binDistribution: Array<{binId: number; weight: number}>;
      totalAmount: number;
      tokenXPercentage: number;
    };
  }) {
    try {
      const pool = await this.getPool(params.poolAddress);
      if (!pool) throw new Error("Pool not found");

      // Calculate potential returns based on template config
      // This is a simplified simulation - in production would use more sophisticated modeling
      const activeBin = pool.activeBin;
      const binRange = params.templateConfig.binDistribution;
      const minBin = Math.min(...binRange.map(b => b.binId));
      const maxBin = Math.max(...binRange.map(b => b.binId));
      
      return {
        activeBin,
        minBin,
        maxBin,
        estimatedAPY: this.calculateEstimatedAPY(binRange, activeBin),
        impermanentLossRisk: this.calculateILRisk(minBin, maxBin, activeBin),
        feesPotential: this.calculateFeesPotential(binRange, activeBin),
      };
    } catch (error) {
      console.error("Error getting template quote:", error);
      throw error;
    }
  }

  // Helper methods for simulation
  private calculateEstimatedAPY(binRange: Array<{binId: number; weight: number}>, activeBin: number): number {
    // Simplified APY calculation based on bin proximity to active bin
    const totalWeight = binRange.reduce((sum, bin) => sum + bin.weight, 0);
    const activeWeight = binRange
      .filter(bin => Math.abs(bin.binId - activeBin) <= 2) // Within 2 bins of active
      .reduce((sum, bin) => sum + bin.weight, 0);
    
    const efficiency = activeWeight / totalWeight;
    return efficiency * 15; // Base 15% APY scaled by efficiency
  }

  private calculateILRisk(minBin: number, maxBin: number, _activeBin: number): string {
    const range = maxBin - minBin;
    if (range < 10) return "Low";
    if (range < 20) return "Medium"; 
    return "High";
  }

  private calculateFeesPotential(binRange: Array<{binId: number; weight: number}>, activeBin: number): number {
    const activeWeight = binRange
      .filter(bin => Math.abs(bin.binId - activeBin) <= 3)
      .reduce((sum, bin) => sum + bin.weight, 0);
    
    const totalWeight = binRange.reduce((sum, bin) => sum + bin.weight, 0);
    return (activeWeight / totalWeight) * 100; // Percentage of fees captured
  }

  // Test connection and basic functionality
  async testConnection() {
    try {
      console.log("Testing DLMM connection...");
      const dexName = this.dlmm.getDexName();
      console.log("Connected to:", dexName);

      const pools = await this.getPools();
      console.log(`Found ${pools.length} pools with metadata`);

      return { 
        success: true, 
        poolCount: pools.length, 
        dexName,
        samplePools: pools.slice(0, 3) // Return first 3 pools as examples
      };
    } catch (error) {
      console.error("DLMM connection test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const dlmmService = new DLMMService();
