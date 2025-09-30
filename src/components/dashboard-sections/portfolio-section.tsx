"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "../client-only";
import { useAppStore } from "@/store/app-store";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { SUPPORTED_POOLS } from "@/constants/supported-pools";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";

// DLMM Service instance
const dlmmService = new LiquidityBookServices({
  mode: MODE.DEVNET,
  options: {
    rpcUrl:
      "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7",
  },
});

interface DLMMPosition {
  positionMint: string;
  poolAddress: string;
  poolPair: string;
  lowerBinId: number;
  upperBinId: number;
  totalXAmount: number;
  totalYAmount: number;
  tokenX: string;
  tokenY: string;
  tokenXDecimals: number;
  tokenYDecimals: number;
  status: "in-range" | "out-of-range";
  feesX: number;
  feesY: number;
}

export function PortfolioSection() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { selectedPool } = useAppStore();
  const [positions, setPositions] = useState<DLMMPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real DLMM positions
  const fetchPositions = async () => {
    if (!connected || !publicKey) {
      console.log("⚠️ Cannot fetch positions: wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching DLMM positions for wallet:", publicKey.toString());

      const allPositions: DLMMPosition[] = [];

      // Get pool details for our supported pools from API
      const response = await fetch("https://api-service-dev.saros.finance/v0/dlmm/pools");
      const data = await response.json();

      if (!data.pools || data.pools.length === 0) {
        console.warn("⚠️ No pools available from API");
        setPositions([]);
        return;
      }

      // Filter to only check our supported pools
      const supportedPoolAddresses = SUPPORTED_POOLS.map(p => p.address);
      const poolsToCheck = data.pools.filter((pool: any) =>
        supportedPoolAddresses.includes(pool.address)
      );

      console.log(`📋 Checking ${poolsToCheck.length} supported pools for positions...`);
      console.log("Supported pool addresses:", supportedPoolAddresses);

      // Check each supported pool
      for (const pool of poolsToCheck) {
        try {
          const pairAddress = new PublicKey(pool.address);
          const pairInfo = await dlmmService.getPairAccount(pairAddress);

          if (!pairInfo) {
            console.warn(`⚠️ Could not fetch pair info for ${pool.address}`);
            continue;
          }

          const userPositions = await dlmmService.getUserPositions({
            payer: publicKey,
            pair: pairAddress,
          });

          if (userPositions.length > 0) {
            console.log(`✅ Found ${userPositions.length} positions in pool ${pool.address.slice(0, 8)}...`);
          }

          // Process each position
          for (const pos of userPositions) {
            console.log("Position data:", {
              positionMint: pos.positionMint.toString(),
              totalXAmount: pos.totalXAmount,
              totalYAmount: pos.totalYAmount,
              feesX: pos.feeX,
              feesY: pos.feeY,
              lowerBinId: pos.lowerBinId,
              upperBinId: pos.upperBinId,
            });

            const isInRange =
              (pos.lowerBinId || 0) <= pairInfo.activeId &&
              (pos.upperBinId || 0) >= pairInfo.activeId;

            // Get token symbols
            const baseSymbol = pool.baseToken?.symbol || getTokenSymbol(pool.baseToken?.mint || "");
            const quoteSymbol = pool.quoteToken?.symbol || getTokenSymbol(pool.quoteToken?.mint || "");

            allPositions.push({
              positionMint: pos.positionMint.toString(),
              poolAddress: pool.address,
              poolPair: `${baseSymbol}/${quoteSymbol}`,
              lowerBinId: pos.lowerBinId || 0,
              upperBinId: pos.upperBinId || 0,
              totalXAmount: pos.totalXAmount || 0,
              totalYAmount: pos.totalYAmount || 0,
              tokenX: pool.baseToken?.mint || "",
              tokenY: pool.quoteToken?.mint || "",
              tokenXDecimals: pool.baseToken?.decimals || 6,
              tokenYDecimals: pool.quoteToken?.decimals || 9,
              status: isInRange ? "in-range" : "out-of-range",
              feesX: pos.feeX || 0,
              feesY: pos.feeY || 0,
            });
          }
        } catch (poolError) {
          console.error(`❌ Error checking pool ${pool.address}:`, poolError);
        }
      }

      setPositions(allPositions);
      console.log(`✅ Total positions found: ${allPositions.length}`);
    } catch (err) {
      console.error("❌ Error fetching positions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [connected, publicKey, selectedPool]);

  // Legacy mock data for comparison
  const mockPositions = [
    {
      id: "1",
      strategyName: "Conservative Strategy",
      poolPair: "SOL/USDC",
      totalValue: 1250.5,
      initialDeposit: 1000,
      pnl: 250.5,
      pnlPercent: 25.05,
      apr: 12.5,
      feesEarned: 45.3,
      status: "active" as const,
      binUtilization: 85,
      riskLevel: "Conservative" as const,
    },
    {
      id: "2",
      strategyName: "Balanced Strategy",
      poolPair: "SAROS/SOL",
      totalValue: 875.25,
      initialDeposit: 800,
      pnl: 75.25,
      pnlPercent: 9.41,
      apr: 18.3,
      feesEarned: 23.15,
      status: "out-of-range" as const,
      binUtilization: 45,
      riskLevel: "Balanced" as const,
    },
  ];

  // Helper to get token symbol from mint address
  const getTokenSymbol = (mintAddress: string) => {
    const tokenMap: Record<string, string> = {
      CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM: "PYUSD",
      So11111111111111111111111111111111111111112: "WSOL",
      mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z: "C98",
      mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9: "USDT",
    };
    return tokenMap[mintAddress] || `${mintAddress.slice(0, 4)}...`;
  };

  // Calculate totals from real positions
  const totalPositions = positions.length;
  const activePositions = positions.filter((p) => p.status === "in-range").length;
  const poolsCount = new Set(positions.map(p => p.poolAddress)).size;

  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            View and manage your active DLMM positions and track performance.
          </p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your wallet to view your DLMM positions and portfolio
                  performance.
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            {publicKey?.toBase58().slice(0, 4)}...
            {publicKey?.toBase58().slice(-4)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPositions}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-muted-foreground">
                Total Positions
              </span>
            </div>
            <div className="text-2xl font-bold">{totalPositions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">In Range</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {activePositions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Out of Range</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {totalPositions - activePositions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Pools Tracked
              </span>
            </div>
            <div className="text-2xl font-bold">{poolsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
            <p className="text-muted-foreground">Loading positions...</p>
          </CardContent>
        </Card>
      )}

      {/* Positions List */}
      {!loading && positions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Positions Found</h3>
            <p className="text-muted-foreground">
              You don't have any active DLMM positions yet. Create your first
              position by deploying a strategy!
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && positions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Positions ({positions.length})</h2>

          {positions.map((position) => (
            <Card key={position.positionMint}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-base">
                        {position.poolPair}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Position: {position.positionMint.slice(0, 8)}...
                      </p>
                    </div>
                    <Badge
                      variant={
                        position.status === "in-range" ? "default" : "destructive"
                      }
                    >
                      {position.status === "in-range"
                        ? "In Range"
                        : "Out of Range"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {getTokenSymbol(position.tokenX)}/{getTokenSymbol(position.tokenY)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bins: {position.lowerBinId} - {position.upperBinId}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">
                      {getTokenSymbol(position.tokenX)} Amount
                    </div>
                    <div className="font-medium">
                      {position.totalXAmount === 0
                        ? "0.0000"
                        : (position.totalXAmount / Math.pow(10, selectedPool?.metadata?.extra?.tokenBaseDecimal || 6)).toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {getTokenSymbol(position.tokenY)} Amount
                    </div>
                    <div className="font-medium">
                      {position.totalYAmount === 0
                        ? "0.0000"
                        : (position.totalYAmount / Math.pow(10, selectedPool?.metadata?.extra?.tokenQuoteDecimal || 9)).toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {getTokenSymbol(position.tokenX)} Fees
                    </div>
                    <div className="font-medium text-green-600">
                      {position.feesX === 0
                        ? "0.000000"
                        : (position.feesX / Math.pow(10, selectedPool?.metadata?.extra?.tokenBaseDecimal || 6)).toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {getTokenSymbol(position.tokenY)} Fees
                    </div>
                    <div className="font-medium text-green-600">
                      {position.feesY === 0
                        ? "0.000000"
                        : (position.feesY / Math.pow(10, selectedPool?.metadata?.extra?.tokenQuoteDecimal || 9)).toFixed(6)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove Liquidity
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
