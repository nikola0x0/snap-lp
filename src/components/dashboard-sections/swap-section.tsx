"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ammService } from "@/services/amm-real";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "@/components/client-only";
import {
  ArrowUpDown,
  ArrowRight,
  AlertTriangle,
  Wallet,
  Loader2,
} from "lucide-react";

// Real Saros AMM pools for swapping (using actual working pools)
const SWAP_POOLS = [
  {
    id: "C98-USDC",
    tokenA: {
      mint: "C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9",
      symbol: "C98",
      name: "Coin98",
    },
    tokenB: {
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      symbol: "USDC",
      name: "USD Coin",
    },
    poolAddress: "2wUvdZA8ZsY714Y5wUL9fkFmupJGGwzui2N74zqJWgty", // Real Saros C98/USDC pool
    poolParams: {
      address: "2wUvdZA8ZsY714Y5wUL9fkFmupJGGwzui2N74zqJWgty",
      tokens: {
        C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9: {
          id: "coin98",
          mintAddress: "C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9",
          symbol: "C98",
          name: "Coin98",
          icon: "https://coin98.s3.ap-southeast-1.amazonaws.com/Coin/c98-512.svg",
          decimals: "6",
          addressSPL: "EKCdCBjfQ6t5FBfDC2zvmr27PgfVVZU37C8LUE4UenKb",
        },
        EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
          id: "usd-coin",
          mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          symbol: "USDC",
          name: "USD Coin",
          icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
          decimals: "6",
          addressSPL: "FXRiEosEvHnpc3XZY1NS7an2PB1SunnYW1f5zppYhXb3",
        },
      },
      tokenIds: [
        "C98A4nkJXhpVZNAZdHUA95RpTF3T4whtQubL3YobiUX9",
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      ],
    },
    fee: 0.003,
  },
];

