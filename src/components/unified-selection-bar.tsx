"use client";

import { useAppStore } from "@/store/app-store";
import { TrendingUp, Zap, Plus, ChevronRight } from "lucide-react";
import { StrategySimulator } from "./strategy-simulator";
import { TokenPairIcon } from "./token-pair-icon";
import { useState } from "react";
import { getTokenImage } from "@/constants/token-images";

export function UnifiedSelectionBar() {
  const {
    selectedPool,
    selectedTemplate,
    setStep,
    getTokenPairSymbol,
    currentStep,
  } = useAppStore();
  const [showSimulator, setShowSimulator] = useState(false);

  // Don't show if nothing is selected
  if (!selectedPool && !selectedTemplate) return null;

  // Hide on portfolio and create strategy pages
  if (currentStep === "portfolio" || currentStep === "create") return null;

  // Get token symbols from pool pair
  const getTokenSymbols = () => {
    if (!selectedPool) return { tokenA: "Token", tokenB: "Token" };
    const pair = getTokenPairSymbol();
    const [tokenA, tokenB] = pair.split("/");
    return { tokenA, tokenB };
  };

  const { tokenA, tokenB } = getTokenSymbols();

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:pl-[calc(16rem+1rem)] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pointer-events-none">
        <div className="bg-zinc-950 border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] pointer-events-auto">
          <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent px-4 py-2">
            <div className="text-cyan-400 font-mono text-[10px] tracking-[0.2em] uppercase">
              /// EQUIP STRATEGY
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Left side - Equipment Slots */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1">
                {/* Pool Slot */}
                <div className="relative p-3 border-2 flex-1 min-w-0 bg-[#0a0a0a] border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                  {selectedPool ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <TokenPairIcon
                          tokenA={{
                            symbol: tokenA,
                            image: getTokenImage(tokenA),
                          }}
                          tokenB={{
                            symbol: tokenB,
                            image: getTokenImage(tokenB),
                          }}
                          size="md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-cyan-400 uppercase font-mono tracking-wider mb-1">
                          LIQUIDITY POOL
                        </div>
                        <div className="font-bold text-sm font-mono text-white mb-1">
                          {getTokenPairSymbol()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-green-400">
                          <span>DLMM</span>
                          <span className="w-1 h-1 bg-green-400" />
                          <span>ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-6 h-6 text-zinc-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1">
                          LIQUIDITY POOL
                        </div>
                        <div className="font-bold text-sm font-mono text-zinc-600 mb-1">
                          NO POOL SELECTED
                        </div>
                        <div className="text-[10px] font-mono text-zinc-700">
                          SELECT POOL TO START
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Plus connector */}
                <Plus className="w-5 h-5 text-cyan-500/50 flex-shrink-0 hidden sm:block" />

                {/* Strategy Slot */}
                <div className="relative p-3 border-2 flex-1 min-w-0 bg-[#0a0a0a] border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                  {selectedTemplate ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-cyan-400 uppercase font-mono tracking-wider mb-1">
                          STRATEGY TEMPLATE
                        </div>
                        <div className="font-bold text-sm font-mono text-white mb-1 truncate">
                          {selectedTemplate.name}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-400 font-mono uppercase">
                            {selectedTemplate.riskLevel}
                          </span>
                          <span className="text-[10px] font-mono text-green-400">
                            APR: {selectedTemplate.estimatedAPR}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center flex-shrink-0">
                        <Plus className="w-6 h-6 text-zinc-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider mb-1">
                          STRATEGY TEMPLATE
                        </div>
                        <div className="font-bold text-sm font-mono text-zinc-600 mb-1">
                          NO STRATEGY SELECTED
                        </div>
                        <div className="text-[10px] font-mono text-zinc-700">
                          EQUIP STRATEGY
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Pool selected but no strategy */}
                {selectedPool && !selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => setStep("templates")}
                    className="px-4 py-2 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 font-mono text-sm font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all flex items-center gap-2"
                  >
                    EQUIP STRATEGY
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Both selected - show simulate and deploy */}
                {selectedPool && selectedTemplate && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSimulator(true)}
                      className="px-4 py-2 border-2 border-zinc-700 bg-zinc-900 text-white font-mono text-sm font-bold uppercase tracking-wider hover:border-cyan-500/50 hover:bg-zinc-800 transition-all flex items-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      TEST BUILD
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("deploy")}
                      className="px-4 py-2 border-2 border-green-500 bg-green-500/10 text-green-400 font-mono text-sm font-bold uppercase tracking-wider hover:bg-green-500/20 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      DEPLOY
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSimulator && selectedTemplate && (
        <StrategySimulator
          template={selectedTemplate}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </>
  );
}
