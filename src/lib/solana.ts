import { Connection, clusterApiUrl } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

// Solana connection configuration
export const getNetwork = (): WalletAdapterNetwork => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork
  return network || WalletAdapterNetwork.Devnet
}

export const getRpcEndpoint = (): string => {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL
  return rpcUrl || clusterApiUrl(getNetwork())
}

// Create a connection instance
export const connection = new Connection(getRpcEndpoint(), 'confirmed')

// Utility function to get connection
export const getConnection = (): Connection => {
  return connection
}

// Connection status check
export const checkConnection = async (): Promise<boolean> => {
  try {
    const version = await connection.getVersion()
    console.log('Solana connection established:', version)
    return true
  } catch (error) {
    console.error('Failed to connect to Solana:', error)
    return false
  }
}