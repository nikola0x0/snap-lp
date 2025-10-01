"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { realDlmmService } from "@/services/dlmm-real";

interface TradingChartProps {
  mint: string;
  symbol: string;
  className?: string;
  height?: number;
}

type TimeRange = "1d" | "7d" | "30d";

export function TradingChart({
  mint,
  symbol,
  className = "",
  height = 400,
}: TradingChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [currentPrice, setCurrentPrice] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);

  const timeRangeMap = {
    "1d": 1,
    "7d": 7,
    "30d": 30,
  };

  // Find the DLMM pool for this token pair on component mount
  useEffect(() => {
    const findPool = async () => {
      try {
        console.log(`Finding DLMM pool for token: ${mint} (${symbol})`);

        const pools = await realDlmmService.getPools();
        console.log(
          `Available pools:`,
          pools.pools.map((p) => ({
            address: p.address,
            tokenX: p.tokenX,
            tokenY: p.tokenY,
          })),
        );

        // Better pool matching logic - find exact matches first
        let matchingPool = pools.pools.find(
          (p) => p.tokenX === mint || p.tokenY === mint,
        );

        // If no exact match, use a consistent fallback based on symbol
        if (!matchingPool) {
          console.log(
            `No exact match for ${mint}, using fallback logic for ${symbol}`,
          );

          // Use consistent pool selection based on symbol
          if (symbol.toUpperCase().includes("SOL")) {
            matchingPool =
              pools.pools.find((p) => p.address.includes("sol-usdc")) ||
              pools.pools[0];
          } else if (symbol.toUpperCase().includes("USDC")) {
            matchingPool =
              pools.pools.find((p) => p.address.includes("sol-usdc")) ||
              pools.pools[0];
          } else {
            matchingPool = pools.pools[0]; // First available pool
          }
        }

        if (matchingPool) {
          console.log(`Selected pool for ${symbol}:`, {
            address: matchingPool.address,
            tokenX: matchingPool.tokenX,
            tokenY: matchingPool.tokenY,
          });
          setPoolAddress(matchingPool.address);
        } else {
          console.warn(`No DLMM pool available for token ${mint}`);
          setError(`No DLMM pool found for ${symbol}`);
        }
      } catch (err) {
        console.error("Error finding DLMM pool:", err);
        setError("Failed to load DLMM pools");
      }
    };

    findPool();
  }, [mint, symbol]);

  // Load DLMM data when timeRange or poolAddress changes
  useEffect(() => {
    const loadDLMMData = async () => {
      if (!poolAddress) {
        console.log("No pool address available, skipping data load");
        return;
      }

      try {
        console.log(
          `Loading DLMM data for pool ${poolAddress}, timeRange: ${timeRange}`,
        );
        setLoading(true);
        setError(null);

        const days = timeRangeMap[timeRange];

        // Load DLMM pool data in parallel
        const [poolPriceData, currentPoolPrice] = await Promise.all([
          realDlmmService.getPoolPriceData(poolAddress, days),
          realDlmmService.getPoolCurrentPrice(poolAddress),
        ]);

        console.log("Loaded price data:", {
          priceDataPoints: poolPriceData?.length,
          currentPrice: currentPoolPrice?.price,
          activeBin: currentPoolPrice?.activeBin,
          symbol: currentPoolPrice?.symbol,
        });

        if (poolPriceData && poolPriceData.length > 0) {
          setChartData(poolPriceData);
        } else {
          console.warn("No price data received");
          setError("DLMM price data not available");
        }

        if (currentPoolPrice) {
          setCurrentPrice(currentPoolPrice);
        } else {
          console.warn("No current price data received");
        }
      } catch (err) {
        console.error("Error loading DLMM data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load DLMM data",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDLMMData();
  }, [poolAddress, timeRange]);

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return "$0.00";

    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const isPositiveChange = (currentPrice?.priceChange24h || 0) >= 0;

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{symbol} DLMM Pool Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {currentPrice?.symbol || symbol} DLMM Pool
            </CardTitle>
            {currentPrice && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold">
                  {formatPrice(currentPrice.price)}
                </span>
                <Badge
                  variant={isPositiveChange ? "default" : "destructive"}
                  className="text-xs"
                >
                  {isPositiveChange ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(currentPrice.priceChange24h || 0).toFixed(2)}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Bin #{currentPrice.activeBin || "---"}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex gap-1">
            {(["1d", "7d", "30d"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="h-7 px-2 text-xs"
                disabled={loading}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="relative" style={{ height }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading DLMM pool data...
                </span>
              </div>
            </div>
          )}

          {!loading && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === "price")
                      return [formatPrice(value), "DLMM Pool Price"];
                    if (name === "activeBin") return [value, "Active Bin"];
                    return [value, name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {!loading && chartData.length === 0 && !error && (
            <div
              className="flex items-center justify-center"
              style={{ height }}
            >
              <p className="text-sm text-muted-foreground">
                No chart data available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
