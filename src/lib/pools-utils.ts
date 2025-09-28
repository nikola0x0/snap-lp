export interface PoolData {
  address: string
  metadata: any
  tokenX: string
  tokenY: string
  activeBin?: number
  totalLiquidity?: number
  volume24h?: number
  isActive?: boolean
}

export type PoolSortBy = 'liquidity' | 'volume' | 'name' | 'newest'
export type PoolFilterBy = 'all' | 'active' | 'sol-pairs' | 'high-liquidity'

// Filter pools based on criteria
export function filterPools(pools: PoolData[], filterBy: PoolFilterBy): PoolData[] {
  switch (filterBy) {
    case 'active':
      return pools.filter(pool => pool.isActive !== false)
    case 'sol-pairs':
      return pools.filter(pool => 
        pool.tokenX.includes('SOL') || pool.tokenY.includes('SOL') ||
        pool.tokenX === 'So11111111111111111111111111111111111111112' ||
        pool.tokenY === 'So11111111111111111111111111111111111111112'
      )
    case 'high-liquidity':
      return pools.filter(pool => (pool.totalLiquidity || 0) > 1000)
    default:
      return pools
  }
}

// Sort pools based on criteria
export function sortPools(pools: PoolData[], sortBy: PoolSortBy): PoolData[] {
  switch (sortBy) {
    case 'liquidity':
      return [...pools].sort((a, b) => (b.totalLiquidity || 0) - (a.totalLiquidity || 0))
    case 'volume':
      return [...pools].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
    case 'name':
      return [...pools].sort((a, b) => {
        const nameA = `${getTokenSymbol(a.tokenX)}-${getTokenSymbol(a.tokenY)}`
        const nameB = `${getTokenSymbol(b.tokenX)}-${getTokenSymbol(b.tokenY)}`
        return nameA.localeCompare(nameB)
      })
    case 'newest':
      return [...pools] // Keep original order (newest first from API)
    default:
      return pools
  }
}

// Enhanced token symbol mapping
export function getTokenSymbol(tokenAddress: string): string {
  const tokenMap: Record<string, string> = {
    'So11111111111111111111111111111111111111112': 'SOL',
    'mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z': 'C98',
    'mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9': 'USDT',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
  }
  
  return tokenMap[tokenAddress] || `${tokenAddress.slice(0, 4)}...${tokenAddress.slice(-4)}`
}

// Calculate mock liquidity and volume for sorting demonstration
export function enrichPoolData(pools: PoolData[]): PoolData[] {
  return pools.map(pool => ({
    ...pool,
    // Mock data for demonstration - in production this would come from the API
    totalLiquidity: Math.random() * 100000,
    volume24h: Math.random() * 50000,
    isActive: Math.random() > 0.2, // 80% pools are active
  }))
}