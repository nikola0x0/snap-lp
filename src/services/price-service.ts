import { Connection, PublicKey } from '@solana/web3.js'

export interface TokenPrice {
  mint: string
  symbol: string
  price: number
  priceChange24h: number
  volume24h: number
  lastUpdated: number
}

export interface PriceHistoryPoint {
  timestamp: number
  price: number
  volume?: number
}

export interface OHLCData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface TokenPriceHistory {
  mint: string
  symbol: string
  prices: PriceHistoryPoint[]
  currentPrice: number
  priceChange24h: number
}

// Token mapping for supported AMM tokens
const TOKEN_MAPPING: Record<string, { symbol: string; coingeckoId?: string; jupiterId?: string }> = {
  'So11111111111111111111111111111111111111112': { 
    symbol: 'SOL', 
    coingeckoId: 'solana',
    jupiterId: 'So11111111111111111111111111111111111111112'
  },
  'mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z': { 
    symbol: 'C98', 
    coingeckoId: 'coin98',
    jupiterId: 'mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z'
  },
  'mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9': { 
    symbol: 'USDT', 
    coingeckoId: 'tether',
    jupiterId: 'mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9'
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { 
    symbol: 'USDC', 
    coingeckoId: 'usd-coin',
    jupiterId: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  }
}

export class PriceService {
  private cache = new Map<string, { data: TokenPrice; expiry: number }>()
  private historyCache = new Map<string, { data: TokenPriceHistory; expiry: number }>()
  private readonly CACHE_DURATION = 60 * 1000 // 1 minute
  private readonly HISTORY_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor(private connection?: Connection) {}

  // Get current token prices
  async getTokenPrices(mints: string[]): Promise<Record<string, TokenPrice>> {
    const prices: Record<string, TokenPrice> = {}
    const fetchPromises = mints.map(mint => this.getTokenPrice(mint))
    
    const results = await Promise.allSettled(fetchPromises)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        prices[mints[index]] = result.value
      }
    })
    
    return prices
  }

  // Get single token price with caching
  async getTokenPrice(mint: string): Promise<TokenPrice | null> {
    // Check cache first
    const cached = this.cache.get(mint)
    if (cached && Date.now() < cached.expiry) {
      return cached.data
    }

    try {
      const tokenInfo = TOKEN_MAPPING[mint]
      if (!tokenInfo) {
        console.warn(`Token mapping not found for mint: ${mint}`)
        return null
      }

      let price = null

      // Try CoinGecko first (most reliable free API)
      if (tokenInfo.coingeckoId) {
        price = await this.fetchFromCoinGecko(tokenInfo.coingeckoId, tokenInfo.symbol)
        if (price) {
          price.mint = mint
        }
      }

      // Fallback to CryptoCompare if CoinGecko fails
      if (!price) {
        price = await this.fetchFromCryptoCompare(tokenInfo.symbol, mint)
      }

      if (price) {
        // Cache the result
        this.cache.set(mint, {
          data: price,
          expiry: Date.now() + this.CACHE_DURATION
        })
      }

      return price
    } catch (error) {
      console.error(`Error fetching price for ${mint}:`, error)
      return null
    }
  }

  // Get token price history for charts
  async getTokenPriceHistory(mint: string, days: number = 7): Promise<TokenPriceHistory | null> {
    const cacheKey = `${mint}-${days}d`
    const cached = this.historyCache.get(cacheKey)
    
    if (cached && Date.now() < cached.expiry) {
      return cached.data
    }

    try {
      const tokenInfo = TOKEN_MAPPING[mint]
      if (!tokenInfo || !tokenInfo.coingeckoId) {
        console.warn(`Token mapping or CoinGecko ID not found for mint: ${mint}`)
        return null
      }

      const history = await this.fetchHistoryFromCoinGecko(tokenInfo.coingeckoId, tokenInfo.symbol, days)
      
      if (history) {
        this.historyCache.set(cacheKey, {
          data: history,
          expiry: Date.now() + this.HISTORY_CACHE_DURATION
        })
      }

      return history
    } catch (error) {
      console.error(`Error fetching price history for ${mint}:`, error)
      return null
    }
  }

  // Fetch from Jupiter API
  private async fetchFromJupiter(mint: string, jupiterId: string): Promise<TokenPrice | null> {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(`https://price.jup.ag/v6/price?ids=${jupiterId}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error(`Jupiter API error: ${response.status}`)
      
      const data = await response.json()
      const priceData = data.data?.[jupiterId]
      
      if (!priceData) return null

      const tokenInfo = TOKEN_MAPPING[mint]
      
      return {
        mint,
        symbol: tokenInfo.symbol,
        price: priceData.price,
        priceChange24h: 0, // Jupiter API doesn't provide 24h change
        volume24h: 0, // Jupiter API doesn't provide volume
        lastUpdated: Date.now()
      }
    } catch (error) {
      console.error('Jupiter API error:', error)
      // Return mock data for development to prevent UI breaking
      const tokenInfo = TOKEN_MAPPING[mint]
      if (tokenInfo) {
        console.warn(`Using mock data for ${tokenInfo.symbol} due to Jupiter API failure`)
        return {
          mint,
          symbol: tokenInfo.symbol,
          price: Math.random() * 100 + 50, // Mock price between $50-150
          priceChange24h: (Math.random() - 0.5) * 10, // Random change between -5% to +5%
          volume24h: Math.random() * 1000000, // Random volume
          lastUpdated: Date.now()
        }
      }
      return null
    }
  }

  // Fetch from CoinGecko API
  private async fetchFromCoinGecko(coingeckoId: string, symbol: string): Promise<TokenPrice | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // Longer timeout for CoinGecko
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'x-cg-demo-api-key': 'CG-D8U3xuthayah5KGiuLmjV7N3'
          }
        }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`)
      
      const data = await response.json()
      const priceData = data[coingeckoId]
      
      if (!priceData) return null

      return {
        mint: '', // Will be set by caller
        symbol,
        price: priceData.usd,
        priceChange24h: priceData.usd_24h_change || 0,
        volume24h: priceData.usd_24h_vol || 0,
        lastUpdated: Date.now()
      }
    } catch (error) {
      console.error('CoinGecko API error:', error)
      return null
    }
  }

  // Fetch from CryptoCompare API (backup)
  private async fetchFromCryptoCompare(symbol: string, mint: string): Promise<TokenPrice | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD&api_key=`,
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error(`CryptoCompare API error: ${response.status}`)
      
      const data = await response.json()
      
      if (!data.USD) return null

      return {
        mint,
        symbol,
        price: data.USD,
        priceChange24h: 0, // Would need separate call for 24h change
        volume24h: 0, // Would need separate call for volume
        lastUpdated: Date.now()
      }
    } catch (error) {
      console.error('CryptoCompare API error:', error)
      return null
    }
  }


  // Fetch price history from CoinGecko
  private async fetchHistoryFromCoinGecko(coingeckoId: string, symbol: string, days: number): Promise<TokenPriceHistory | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'x-cg-demo-api-key': 'CG-D8U3xuthayah5KGiuLmjV7N3'
          }
        }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error(`CoinGecko history API error: ${response.status}`)
      
      const data = await response.json()
      
      if (!data.prices || !Array.isArray(data.prices)) return null

      const prices: PriceHistoryPoint[] = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        volume: 0 // Could add volume data if needed
      }))

      const currentPrice = prices[prices.length - 1]?.price || 0
      const previousPrice = prices[0]?.price || 0
      const priceChange24h = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0

      return {
        mint: '', // Will be set by caller
        symbol,
        prices,
        currentPrice,
        priceChange24h
      }
    } catch (error) {
      console.error('CoinGecko history API error:', error)
      return null
    }
  }

  // Get pool pair prices (for calculating liquidity values)
  async getPoolPairPrices(baseMint: string, quoteMint: string): Promise<{
    basePrice: TokenPrice | null
    quotePrice: TokenPrice | null
    ratio: number | null
  }> {
    const [basePrice, quotePrice] = await Promise.all([
      this.getTokenPrice(baseMint),
      this.getTokenPrice(quoteMint)
    ])

    let ratio: number | null = null
    if (basePrice && quotePrice && quotePrice.price > 0) {
      ratio = basePrice.price / quotePrice.price
    }

    return {
      basePrice,
      quotePrice,
      ratio
    }
  }

  // Calculate USD value for token amounts
  calculateUSDValue(amount: number, tokenPrice: TokenPrice | null, decimals: number = 9): number {
    if (!tokenPrice) return 0
    const adjustedAmount = amount / Math.pow(10, decimals)
    return adjustedAmount * tokenPrice.price
  }

  // Get OHLC data for candlestick charts
  async getTokenOHLC(mint: string, days: number = 7): Promise<OHLCData[] | null> {
    try {
      const tokenInfo = TOKEN_MAPPING[mint]
      if (!tokenInfo || !tokenInfo.coingeckoId) {
        console.warn(`Token mapping or CoinGecko ID not found for mint: ${mint}`)
        return null
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenInfo.coingeckoId}/ohlc?vs_currency=usd&days=${days}`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'x-cg-demo-api-key': 'CG-D8U3xuthayah5KGiuLmjV7N3'
          }
        }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error(`CoinGecko OHLC API error: ${response.status}`)
      
      const data = await response.json()
      
      if (!Array.isArray(data)) return null

      const ohlcData: OHLCData[] = data.map(([timestamp, open, high, low, close]: [number, number, number, number, number]) => ({
        time: Math.floor(timestamp / 1000), // Convert to seconds
        open,
        high,
        low,
        close
      }))

      return ohlcData
    } catch (error) {
      console.error('Error fetching OHLC data:', error)
      return null
    }
  }

  // Get volume data for volume chart
  async getTokenVolume(mint: string, days: number = 7): Promise<Array<{time: number, value: number}> | null> {
    try {
      const tokenInfo = TOKEN_MAPPING[mint]
      if (!tokenInfo || !tokenInfo.coingeckoId) return null

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenInfo.coingeckoId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 1 ? 'hourly' : 'daily'}`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'x-cg-demo-api-key': 'CG-D8U3xuthayah5KGiuLmjV7N3'
          }
        }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) throw new Error(`CoinGecko volume API error: ${response.status}`)
      
      const data = await response.json()
      
      if (!data.total_volumes || !Array.isArray(data.total_volumes)) return null

      const volumeData = data.total_volumes.map(([timestamp, volume]: [number, number]) => ({
        time: Math.floor(timestamp / 1000),
        value: volume
      }))

      return volumeData
    } catch (error) {
      console.error('Error fetching volume data:', error)
      return null
    }
  }

  // Clear cache (useful for testing or manual refresh)

  clearCache(): void {
    this.cache.clear()
    this.historyCache.clear()
  }
}

// Export singleton instance
export const priceService = new PriceService()