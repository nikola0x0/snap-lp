// Strategy template types
export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  riskLevel: "Conservative" | "Balanced" | "Aggressive";
  riskRating: number; // 1-5 scale
  estimatedAPR: number; // Estimated APR percentage
  impermanentLossRisk: number; // 1-5 scale
  binConfiguration: BinConfiguration;
  parameters: StrategyParameters;
  tags: string[];
  creator?: string;
}

export interface BinConfiguration {
  binCount: number;
  rangeWidth: number; // Percentage around current price
  distribution:
    | "uniform"
    | "concentrated"
    | "weighted"
    | "spot"
    | "curve"
    | "bid-ask";
  concentrationFactor?: number; // For concentrated strategies
  binDistribution: Array<{ binId: number; weight: number }>; // Actual bin weights for DLMM
}

export interface StrategyParameters {
  minTokenAmount: number;
  maxTokenAmount: number;
  rebalanceThreshold: number; // Percentage
  stopLossThreshold?: number; // Percentage
  takeProfitThreshold?: number; // Percentage
  autoRebalance: boolean;
  defaultTokenXPercentage: number; // 0-100, default X/Y split
  slippage: number; // Default slippage tolerance
}

// Pool and market data types
export interface PoolInfo {
  address: string;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  currentPrice: number;
  volume24h: number;
  tvl: number;
  apr: number;
}

export interface TokenInfo {
  mint: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

// Simulation and metrics types
export interface SimulationParams {
  strategyId: string;
  poolAddress: string;
  tokenAmountA: number;
  tokenAmountB: number;
  priceRange: [number, number]; // Min and max price for simulation
}

export interface SimulationResult {
  estimatedAPR: number;
  impermanentLoss: number;
  feesClaimed: number;
  roi: number;
  binUtilization: number[];
  priceImpactScenarios: PriceScenario[];
}

export interface PriceScenario {
  priceChange: number; // Percentage change
  roi: number;
  impermanentLoss: number;
  binsCovered: number;
}

// Position and portfolio types
export interface Position {
  id: string;
  strategyTemplate: StrategyTemplate;
  poolAddress: string;
  tokenAmountA: number;
  tokenAmountB: number;
  createdAt: Date;
  currentValue: number;
  unrealizedPnL: number;
  feesClaimed: number;
  status: "active" | "closed" | "out-of-range";
  binIds: number[];
}

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalFees: number;
  positions: Position[];
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  totalROI: number;
  avgAPR: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
}
