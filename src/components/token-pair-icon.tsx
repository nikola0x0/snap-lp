interface TokenPairIconProps {
  tokenA: {
    symbol: string;
    image?: string;
  };
  tokenB: {
    symbol: string;
    image?: string;
  };
  size?: "sm" | "md" | "lg";
}

const TOKEN_IMAGES: Record<string, string> = {
  SOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  WSOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  PYUSD: "https://s2.coinmarketcap.com/static/img/coins/64x64/27772.png",
  USDT: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
  USDC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
};

const DEFAULT_IMAGE =
  "https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png";

export function TokenPairIcon({
  tokenA,
  tokenB,
  size = "md",
}: TokenPairIconProps) {
  const sizes = {
    sm: { icon: "w-6 h-6", overlap: "-ml-2" },
    md: { icon: "w-8 h-8", overlap: "-ml-3" },
    lg: { icon: "w-10 h-10", overlap: "-ml-4" },
  };

  const { icon, overlap } = sizes[size];

  const getTokenImage = (token: typeof tokenA) => {
    if (token.image) return token.image;
    return TOKEN_IMAGES[token.symbol] || DEFAULT_IMAGE;
  };

  return (
    <div className="flex items-center">
      <img
        src={getTokenImage(tokenA)}
        alt={tokenA.symbol}
        className={`${icon} rounded-full border-2 border-background relative z-10`}
      />
      <img
        src={getTokenImage(tokenB)}
        alt={tokenB.symbol}
        className={`${icon} rounded-full border-2 border-background ${overlap}`}
      />
    </div>
  );
}
