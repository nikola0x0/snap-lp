import type { StrategyTemplate } from '@/types/strategy'

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'conservative',
    name: 'Conservative Strategy',
    description: 'Tight price range with minimal impermanent loss risk. Best for stable pairs and risk-averse LPs.',
    riskLevel: 'Conservative',
    riskRating: 2,
    estimatedAPR: 8,
    impermanentLossRisk: 1,
    binConfiguration: {
      binCount: 5,
      rangeWidth: 10, // ±5% around current price
      distribution: 'concentrated',
      concentrationFactor: 0.8,
    },
    parameters: {
      minTokenAmount: 10,
      maxTokenAmount: 10000,
      rebalanceThreshold: 3, // 3% price move triggers rebalance alert
      stopLossThreshold: 15,
      takeProfitThreshold: 12,
      autoRebalance: false,
    },
    tags: ['Low Risk', 'Stable', 'Beginner Friendly'],
  },
  {
    id: 'balanced',
    name: 'Balanced Strategy',
    description: 'Medium price range balancing yield potential with manageable risk. Good for most trading pairs.',
    riskLevel: 'Balanced',
    riskRating: 3,
    estimatedAPR: 15,
    impermanentLossRisk: 3,
    binConfiguration: {
      binCount: 7,
      rangeWidth: 25, // ±12.5% around current price
      distribution: 'weighted',
      concentrationFactor: 0.6,
    },
    parameters: {
      minTokenAmount: 25,
      maxTokenAmount: 25000,
      rebalanceThreshold: 8, // 8% price move triggers rebalance alert
      stopLossThreshold: 25,
      takeProfitThreshold: 20,
      autoRebalance: false,
    },
    tags: ['Medium Risk', 'Balanced', 'Popular'],
  },
  {
    id: 'aggressive',
    name: 'Aggressive Strategy',
    description: 'Wide price range targeting maximum yield potential. Higher risk but greater rewards for volatile pairs.',
    riskLevel: 'Aggressive',
    riskRating: 5,
    estimatedAPR: 28,
    impermanentLossRisk: 4,
    binConfiguration: {
      binCount: 11,
      rangeWidth: 50, // ±25% around current price
      distribution: 'uniform',
    },
    parameters: {
      minTokenAmount: 50,
      maxTokenAmount: 50000,
      rebalanceThreshold: 15, // 15% price move triggers rebalance alert
      stopLossThreshold: 40,
      takeProfitThreshold: 35,
      autoRebalance: false,
    },
    tags: ['High Risk', 'High Yield', 'Advanced'],
  },
]

// Helper functions for strategy management
export const getStrategyById = (id: string): StrategyTemplate | undefined => {
  return STRATEGY_TEMPLATES.find(strategy => strategy.id === id)
}

export const getStrategiesByRiskLevel = (riskLevel: StrategyTemplate['riskLevel']): StrategyTemplate[] => {
  return STRATEGY_TEMPLATES.filter(strategy => strategy.riskLevel === riskLevel)
}

export const getRiskLevelColor = (riskLevel: StrategyTemplate['riskLevel']): string => {
  switch (riskLevel) {
    case 'Conservative':
      return 'text-green-600'
    case 'Balanced':
      return 'text-yellow-600'
    case 'Aggressive':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export const getRiskLevelBgColor = (riskLevel: StrategyTemplate['riskLevel']): string => {
  switch (riskLevel) {
    case 'Conservative':
      return 'bg-green-100'
    case 'Balanced':
      return 'bg-yellow-100'
    case 'Aggressive':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
}