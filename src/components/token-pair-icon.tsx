import { getTokenImage } from "@/constants/token-images";

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

  return (
    <div className="flex items-center">
      <img
        src={tokenA.image || getTokenImage(tokenA.symbol)}
        alt={tokenA.symbol}
        className={`${icon} rounded-full border-2 border-background relative z-10`}
      />
      <img
        src={tokenB.image || getTokenImage(tokenB.symbol)}
        alt={tokenB.symbol}
        className={`${icon} rounded-full border-2 border-background ${overlap}`}
      />
    </div>
  );
}
