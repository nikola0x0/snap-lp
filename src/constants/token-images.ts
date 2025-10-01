export const TOKEN_IMAGES: Record<string, string> = {
  SOL: "/tokens/sol.png",
  WSOL: "/tokens/sol.png",
  PYUSD: "/tokens/pyusd.webp",
  USDT: "/tokens/usdt.webp",
  USDC: "/tokens/usdc.png",
  C98: "/tokens/default.png",
};

export const DEFAULT_TOKEN_IMAGE = "/tokens/default.png";

export const getTokenImage = (symbol: string): string => {
  return TOKEN_IMAGES[symbol] || DEFAULT_TOKEN_IMAGE;
};
