"use client";

import { useState, useEffect, useCallback } from "react";
import { realDlmmService } from "@/services/dlmm-real";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { useAppStore } from "@/store/app-store";
import { SUPPORTED_POOLS } from "@/constants/supported-pools";
import { TerminalHeader } from "@/components/terminal-header";
import { ConsoleLoading } from "@/components/console-loading";
import { PoolCard } from "@/components/pool-card";
import { Search, Loader2, ChevronRight, ArrowUpDown, BarChart3 } from "lucide-react";

interface PoolMetrics {
  address: string;
  name: string;
  liquidity: number;
  volume24h: number;
  volume7d: number;
  feeRate: number;
  apr: number;
  price: number;
  priceChange24h: number;
  activeBin: number;
  totalTokensLocked?: {
    tokenA: { symbol: string; amount: number };
    tokenB: { symbol: string; amount: number };
  };
  exchangeRates?: {
    aToB: number;
    bToA: number;
  };
  originalPool?: {
    address: string;
    baseToken: {
      symbol: string;
      mint: string;
      decimals: number;
    };
    quoteToken: {
      symbol: string;
      mint: string;
      decimals: number;
    };
    reserves: {
      base: string;
      quote: string;
    };
    feeRate: number;
    type: string;
  };
}

export function PoolsSection() {
  const [pools, setPools] = useState<PoolMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "liquidity" | "volume24h" | "volume7d" | "apr"
  >("liquidity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPool, setSelectedPool] = useState<PoolMetrics | null>(null);
  const [volumeHistory, setVolumeHistory] = useState<
    Array<{ date: string; volume: number }>
  >([]);
  const [liquidityHistory, setLiquidityHistory] = useState<
    Array<{ date: string; liquidity: number }>
  >([]);
  const [modalLoading, setModalLoading] = useState(false);
  const {
    selectPool,
    setStep,
    setPools: setAppPools,
    selectedPool: currentlySelectedPool,
    isPoolSelected,
  } = useAppStore();

  const loadPools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Starting pool loading process...");

      // Use the DLMM pools API endpoint and filter to supported pools
      try {
        const response = await fetch("/api/dlmm-pools");
        const data = await response.json();

        if (!data.success || !data.pools) {
          throw new Error(data.error || "No DLMM pools found");
        }

        console.log(`📊 Got ${data.pools.length} pools from DLMM API`);

        // Filter to only supported pools
        const supportedPoolAddresses = SUPPORTED_POOLS.map((p) => p.address);
        const supportedPoolsData = data.pools.filter((pool: any) =>
          supportedPoolAddresses.includes(pool.address),
        );

        console.log(
          `🎯 Filtered to ${supportedPoolsData.length} supported pools`,
        );

        // Get detailed metrics for each supported pool
        const poolsWithMetrics: PoolMetrics[] = [];

        for (const pool of supportedPoolsData) {
          try {
            console.log(
              `📈 Loading metrics for pool: ${pool.address.slice(0, 8)}...`,
            );
            const metrics = await realDlmmService.getPoolMetrics(pool.address);
            if (metrics) {
              // Create pool name from token symbols (now properly available from API)
              const poolName = `${pool.baseToken?.symbol || "TOKEN"}/${
                pool.quoteToken?.symbol || "TOKEN"
              }`;

              poolsWithMetrics.push({
                address: pool.address,
                name: poolName,
                originalPool: pool, // Store original pool with real metadata
                ...metrics,
              });
              console.log(`✅ Loaded metrics for ${poolName}`);
            }
          } catch (err) {
            console.warn(
              `⚠️  Failed to load metrics for pool ${pool.address}:`,
              err,
            );
          }
        }

        if (poolsWithMetrics.length > 0) {
          setPools(poolsWithMetrics);
          console.log(
            `✅ Successfully loaded ${poolsWithMetrics.length} pools with comprehensive metrics`,
          );
        } else {
          throw new Error("No pools loaded with metrics");
        }
      } catch (apiError) {
        console.warn("⚠️  API failed, falling back to demo data:", apiError);

        // Fallback to demo data
        const demoPoolsWithMetrics: PoolMetrics[] = [
          {
            address: "DemoPool1234567890abcdef",
            name: "SOL/USDC",
            liquidity: 1250000,
            volume24h: 85000,
            volume7d: 520000,
            feeRate: 0.25,
            apr: 18.5,
            price: 0.000043,
            priceChange24h: 2.3,
            activeBin: 8388608,
            totalTokensLocked: {
              tokenA: { symbol: "SOL", amount: 26.51e9 },
              tokenB: { symbol: "USDC", amount: 1.44e6 },
            },
            exchangeRates: {
              aToB: 0.000043,
              bToA: 23255.8,
            },
          },
          {
            address: "DemoPool2345678901bcdefg",
            name: "BONK/USDC",
            liquidity: 850000,
            volume24h: 42000,
            volume7d: 285000,
            feeRate: 0.3,
            apr: 22.1,
            price: 0.000000034,
            priceChange24h: -1.2,
            activeBin: 8388609,
            totalTokensLocked: {
              tokenA: { symbol: "BONK", amount: 1.2e12 },
              tokenB: { symbol: "USDC", amount: 850000 },
            },
            exchangeRates: {
              aToB: 0.000000034,
              bToA: 29411764.7,
            },
          },
          {
            address: "DemoPool3456789012cdefgh",
            name: "USDT/USDC",
            liquidity: 2100000,
            volume24h: 120000,
            volume7d: 750000,
            feeRate: 0.05,
            apr: 8.2,
            price: 0.9998,
            priceChange24h: 0.01,
            activeBin: 8388610,
            totalTokensLocked: {
              tokenA: { symbol: "USDT", amount: 1050000 },
              tokenB: { symbol: "USDC", amount: 1050000 },
            },
            exchangeRates: {
              aToB: 0.9998,
              bToA: 1.0002,
            },
          },
        ];

        setPools(demoPoolsWithMetrics);
        console.log(
          `📝 Loaded ${demoPoolsWithMetrics.length} demo pools as fallback`,
        );
      }
    } catch (err) {
      console.error("❌ Complete failure loading pools:", err);
      setError(err instanceof Error ? err.message : "Failed to load pools");
    } finally {
      setLoading(false);
    }
  }, [setAppPools]);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const handleSelectPool = (pool: PoolMetrics) => {
    const baseMint = pool.originalPool?.baseToken?.mint;
    const quoteMint = pool.originalPool?.quoteToken?.mint;

    if (!baseMint || !quoteMint) {
      console.error("❌ Cannot select: Missing mint addresses");
      alert("Error: Cannot select this pool - missing token mint addresses.");
      return;
    }

    selectPool({
      address: pool.address,
      tokenX: pool.originalPool?.baseToken?.symbol || "Unknown",
      tokenY: pool.originalPool?.quoteToken?.symbol || "Unknown",
      metadata: {
        poolAddress: pool.address,
        baseMint: baseMint,
        baseReserve: pool.originalPool?.reserves?.base || "0",
        quoteMint: quoteMint,
        quoteReserve: pool.originalPool?.reserves?.quote || "0",
        tradeFee: pool.feeRate,
        extra: {
          tokenBaseDecimal: pool.originalPool?.baseToken?.decimals || 9,
          tokenQuoteDecimal: pool.originalPool?.quoteToken?.decimals || 9,
          hook: undefined,
        },
      },
    });
  };

  const openPoolDetails = async (pool: PoolMetrics) => {
    setSelectedPool(pool);
    setModalLoading(true);

    try {
      if (pool.address.startsWith("DemoPool")) {
        // Generate demo chart data for demo pools
        const demoVolumeData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split("T")[0],
            volume: Math.floor(pool.volume24h * (0.8 + Math.random() * 0.4)),
          };
        });

        const demoLiquidityData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const trendFactor = 0.95 + (i / 7) * 0.1; // slight upward trend
          return {
            date: date.toISOString().split("T")[0],
            liquidity: Math.floor(
              pool.liquidity * trendFactor * (0.9 + Math.random() * 0.2),
            ),
          };
        });

        setVolumeHistory(demoVolumeData);
        setLiquidityHistory(demoLiquidityData);
      } else {
        // Try real service for real pools
        const [volumeData, liquidityData] = await Promise.all([
          realDlmmService.getVolumeHistory(pool.address, 7),
          realDlmmService.getLiquidityHistory(pool.address, 7),
        ]);

        setVolumeHistory(volumeData || []);
        setLiquidityHistory(liquidityData || []);
      }
    } catch (err) {
      console.error("Failed to load pool history:", err);
      setVolumeHistory([]);
      setLiquidityHistory([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const filteredPools = pools
    .filter((pool) =>
      (pool.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const multiplier = sortOrder === "asc" ? 1 : -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * multiplier;
      }

      return (Number(aVal) - Number(bVal)) * multiplier;
    });

  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return "$0.00";
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (!value && value !== 0) return "0.00";
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  const SortButton = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: typeof sortBy;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(sortKey)}
      className="h-auto p-1 text-xs font-medium"
    >
      {label}
      <ArrowUpDown className="w-3 h-3 ml-1" />
      {sortBy === sortKey && (
        <span className="ml-1 text-blue-600">
          {sortOrder === "desc" ? "↓" : "↑"}
        </span>
      )}
    </Button>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <TerminalHeader
          title="LIQUIDITY POOLS"
          subtitle="LOADING POOL DATA..."
        />
        <div className="bg-zinc-950 border-2 border-zinc-800">
          <ConsoleLoading message="LOADING POOL DATA..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Available Pools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadPools} variant="outline">
              Retry Loading
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TerminalHeader
        title="LIQUIDITY POOLS"
        subtitle={`SELECT TARGET POOL • ${filteredPools.length} AVAILABLE`}
      />

      <div className="bg-zinc-950 border-2 border-zinc-800 p-4">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search pools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48 bg-[#0a0a0a] border-zinc-700 text-white"
              />
            </div>
            <Button
              onClick={loadPools}
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase">Sort by:</span>
          <SortButton label="Pool Name" sortKey="name" />
          <SortButton label="Liquidity" sortKey="liquidity" />
          <SortButton label="24H Volume" sortKey="volume24h" />
          <SortButton label="APR" sortKey="apr" />
        </div>

        {/* Pool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPools.map((pool) => {
            const isSelected =
              currentlySelectedPool?.address === pool.address;
            return (
              <PoolCard
                key={pool.address}
                pool={pool}
                isSelected={isSelected}
                onClick={() => handleSelectPool(pool)}
                onViewDetails={() => openPoolDetails(pool)}
              />
            );
          })}
        </div>

        {filteredPools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 font-mono text-sm">
              NO POOLS MATCH YOUR SEARCH CRITERIA
            </p>
          </div>
        )}
      </div>

      {/* Pool Details Modal */}
      <Dialog open={!!selectedPool} onOpenChange={() => setSelectedPool(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPool && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <img
                      src={`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${selectedPool.originalPool?.baseToken?.mint}/logo.png`}
                      alt={selectedPool.originalPool?.baseToken?.symbol || ""}
                      className="w-8 h-8 border-2 border-background relative z-10"
                      onError={(e) => {
                        e.currentTarget.src = "https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png";
                      }}
                    />
                    <img
                      src={`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${selectedPool.originalPool?.quoteToken?.mint}/logo.png`}
                      alt={selectedPool.originalPool?.quoteToken?.symbol || ""}
                      className="w-8 h-8 border-2 border-background"
                      onError={(e) => {
                        e.currentTarget.src = "https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png";
                      }}
                    />
                  </div>
                  {selectedPool.name} Pool Details
                </DialogTitle>
                <DialogDescription>
                  Comprehensive metrics and charts for the {selectedPool.name}{" "}
                  DLMM pool including liquidity, volume, and fee data.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Token Balances */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Pool Tokens</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${selectedPool.originalPool?.baseToken?.mint}/logo.png`}
                          alt={selectedPool.originalPool?.baseToken?.symbol || "TOKEN"}
                          className="w-16 h-16 border-2 border-zinc-800"
                          onError={(e) => {
                            e.currentTarget.src = "https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png";
                          }}
                        />
                        <div>
                          <div className="text-2xl font-bold">
                            {selectedPool.originalPool?.baseToken?.symbol ||
                              "TOKEN"}
                          </div>
                          <div className="text-lg font-medium text-gray-600">
                            Base Token
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {selectedPool.originalPool?.baseToken?.mint}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${selectedPool.originalPool?.quoteToken?.mint}/logo.png`}
                          alt={selectedPool.originalPool?.quoteToken?.symbol || "TOKEN"}
                          className="w-16 h-16 border-2 border-zinc-800"
                          onError={(e) => {
                            e.currentTarget.src = "https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png";
                          }}
                        />
                        <div>
                          <div className="text-2xl font-bold">
                            {selectedPool.originalPool?.quoteToken?.symbol ||
                              "TOKEN"}
                          </div>
                          <div className="text-lg font-medium text-gray-600">
                            Quote Token
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {selectedPool.originalPool?.quoteToken?.mint}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-[#0a0a0a] border-2 border-zinc-800">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-2">
                        Exchange Rates:
                      </div>
                      <div className="flex flex-col gap-1 text-sm font-mono">
                        <div className="text-white">
                          1{" "}
                          {selectedPool.originalPool?.baseToken?.symbol ||
                            "TOKEN"}{" "}
                          ={" "}
                          {selectedPool.price
                            ? selectedPool.price.toFixed(6)
                            : "0.000000"}{" "}
                          {selectedPool.originalPool?.quoteToken?.symbol ||
                            "TOKEN"}
                        </div>
                        <div className="text-zinc-400">
                          Price: {formatCurrency(selectedPool.price || 0)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold">
                        {formatCurrency(selectedPool.volume24h)}
                      </div>
                      <div className="text-sm text-gray-600">24H Volume</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold">
                        {formatCurrency(selectedPool.liquidity)}
                      </div>
                      <div className="text-sm text-gray-600">Liquidity</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold">
                        {formatCurrency(
                          (selectedPool.volume24h * selectedPool.feeRate) / 100,
                        )}
                      </div>
                      <div className="text-sm text-gray-600">24H Fee</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold">
                        {formatCurrency(selectedPool.volume7d)}
                      </div>
                      <div className="text-sm text-gray-600">7D Volume</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                {modalLoading ? (
                  <ConsoleLoading message="LOADING CHARTS..." bars={15} />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Volume Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">7-Day Volume</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={volumeHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) =>
                                `$${(value / 1000).toFixed(0)}K`
                              }
                            />
                            <Tooltip
                              formatter={(value) => [
                                formatCurrency(Number(value)),
                                "Volume",
                              ]}
                            />
                            <Bar dataKey="volume" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Liquidity Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          7-Day Liquidity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={liquidityHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) =>
                                `$${(value / 1000).toFixed(0)}K`
                              }
                            />
                            <Tooltip
                              formatter={(value) => [
                                formatCurrency(Number(value)),
                                "Liquidity",
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="liquidity"
                              stroke="#10b981"
                              strokeWidth={2}
                              dot={{ fill: "#10b981", r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => {
                      // Use real mint addresses from original pool data
                      console.log(
                        "🔍 Checking originalPool data:",
                        selectedPool.originalPool,
                      );
                      const baseMint =
                        selectedPool.originalPool?.baseToken?.mint;
                      const quoteMint =
                        selectedPool.originalPool?.quoteToken?.mint;

                      console.log("🔍 Extracted mint addresses:", {
                        baseMint,
                        quoteMint,
                      });

                      if (!baseMint || !quoteMint) {
                        console.error(
                          "❌ Cannot deploy: Missing real mint addresses from pool metadata",
                        );
                        console.error(
                          "Full pool data:",
                          JSON.stringify(selectedPool, null, 2),
                        );
                        alert(
                          "Error: Cannot deploy this pool - missing token mint addresses. Please try a different pool.",
                        );
                        return;
                      }

                      console.log("✅ Using real mint addresses:", {
                        baseMint,
                        quoteMint,
                      });

                      selectPool({
                        address: selectedPool.address,
                        tokenX:
                          selectedPool.originalPool?.baseToken?.symbol ||
                          "Unknown",
                        tokenY:
                          selectedPool.originalPool?.quoteToken?.symbol ||
                          "Unknown",
                        metadata: {
                          poolAddress: selectedPool.address,
                          baseMint: baseMint,
                          baseReserve:
                            selectedPool.originalPool?.reserves?.base || "0",
                          quoteMint: quoteMint,
                          quoteReserve:
                            selectedPool.originalPool?.reserves?.quote || "0",
                          tradeFee: selectedPool.feeRate,
                          extra: {
                            tokenBaseDecimal:
                              selectedPool.originalPool?.baseToken?.decimals ||
                              9,
                            tokenQuoteDecimal:
                              selectedPool.originalPool?.quoteToken?.decimals ||
                              9,
                            hook: undefined,
                          },
                        },
                      });
                      setStep("templates");
                      setSelectedPool(null);
                    }}
                    className="flex-1"
                  >
                    Select Pool for Strategy
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPool(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom padding for fixed bar */}
      <div className="h-40" />
    </>
  );
}
