'use client'

import { DLMMPoolChart } from './dlmm-pool-chart'

interface PoolPriceChartsProps {
  poolAddress: string
  baseMint: string
  quoteMint: string
  baseSymbol: string
  quoteSymbol: string
  className?: string
}

export function PoolPriceCharts({ 
  poolAddress,
  baseMint, 
  quoteMint, 
  baseSymbol, 
  quoteSymbol,
  className = ''
}: PoolPriceChartsProps) {
  const poolSymbol = `${baseSymbol}/${quoteSymbol}`
  
  return (
    <DLMMPoolChart
      poolAddress={poolAddress}
      poolSymbol={poolSymbol}
      className={className}
    />
  )
}