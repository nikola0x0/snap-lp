import { Connection, PublicKey } from "@solana/web3.js";
import { dlmmIntegration, DLMMPoolConfig, DLMMStrategyParams } from "./dlmm-integration";
import { RPC_ENDPOINT } from "@/constants/strategy-templates";

/**
 * Client-side DLMM service for browser wallet integration
 * This service runs in the browser and can interact with wallet adapters
 */
export class DLMMClientService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, {
      commitment: "confirmed",
      wsEndpoint: undefined,
    });
  }

  /**
   * Deploy a DLMM strategy using a browser wallet
   */
  async deployStrategy(
    poolAddress: string,
    baseTokenMint: string,
    quoteTokenMint: string,
    strategyType: "conservative" | "balanced" | "aggressive",
    amountX: number,
    amountY: number,
    wallet: any, // Wallet adapter instance
    sendTransaction: (transaction: any, connection: Connection) => Promise<string>
  ) {
    try {
      console.log("🚀 Starting client-side DLMM deployment...");

      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      // Create pool configuration
      const poolConfig: DLMMPoolConfig = {
        address: poolAddress,
        baseToken: {
          mintAddress: baseTokenMint,
          symbol: this.getTokenSymbol(baseTokenMint),
          name: this.getTokenName(baseTokenMint),
          decimals: this.getTokenDecimals(baseTokenMint),
        },
        quoteToken: {
          mintAddress: quoteTokenMint,
          symbol: this.getTokenSymbol(quoteTokenMint),
          name: this.getTokenName(quoteTokenMint),
          decimals: this.getTokenDecimals(quoteTokenMint),
        },
      };

      // Get strategy parameters
      const strategies = dlmmIntegration.getStrategyTemplates();
      const baseStrategyParams = strategies[strategyType];
      
      if (!baseStrategyParams) {
        throw new Error("Invalid strategy type");
      }

      // Create final strategy parameters with custom amounts
      const strategyParams: DLMMStrategyParams = {
        ...baseStrategyParams,
        amountX,
        amountY,
      };

      console.log("📊 Pool Config:", poolConfig);
      console.log("📈 Strategy Params:", strategyParams);

      // Execute the real DLMM transaction
      const result = await dlmmIntegration.addLiquidity(
        poolConfig,
        strategyParams,
        wallet,
        sendTransaction
      );

      console.log("✅ DLMM deployment result:", result);
      return result;

    } catch (error) {
      console.error("❌ Client-side DLMM deployment failed:", error);
      throw error;
    }
  }

  /**
   * Get positions for a wallet address
   */
  async getUserPositions(walletAddress: string, poolAddress?: string) {
    try {
      console.log("📋 Fetching user DLMM positions...");
      
      const publicKey = new PublicKey(walletAddress);
      
      if (poolAddress) {
        // Get positions for specific pool
        const pair = new PublicKey(poolAddress);
        const positions = await dlmmIntegration["dlmm"].getUserPositions({
          payer: publicKey,
          pair,
        });
        return positions;
      } else {
        // Get all positions (would need to implement getAllUserPositions)
        console.log("Getting all positions not yet implemented");
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching user positions:", error);
      return [];
    }
  }

  /**
   * Test connection and return status
   */
  async testConnection() {
    return dlmmIntegration.testConnection();
  }

  // Helper methods for token information
  private getTokenSymbol(mintAddress: string): string {
    const knownTokens: Record<string, string> = {
      "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM": "PYUSD",
      "So11111111111111111111111111111111111111112": "WSOL",
      "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr": "USDC",
    };
    return knownTokens[mintAddress] || `TOKEN_${mintAddress.slice(0, 8)}`;
  }

  private getTokenName(mintAddress: string): string {
    const knownTokens: Record<string, string> = {
      "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM": "PAYPAL USD",
      "So11111111111111111111111111111111111111112": "Wrapped SOL",
      "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr": "USDC",
    };
    return knownTokens[mintAddress] || `Token ${mintAddress.slice(0, 8)}`;
  }

  private getTokenDecimals(mintAddress: string): number {
    const knownTokens: Record<string, number> = {
      "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM": 6, // PYUSD
      "So11111111111111111111111111111111111111112": 9, // WSOL
      "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr": 6, // USDC
    };
    return knownTokens[mintAddress] || 9; // Default to 9 decimals
  }
}

// Export singleton instance
export const dlmmClient = new DLMMClientService();