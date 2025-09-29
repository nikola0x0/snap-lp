"use client";

import { useState, useEffect, useCallback } from "react";
import { realDlmmService } from "@/services/dlmm-real";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Search,
  Loader2,
  ChevronRight,
  BarChart3,
  ArrowUpDown,
  Eye,
} from "lucide-react";

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
  const { selectPool, setStep } = useAppStore();

  const loadPools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Starting pool loading process...");

      // Use the DLMM pools API endpoint instead of direct service call
      try {
        const response = await fetch('/api/dlmm-pools');
        const data = await response.json();
        
        if (!data.success || !data.pools) {
          throw new Error(data.error || "No DLMM pools found");
        }

        console.log(`📊 Got ${data.pools.length} pools from DLMM API`);

        // Get detailed metrics for each pool
        const poolsWithMetrics: PoolMetrics[] = [];

        for (const pool of data.pools.slice(0, 10)) {
          try {
            console.log(
              `📈 Loading metrics for pool: ${pool.address.slice(0, 8)}...`,
            );
            const metrics = await realDlmmService.getPoolMetrics(pool.address);
            if (metrics) {
              // Create pool name from token symbols (now properly available from API)
              const poolName = `${pool.baseToken?.symbol || 'TOKEN'}/${pool.quoteToken?.symbol || 'TOKEN'}`;
              
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
  }, []);;

  useEffect(() => {
    loadPools();
  }, [loadPools]);

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
      (pool.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Available Pools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading comprehensive pool data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
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
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Available Pools ({filteredPools.length})
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search pools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Button onClick={loadPools} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-medium text-sm">
            <div className="col-span-3">
              <SortButton label="Pool Name" sortKey="name" />
            </div>
            <div className="col-span-2 text-right">
              <SortButton label="Liquidity" sortKey="liquidity" />
            </div>
            <div className="col-span-2 text-right">
              <SortButton label="24H Volume" sortKey="volume24h" />
            </div>
            <div className="col-span-2 text-right">
              <SortButton label="7D Volume" sortKey="volume7d" />
            </div>
            <div className="col-span-1 text-right">
              <span className="text-xs">Fee</span>
            </div>
            <div className="col-span-1 text-right">
              <SortButton label="APR" sortKey="apr" />
            </div>
            <div className="col-span-1 text-center">
              <span className="text-xs">Action</span>
            </div>
          </div>

          {/* Pool Rows */}
          <div className="divide-y">
            {filteredPools.map((pool) => (
              <div
                key={pool.address}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Pool Name */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {pool.name.split("/")[0][0]}
                    </div>
                    <div>
                      <div className="font-semibold">{pool.name}</div>
                      <div className="text-xs text-gray-500">
                        Bin #{pool.activeBin}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liquidity */}
                <div className="col-span-2 text-right">
                  <div className="font-semibold">
                    {formatCurrency(pool.liquidity)}
                  </div>
                  <div className="text-xs text-gray-500">Total TVL</div>
                </div>

                {/* 24H Volume */}
                <div className="col-span-2 text-right">
                  <div className="font-semibold">
                    {formatCurrency(pool.volume24h)}
                  </div>
                  <div className="text-xs text-gray-500">24h trading</div>
                </div>

                {/* 7D Volume */}
                <div className="col-span-2 text-right">
                  <div className="font-semibold">
                    {formatCurrency(pool.volume7d)}
                  </div>
                  <div className="text-xs text-gray-500">7d trading</div>
                </div>

                {/* Fee Rate */}
                <div className="col-span-1 text-right">
                  <Badge variant="outline" className="text-xs">
                    {pool.feeRate}%
                  </Badge>
                </div>

                {/* APR */}
                <div className="col-span-1 text-right">
                  <div className="font-semibold text-green-600">
                    {pool.apr.toFixed(1)}%
                  </div>
                </div>

                {/* Action */}
                <div className="col-span-1 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openPoolDetails(pool)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredPools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No pools match your search criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pool Details Modal */}
      <Dialog open={!!selectedPool} onOpenChange={() => setSelectedPool(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPool && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {selectedPool.name.split("/")[0][0]}
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
                      <div>
                        <div className="text-2xl font-bold">
                          {selectedPool.originalPool?.baseToken?.symbol || 'TOKEN'}
                        </div>
                        <div className="text-lg font-medium text-gray-600">
                          Base Token
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {selectedPool.originalPool?.baseToken?.mint}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {selectedPool.originalPool?.quoteToken?.symbol || 'TOKEN'}
                        </div>
                        <div className="text-lg font-medium text-gray-600">
                          Quote Token
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {selectedPool.originalPool?.quoteToken?.mint}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">
                        Exchange Rates:
                      </div>
                      <div className="flex flex-col gap-1 text-sm">
                        <div>
                          1 {selectedPool.originalPool?.baseToken?.symbol || 'TOKEN'} ={" "}
                          {selectedPool.price ? selectedPool.price.toFixed(6) : '0.000000'}{" "}
                          {selectedPool.originalPool?.quoteToken?.symbol || 'TOKEN'}
                        </div>
                        <div>
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
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading charts...</span>
                  </div>
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
                      const baseMint =
                        selectedPool.originalPool?.baseToken?.mint;
                      const quoteMint =
                        selectedPool.originalPool?.quoteToken?.mint;

                      if (!baseMint || !quoteMint) {
                        console.error(
                          "❌ Cannot deploy: Missing real mint addresses from pool metadata",
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
                          selectedPool.originalPool?.tokenX ||
                          selectedPool.originalPool?.baseToken?.symbol ||
                          "Unknown",
                        tokenY:
                          selectedPool.originalPool?.tokenY ||
                          selectedPool.originalPool?.quoteToken?.symbol ||
                          "Unknown",
                        metadata: {
                          poolAddress: selectedPool.address,
                          baseMint: baseMint,
                          baseReserve:
                            selectedPool.originalPool?.reserves?.base ||
                            "0",
                          quoteMint: quoteMint,
                          quoteReserve:
                            selectedPool.originalPool?.reserves?.quote ||
                            "0",
                          tradeFee: selectedPool.feeRate,
                          extra: {
                            tokenBaseDecimal:
                              selectedPool.originalPool?.baseToken?.decimals || 9,
                            tokenQuoteDecimal:
                              selectedPool.originalPool?.quoteToken?.decimals || 9,
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
    </>
  );
}
