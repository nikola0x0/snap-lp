'use client'

import { useState, useEffect } from 'react'
import { DLMMService } from '@/services/dlmm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  ChevronRight,
  DollarSign,
  BarChart3,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

interface PoolData {
  address: string
  tokenX: string
  tokenY: string
  metadata: {
    poolAddress: string
    baseMint: string
    baseReserve: string
    quoteMint: string
    quoteReserve: string
    tradeFee: number
    extra: {
      tokenBaseDecimal: number
      tokenQuoteDecimal: number
      hook?: string
    }
  } | null
}

export function PoolsSection() {
  const [pools, setPools] = useState<PoolData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { selectPool, selectedPool } = useAppStore()

  // Common devnet test tokens (you need BOTH tokens to provide liquidity)
  const getTokenDisplay = (mintAddress: string) => {
    const tokenMap: Record<string, string> = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z': 'Test-A',
      'mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9': 'Test-B', 
      'mntCAkd76nKSVTYxwu8qwQnhPcEE9JyEbgW6eEpwr1N': 'Test-C',
      'mntLe6A4SELrDDiSsdp1wNe64EZ5TsM9gtyFzGPouTr': 'Test-D'
    }
    return tokenMap[mintAddress] || `${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`
  }

  useEffect(() => {
    const loadPools = async () => {
      try {
        setLoading(true)
        const dlmm = new DLMMService()
        const poolsData = await dlmm.getPools()
        setPools(poolsData)
      } catch (err) {
        console.error('Failed to load pools:', err)
        setError(err instanceof Error ? err.message : 'Failed to load pools')
      } finally {
        setLoading(false)
      }
    }

    loadPools()
  }, [])

  const formatLiquidity = (baseReserve: string, quoteReserve: string, baseDecimals: number, quoteDecimals: number) => {
    const base = parseFloat(baseReserve) / Math.pow(10, baseDecimals)
    const quote = parseFloat(quoteReserve) / Math.pow(10, quoteDecimals)
    const totalValue = base + quote // Simplified - would need actual prices
    
    if (totalValue > 1000000) return `$${(totalValue / 1000000).toFixed(2)}M`
    if (totalValue > 1000) return `$${(totalValue / 1000).toFixed(1)}K`
    return `$${totalValue.toFixed(0)}`
  }

  const formatTokenSymbol = (mint: string) => {
    // Simplified token symbol mapping - in production would use a token registry
    const tokenMap: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      // Add more as needed
    }
    
    return tokenMap[mint] || mint.slice(0, 4) + '...'
  }

  const filteredPools = pools.filter(pool => {
    if (!searchTerm) return true
    const tokenXSymbol = formatTokenSymbol(pool.tokenX)
    const tokenYSymbol = formatTokenSymbol(pool.tokenY)
    const searchLower = searchTerm.toLowerCase()
    
    return tokenXSymbol.toLowerCase().includes(searchLower) ||
           tokenYSymbol.toLowerCase().includes(searchLower) ||
           pool.address.toLowerCase().includes(searchLower)
  })

  const activePools = filteredPools.filter(pool => 
    pool.metadata && 
    pool.metadata.baseReserve !== '0' && 
    pool.metadata.quoteReserve !== '0'
  )

  const handleSelectPool = (pool: PoolData) => {
    selectPool(pool)
    // Navigation is handled automatically by the app store
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading DLMM pools...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load pools: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Step 1: Select a Pool</h1>
          
          {/* Token Requirements Warning */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-orange-900">Token Requirements for Liquidity</p>
                  <p className="text-sm text-orange-800">
                    To provide liquidity to any DLMM pool, you need <strong>BOTH tokens</strong> of the pair in your wallet. 
                    For example, a SOL/USDC pool requires both SOL and USDC tokens.
                  </p>
                  <p className="text-xs text-orange-700">
                    💡 Currently you have SOL on devnet. Look for pools with SOL as one of the tokens, or get test tokens from a devnet faucet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <p className="text-muted-foreground">
            Choose a DLMM pool to provide liquidity. After selecting a pool, you'll choose from strategy templates optimized for that pool.
          </p>
        </div>
        
        {selectedPool && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Pool Selected</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTokenSymbol(selectedPool.tokenX)}/{formatTokenSymbol(selectedPool.tokenY)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-sm font-medium">Next: Choose Strategy</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pools</p>
                <p className="text-2xl font-bold">{pools.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Pools</p>
                <p className="text-2xl font-bold">{activePools.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total TVL</p>
                <p className="text-2xl font-bold">$2.1M</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search pools or tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Available Pools</span>
            <Badge variant="secondary">{filteredPools.length} pools</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pools found matching your search.
              </div>
            ) : (
              filteredPools.map((pool) => {
                const isActive = pool.metadata && 
                  pool.metadata.baseReserve !== '0' && 
                  pool.metadata.quoteReserve !== '0'
                
                const tokenXSymbol = formatTokenSymbol(pool.tokenX)
                const tokenYSymbol = formatTokenSymbol(pool.tokenY)
                
                return (
                  <Card 
                    key={pool.address} 
                    className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                      selectedPool?.address === pool.address ? 'border-primary bg-primary/5' : 'border-transparent'
                    } ${!isActive ? 'opacity-60' : ''}`}
                    onClick={() => isActive && handleSelectPool(pool)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Pool Icon */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {tokenXSymbol.slice(0, 1)}{tokenYSymbol.slice(0, 1)}
                          </div>
                          
                          {/* Pool Info */}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">
                                {tokenXSymbol}/{tokenYSymbol}
                              </span>
                              {!isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {pool.address.slice(0, 8)}...{pool.address.slice(-6)}
                            </p>
                          </div>
                        </div>

                        {/* Pool Stats */}
                        <div className="flex items-center space-x-6">
                          {pool.metadata && (
                            <>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Liquidity</p>
                                <p className="font-semibold">
                                  {formatLiquidity(
                                    pool.metadata.baseReserve,
                                    pool.metadata.quoteReserve,
                                    pool.metadata.extra.tokenBaseDecimal,
                                    pool.metadata.extra.tokenQuoteDecimal
                                  )}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Fee</p>
                                <p className="font-semibold">
                                  {(pool.metadata.tradeFee * 100).toFixed(2)}%
                                </p>
                              </div>
                            </>
                          )}
                          
                          {isActive && (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}