"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

interface TokenSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTokens: {
    tokenXAmount: number;
    tokenYAmount: number;
    tokenXSymbol: string;
    tokenYSymbol: string;
    tokenXUsdValue: number;
    tokenYUsdValue: number;
    totalUsdValue: number;
    // Legacy properties for backward compatibility
    c98Amount: number;
    usdtAmount: number;
  };
  onSwapComplete: () => void;
}

export function TokenSwapModal({
  isOpen,
  onClose,
  requiredTokens,
  onSwapComplete,
}: TokenSwapModalProps) {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();

  const [solBalance, setSolBalance] = useState<number>(0);

  const checkSolBalance = useCallback(async () => {
    if (!publicKey) return;

    try {
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / 1e9);
    } catch (error) {
      console.error("Error checking SOL balance:", error);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (isOpen && connected && publicKey) {
      checkSolBalance();
    }
  }, [isOpen, connected, publicKey, checkSolBalance]);

  const handleClose = () => {
    onClose();
  };

  const handleContinue = () => {
    // For demo purposes, just mark as complete
    onSwapComplete();
    onClose();
  };

  if (!connected) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Please connect your wallet to proceed with token requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 text-center">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Get Required Tokens</DialogTitle>
          <DialogDescription>
            Ensure you have the required tokens to provide liquidity to the DLMM pool.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 mb-2">
                    DLMM requires both tokens to provide liquidity. Make sure you have sufficient amounts of both tokens in your wallet.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-blue-700">
                    <span>Need devnet tokens?</span>
                    <code className="bg-blue-100 px-2 py-1 rounded">
                      solana airdrop 2
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current SOL Balance:</span>
                <Badge variant={solBalance >= 1 ? "default" : "destructive"}>
                  {solBalance.toFixed(4)} SOL
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Required Tokens:</h4>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {requiredTokens.tokenXAmount.toFixed(6)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {requiredTokens.tokenXSymbol || 'Token X'}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ≈ ${requiredTokens.tokenXUsdValue?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {requiredTokens.tokenYAmount.toFixed(6)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {requiredTokens.tokenYSymbol || 'Token Y'}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ≈ ${requiredTokens.tokenYUsdValue?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm text-orange-800 mb-2">
                    <strong>Note:</strong> This demo assumes you already have the required tokens in your wallet. 
                    In a production app, you would integrate with DEX aggregators like Jupiter or use direct DLMM swap functionality.
                  </p>
                  <p className="text-xs text-orange-700">
                    For devnet testing, you can mint test tokens or get them from faucets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              I Have The Tokens - Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}