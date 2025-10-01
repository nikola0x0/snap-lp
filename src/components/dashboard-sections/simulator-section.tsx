"use client";

import { useState } from "react";
import { StrategySimulator } from "../strategy-simulator";
import { useAppStore } from "@/store/app-store";
import { Play, ArrowLeft, Target, TrendingUp } from "lucide-react";
import { TerminalHeader } from "../terminal-header";

export function SimulatorSection() {
  const [showFullSimulator, setShowFullSimulator] = useState(false);
  const { selectedPool, selectedTemplate, setStep, getTokenPairSymbol } =
    useAppStore();

  // Redirect if no pool or template is selected
  if (!selectedPool || !selectedTemplate) {
    return (
      <div className="space-y-4">
        <TerminalHeader
          title="/// STRATEGY SIMULATION"
          subtitle="Interactive position testing and metrics preview"
        />

        <div className="border-2 border-amber-500/30 bg-zinc-950">
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 border-2 border-amber-500 bg-amber-500/10 mx-auto flex items-center justify-center">
              <Target className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-amber-400 mb-2">
                Simulator Offline
              </h2>
              <p className="text-sm font-mono text-zinc-400 uppercase tracking-wider">
                {!selectedPool
                  ? "[ ! ] No pool selected"
                  : "[ ! ] No strategy template selected"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(!selectedPool ? "pools" : "templates")}
              className="h-10 px-6 border-2 border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-mono text-xs uppercase tracking-wider inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {!selectedPool ? "Select Pool" : "Select Template"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleStartSimulation = () => {
    setShowFullSimulator(true);
  };

  const handleDeploy = () => {
    setStep("deploy");
  };

  return (
    <div className="space-y-4">
      <TerminalHeader
        title="/// STRATEGY SIMULATION"
        subtitle="Test position performance across price scenarios"
      />

      {/* Selection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-cyan-500/30 bg-zinc-950">
          <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent px-4 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
              Active Pool
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-cyan-500 bg-cyan-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="font-mono text-lg font-bold text-white uppercase tracking-wider">
                {getTokenPairSymbol()}
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-green-500/30 bg-zinc-950">
          <div className="border-b-2 border-green-500/30 bg-gradient-to-r from-green-950/50 to-transparent px-4 py-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-green-400">
              Active Strategy
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-green-500 bg-green-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-white uppercase tracking-wider">
                  {selectedTemplate.name}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  {selectedTemplate.riskLevel} Risk
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="border-2 border-cyan-500/30 bg-zinc-950">
        <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
              {"/// STRATEGY OVERVIEW"}
            </h2>
            <button
              type="button"
              onClick={() => setStep("templates")}
              className="h-8 px-3 border-2 border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 font-mono text-[10px] uppercase tracking-wider inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Change
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="font-mono text-xl font-bold text-white uppercase tracking-wider">
              {selectedTemplate.name}
            </div>
            <div className="px-3 py-1 border-2 border-amber-500 bg-amber-500/10 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
              {selectedTemplate.riskLevel}
            </div>
            <div className="px-3 py-1 border-2 border-zinc-700 bg-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
              by {selectedTemplate.creator}
            </div>
          </div>

          <p className="text-sm font-mono text-zinc-400 uppercase tracking-wider">
            {selectedTemplate.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                Est. APR
              </div>
              <div className="font-mono text-xl font-bold text-green-400">
                {selectedTemplate.estimatedAPR}%
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                IL Risk
              </div>
              <div className="font-mono text-xl font-bold text-white">
                {selectedTemplate.impermanentLossRisk}/5
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                Range
              </div>
              <div className="font-mono text-xl font-bold text-white">
                ±{selectedTemplate.binConfiguration.rangeWidth / 2}%
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                Bins
              </div>
              <div className="font-mono text-xl font-bold text-white">
                {selectedTemplate.binConfiguration.binCount}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleStartSimulation}
              className="flex-1 h-14 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-mono text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Simulation
            </button>
            <button
              type="button"
              onClick={handleDeploy}
              className="flex-1 h-14 border-2 border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20 font-mono text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              Skip - Deploy Now
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Guide */}
      <div className="border-2 border-cyan-500/30 bg-zinc-950">
        <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
          <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
            {"/// SIMULATION CAPABILITIES"}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-4">
              <div className="font-mono text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                [1] Price Movements
              </div>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Test strategy across {getTokenPairSymbol()} price scenarios
              </p>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-4">
              <div className="font-mono text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                [2] Investment Size
              </div>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Estimate returns with different liquidity amounts
              </p>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-4">
              <div className="font-mono text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                [3] Live Metrics
              </div>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Real-time APR, IL, and fee calculations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Simulator Modal */}
      {showFullSimulator && (
        <StrategySimulator
          template={selectedTemplate}
          onClose={() => setShowFullSimulator(false)}
        />
      )}
    </div>
  );
}