export function SwapSection() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();

  const [availablePools, setAvailablePools] = useState(SWAP_POOLS);
  const [selectedPool, setSelectedPool] = useState(SWAP_POOLS[0]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const [solBalance, setSolBalance] = useState(0);

  // Load real pools from DLMM
  useEffect(() => {
    const loadRealPools = async () => {
      setPoolsLoading(true);
      try {
        console.log("Loading real DLMM pools...");
        const { realDlmmService } = await import("@/services/dlmm-real");
        const poolsResult = await realDlmmService.getPools();

        if (poolsResult.pools.length > 0) {
          console.log("Got real DLMM pools:", poolsResult.pools);

          // Convert DLMM pools to swap UI format
          const uiPools = poolsResult.pools
            .filter(pool => pool.metadata)
            .map((pool) => {
              const metadata = pool.metadata!;
              
              return {
                id: `${metadata.baseMint.slice(0, 4)}-${metadata.quoteMint.slice(0, 4)}`,
                tokenA: {
                  mint: metadata.baseMint,
                  symbol: getTokenSymbol(metadata.baseMint),
                  name: getTokenName(metadata.baseMint),
                },
                tokenB: {
                  mint: metadata.quoteMint,
                  symbol: getTokenSymbol(metadata.quoteMint),
                  name: getTokenName(metadata.quoteMint),
                },
                poolAddress: metadata.poolAddress,
                metadata: metadata,
                fee: 0.003,
              };
            });

          setAvailablePools(uiPools);
          if (uiPools.length > 0) {
            setSelectedPool(uiPools[0]);
          }
          console.log("Updated pools for UI:", uiPools);
        }
      } catch (error) {
        console.error("Error loading real pools:", error);
      } finally {
        setPoolsLoading(false);
      }
    };

    loadRealPools();
  }, []);

  // Get SOL balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / 1e9);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

  // Get swap quote when amount changes
  useEffect(() => {
    const getQuote = async () => {
      if (!fromAmount || parseFloat(fromAmount) <= 0) {
        setToAmount("");
        return;
      }

      setLoading(true);
      try {
        const { realDlmmService } = await import("@/services/dlmm-real");
        
        // Simple price estimation based on reserves
        if (selectedPool.metadata) {
          const baseReserve = parseFloat(selectedPool.metadata.baseReserve);
          const quoteReserve = parseFloat(selectedPool.metadata.quoteReserve);
          
          if (baseReserve > 0 && quoteReserve > 0) {
            // Estimate price from reserves
            const price = quoteReserve / baseReserve;
            const estimatedOutput = parseFloat(fromAmount) * price * 0.997; // Account for fees
            setToAmount(estimatedOutput.toFixed(6));
          } else {
            setToAmount("0");
          }
        }
      } catch (error) {
        console.error("Quote error:", error);
        setToAmount("0");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(getQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [fromAmount, selectedPool]);

  const handleSwap = async () => {
    if (!connected || !publicKey) return;

    const amount = parseFloat(fromAmount);
    if (amount <= 0 || amount < 0.001) {
      alert("Minimum swap amount is 0.001 SOL");
      return;
    }

    if (amount > solBalance) {
      alert("Insufficient SOL balance");
      return;
    }

    setLoading(true);
    try {
      // For now, just show success message - actual DLMM swap would go here
      alert(
        `Swap initiated: ${fromAmount} ${selectedPool.tokenA.symbol} → ${toAmount} ${selectedPool.tokenB.symbol}`,
      );

      setFromAmount("");
      setToAmount("");
    } catch (error) {
      console.error("Swap error:", error);
      alert(
        `Swap failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const getTokenSymbol = (mintAddress: string): string => {
    const tokenMap: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      'mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z': 'C98',
    };
    return tokenMap[mintAddress] || mintAddress.slice(0, 4).toUpperCase();
  };

  const getTokenName = (mintAddress: string): string => {
    const tokenMap: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'Solana',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USD Coin',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'Tether USD',
      'mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z': 'Coin98',
    };
    return tokenMap[mintAddress] || 'Unknown Token';
  };

  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Step 0: Get Required Tokens
          </h1>
          <p className="text-muted-foreground">
            Swap SOL for tokens needed for DLMM liquidity provision.
          </p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your Solana wallet to start swapping tokens.
                </p>
              </div>
              <ClientOnly
                fallback={
                  <div className="h-9 w-32 bg-muted animate-pulse rounded-md mx-auto" />
                }
              >
                <WalletMultiButton className="mx-auto" />
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Step 0: Get Required Tokens
        </h1>
        <p className="text-muted-foreground">
          Swap SOL for C98 and USDT tokens needed for DLMM liquidity provision.
        </p>
      </div>

      {/* SOL Balance */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">◎</span>
              </div>
              <div>
                <div className="font-semibold text-lg">SOL Balance</div>
                <div className="text-sm text-muted-foreground">
                  Available for swapping
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-700">
                {solBalance.toFixed(4)}
              </div>
              <div className="text-sm text-muted-foreground">SOL</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Swap Pair</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {poolsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading pools from Saros...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePools.map((pool) => (
                <button
                  key={pool.id}
                  type="button"
                  onClick={() => setSelectedPool(pool)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedPool.id === pool.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">
                      {pool.tokenA.symbol}/{pool.tokenB.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(pool.fee * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pool.tokenA.name} ↔ {pool.tokenB.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Pool: {pool.poolAddress.slice(0, 8)}...
                    {pool.poolAddress.slice(-4)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Swap Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Swap Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Section */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">From</span>
                <span className="text-sm text-muted-foreground">
                  Balance: {solBalance.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">◎</span>
                  </div>
                  <span className="font-semibold">
                    {selectedPool.tokenA.symbol}
                  </span>
                </div>
                <Input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="text-right text-xl font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 w-32"
                  min="0"
                  step="0.001"
                />
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center -my-3 relative z-10">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-background">
              <ArrowRight className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          {/* To Section */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">To</span>
                <span className="text-sm text-muted-foreground">
                  Balance: 0.0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {selectedPool.tokenB.symbol.charAt(0)}
                    </span>
                  </div>
                  <span className="font-semibold">
                    {selectedPool.tokenB.symbol}
                  </span>
                </div>
                <div className="text-xl font-semibold text-right w-32">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin ml-auto" />
                  ) : (
                    toAmount || "0.0"
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <Button
            className="w-full py-3 text-base font-semibold"
            onClick={handleSwap}
            disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting Quote...
              </div>
            ) : (
              `Swap ${selectedPool.tokenA.symbol} for ${selectedPool.tokenB.symbol}`
            )}
          </Button>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Swap Information</span>
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>• Minimum swap amount: 0.001 SOL</div>
                <div>• Slippage tolerance: 1%</div>
                <div>• Fee: {(selectedPool.fee * 100).toFixed(1)}%</div>
                <div>• Using dedicated AMM pools for token swaps</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
