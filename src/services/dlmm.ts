import { Connection, PublicKey } from '@solana/web3.js'
import { LiquidityBookServices, MODE } from '@saros-finance/dlmm-sdk'
import { getConnection } from '@/lib/solana'

// DLMM Service wrapper class
export class DLMMService {
  private connection: Connection
  private dlmm: LiquidityBookServices

  constructor(connection?: Connection) {
    this.connection = connection || getConnection()
    // Initialize with devnet mode for development
    this.dlmm = new LiquidityBookServices({
      mode: MODE.DEVNET,
    })
  }

  // Get all DLMM pools
  async getPools() {
    try {
      const pools = await this.dlmm.fetchPoolAddresses()
      return pools
    } catch (error) {
      console.error('Error fetching pools:', error)
      throw error
    }
  }

  // Get pool metadata
  async getPoolMetadata(poolAddress: string) {
    try {
      const metadata = await this.dlmm.fetchPoolMetadata(poolAddress)
      return metadata
    } catch (error) {
      console.error('Error fetching pool metadata:', error)
      throw error
    }
  }

  // Get user positions
  async getUserPositions(userPublicKey: PublicKey, poolAddress: string) {
    try {
      const positions = await this.dlmm.getUserPositions({
        payer: userPublicKey,
        pair: new PublicKey(poolAddress),
      })
      return positions
    } catch (error) {
      console.error('Error fetching user positions:', error)
      throw error
    }
  }

  // Get quote for swap
  async getQuote(params: {
    poolAddress: string
    amount: number
    swapForY: boolean
    isExactInput: boolean
    slippage: number
  }) {
    try {
      // This would need token addresses and decimals in a real implementation
      const quote = await this.dlmm.getQuote({
        amount: BigInt(params.amount),
        isExactInput: params.isExactInput,
        swapForY: params.swapForY,
        pair: new PublicKey(params.poolAddress),
        // Note: In real implementation, these would come from pool metadata
        tokenBase: new PublicKey(""), // placeholder
        tokenQuote: new PublicKey(""), // placeholder
        tokenBaseDecimal: 9, // placeholder
        tokenQuoteDecimal: 6, // placeholder
        slippage: params.slippage,
      })
      return quote
    } catch (error) {
      console.error('Error getting quote:', error)
      throw error
    }
  }

  // Test connection and basic functionality
  async testConnection() {
    try {
      console.log('Testing DLMM connection...')
      const dexName = this.dlmm.getDexName()
      console.log('Connected to:', dexName)
      
      const pools = await this.getPools()
      console.log(`Found ${pools.length} pools`)
      
      return { success: true, poolCount: pools.length, dexName }
    } catch (error) {
      console.error('DLMM connection test failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Export singleton instance
export const dlmmService = new DLMMService()