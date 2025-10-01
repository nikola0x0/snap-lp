"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { TrendingUp, Zap, Plus, ChevronRight } from "lucide-react";
import { StrategySimulator } from "./strategy-simulator";
import { TokenPairIcon } from "./token-pair-icon";
import { useState } from "react";

const TOKEN_IMAGES: Record<string, string> = {
  SOL: "https://coin98.s3.amazonaws.com/hUTZN237FzDLlfP3",
  WSOL: "https://coin98.s3.amazonaws.com/hUTZN237FzDLlfP3",
  USDT: "https://file.coin98.com/images/untitled-2-CdtGnpYdjMHmHJNL.png",
  USDC: "https://file.coin98.com/images/tdugg6fe0z74qafm-PJ4GMyP9c0PtzSUJ.png",
  PYUSD:
    "https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png",
  C98: "https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png",
};

const DEFAULT_IMAGE =
  "https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png";

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
  const getTokenImage = (symbol: string) =>
    TOKEN_IMAGES[symbol] || DEFAULT_IMAGE;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:pl-[calc(16rem+1rem)] bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
        <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 shadow-2xl pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Left side - Equipment Slots */}
              <div className="flex items-center gap-3 flex-1">
                {/* Pool Slot */}
                <div className="relative p-4 rounded-lg border-2 flex-1 min-w-0 bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/50">
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
                        <div className="text-[10px] text-blue-300 uppercase font-semibold tracking-wider mb-1">
                          Liquidity Pool
                        </div>
                        <div className="font-bold text-base text-white mb-1">
                          {getTokenPairSymbol()}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-200">
                          <span>DLMM Pool</span>
                          <span className="w-1 h-1 rounded-full bg-blue-400" />
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Plus className="w-7 h-7 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1">
                          Liquidity Pool
                        </div>
                        <div className="font-bold text-base text-slate-400 mb-1">
                          No Pool Selected
                        </div>
                        <div className="text-xs text-slate-500">
                          Select a pool to get started
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Plus connector */}
                <Plus className="w-6 h-6 text-slate-500 flex-shrink-0" />

                {/* Strategy Slot */}
                <div className="relative p-4 rounded-lg border-2 flex-1 min-w-0 bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/50">
                  {selectedTemplate ? (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Zap className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-purple-300 uppercase font-semibold tracking-wider mb-1">
                          Strategy Template
                        </div>
                        <div className="font-bold text-base text-white mb-1 truncate">
                          {selectedTemplate.name}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="text-[10px] px-2 py-0.5 bg-purple-600/50 text-white border-purple-400">
                            {selectedTemplate.riskLevel}
                          </Badge>
                          <span className="text-xs text-purple-200">
                            APR: {selectedTemplate.estimatedAPR}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Plus className="w-7 h-7 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1">
                          Strategy Template
                        </div>
                        <div className="font-bold text-base text-slate-400 mb-1">
                          No Strategy Selected
                        </div>
                        <div className="text-xs text-slate-500">
                          Equip a strategy template
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-2">
                {/* Pool selected but no strategy */}
                {selectedPool && !selectedTemplate && (
                  <Button
                    onClick={() => setStep("templates")}
                    size="lg"
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    Equip Strategy
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                {/* Both selected - show simulate and deploy */}
                {selectedPool && selectedTemplate && (
                  <>
                    <Button
                      onClick={() => setShowSimulator(true)}
                      variant="outline"
                      size="lg"
                      className="gap-2 border-slate-600 bg-slate-700/50 text-white hover:bg-slate-600 hover:text-white"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Test Build
                    </Button>
                    <Button
                      onClick={() => setStep("deploy")}
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/50"
                    >
                      <Zap className="w-4 h-4" />
                      Deploy
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
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
