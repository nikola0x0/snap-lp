import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { dlmmIntegration } from "@/services/dlmm-integration";

export interface DeployConfig {
  tokenXAmount: number;
  tokenYAmount: number;
  slippage: number;
}

export interface SelectedPool {
  address: string;
  baseToken?: {
    symbol: string;
    mint: string;
  };
  quoteToken?: {
    symbol: string;
    mint: string;
  };
}

export interface SelectedTemplate {
  name: string;
}

/**
 * Hook for handling DLMM deployment with real wallet integration
 */
export function useDLMMDeploy() {
  const { wallet, publicKey, sendTransaction } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);

  const deployToPool = async (
    selectedPool: SelectedPool,
    selectedTemplate: SelectedTemplate,
    deployConfig: DeployConfig,
  ) => {
    try {
      console.log("🚀 Starting DLMM deployment with real wallet...");

      if (!wallet || !publicKey || !sendTransaction) {
        throw new Error("Wallet not connected or missing sendTransaction");
      }

      if (!selectedPool.baseToken?.mint || !selectedPool.quoteToken?.mint) {
        throw new Error("Missing token mint addresses from pool data");
      }

      setIsDeploying(true);

      // Map template name to strategy type
      const getStrategyType = (
        templateName: string,
      ): "conservative" | "balanced" | "aggressive" => {
        const name = templateName.toLowerCase();
        if (name.includes("conservative")) return "conservative";
        if (name.includes("aggressive")) return "aggressive";
        return "balanced"; // default
      };

      console.log("📋 Deployment Parameters:");
      console.log(
        "- Pool:",
        `${selectedPool.baseToken.symbol}/${selectedPool.quoteToken.symbol} (${selectedPool.address.slice(0, 8)}...)`,
      );
      console.log("- Strategy:", selectedTemplate.name);
      console.log(
        "- Amounts:",
        `${deployConfig.tokenXAmount} ${selectedPool.baseToken.symbol}, ${deployConfig.tokenYAmount} ${selectedPool.quoteToken.symbol}`,
      );
      console.log("- Wallet:", publicKey.toString().slice(0, 8) + "...");

      // Get strategy parameters
      const strategies = dlmmIntegration.getStrategyTemplates();
      const strategyType = getStrategyType(selectedTemplate.name);
      const baseStrategyParams = strategies[strategyType];

      if (!baseStrategyParams) {
        throw new Error("Invalid strategy type");
      }

      // Create pool configuration
      const poolConfig = {
        address: selectedPool.address,
        baseToken: {
          mintAddress: selectedPool.baseToken.mint,
          symbol: selectedPool.baseToken.symbol,
          name: selectedPool.baseToken.symbol,
          decimals: 6, // Will be fetched from chain if needed
        },
        quoteToken: {
          mintAddress: selectedPool.quoteToken.mint,
          symbol: selectedPool.quoteToken.symbol,
          name: selectedPool.quoteToken.symbol,
          decimals: 6,
        },
      };

      // Create strategy parameters with custom amounts
      const strategyParams = {
        ...baseStrategyParams,
        amountX: deployConfig.tokenXAmount,
        amountY: deployConfig.tokenYAmount,
      };

      // Execute real DLMM deployment
      const result = await dlmmIntegration.addLiquidity(
        poolConfig,
        strategyParams,
        wallet,
        sendTransaction,
      );

      if (result.success) {
        console.log("🎉 DLMM deployment successful!");
        console.log("📄 Signatures:", result.signatures);
        console.log("🏦 Position Mints:", result.positionMints);

        return {
          success: true,
          message: `Successfully deployed ${selectedTemplate.name} strategy!`,
          signatures: result.signatures,
          positionMints: result.positionMints,
        };
      } else {
        throw new Error(result.error || "Deployment failed");
      }
    } catch (error) {
      console.error("❌ DLMM deployment failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check for common wallet errors
      if (errorMessage.includes("User rejected")) {
        throw new Error("Transaction was rejected by user");
      } else if (
        errorMessage.includes("insufficient funds") ||
        errorMessage.includes("Insufficient")
      ) {
        throw new Error("Insufficient funds for transaction");
      } else if (errorMessage.includes("Wallet not connected")) {
        throw new Error("Please connect your wallet first");
      } else {
        throw new Error(`Deployment failed: ${errorMessage}`);
      }
    } finally {
      setIsDeploying(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await dlmmIntegration.testConnection();
      console.log("🧪 DLMM connection test:", result);
      return result;
    } catch (error) {
      console.error("❌ Connection test failed:", error);
      return { success: false, message: "Connection test failed" };
    }
  };

  const getUserPositions = async (poolAddress?: string) => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      // Get positions directly from DLMM SDK
      if (!poolAddress) {
        console.log("Getting all positions not yet implemented");
        return [];
      }

      const positions = await dlmmIntegration["dlmm"].getUserPositions({
        payer: publicKey,
        pair: new PublicKey(poolAddress),
      });
      return positions;
    } catch (error) {
      console.error("❌ Failed to get user positions:", error);
      return [];
    }
  };

  return {
    deployToPool,
    testConnection,
    getUserPositions,
    isDeploying,
    isConnected: !!(wallet && publicKey),
  };
}
