"use client";

import { useState } from "react";
import { StrategyTemplate } from "@/types/strategy";
// Risk level styling utilities
const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "Conservative":
      return "text-green-700";
    case "Balanced":
      return "text-yellow-700";
    case "Aggressive":
      return "text-red-700";
    default:
      return "text-gray-700";
  }
};

const getRiskLevelBgColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "Conservative":
      return "bg-green-100";
    case "Balanced":
      return "bg-yellow-100";
    case "Aggressive":
      return "bg-red-100";
    default:
      return "bg-gray-100";
  }
};
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BinChart } from "./bin-chart";
import { StrategySimulator } from "./strategy-simulator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Shield,
  TrendingUp,
  Zap,
  Info,
  Target,
  DollarSign,
  AlertTriangle,
  Settings,
  BarChart3,
  Calculator,
  X,
  Play,
} from "lucide-react";

interface TemplateDetailModalProps {
  template: StrategyTemplate;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateDetailModal({
  template,
  isOpen,
  onClose,
}: TemplateDetailModalProps) {
  const [showSimulator, setShowSimulator] = useState(false);

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "Conservative":
        return <Shield className="w-4 h-4" />;
      case "Balanced":
        return <TrendingUp className="w-4 h-4" />;
      case "Aggressive":
        return <Zap className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getRiskDescription = (riskLevel: string) => {
    switch (riskLevel) {
      case "Conservative":
        return "Minimal exposure to impermanent loss with steady fee collection. Ideal for stable pairs and risk-averse investors.";
      case "Balanced":
        return "Moderate risk exposure balanced with higher yield potential. Good for most trading pairs with regular activity.";
      case "Aggressive":
        return "Higher risk exposure targeting maximum yield from volatile pairs. Suitable for experienced LPs comfortable with IL risk.";
      default:
        return "";
    }
  };

  // Generate mock bin data for visualization
  const generateBinData = (template: StrategyTemplate) => {
    const {
      binCount,
      rangeWidth,
      concentrationFactor = 0.6,
    } = template.binConfiguration;
    const bins = [];
    const centerPrice = 100; // Mock current price
    const halfRange = rangeWidth / 2;

    for (let i = 0; i < binCount; i++) {
      const position = (i / (binCount - 1) - 0.5) * 2; // -1 to 1
      const price = centerPrice * (1 + (position * halfRange) / 100);

      // Calculate liquidity based on distribution type
      let liquidity;
      if (template.binConfiguration.distribution === "concentrated") {
        liquidity = Math.max(
          0.1,
          concentrationFactor * Math.exp(-Math.abs(position * 2)),
        );
      } else if (template.binConfiguration.distribution === "weighted") {
        liquidity = Math.max(0.2, 1 - Math.abs(position) * 0.6);
      } else {
        // uniform
        liquidity = 0.8 + Math.random() * 0.4;
      }

      bins.push({
        id: i,
        price: +price.toFixed(2),
        liquidity: +(liquidity * 100).toFixed(1),
        active: Math.abs(position) < 0.2, // Active if near center
      });
    }

    return bins;
  };

  const binData = generateBinData(template);
  const currentPrice = 100; // Mock current price

  if (showSimulator) {
    return (
      <StrategySimulator
        template={template}
        onClose={() => {
          setShowSimulator(false);
          onClose();
        }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={`${getRiskLevelBgColor(template.riskLevel)} ${getRiskLevelColor(
                    template.riskLevel,
                  )} border-0`}
                >
                  {getRiskIcon(template.riskLevel)}
                  <span className="ml-1">{template.riskLevel}</span>
                </Badge>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    Risk Level:
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full mr-1 ${
                          i < template.riskRating
                            ? getRiskLevelColor(template.riskLevel).replace(
                                "text-",
                                "bg-",
                              )
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogDescription className="text-base">
            {template.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {getRiskDescription(template.riskLevel)}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {template.estimatedAPR}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Estimated APR
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {template.impermanentLossRisk}/5
                  </div>
                  <div className="text-sm text-muted-foreground">
                    IL Risk Rating
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    ±{template.binConfiguration.rangeWidth / 2}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Price Range
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bin Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Liquidity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BinChart bins={binData} currentPrice={currentPrice} />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Bins</div>
                    <div className="font-semibold">
                      {template.binConfiguration.binCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Distribution</div>
                    <div className="font-semibold capitalize">
                      {template.binConfiguration.distribution}
                    </div>
                  </div>
                  {template.binConfiguration.concentrationFactor && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground">
                        Concentration Factor
                      </div>
                      <div className="font-semibold">
                        {(
                          template.binConfiguration.concentrationFactor * 100
                        ).toFixed(0)}
                        %
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Strategy Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Strategy Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position Size</span>
                    <span className="font-medium">
                      ${template.parameters.minTokenAmount} - $
                      {template.parameters.maxTokenAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Rebalance Threshold
                    </span>
                    <span className="font-medium">
                      {template.parameters.rebalanceThreshold}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stop Loss</span>
                    <span className="font-medium">
                      {template.parameters.stopLossThreshold}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Take Profit</span>
                    <span className="font-medium">
                      {template.parameters.takeProfitThreshold}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Auto Rebalance
                    </span>
                    <span className="font-medium">
                      {template.parameters.autoRebalance ? "Enabled" : "Manual"}
                    </span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expected Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Expected Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">
                    Daily Fees (Est.)
                  </div>
                  <div className="font-semibold text-green-600">
                    {((template.estimatedAPR / 365) * 0.8).toFixed(3)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    Weekly Return
                  </div>
                  <div className="font-semibold text-green-600">
                    {((template.estimatedAPR / 52) * 0.85).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    Monthly Return
                  </div>
                  <div className="font-semibold text-green-600">
                    {(template.estimatedAPR / 12).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    Rebalance Freq.
                  </div>
                  <div className="font-semibold">
                    {template.riskLevel === "Conservative"
                      ? "Low"
                      : template.riskLevel === "Balanced"
                        ? "Medium"
                        : "High"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={() => setShowSimulator(true)} className="flex-1">
              <Calculator className="w-4 h-4 mr-2" />
              Run Simulation
            </Button>
            <Button variant="outline" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Deploy This Strategy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
