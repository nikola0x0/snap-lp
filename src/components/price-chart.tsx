"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { realDlmmService } from "@/services/dlmm-real";

interface PricePoint {
  time: string;
  price: number;
  volume: number;
  activeBin: number;
}

interface PriceChartProps {
  poolAddress: string;
  symbol: string;
  className?: string;
}

type TimeRange = "1d" | "7d" | "30d";

export function PriceChart({ poolAddress, symbol, className }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);

  const timeRangeMap = {
    "1d": 1,
    "7d": 7,
    "30d": 30,
  };

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const days = timeRangeMap[timeRange];
        
        // Get price history from DLMM service
        const priceHistory = await realDlmmService.getPoolPriceData(poolAddress, days);
        
        if (priceHistory && priceHistory.length > 0) {
          setPriceData(priceHistory);
          
          // Calculate current price and change
          const latest = priceHistory[priceHistory.length - 1];
          const earliest = priceHistory[0];
          
          setCurrentPrice(latest?.price || 0);
          
          if (earliest && latest) {
            const change = ((latest.price - earliest.price) / earliest.price) * 100;
            setPriceChange(change);
          }
        } else {
          setError("No price data available");
        }
      } catch (err) {
        console.error("Error fetching price data:", err);
        setError("Failed to load price data");
      } finally {
        setLoading(false);
      }
    };

    if (poolAddress) {
      fetchPriceData();
    }
  }, [poolAddress, timeRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{symbol} Price</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{symbol} Price</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {symbol} Price
              <Badge variant={priceChange >= 0 ? "secondary" : "destructive"}>
                {priceChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {formatPercentage(priceChange)}
              </Badge>
            </CardTitle>
            {currentPrice && (
              <p className="text-2xl font-bold mt-1">
                {formatPrice(currentPrice)}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            {(["1d", "7d", "30d"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatPrice}
              />
              <Tooltip
                labelFormatter={(label) => `Time: ${label}`}
                formatter={(value: number) => [formatPrice(value), "Price"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}