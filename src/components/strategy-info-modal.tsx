"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, TrendingUp, Zap, Share2, Sparkles, X } from "lucide-react";

interface StrategyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StrategyInfoModal({ isOpen, onClose }: StrategyInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-cyan-500/30 bg-zinc-950 p-0">
        {/* Header */}
        <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-6 sticky top-0 z-10 bg-zinc-950">
          <div className="flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 font-mono text-lg uppercase tracking-wider">
                {"/// STRATEGY LIBRARY INFO"}
              </DialogTitle>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-2">
                Understanding DLMM strategy templates and platform features
              </p>
            </DialogHeader>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Strategy Types */}
          <div className="border-2 border-cyan-500/30 bg-zinc-950">
            <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
              <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                {"/// STRATEGY RISK PROFILES"}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Conservative */}
              <div className="border-2 border-green-500/30 bg-[#0a0a0a] p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border-2 border-green-500 bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-mono text-lg font-bold text-green-400 uppercase tracking-wider">
                        Conservative
                      </h4>
                      <span className="px-2 py-1 border-2 border-green-500 bg-green-500/10 text-green-400 font-mono text-[10px] uppercase tracking-wider">
                        Low Risk
                      </span>
                    </div>
                    <p className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-3">
                      Tight ranges (±5%) • Minimal IL • Steady fees
                    </p>
                    <div className="bg-zinc-950 border-2 border-zinc-800 p-3">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                        Best For:
                      </div>
                      <div className="text-xs font-mono text-white uppercase tracking-wider">
                        Stablecoins • Low volatility • Passive income
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balanced */}
              <div className="border-2 border-amber-500/30 bg-[#0a0a0a] p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-mono text-lg font-bold text-amber-400 uppercase tracking-wider">
                        Balanced
                      </h4>
                      <span className="px-2 py-1 border-2 border-amber-500 bg-amber-500/10 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
                        Med Risk
                      </span>
                    </div>
                    <p className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-3">
                      Medium ranges (±12.5%) • Balanced IL • Good yields
                    </p>
                    <div className="bg-zinc-950 border-2 border-zinc-800 p-3">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                        Best For:
                      </div>
                      <div className="text-xs font-mono text-white uppercase tracking-wider">
                        SOL pairs • Established tokens • Balanced returns
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aggressive */}
              <div className="border-2 border-red-500/30 bg-[#0a0a0a] p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border-2 border-red-500 bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-mono text-lg font-bold text-red-400 uppercase tracking-wider">
                        Aggressive
                      </h4>
                      <span className="px-2 py-1 border-2 border-red-500 bg-red-500/10 text-red-400 font-mono text-[10px] uppercase tracking-wider">
                        High Risk
                      </span>
                    </div>
                    <p className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-3">
                      Wide ranges (±25%) • Higher IL • Maximum fees
                    </p>
                    <div className="bg-zinc-950 border-2 border-zinc-800 p-3">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                        Best For:
                      </div>
                      <div className="text-xs font-mono text-white uppercase tracking-wider">
                        Volatile pairs • Memcoins • Max fee capture
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Concepts */}
          <div className="border-2 border-cyan-500/30 bg-zinc-950">
            <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
              <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                {"/// KEY CONCEPTS"}
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                <div className="font-mono text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Price Range
                </div>
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Active liquidity window. Narrower = higher fees when in range, more risk when out of range
                </p>
              </div>
              <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                <div className="font-mono text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Bins
                </div>
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Individual price points for liquidity. More bins = smoother distribution
                </p>
              </div>
              <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                <div className="font-mono text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Impermanent Loss
                </div>
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Temporary loss vs holding. Wider ranges = higher IL but more volume capture
                </p>
              </div>
              <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
                <div className="font-mono text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                  APR
                </div>
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Estimated annual return from fees. Varies with volume and volatility
                </p>
              </div>
            </div>
          </div>

          {/* Future Features */}
          <div className="border-2 border-cyan-500/30 bg-zinc-950">
            <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
              <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                {"/// COMING SOON"}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Community Templates */}
              <div className="border-2 border-cyan-500/30 bg-[#0a0a0a] p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border-2 border-cyan-500 bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-mono text-lg font-bold text-cyan-400 uppercase tracking-wider">
                        Community Templates
                      </h4>
                      <span className="px-2 py-1 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 font-mono text-[10px] uppercase tracking-wider animate-pulse">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-3">
                      Share your successful strategies with the community
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          Create and publish your own strategy templates
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          Browse community-created strategies with performance metrics
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          Clone and customize strategies from top performers
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          Earn reputation and rewards for popular templates
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          <span className="text-cyan-400">Advanced Features:</span> Auto stop-loss, take profit, and DCA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SNAP Score AI Analysis */}
              <div className="border-2 border-green-500/30 bg-[#0a0a0a] p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border-2 border-green-500 bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-mono text-lg font-bold text-green-400 uppercase tracking-wider">
                        SNAP Score AI Analysis
                      </h4>
                      <span className="px-2 py-1 border-2 border-green-500 bg-green-500/10 text-green-400 font-mono text-[10px] uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                    <p className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-3">
                      AI-powered strategy evaluation with 4-component scoring system
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          <span className="text-green-400">Market Fit:</span> Analyzes pool volatility and volume patterns
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          <span className="text-green-400">Efficiency:</span> Evaluates capital utilization and fee capture
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          <span className="text-green-400">Safety:</span> Assesses IL risk and range sustainability
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-mono text-xs">▸</span>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          <span className="text-green-400">Adaptability:</span> Measures strategy resilience to market changes
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t-2 border-zinc-800">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        Grade scale: S (90+) • A (80+) • B (70+) • C (60+) • D (&lt;60)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full h-14 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-mono text-sm font-bold uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
