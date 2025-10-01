import type { StrategyTemplate } from "@/types/strategy";

// Generate bin distribution for different strategy types
function generateSpotDistribution(
  centerBin: number,
  range: number,
): Array<{ binId: number; weight: number }> {
  const bins = [];
  const totalBins = range * 2 + 1;
  for (let i = -range; i <= range; i++) {
    bins.push({
      binId: centerBin + i,
      weight: 1 / totalBins, // Uniform distribution
    });
  }
  return bins;
}

function generateCurveDistribution(
  centerBin: number,
  range: number,
): Array<{ binId: number; weight: number }> {
  const bins = [];
  let totalWeight = 0;

  // Bell curve distribution
  for (let i = -range; i <= range; i++) {
    const distance = Math.abs(i);
    const weight = Math.exp(-Math.pow(distance / (range / 2), 2)); // Gaussian-like
    bins.push({
      binId: centerBin + i,
      weight: weight,
    });
    totalWeight += weight;
  }

  // Normalize weights
  return bins.map((bin) => ({
    ...bin,
    weight: bin.weight / totalWeight,
  }));
}

function generateBidAskDistribution(
  centerBin: number,
  range: number,
): Array<{ binId: number; weight: number }> {
  const bins = [];
  const edgeWeight = 0.4; // 40% on each edge, 20% in middle
  const middleWeight = 0.2;
  const middleBins = Math.floor(range / 2);

  for (let i = -range; i <= range; i++) {
    let weight: number;

    if (Math.abs(i) >= range - 1) {
      // Edge bins
      weight = edgeWeight / 2; // Split between both edges
    } else if (Math.abs(i) <= middleBins) {
      // Middle bins
      weight = middleWeight / (middleBins * 2 + 1);
    } else {
      // Transition bins
      weight = 0.05;
    }

    bins.push({
      binId: centerBin + i,
      weight: weight,
    });
  }

  return bins;
}

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: "conservative-stable",
    name: "Stable Pairs Conservative",
    description:
      "Wide range strategy for stable pairs like USDC-USDT with minimal IL risk",
    riskLevel: "Conservative",
    riskRating: 1,
    estimatedAPR: 8,
    impermanentLossRisk: 1,
    binConfiguration: {
      binCount: 21,
      rangeWidth: 5, // ±5% range
      distribution: "curve",
      concentrationFactor: 0.7,
      binDistribution: generateCurveDistribution(0, 10), // Will be adjusted for actual pool
    },
    parameters: {
      minTokenAmount: 100,
      maxTokenAmount: 100000,
      rebalanceThreshold: 15,
      autoRebalance: false,
      defaultTokenXPercentage: 50,
      slippage: 0.005, // 0.5%
    },
    tags: ["stable", "low-risk", "passive"],
    creator: "SnapLP",
  },

  {
    id: "balanced-spot",
    name: "Balanced Spot Strategy",
    description:
      "Even liquidity distribution around current price for moderate volatility pairs",
    riskLevel: "Balanced",
    riskRating: 3,
    estimatedAPR: 15,
    impermanentLossRisk: 3,
    binConfiguration: {
      binCount: 15,
      rangeWidth: 10, // ±10% range
      distribution: "spot",
      concentrationFactor: 1.0,
      binDistribution: generateSpotDistribution(0, 7),
    },
    parameters: {
      minTokenAmount: 50,
      maxTokenAmount: 50000,
      rebalanceThreshold: 25,
      autoRebalance: true,
      defaultTokenXPercentage: 50,
      slippage: 0.01, // 1%
    },
    tags: ["balanced", "medium-risk", "versatile"],
    creator: "SnapLP",
  },

  {
    id: "aggressive-concentrated",
    name: "Aggressive Concentrated",
    description:
      "Tight range around current price for maximum capital efficiency and fees",
    riskLevel: "Aggressive",
    riskRating: 5,
    estimatedAPR: 35,
    impermanentLossRisk: 5,
    binConfiguration: {
      binCount: 9,
      rangeWidth: 3, // ±3% range
      distribution: "concentrated",
      concentrationFactor: 0.9,
      binDistribution: generateCurveDistribution(0, 4),
    },
    parameters: {
      minTokenAmount: 25,
      maxTokenAmount: 25000,
      rebalanceThreshold: 5,
      autoRebalance: true,
      defaultTokenXPercentage: 50,
      slippage: 0.015, // 1.5%
    },
    tags: ["aggressive", "high-risk", "active"],
    creator: "SnapLP",
  },

  {
    id: "swing-trader",
    name: "Swing Trader",
    description:
      "Bid-ask distribution to profit from price swings and volatility",
    riskLevel: "Aggressive",
    riskRating: 4,
    estimatedAPR: 28,
    impermanentLossRisk: 4,
    binConfiguration: {
      binCount: 17,
      rangeWidth: 15, // ±15% range
      distribution: "bid-ask",
      concentrationFactor: 0.8,
      binDistribution: generateBidAskDistribution(0, 8),
    },
    parameters: {
      minTokenAmount: 100,
      maxTokenAmount: 75000,
      rebalanceThreshold: 30,
      stopLossThreshold: 20,
      autoRebalance: false,
      defaultTokenXPercentage: 50,
      slippage: 0.02, // 2%
    },
    tags: ["swing-trading", "volatility", "tactical"],
    creator: "SnapLP",
  },

  {
    id: "accumulator",
    name: "Token Accumulator",
    description: "Buy-side heavy to accumulate tokens during dips",
    riskLevel: "Balanced",
    riskRating: 3,
    estimatedAPR: 18,
    impermanentLossRisk: 2,
    binConfiguration: {
      binCount: 13,
      rangeWidth: 12, // -15% to +9%
      distribution: "weighted",
      concentrationFactor: 0.6,
      binDistribution: [
        // More weight on lower bins (buy side)
        { binId: -7, weight: 0.15 },
        { binId: -6, weight: 0.12 },
        { binId: -5, weight: 0.1 },
        { binId: -4, weight: 0.08 },
        { binId: -3, weight: 0.06 },
        { binId: -2, weight: 0.05 },
        { binId: -1, weight: 0.04 },
        { binId: 0, weight: 0.1 },
        { binId: 1, weight: 0.05 },
        { binId: 2, weight: 0.05 },
        { binId: 3, weight: 0.05 },
        { binId: 4, weight: 0.05 },
        { binId: 5, weight: 0.1 },
      ],
    },
    parameters: {
      minTokenAmount: 75,
      maxTokenAmount: 40000,
      rebalanceThreshold: 20,
      autoRebalance: false,
      defaultTokenXPercentage: 30, // More Y tokens to buy X
      slippage: 0.01,
    },
    tags: ["accumulation", "buy-heavy", "dca"],
    creator: "SnapLP",
  },

  {
    id: "defi-alpha-scalper",
    name: "DeFi Alpha Scalper",
    description:
      "Ultra-tight range strategy for quick profits on stable pairs. Perfect for experienced traders.",
    riskLevel: "Aggressive",
    riskRating: 5,
    estimatedAPR: 45,
    impermanentLossRisk: 5,
    binConfiguration: {
      binCount: 7,
      rangeWidth: 2, // ±1% range
      distribution: "concentrated",
      concentrationFactor: 0.95,
      binDistribution: generateCurveDistribution(0, 3),
    },
    parameters: {
      minTokenAmount: 500,
      maxTokenAmount: 100000,
      rebalanceThreshold: 2,
      autoRebalance: true,
      defaultTokenXPercentage: 50,
      slippage: 0.02,
    },
    tags: ["scalping", "high-frequency", "expert"],
    creator: "@DeFiAlpha_Pro",
  },

  {
    id: "whale-accumulator",
    name: "Whale Accumulation Strategy",
    description:
      "Long-term accumulation strategy using wide ranges. Popularized by crypto whales.",
    riskLevel: "Conservative",
    riskRating: 2,
    estimatedAPR: 12,
    impermanentLossRisk: 2,
    binConfiguration: {
      binCount: 25,
      rangeWidth: 30, // ±15% range
      distribution: "spot",
      concentrationFactor: 0.5,
      binDistribution: generateSpotDistribution(0, 12),
    },
    parameters: {
      minTokenAmount: 1000,
      maxTokenAmount: 500000,
      rebalanceThreshold: 40,
      autoRebalance: false,
      defaultTokenXPercentage: 40, // Favor quote token
      slippage: 0.005,
    },
    tags: ["accumulation", "whale-strategy", "long-term"],
    creator: "@CryptoWhaleWatch",
  },
];

// Helper function to adjust bin IDs based on actual pool active bin
export function adjustTemplateForPool(
  template: StrategyTemplate,
  activeBin: number,
): StrategyTemplate {
  const adjustedBinDistribution = template.binConfiguration.binDistribution.map(
    (bin) => ({
      ...bin,
      binId: activeBin + bin.binId, // Adjust relative to active bin
    }),
  );

  return {
    ...template,
    binConfiguration: {
      ...template.binConfiguration,
      binDistribution: adjustedBinDistribution,
    },
  };
}

// Get template by category
export function getTemplatesByCategory(
  category: "Conservative" | "Balanced" | "Aggressive",
) {
  return STRATEGY_TEMPLATES.filter(
    (template) => template.riskLevel === category,
  );
}

// Get template by ID
export function getTemplateById(id: string) {
  return STRATEGY_TEMPLATES.find((template) => template.id === id);
}
