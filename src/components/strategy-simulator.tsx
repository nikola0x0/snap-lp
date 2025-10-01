"use client";

import { useState, useEffect } from "react";
import { StrategyTemplate } from "@/types/strategy";
import { Slider } from "@/components/ui/slider";
import { BinChart } from "./bin-chart";
import { realDlmmService } from "@/services/dlmm-real";
import { X, Play, Loader2, AlertCircle, TrendingUp, DollarSign, Target } from "lucide-react";
import { ConsoleLoading } from "./console-loading";

interface StrategySimulatorProps {
  template: StrategyTemplate;
  onClose: () => void;
}

export function StrategySimulator({
  template,
  onClose,
}: StrategySimulatorProps) {
  // Real pool data state
  const [poolData, setPoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation state
  const [currentPrice, setCurrentPrice] = useState(100);
  const [selectedPrice, setSelectedPrice] = useState([100]);
  const [liquidityAmount, setLiquidityAmount] = useState([1000]);

  // Load real pool data on mount
  useEffect(() => {
    const loadPoolData = async () => {
      try {
        setLoading(true);
        const poolsResult = await realDlmmService.getPools();
        const pools = poolsResult.pools;

        const activePool = pools.find(
          (pool) =>
            pool.metadata?.baseReserve !== "0" &&
            pool.metadata?.quoteReserve !== "0",
        );

        if (activePool?.metadata) {
          setPoolData(activePool);
          const baseReserve = parseFloat(activePool.metadata.baseReserve);
          const quoteReserve = parseFloat(activePool.metadata.quoteReserve);
          const price = quoteReserve / baseReserve;

          setCurrentPrice(price);
          setSelectedPrice([price]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load pool data:", err);
        setError("Failed to load pool data");
        setLoading(false);
        setCurrentPrice(100);
        setSelectedPrice([100]);
      }
    };

    loadPoolData();
  }, []);

  // Calculate bin positions based on template configuration
  const calculateBins = () => {
    const binDistribution = template.binConfiguration.binDistribution;
    const centerPrice = currentPrice;

    if (!binDistribution || binDistribution.length === 0) {
      const rangeWidth = template.binConfiguration.rangeWidth;
      const binCount = template.binConfiguration.binCount;
      const priceRange = centerPrice * (rangeWidth / 100);
      const minPrice = centerPrice - priceRange / 2;
      const maxPrice = centerPrice + priceRange / 2;
      const priceStep = (maxPrice - minPrice) / binCount;

      return Array.from({ length: binCount }, (_, i) => ({
        id: i,
        price: minPrice + i * priceStep,
        liquidity:
          template.binConfiguration.distribution === "concentrated"
            ? Math.max(0, 100 - Math.abs(i - binCount / 2) * 20)
            : 100 / binCount,
        active:
          selectedPrice[0] >= minPrice + i * priceStep &&
          selectedPrice[0] < minPrice + (i + 1) * priceStep,
      }));
    }

    const binRange =
      Math.max(...binDistribution.map((b) => Math.abs(b.binId))) * 2 + 1;
    const priceRange =
      centerPrice * (template.binConfiguration.rangeWidth / 100);
    const priceStep = priceRange / binRange;

    return binDistribution
      .map((bin) => {
        const adjustedPrice = centerPrice + bin.binId * priceStep;
        return {
          id: bin.binId,
          price: adjustedPrice,
          liquidity: bin.weight * 100,
          active: Math.abs(selectedPrice[0] - adjustedPrice) < priceStep / 2,
        };
      })
      .sort((a, b) => a.price - b.price);
  };

  // Calculate estimated metrics
  const calculateMetrics = () => {
    const bins = calculateBins();
    const activeBins = bins.filter((bin) => bin.active).length;
    const utilizationRate = activeBins / bins.length;

    const priceChange =
      ((selectedPrice[0] - currentPrice) / currentPrice) * 100;
    const priceMovement = Math.abs(priceChange);

    const impermanentLoss =
      priceMovement > 0
        ? 2 * Math.sqrt(1 + priceChange / 100) - 2 - priceChange / 100
        : 0;

    const dailyVolume = liquidityAmount[0] * 0.5;
    const feeRate = 0.003;
    const dailyFees = dailyVolume * feeRate * utilizationRate;

    const sortedBins = bins.sort((a, b) => a.price - b.price);
    const minPrice = sortedBins[0]?.price || currentPrice * 0.8;
    const maxPrice =
      sortedBins[sortedBins.length - 1]?.price || currentPrice * 1.2;

    return {
      estimatedAPR: template.estimatedAPR * utilizationRate,
      dailyFees: dailyFees,
      weeklyReturn: dailyFees * 7,
      monthlyReturn: dailyFees * 30,
      impermanentLoss: Math.abs(impermanentLoss) * 100,
      priceChange: priceChange,
      minPrice: minPrice,
      maxPrice: maxPrice,
      priceRangePercent: ((maxPrice - minPrice) / currentPrice) * 100,
      inRange: selectedPrice[0] >= minPrice && selectedPrice[0] <= maxPrice,
      binUtilization: utilizationRate * 100,
      breakEven:
        dailyFees > 0
          ? (Math.abs(impermanentLoss) * liquidityAmount[0]) / (dailyFees * 100)
          : 0,
    };
  };

  const bins = calculateBins();
  const metrics = calculateMetrics();

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="border-2 border-cyan-500/30 bg-zinc-950 w-full max-w-md">
          <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
            <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
              {"/// INITIALIZING SIMULATOR"}
            </h2>
          </div>
          <div className="p-8">
            <ConsoleLoading message="Loading pool data" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="border-2 border-cyan-500/30 bg-zinc-950 w-full max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4 sticky top-0 z-10 bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                {"/// "}{template.name} Simulator
              </h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="px-2 py-1 border-2 border-amber-500 bg-amber-500/10 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
                  {template.riskLevel}
                </div>
                <div className="px-2 py-1 border-2 border-zinc-700 bg-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                  {template.binConfiguration.binCount} bins • ±{template.binConfiguration.rangeWidth / 2}%
                </div>
                {poolData?.metadata && (
                  <div className="px-2 py-1 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 font-mono text-[10px] uppercase tracking-wider">
                    Live Data
                  </div>
                )}
                {error && (
                  <div className="px-2 py-1 border-2 border-amber-500 bg-amber-500/10 text-amber-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Fallback Mode
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Price Slider */}
          <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-4">
            <label
              htmlFor="price-slider"
              className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-3 block"
            >
              Simulated Price: <span className="text-white text-lg font-bold">${
                selectedPrice[0] < 1
                  ? selectedPrice[0].toFixed(6)
                  : selectedPrice[0].toFixed(2)
              }</span>
            </label>
            <Slider
              id="price-slider"
              value={selectedPrice}
              onValueChange={setSelectedPrice}
              max={currentPrice * 1.5}
              min={currentPrice * 0.5}
              step={currentPrice * 0.01}
              className="mb-3"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              <span>${(currentPrice * 0.5).toFixed(currentPrice < 1 ? 6 : 2)}</span>
              <span className="text-cyan-400">
                Market: ${currentPrice < 1 ? currentPrice.toFixed(6) : currentPrice.toFixed(2)}
              </span>
              <span>${(currentPrice * 1.5).toFixed(currentPrice < 1 ? 6 : 2)}</span>
            </div>
          </div>

          {/* Liquidity Amount */}
          <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-4">
            <label
              htmlFor="liquidity-slider"
              className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-3 block"
            >
              Liquidity Amount: <span className="text-white text-lg font-bold">${liquidityAmount[0].toLocaleString()}</span>
            </label>
            <Slider
              id="liquidity-slider"
              value={liquidityAmount}
              onValueChange={setLiquidityAmount}
              max={10000}
              min={100}
              step={100}
              className="mb-3"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              <span>$100</span>
              <span>$10,000</span>
            </div>
          </div>

          {/* Bin Visualization */}
          <div className="border-2 border-cyan-500/30 bg-zinc-950">
            <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
              <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                {"/// BIN DISTRIBUTION"}
              </h3>
            </div>
            <div className="p-4">
              <BinChart bins={bins} currentPrice={selectedPrice[0]} />
            </div>
          </div>

          {/* Price Range Coverage */}
          <div className={`border-2 p-4 ${
            metrics.inRange
              ? "border-green-500/50 bg-green-500/5"
              : "border-amber-500/50 bg-amber-500/5"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Target className="w-4 h-4" />
                Position Coverage
              </h3>
              <div className={`px-3 py-1 border-2 font-mono text-[10px] uppercase tracking-wider ${
                metrics.inRange
                  ? "border-green-500 bg-green-500/10 text-green-400"
                  : "border-amber-500 bg-amber-500/10 text-amber-400"
              }`}>
                {metrics.inRange ? "✓ In Range" : "! Out of Range"}
              </div>
            </div>
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Earning fees when price is between:
            </p>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-2xl font-bold text-white">
                ${metrics.minPrice.toFixed(2)}
              </span>
              <span className="text-zinc-500">↔</span>
              <span className="text-2xl font-bold text-white">
                ${metrics.maxPrice.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                (±{(metrics.priceRangePercent / 2).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Estimated Returns */}
          <div className="border-2 border-green-500/30 bg-zinc-950">
            <div className="border-b-2 border-green-500/30 bg-gradient-to-r from-green-950/50 to-transparent p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <h3 className="text-green-400 font-mono text-sm uppercase tracking-wider">
                  {"/// ESTIMATED RETURNS"}
                </h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  (if price stays in range)
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    Daily
                  </div>
                  <div className="text-2xl font-mono font-bold text-green-400">
                    ${metrics.dailyFees.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    Weekly
                  </div>
                  <div className="text-2xl font-mono font-bold text-green-400">
                    ${metrics.weeklyReturn.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    Monthly
                  </div>
                  <div className="text-2xl font-mono font-bold text-green-400">
                    ${metrics.monthlyReturn.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Est. APR: <span className="text-green-400">{metrics.estimatedAPR.toFixed(1)}%</span> •
                Bin Utilization: <span className="text-cyan-400">{metrics.binUtilization.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="border-2 border-amber-500/30 bg-zinc-950">
            <div className="border-b-2 border-amber-500/30 bg-gradient-to-r from-amber-950/50 to-transparent p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-amber-400 font-mono text-sm uppercase tracking-wider">
                  {"/// RISK ASSESSMENT"}
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Price Movement to ${selectedPrice[0].toFixed(2)}:
                </span>
                <span className={`font-mono text-lg font-bold ${
                  Math.abs(metrics.priceChange) > 10 ? "text-amber-400" : "text-green-400"
                }`}>
                  {metrics.priceChange > 0 ? "+" : ""}{metrics.priceChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Impermanent Loss:
                </span>
                <span className={`font-mono text-lg font-bold ${
                  metrics.impermanentLoss > 5 ? "text-red-400" : "text-amber-400"
                }`}>
                  -{metrics.impermanentLoss.toFixed(2)}%
                </span>
              </div>
              {metrics.breakEven > 0 && metrics.breakEven < 365 && (
                <div className="bg-[#0a0a0a] border-2 border-cyan-500 p-3">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    Break-Even Timeline
                  </div>
                  <div className="text-sm font-mono text-white">
                    Fees will offset IL in ~{metrics.breakEven.toFixed(0)} days
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Scenarios */}
          <div className="border-2 border-cyan-500/30 bg-zinc-950">
            <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                  {"/// SCENARIOS"}
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  ✓ Best Case (30 days in range):
                </span>
                <span className="font-mono text-lg font-bold text-green-400">
                  +${metrics.monthlyReturn.toFixed(2)} (
                  {((metrics.monthlyReturn / liquidityAmount[0]) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  ! Worst Case (price to ${selectedPrice[0].toFixed(2)}):
                </span>
                <span className="font-mono text-lg font-bold text-amber-400">
                  -${((metrics.impermanentLoss / 100) * liquidityAmount[0]).toFixed(2)} (
                  {metrics.impermanentLoss.toFixed(1)}% IL)
                </span>
              </div>
              {!metrics.inRange && (
                <div className="bg-amber-500/10 border-2 border-amber-500 p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    <strong>Warning:</strong> Position out of range! No fees earned until price returns to ${metrics.minPrice.toFixed(2)} - ${metrics.maxPrice.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 h-14 border-2 border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20 font-mono text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Deploy Strategy
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-14 px-8 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 font-mono text-sm font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
