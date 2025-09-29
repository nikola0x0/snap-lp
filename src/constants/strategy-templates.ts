import { LiquidityShape } from "@saros-finance/dlmm-sdk"

export interface TokenInfo {
  id: string
  mintAddress: string
  symbol: string
  name: string
  decimals: number
}

export interface PoolInfo {
  address: string
  baseToken: TokenInfo
  quoteToken: TokenInfo
  slippage: number
}

export interface StrategyTemplate {
  id: string
  name: string
  description: string
  riskLevel: "Conservative" | "Balanced" | "Aggressive"
  binRange: [number, number]
  liquidityShape: LiquidityShape
  pool: PoolInfo
  expectedAPY: string
  riskDescription: string
  minLiquidity: number
  maxLiquidity: number
}

export const PYUSD_TOKEN_DEVNET: TokenInfo = {
  id: "pyusd",
  mintAddress: "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM",
  symbol: "PYUSD",
  name: "PAYPAL USD",
  decimals: 6,
}

export const WSOL_TOKEN_DEVNET: TokenInfo = {
  id: "wsol",
  mintAddress: "So11111111111111111111111111111111111111112",
  symbol: "WSOL",
  name: "Wrapped SOL",
  decimals: 9,
}

export const PYUSD_WSOL_POOL_DEVNET: PoolInfo = {
  address: "H9EPqQKCvv9ddzK6KHjo8vvUPMLMJXmMmru9KUYNaDFQ",
  baseToken: PYUSD_TOKEN_DEVNET,
  quoteToken: WSOL_TOKEN_DEVNET,
  slippage: 0.5,
}

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: "conservative-pyusd-wsol",
    name: "Conservative PYUSD-WSOL",
    description: "Low risk, tight range strategy for stable returns around current price",
    riskLevel: "Conservative",
    binRange: [-5, 5],
    liquidityShape: LiquidityShape.Spot,
    pool: PYUSD_WSOL_POOL_DEVNET,
    expectedAPY: "8-12%",
    riskDescription: "Low impermanent loss risk, concentrated liquidity",
    minLiquidity: 10,
    maxLiquidity: 1000,
  },
  {
    id: "balanced-pyusd-wsol",
    name: "Balanced PYUSD-WSOL",
    description: "Medium risk, moderate range for balanced returns and IL protection",
    riskLevel: "Balanced",
    binRange: [-10, 10],
    liquidityShape: LiquidityShape.Curve,
    pool: PYUSD_WSOL_POOL_DEVNET,
    expectedAPY: "12-18%",
    riskDescription: "Moderate impermanent loss risk, good price range coverage",
    minLiquidity: 50,
    maxLiquidity: 5000,
  },
  {
    id: "aggressive-pyusd-wsol",
    name: "Aggressive PYUSD-WSOL", 
    description: "High risk, wide range strategy for maximum fee capture",
    riskLevel: "Aggressive",
    binRange: [-20, 20],
    liquidityShape: LiquidityShape.BidAsk,
    pool: PYUSD_WSOL_POOL_DEVNET,
    expectedAPY: "20-35%",
    riskDescription: "High impermanent loss risk, maximum fee opportunity",
    minLiquidity: 100,
    maxLiquidity: 10000,
  },
]

export const BIN_STEP_CONFIG = 250

export const DEFAULT_SLIPPAGE = 0.5
export const RPC_ENDPOINT = "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7"