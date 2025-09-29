import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { dlmmClient } from "@/services/dlmm-client";

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
  const { connection } = useConnection();
  const [isDeploying, setIsDeploying] = useState(false);

  const deployToPool = async (
    selectedPool: SelectedPool,
    selectedTemplate: SelectedTemplate,
    deployConfig: DeployConfig
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
      const getStrategyType = (templateName: string): "conservative" | "balanced" | "aggressive" => {
        const name = templateName.toLowerCase();
        if (name.includes("conservative")) return "conservative";
        if (name.includes("aggressive")) return "aggressive";
        return "balanced"; // default
      };

      console.log("📋 Deployment Parameters:");
      console.log("- Pool:", `${selectedPool.baseToken.symbol}/${selectedPool.quoteToken.symbol} (${selectedPool.address.slice(0, 8)}...)`);
      console.log("- Strategy:", selectedTemplate.name);
      console.log("- Amounts:", `${deployConfig.tokenXAmount} ${selectedPool.baseToken.symbol}, ${deployConfig.tokenYAmount} ${selectedPool.quoteToken.symbol}`);
      console.log("- Wallet:", publicKey.toString().slice(0, 8) + "...");

      // Execute real DLMM deployment
      const result = await dlmmClient.deployStrategy(
        selectedPool.address,
        selectedPool.baseToken.mint,
        selectedPool.quoteToken.mint,
        getStrategyType(selectedTemplate.name),
        deployConfig.tokenXAmount,
        deployConfig.tokenYAmount,
        wallet,
        sendTransaction
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
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Check for common wallet errors
      if (errorMessage.includes("User rejected")) {
        throw new Error("Transaction was rejected by user");
      } else if (errorMessage.includes("insufficient funds") || errorMessage.includes("Insufficient")) {
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
      const result = await dlmmClient.testConnection();
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
      const positions = await dlmmClient.getUserPositions(
        publicKey.toString(),
        poolAddress
      );
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