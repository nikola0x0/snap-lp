"use client";

import { Badge } from "@/components/ui/badge";
import { TokenPairIcon } from "@/components/token-pair-icon";
import { CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

interface PoolCardProps {
  pool: {
    address: string;
    name: string;
    liquidity: number;
    volume24h: number;
    apr: number;
    priceChange24h: number;
    feeRate: number;
  };
  isSelected?: boolean;
  onClick: () => void;
  onViewDetails: () => void;
}

export function PoolCard({
  pool,
  isSelected,
  onClick,
  onViewDetails,
}: PoolCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const priceChangeColor =
    pool.priceChange24h >= 0 ? "text-green-400" : "text-red-400";
  const PriceIcon = pool.priceChange24h >= 0 ? TrendingUp : TrendingDown;

  return (
    <div
      className={`
        relative bg-zinc-950 border-2 p-4
        transition-all duration-300 cursor-pointer
        ${
          isSelected
            ? "border-cyan-500 shadow-[0_0_40px_rgba(34,211,238,0.4)]"
            : "border-zinc-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
        }
      `}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        </div>
      )}

      {/* Pool name and icon */}
      <div className="flex items-center gap-3 mb-4">
        <TokenPairIcon
          tokenA={{ symbol: pool.name.split('/')[0] }}
          tokenB={{ symbol: pool.name.split('/')[1] }}
          size="lg"
        />
        <div>
          <h3 className="text-lg font-semibold text-white">{pool.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] px-1.5 py-0">
              {pool.feeRate}% FEE
            </Badge>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Liquidity */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-2">
          <div className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase mb-1">
            TVL
          </div>
          <div className="text-base font-mono font-bold text-cyan-400">
            {formatNumber(pool.liquidity)}
          </div>
        </div>

        {/* Volume 24h */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-2">
          <div className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase mb-1">
            VOL 24H
          </div>
          <div className="text-base font-mono font-bold text-white">
            {formatNumber(pool.volume24h)}
          </div>
        </div>

        {/* APR */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-2">
          <div className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase mb-1">
            EST. APR
          </div>
          <div className="text-base font-mono font-bold text-green-400">
            {pool.apr.toFixed(2)}%
          </div>
        </div>

        {/* Price Change */}
        <div className="bg-[#0a0a0a] border border-zinc-800 p-2">
          <div className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase mb-1">
            24H CHANGE
          </div>
          <div
            className={`text-base font-mono font-bold flex items-center gap-1 ${priceChangeColor}`}
          >
            <PriceIcon className="w-3 h-3" />
            {pool.priceChange24h >= 0 ? "+" : ""}
            {pool.priceChange24h.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails();
        }}
        className="
          w-full border-2 border-cyan-500 text-cyan-400 bg-transparent
          px-3 py-2 text-xs font-bold uppercase tracking-wider
          hover:bg-cyan-500/10 transition-all duration-200
        "
      >
        VIEW DETAILS
      </button>
    </div>
  );
}
