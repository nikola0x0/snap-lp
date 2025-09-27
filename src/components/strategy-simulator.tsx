"use client";

import { useState, useEffect } from "react";
import { StrategyTemplate } from "@/types/strategy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BinChart } from "./bin-chart";
import { DLMMService } from "@/services/dlmm";
import { X, Play, Loader2, AlertCircle } from "lucide-react";

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
        const dlmm = new DLMMService();
        const pools = await dlmm.getPools();
        
        // Use the first active pool with reserves
        const activePool = pools.find(pool => 
          pool.metadata?.baseReserve !== "0" && pool.metadata?.quoteReserve !== "0"
        );
        
        if (activePool?.metadata) {
          setPoolData(activePool);
          // Calculate current price from reserves (simplified)
          const baseReserve = parseFloat(activePool.metadata.baseReserve);
          const quoteReserve = parseFloat(activePool.metadata.quoteReserve);
          const price = quoteReserve / baseReserve;
          
          setCurrentPrice(price);
          setSelectedPrice([price]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load pool data:', err);
        setError('Failed to load pool data');
        setLoading(false);
        // Fallback to mock data
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
      // Fallback to old calculation if no binDistribution
      const rangeWidth = template.binConfiguration.rangeWidth;
      const binCount = template.binConfiguration.binCount;
      const priceRange = centerPrice * (rangeWidth / 100);
      const minPrice = centerPrice - priceRange / 2;
      const maxPrice = centerPrice + priceRange / 2;
      const priceStep = (maxPrice - minPrice) / binCount;

      return Array.from({ length: binCount }, (_, i) => ({
        id: i,
        price: minPrice + i * priceStep,
        liquidity: template.binConfiguration.distribution === "concentrated"
          ? Math.max(0, 100 - Math.abs(i - binCount / 2) * 20)
          : 100 / binCount,
        active: selectedPrice[0] >= minPrice + i * priceStep &&
               selectedPrice[0] < minPrice + (i + 1) * priceStep,
      }));
    }

    // Use actual bin distribution from template
    const binRange = Math.max(...binDistribution.map(b => Math.abs(b.binId))) * 2 + 1;
    const priceRange = centerPrice * (template.binConfiguration.rangeWidth / 100);
    const priceStep = priceRange / binRange;
    
    return binDistribution.map((bin) => {
      const adjustedPrice = centerPrice + (bin.binId * priceStep);
      return {
        id: bin.binId,
        price: adjustedPrice,
        liquidity: bin.weight * 100, // Scale weight to percentage for visualization
        active: Math.abs(selectedPrice[0] - adjustedPrice) < priceStep / 2,
      };
    }).sort((a, b) => a.price - b.price);
  };

  // Calculate estimated metrics
  const calculateMetrics = () => {
    const bins = calculateBins();
    const activeBins = bins.filter((bin) => bin.active).length;
    const utilizationRate = activeBins / bins.length;

    return {
      estimatedAPR: template.estimatedAPR * utilizationRate,
      impermanentLoss: Math.max(
        0,
        (Math.abs(selectedPrice[0] - currentPrice) / currentPrice) *
          template.impermanentLossRisk *
          10
      ),
      feesEstimate:
        liquidityAmount[0] * (template.estimatedAPR / 100) * utilizationRate,
      binUtilization: utilizationRate * 100,
    };
  };

  const bins = calculateBins();
  const metrics = calculateMetrics();

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading real pool data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {template.name} - Simulator
              {poolData && (
                <Badge variant="outline" className="text-xs">
                  Live Pool Data
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{template.riskLevel}</Badge>
              <span className="text-sm text-muted-foreground">
                {template.binConfiguration.binCount} bins • ±
                {template.binConfiguration.rangeWidth / 2}% range
              </span>
              {poolData?.metadata && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Pool: {poolData.metadata.poolAddress.slice(0, 8)}...
                </span>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                <AlertCircle className="w-4 h-4" />
                Using fallback data: {error}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price Slider */}
          <div>
            <label
              htmlFor="price-slider"
              className="text-sm font-medium mb-2 block"
            >
              Simulated Price: {selectedPrice[0] < 1 
                ? selectedPrice[0].toFixed(6) 
                : selectedPrice[0].toFixed(2)
              } {poolData?.metadata ? 
                `(${poolData.metadata.quoteMint.slice(0, 4)}.../${poolData.metadata.baseMint.slice(0, 4)}...)` 
                : '$'
              }
            </label>
            <Slider
              id="price-slider"
              value={selectedPrice}
              onValueChange={setSelectedPrice}
              max={currentPrice * 1.5}
              min={currentPrice * 0.5}
              step={currentPrice * 0.01}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{(currentPrice * 0.5).toFixed(currentPrice < 1 ? 6 : 2)}</span>
              <span>Market: {currentPrice < 1 ? currentPrice.toFixed(6) : currentPrice.toFixed(2)}</span>
              <span>{(currentPrice * 1.5).toFixed(currentPrice < 1 ? 6 : 2)}</span>
            </div>
          </div>

          {/* Liquidity Amount */}
          <div>
            <label
              htmlFor="liquidity-slider"
              className="text-sm font-medium mb-2 block"
            >
              Liquidity Amount: ${liquidityAmount[0].toLocaleString()}
            </label>
            <Slider
              id="liquidity-slider"
              value={liquidityAmount}
              onValueChange={setLiquidityAmount}
              max={10000}
              min={100}
              step={100}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$100</span>
              <span>$10,000</span>
            </div>
          </div>

          {/* Bin Visualization */}
          <div>
            <h4 className="text-sm font-medium mb-3">Bin Distribution</h4>
            <BinChart bins={bins} currentPrice={selectedPrice[0]} />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Est. APR</div>
              <div className="font-semibold text-green-600">
                {metrics.estimatedAPR.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">IL Risk</div>
              <div className="font-semibold text-orange-600">
                {metrics.impermanentLoss.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Est. Fees</div>
              <div className="font-semibold text-blue-600">
                ${metrics.feesEstimate.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Bin Usage</div>
              <div className="font-semibold">
                {metrics.binUtilization.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Deploy Strategy
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
