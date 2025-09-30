/**
 * Supported DLMM pools on Saros Finance (Devnet)
 * For demo purposes, we focus on the main pool being used
 * TODO: Add more top pools by volume once identified
 */

export const SUPPORTED_POOLS = [
  {
    address: "H9EPqQKCvv9ddzK6KHjo8vvUPMLMJXmMmru9KUYNaDFQ",
    name: "PYUSD/WSOL",
    description: "PayPal USD / Wrapped SOL - Primary demo pool",
  },
  // Add more pools here as they're identified from the API
  // Format: { address: "...", name: "TOKEN/TOKEN", description: "..." }
];

/**
 * Get list of supported pool addresses
 */
export const getSupportedPoolAddresses = () => SUPPORTED_POOLS.map(p => p.address);

/**
 * Check if a pool is supported
 */
export const isSupportedPool = (address: string) =>
  SUPPORTED_POOLS.some(p => p.address === address);