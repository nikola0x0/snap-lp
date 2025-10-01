"use client";

import { useState } from "react";
import { TerminalHeader } from "../terminal-header";
import { useAppStore } from "@/store/app-store";
import type { StrategyTemplate } from "@/types/strategy";
import {
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Share2,
  Save,
  AlertTriangle,
  Target,
  DollarSign,
  Activity,
  Lock,
  User,
} from "lucide-react";

export function CreateSection() {
  const { addCustomTemplate, setStep } = useAppStore();
  const [strategyName, setStrategyName] = useState("");
  const [binCount, setBinCount] = useState(15);
  const [rangeWidth, setRangeWidth] = useState(10);
  const [distribution, setDistribution] = useState<
    "uniform" | "concentrated" | "weighted"
  >("concentrated");
  const [riskLevel, setRiskLevel] = useState<
    "Conservative" | "Balanced" | "Aggressive"
  >("Conservative");
  const [autoRebalance, setAutoRebalance] = useState(false);
  const [stopLoss, setStopLoss] = useState(false);
  const [takeProfit, setTakeProfit] = useState(false);
  const [dca, setDca] = useState(false);

  const handleCreateStrategy = () => {
    if (!strategyName.trim()) {
      alert("Please enter a strategy name");
      return;
    }

    // Generate bin distribution based on configuration
    const binDistribution = Array.from({ length: binCount }, (_, i) => ({
      binId: i,
      weight: distribution === "concentrated" ?
        // Gaussian-like distribution for concentrated
        Math.exp(-(((i - binCount / 2) / (binCount / 4)) ** 2)) :
        // Uniform distribution
        1.0 / binCount
    }));

    const newTemplate: StrategyTemplate = {
      id: `custom-${Date.now()}`,
      name: strategyName,
      description: `Custom ${riskLevel.toLowerCase()} strategy created by user`,
      riskLevel,
      riskRating: riskLevel === "Conservative" ? 2 : riskLevel === "Balanced" ? 3 : 4,
      estimatedAPR:
        riskLevel === "Conservative" ? 10 :
        riskLevel === "Balanced" ? 20 :
        40,
      impermanentLossRisk:
        riskLevel === "Conservative" ? 1 :
        riskLevel === "Balanced" ? 3 :
        4,
      binConfiguration: {
        binCount,
        rangeWidth,
        distribution,
        concentrationFactor: distribution === "concentrated" ? 0.8 : undefined,
        binDistribution,
      },
      parameters: {
        minTokenAmount: 100,
        maxTokenAmount: 100000,
        rebalanceThreshold: 10,
        stopLossThreshold: riskLevel === "Conservative" ? 5 : 15,
        takeProfitThreshold: riskLevel === "Conservative" ? 15 : 25,
        autoRebalance: false,
        defaultTokenXPercentage: 50,
        slippage: 1,
      },
      tags: ["custom", riskLevel.toLowerCase()],
      creator: "You",
    };

    addCustomTemplate(newTemplate);

    // Show success message and redirect to templates
    alert(
      `✓ Strategy Created!\n\n"${strategyName}" has been saved to your library.\n\nYou can now find it in the Strategy Library section.`
    );

    // Reset form
    setStrategyName("");
    setBinCount(15);
    setRangeWidth(10);
    setDistribution("concentrated");
    setRiskLevel("Conservative");

    // Redirect to templates section
    setStep("templates");
  };

  return (
    <div className="space-y-4">
      <TerminalHeader
        title="/// CREATE STRATEGY"
        subtitle="Build custom DLMM templates with your parameters"
      />

      {/* Beta Notice */}
      <div className="border-2 border-cyan-500 bg-cyan-500/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 border-2 border-cyan-500 bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-mono text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">
              CUSTOM STRATEGY BUILDER - BETA
            </h3>
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Create custom DLMM strategies with your own parameters. Community
              publishing and advanced features (auto-rebalance, stop-loss,
              take-profit, DCA) coming soon!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Configuration */}
        <div className="space-y-4">
          {/* Basic Configuration */}
          <div className="border-2 border-cyan-500/30 bg-zinc-950">
            <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
              <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                {"/// BASIC CONFIGURATION"}
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Strategy Name */}
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  placeholder="e.g., Ultra Conservative Stablecoin"
                  className="w-full h-10 bg-[#0a0a0a] border-2 border-zinc-800 px-3 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Risk Level */}
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
                  Risk Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    ["Conservative", "Balanced", "Aggressive"] as const
                  ).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setRiskLevel(level)}
                      className={`h-10 border-2 font-mono text-xs uppercase tracking-wider transition-all ${
                        riskLevel === level
                          ? level === "Conservative"
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : level === "Balanced"
                              ? "border-amber-500 bg-amber-500/20 text-amber-400"
                              : "border-red-500 bg-red-500/20 text-red-400"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      {level === "Conservative" && (
                        <Shield className="w-3 h-3 inline mr-1" />
                      )}
                      {level === "Balanced" && (
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                      )}
                      {level === "Aggressive" && (
                        <Zap className="w-3 h-3 inline mr-1" />
                      )}
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bin Configuration */}
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
                  Bin Count: {binCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={binCount}
                  onChange={(e) => setBinCount(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-400"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-600 uppercase mt-1">
                  <span>5 (TIGHT)</span>
                  <span>50 (WIDE)</span>
                </div>
              </div>

              {/* Range Width */}
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
                  Range Width: ±{rangeWidth / 2}%
                </label>
                <input
                  type="range"
                  min="4"
                  max="100"
                  step="2"
                  value={rangeWidth}
                  onChange={(e) => setRangeWidth(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-400"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-600 uppercase mt-1">
                  <span>±2% (TIGHT)</span>
                  <span>±50% (WIDE)</span>
                </div>
              </div>

              {/* Distribution Type */}
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
                  Distribution Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["uniform", "concentrated", "weighted"] as const).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDistribution(type)}
                        className={`h-10 border-2 font-mono text-xs uppercase tracking-wider transition-all ${
                          distribution === type
                            ? "border-cyan-500 bg-cyan-500/20 text-cyan-400"
                            : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
                        }`}
                      >
                        {type}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Features (Coming Soon) */}
          <div className="border-2 border-green-500/30 bg-zinc-950">
            <div className="border-b-2 border-green-500/30 bg-gradient-to-r from-green-950/50 to-transparent p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-green-400 font-mono text-sm uppercase tracking-wider">
                  {"/// ADVANCED FEATURES"}
                </h2>
                <span className="px-2 py-1 border-2 border-green-500 bg-green-500/10 text-green-400 font-mono text-[9px] uppercase tracking-wider animate-pulse">
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Auto Rebalance */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center group-hover:border-green-500/50">
                    <Activity className="w-4 h-4 text-zinc-500 group-hover:text-green-400" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-white uppercase tracking-wider">
                      Auto Rebalance
                    </div>
                    <div className="font-mono text-[9px] text-zinc-500 uppercase">
                      Automatic position adjustment
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={autoRebalance}
                    onChange={(e) => setAutoRebalance(e.target.checked)}
                    className="sr-only peer"
                    disabled
                  />
                  <div className="w-11 h-6 bg-zinc-800 border-2 border-zinc-700 peer-checked:bg-green-500/20 peer-checked:border-green-500 transition-all">
                    <div
                      className={`w-4 h-4 bg-zinc-600 peer-checked:bg-green-400 transition-all ${autoRebalance ? "ml-5" : "ml-0.5"} mt-0.5`}
                    />
                  </div>
                </div>
              </label>

              {/* Stop Loss */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center group-hover:border-red-500/50">
                    <AlertTriangle className="w-4 h-4 text-zinc-500 group-hover:text-red-400" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-white uppercase tracking-wider">
                      Stop Loss
                    </div>
                    <div className="font-mono text-[9px] text-zinc-500 uppercase">
                      Auto-exit on loss threshold
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={stopLoss}
                    onChange={(e) => setStopLoss(e.target.checked)}
                    className="sr-only peer"
                    disabled
                  />
                  <div className="w-11 h-6 bg-zinc-800 border-2 border-zinc-700 peer-checked:bg-red-500/20 peer-checked:border-red-500 transition-all">
                    <div
                      className={`w-4 h-4 bg-zinc-600 peer-checked:bg-red-400 transition-all ${stopLoss ? "ml-5" : "ml-0.5"} mt-0.5`}
                    />
                  </div>
                </div>
              </label>

              {/* Take Profit */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center group-hover:border-green-500/50">
                    <Target className="w-4 h-4 text-zinc-500 group-hover:text-green-400" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-white uppercase tracking-wider">
                      Take Profit
                    </div>
                    <div className="font-mono text-[9px] text-zinc-500 uppercase">
                      Auto-exit on profit target
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.checked)}
                    className="sr-only peer"
                    disabled
                  />
                  <div className="w-11 h-6 bg-zinc-800 border-2 border-zinc-700 peer-checked:bg-green-500/20 peer-checked:border-green-500 transition-all">
                    <div
                      className={`w-4 h-4 bg-zinc-600 peer-checked:bg-green-400 transition-all ${takeProfit ? "ml-5" : "ml-0.5"} mt-0.5`}
                    />
                  </div>
                </div>
              </label>

              {/* DCA */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center group-hover:border-cyan-500/50">
                    <DollarSign className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-white uppercase tracking-wider">
                      Dollar-Cost Averaging
                    </div>
                    <div className="font-mono text-[9px] text-zinc-500 uppercase">
                      Scheduled liquidity additions
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={dca}
                    onChange={(e) => setDca(e.target.checked)}
                    className="sr-only peer"
                    disabled
                  />
                  <div className="w-11 h-6 bg-zinc-800 border-2 border-zinc-700 peer-checked:bg-cyan-500/20 peer-checked:border-cyan-500 transition-all">
                    <div
                      className={`w-4 h-4 bg-zinc-600 peer-checked:bg-cyan-400 transition-all ${dca ? "ml-5" : "ml-0.5"} mt-0.5`}
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Preview & Publish */}
        <div className="space-y-4">
          {/* Strategy Preview */}
          <div className="border-2 border-cyan-500/30 bg-zinc-950">
            <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
              <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                {"/// STRATEGY PREVIEW"}
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Template Card Preview */}
              <div className="border-2 border-zinc-800 bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-mono text-lg font-bold text-white uppercase tracking-wider">
                      {strategyName || "Untitled Strategy"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 border-2 font-mono uppercase tracking-wider ${
                          riskLevel === "Conservative"
                            ? "border-green-500 text-green-400 bg-green-500/10"
                            : riskLevel === "Balanced"
                              ? "border-amber-500 text-amber-400 bg-amber-500/10"
                              : "border-red-500 text-red-400 bg-red-500/10"
                        }`}
                      >
                        {riskLevel}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center">
                    <User className="w-5 h-5 text-zinc-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950 border-2 border-zinc-800 p-2">
                    <div className="text-[9px] text-cyan-400 font-mono uppercase mb-1">
                      Range
                    </div>
                    <div className="font-mono text-lg font-bold text-white">
                      ±{rangeWidth / 2}%
                    </div>
                  </div>
                  <div className="bg-zinc-950 border-2 border-zinc-800 p-2">
                    <div className="text-[9px] text-cyan-400 font-mono uppercase mb-1">
                      Bins
                    </div>
                    <div className="font-mono text-lg font-bold text-white">
                      {binCount}
                    </div>
                  </div>
                  <div className="col-span-2 bg-zinc-950 border-2 border-zinc-800 p-2">
                    <div className="text-[9px] text-cyan-400 font-mono uppercase mb-1">
                      Distribution
                    </div>
                    <div className="font-mono text-sm font-bold text-white uppercase">
                      {distribution}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-[#0a0a0a] border-2 border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Est. APR
                  </span>
                  <span className="text-xs font-mono text-green-400 font-bold">
                    {riskLevel === "Conservative"
                      ? "8-12%"
                      : riskLevel === "Balanced"
                        ? "15-25%"
                        : "30-50%"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0a0a0a] border-2 border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    IL Risk
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {riskLevel === "Conservative"
                      ? "1/5"
                      : riskLevel === "Balanced"
                        ? "3/5"
                        : "4/5"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-[#0a0a0a] border-2 border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Rebalance Freq.
                  </span>
                  <span className="text-xs font-mono text-white font-bold">
                    {riskLevel === "Conservative"
                      ? "LOW"
                      : riskLevel === "Balanced"
                        ? "MEDIUM"
                        : "HIGH"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Community Publishing (Coming Soon) */}
          <div className="border-2 border-cyan-500/30 bg-zinc-950">
            <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
                  {"/// PUBLISH TO COMMUNITY"}
                </h2>
                <span className="px-2 py-1 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 font-mono text-[9px] uppercase tracking-wider animate-pulse">
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Share2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-xs text-white uppercase tracking-wider mb-1">
                    Share with Community
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Publish your strategy to the community marketplace. Earn
                    reputation when others use your template.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-xs text-white uppercase tracking-wider mb-1">
                    Keep Private
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Save to your personal library. Only you can access and
                    deploy this strategy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleCreateStrategy}
              disabled={!strategyName.trim()}
              className="w-full h-12 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-mono text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              Create Strategy
            </button>
            <button
              type="button"
              disabled
              className="w-full h-12 border-2 border-zinc-700 bg-zinc-900 text-zinc-500 font-mono text-sm font-bold uppercase tracking-wider opacity-50 cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Publish to Community (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
