/**
 * Supported DLMM pools on Saros Finance (Devnet)
 * These are active devnet pools for testing and demonstration
 */

export const SUPPORTED_POOLS = [
  {
    address: "H9EPqQKCvv9ddzK6KHjo8vvUPMLMJXmMmru9KUYNaDFQ",
    name: "PYUSD/WSOL",
    description: "PayPal USD / Wrapped SOL",
  },
  {
    address: "DMb8Xta7STwCkHwdWQSazjoJWG1vnNYkk2Pnenj9kPV",
    name: "WSOL/USDT",
    description: "Wrapped SOL / Tether USD",
  },
  {
    address: "3jPMRAaibizCW1nZhyyuSsDSy7beSP4yAfJZtxCBsYuD",
    name: "TKN1/WSOL",
    description: "Test Token 1 / Wrapped SOL",
  },
  {
    address: "7zzwywSok1HLmpqd2SpctCUbDR6oV4RYZmmMPgNxWDs5",
    name: "TKN2/WSOL",
    description: "Test Token 2 / Wrapped SOL",
  },
];

/**
 * Get list of supported pool addresses
 */
export const getSupportedPoolAddresses = () =>
  SUPPORTED_POOLS.map((p) => p.address);

/**
 * Check if a pool is supported
 */
export const isSupportedPool = (address: string) =>
  SUPPORTED_POOLS.some((p) => p.address === address);
