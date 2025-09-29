"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2 } from "lucide-react";
import { useDLMMDeploy } from "@/hooks/useDLMMDeploy";
import { useAppStore } from "@/store/app-store";

interface DLMMDeployButtonProps {
  deployConfig: {
    tokenXAmount: number;
    tokenYAmount: number;
    slippage: number;
  };
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

/**
 * Real DLMM deployment button component
 * This demonstrates how to integrate real wallet transactions
 */
export function DLMMDeployButton({ 
  deployConfig, 
  onSuccess, 
  onError, 
  disabled 
}: DLMMDeployButtonProps) {
  const { selectedPool, selectedTemplate } = useAppStore();
  const { deployToPool, isDeploying, isConnected, testConnection } = useDLMMDeploy();

  const handleDeploy = async () => {
    if (!selectedPool || !selectedTemplate) {
      const error = new Error("Please select a pool and template first");
      onError?.(error);
      return;
    }

    if (!isConnected) {
      const error = new Error("Please connect your wallet first");
      onError?.(error);
      return;
    }

    try {
      console.log("🎯 Initiating real DLMM deployment...");
      
      // Test connection first (optional)
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection test failed: ${connectionTest.message}`);
      }
      console.log("✅ Connection test passed");

      // Deploy to the pool with real transactions
      const result = await deployToPool(
        selectedPool,
        selectedTemplate,
        deployConfig
      );

      console.log("🎉 Deployment completed successfully!");
      
      // Success callback
      onSuccess?.(result);

      // Show success alert
      alert(
        `🎉 DLMM Position Created Successfully!\n\n` +
        `Strategy: ${selectedTemplate.name}\n` +
        `Pool: ${selectedPool.baseToken?.symbol}/${selectedPool.quoteToken?.symbol}\n` +
        `Amounts: ${deployConfig.tokenXAmount} + ${deployConfig.tokenYAmount}\n\n` +
        `Transactions: ${result.signatures?.length || 0}\n` +
        `Position Mints: ${result.positionMints?.length || 0}\n\n` +
        `Check your wallet for the new DLMM position!`
      );

    } catch (error) {
      console.error("❌ Deployment error:", error);
      
      const deploymentError = error instanceof Error ? error : new Error("Unknown deployment error");
      onError?.(deploymentError);

      // Show error alert
      alert(`❌ Deployment Failed\n\n${deploymentError.message}`);
    }
  };

  if (!isConnected) {
    return (
      <Button disabled variant="outline">
        Connect Wallet to Deploy
      </Button>
    );
  }

  if (!selectedPool || !selectedTemplate) {
    return (
      <Button disabled variant="outline">
        Select Pool & Strategy First
      </Button>
    );
  }

  return (
    <Button
      onClick={handleDeploy}
      disabled={disabled || isDeploying}
      className="min-w-[200px]"
    >
      {isDeploying ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Deploying to DLMM...
        </>
      ) : (
        <>
          <Rocket className="w-4 h-4 mr-2" />
          Deploy Strategy (Real Tx)
        </>
      )}
    </Button>
  );
}

/**
 * Simple usage example:
 * 
 * ```tsx
 * <DLMMDeployButton
 *   deployConfig={{
 *     tokenXAmount: 0.5,
 *     tokenYAmount: 0.1,
 *     slippage: 1.0
 *   }}
 *   onSuccess={(result) => {
 *     console.log("Deployment successful!", result);
 *     // Handle success (e.g., refresh positions, navigate, etc.)
 *   }}
 *   onError={(error) => {
 *     console.error("Deployment failed:", error);
 *     // Handle error (e.g., show toast, log, etc.)
 *   }}
 * />
 * ```
 */