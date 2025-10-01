"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "../client-only";
import { useAppStore } from "@/store/app-store";
import { TerminalHeader } from "../terminal-header";
import { ConsoleLoading } from "../console-loading";
import {
  LiquidityBookServices,
  MODE,
  RemoveLiquidityType,
} from "@saros-finance/dlmm-sdk";
import { SUPPORTED_POOLS } from "@/constants/supported-pools";
import {
  TrendingUp,
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
  const { connected, publicKey, sendTransaction } = useWallet();
  const { selectedPool } = useAppStore();
  const [positions, setPositions] = useState<DLMMPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingPosition, setProcessingPosition] = useState<string | null>(
    null,
  );

  // Fetch real DLMM positions
  const fetchPositions = async () => {
    if (!connected || !publicKey) {
      console.log("⚠️ Cannot fetch positions: wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "🔍 Fetching DLMM positions for wallet:",
        publicKey.toString(),
      );

      const allPositions: DLMMPosition[] = [];

      // Get pool details for our supported pools from local API
      const response = await fetch("/api/dlmm-pools");
      const data = await response.json();

      if (!data.success || !data.pools || data.pools.length === 0) {
        console.warn("⚠️ No pools available from API");
        setPositions([]);
        return;
      }

      // Filter to only check our supported pools
      const supportedPoolAddresses = SUPPORTED_POOLS.map((p) => p.address);
      const poolsToCheck = data.pools.filter((pool: any) =>
        supportedPoolAddresses.includes(pool.address),
      );

      console.log(
        `📋 Checking ${poolsToCheck.length} supported pools for positions...`,
      );
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
            console.log(
              `✅ Found ${userPositions.length} positions in pool ${pool.address.slice(0, 8)}...`,
            );
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
            const baseSymbol =
              pool.baseToken?.symbol ||
              getTokenSymbol(pool.baseToken?.mint || "");
            const quoteSymbol =
              pool.quoteToken?.symbol ||
              getTokenSymbol(pool.quoteToken?.mint || "");

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
      setError(
        err instanceof Error ? err.message : "Failed to fetch positions",
      );
    } finally {
      setLoading(false);
    }
  };
  // Remove liquidity from a position
  const handleRemoveLiquidity = async (position: DLMMPosition) => {
    if (!publicKey || !sendTransaction) {
      alert("Please connect your wallet");
      return;
    }

    const confirmed = confirm(
      `Remove all liquidity from position ${position.positionMint.slice(0, 8)}...?\n\nThis will withdraw all tokens and close the position.`,
    );

    if (!confirmed) return;

    setProcessingPosition(position.positionMint);

    try {
      console.log(
        "🔄 Removing liquidity from position:",
        position.positionMint,
      );

      const pairAddress = new PublicKey(position.poolAddress);
      const pairInfo = await dlmmService.getPairAccount(pairAddress);

      if (!pairInfo) {
        throw new Error("Could not fetch pair info");
      }

      // Get the user's position details
      const userPositions = await dlmmService.getUserPositions({
        payer: publicKey,
        pair: pairAddress,
      });

      const targetPosition = userPositions.find(
        (p) => p.positionMint.toString() === position.positionMint,
      );

      if (!targetPosition) {
        throw new Error("Position not found");
      }

      // Remove all liquidity from this position
      const { txs, txCreateAccount, txCloseAccount } =
        await dlmmService.removeMultipleLiquidity({
          maxPositionList: [
            {
              position: targetPosition.position,
              start: targetPosition.lowerBinId || 0,
              end: targetPosition.upperBinId || 0,
              positionMint: targetPosition.positionMint,
            },
          ],
          payer: publicKey,
          type: RemoveLiquidityType.Both,
          pair: pairAddress,
          tokenMintX: new PublicKey(position.tokenX),
          tokenMintY: new PublicKey(position.tokenY),
          activeId: pairInfo.activeId,
        });

      const allTxs: Transaction[] = [];
      if (txCreateAccount) allTxs.push(txCreateAccount as any);
      allTxs.push(...(txs as any));
      if (txCloseAccount) allTxs.push(txCloseAccount as any);

      console.log(`📝 Executing ${allTxs.length} transactions...`);

      // Execute transactions
      for (let i = 0; i < allTxs.length; i++) {
        const tx = allTxs[i];
        const { blockhash } =
          await dlmmService.connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;

        const signature = await sendTransaction(
          tx,
          dlmmService.connection as any,
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          },
        );

        console.log(`✅ Transaction ${i + 1}/${allTxs.length}:`, signature);
        await dlmmService.connection.confirmTransaction(signature, "confirmed");
      }

      alert(
        `✅ Successfully removed liquidity!\n\nTokens have been returned to your wallet.`,
      );

      // Refresh positions
      await fetchPositions();
    } catch (err) {
      console.error("❌ Error removing liquidity:", err);
      alert(
        `❌ Failed to remove liquidity:\n${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setProcessingPosition(null);
    }
  };

  // Claim accumulated fees
  const handleClaimFees = async (position: DLMMPosition) => {
    if (!publicKey || !sendTransaction) {
      alert("Please connect your wallet");
      return;
    }

    const totalFeesX = position.feesX / Math.pow(10, position.tokenXDecimals);
    const totalFeesY = position.feesY / Math.pow(10, position.tokenYDecimals);

    if (totalFeesX === 0 && totalFeesY === 0) {
      alert("No fees to claim from this position.");
      return;
    }

    const confirmed = confirm(
      `Claim fees from position ${position.positionMint.slice(0, 8)}...?\n\n` +
        `${getTokenSymbol(position.tokenX)}: ${totalFeesX.toFixed(6)}\n` +
        `${getTokenSymbol(position.tokenY)}: ${totalFeesY.toFixed(6)}`,
    );

    if (!confirmed) return;

    setProcessingPosition(position.positionMint);

    try {
      console.log("💰 Claiming fees from position:", position.positionMint);

      const pairAddress = new PublicKey(position.poolAddress);

      // Get the user's position details
      const userPositions = await dlmmService.getUserPositions({
        payer: publicKey,
        pair: pairAddress,
      });

      const targetPosition = userPositions.find(
        (p) => p.positionMint.toString() === position.positionMint,
      );

      if (!targetPosition) {
        throw new Error("Position not found");
      }

      // Claim fees by removing 0% liquidity (just claims fees)
      const { txs } = await dlmmService.removeMultipleLiquidity({
        maxPositionList: [
          {
            position: targetPosition.position,
            start: targetPosition.lowerBinId || 0,
            end: targetPosition.upperBinId || 0,
            positionMint: targetPosition.positionMint,
          },
        ],
        payer: publicKey,
        type: RemoveLiquidityType.Both,
        pair: pairAddress,
        tokenMintX: new PublicKey(position.tokenX),
        tokenMintY: new PublicKey(position.tokenY),
        activeId: (await dlmmService.getPairAccount(pairAddress))!.activeId,
      });

      console.log(`📝 Executing ${txs.length} fee claim transactions...`);

      // Execute transactions
      for (let i = 0; i < txs.length; i++) {
        const tx = txs[i] as Transaction;
        const { blockhash } =
          await dlmmService.connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;

        const signature = await sendTransaction(
          tx,
          dlmmService.connection as any,
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          },
        );

        console.log(
          `✅ Fee claim transaction ${i + 1}/${txs.length}:`,
          signature,
        );
        await dlmmService.connection.confirmTransaction(signature, "confirmed");
      }

      alert(
        `✅ Successfully claimed fees!\n\nFees have been sent to your wallet.`,
      );

      // Refresh positions
      await fetchPositions();
    } catch (err) {
      console.error("❌ Error claiming fees:", err);
      alert(
        `❌ Failed to claim fees:\n${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setProcessingPosition(null);
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
  const activePositions = positions.filter(
    (p) => p.status === "in-range",
  ).length;
  const poolsCount = new Set(positions.map((p) => p.poolAddress)).size;

  if (!connected) {
    return (
      <div className="space-y-4">
        <TerminalHeader
          title="PORTFOLIO"
          subtitle="TRACK YOUR DLMM POSITIONS • MONITOR PERFORMANCE"
        />

        <div className="bg-zinc-950 border-2 border-zinc-800 p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                WALLET NOT CONNECTED
              </h3>
              <p className="text-zinc-400 font-mono text-sm">
                CONNECT WALLET TO VIEW POSITIONS AND PERFORMANCE DATA
              </p>
            </div>
            <ClientOnly
              fallback={
                <div className="h-10 w-40 bg-zinc-800 animate-pulse mx-auto border-2 border-zinc-700" />
              }
            >
              <WalletMultiButton className="mx-auto" />
            </ClientOnly>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TerminalHeader
        title="PORTFOLIO"
        subtitle={`WALLET: ${publicKey?.toBase58().slice(0, 4)}...${publicKey?.toBase58().slice(-4)} • ${totalPositions} POSITIONS`}
      />

      <div className="bg-zinc-950 border-2 border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            SYSTEM OVERVIEW
          </div>
          <button
            type="button"
            onClick={fetchPositions}
            disabled={loading}
            className="px-3 py-1.5 border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 inline mr-2 animate-spin" />
                LOADING...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 inline mr-2" />
                REFRESH
              </>
            )}
          </button>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          {/* Total Positions */}
          <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
            <div className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase mb-1">
              TOTAL POSITIONS
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {totalPositions}
            </div>
          </div>

          {/* In Range */}
          <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <div className="text-[9px] text-green-400 font-mono tracking-wider uppercase">
                IN RANGE
              </div>
            </div>
            <div className="text-2xl font-mono font-bold text-green-400">
              {activePositions}
            </div>
          </div>

          {/* Out of Range */}
          <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <div className="text-[9px] text-amber-400 font-mono tracking-wider uppercase">
                OUT OF RANGE
              </div>
            </div>
            <div className="text-2xl font-mono font-bold text-amber-400">
              {totalPositions - activePositions}
            </div>
          </div>

          {/* Pools Tracked */}
          <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
            <div className="flex items-center gap-1 mb-1">
              <Percent className="w-3 h-3 text-cyan-400" />
              <div className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase">
                POOLS TRACKED
              </div>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {poolsCount}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="border-2 border-red-500 bg-red-500/10 p-4 mb-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono text-sm uppercase tracking-wider">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <ConsoleLoading message="LOADING POSITIONS..." />}

        {/* Positions List */}
        {!loading && positions.length === 0 && (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              NO POSITIONS FOUND
            </h3>
            <p className="text-zinc-400 font-mono text-sm">
              CREATE YOUR FIRST POSITION BY DEPLOYING A STRATEGY
            </p>
          </div>
        )}

        {!loading && positions.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">
              ACTIVE POSITIONS • {positions.length} TOTAL
            </div>

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
                        position.status === "in-range"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {position.status === "in-range"
                        ? "In Range"
                        : "Out of Range"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {getTokenSymbol(position.tokenX)}/
                      {getTokenSymbol(position.tokenY)}
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
                        : (
                            position.totalXAmount /
                            Math.pow(
                              10,
                              selectedPool?.metadata?.extra?.tokenBaseDecimal ||
                                6,
                            )
                          ).toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {getTokenSymbol(position.tokenY)} Amount
                    </div>
                    <div className="font-medium">
                      {position.totalYAmount === 0
                        ? "0.0000"
                        : (
                            position.totalYAmount /
                            Math.pow(
                              10,
                              selectedPool?.metadata?.extra
                                ?.tokenQuoteDecimal || 9,
                            )
                          ).toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {getTokenSymbol(position.tokenX)} Fees
                    </div>
                    <div className="font-medium text-green-600">
                      {position.feesX === 0
                        ? "0.000000"
                        : (
                            position.feesX /
                            Math.pow(
                              10,
                              selectedPool?.metadata?.extra?.tokenBaseDecimal ||
                                6,
                            )
                          ).toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {getTokenSymbol(position.tokenY)} Fees
                    </div>
                    <div className="font-medium text-green-600">
                      {position.feesY === 0
                        ? "0.000000"
                        : (
                            position.feesY /
                            Math.pow(
                              10,
                              selectedPool?.metadata?.extra
                                ?.tokenQuoteDecimal || 9,
                            )
                          ).toFixed(6)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClaimFees(position)}
                    disabled={
                      processingPosition === position.positionMint ||
                      (position.feesX === 0 && position.feesY === 0)
                    }
                  >
                    {processingPosition === position.positionMint ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Claim Fees"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRemoveLiquidity(position)}
                    disabled={processingPosition === position.positionMint}
                  >
                    {processingPosition === position.positionMint ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Remove Liquidity"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
