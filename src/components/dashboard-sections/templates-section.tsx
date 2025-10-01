"use client";

import { useState } from "react";
import { STRATEGY_TEMPLATES } from "@/data/strategy-templates";
import { TemplatesGallery } from "../templates-gallery";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAppStore } from "@/store/app-store";
import { StrategyInfoModal } from "../strategy-info-modal";
import { TerminalHeader } from "../terminal-header";
import {
  BarChart3,
  Filter,
  Search,
  TrendingUp,
  Trophy,
  ArrowLeft,
  Info,
} from "lucide-react";

type FilterType = "all" | "Conservative" | "Balanced" | "Aggressive";

export function TemplatesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { selectedPool, setStep, getTokenPairSymbol, customTemplates } = useAppStore();

  // Combine built-in and custom templates
  const allTemplates = [...STRATEGY_TEMPLATES, ...customTemplates];

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      activeFilter === "all" || template.riskLevel === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const getFilterStats = (filter: FilterType) => {
    if (filter === "all") return allTemplates.length;
    return allTemplates.filter((t) => t.riskLevel === filter).length;
  };

  const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
      case "Conservative":
        return <BarChart3 className="w-4 h-4" />;
      case "Balanced":
        return <TrendingUp className="w-4 h-4" />;
      case "Aggressive":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  // Redirect if no pool is selected
  if (!selectedPool) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-semibold mb-2">No Pool Selected</h2>
          <p className="max-w-md">
            Please select a pool first to see strategies optimized for that
            specific pool.
          </p>
        </div>
        <Button onClick={() => setStep("pools")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back to Pool Selection
        </Button>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <TerminalHeader
        title="STRATEGY TEMPLATES"
        subtitle={`SELECT TEMPLATE FOR ${getTokenPairSymbol()} • ${
          filteredTemplates.length
        } AVAILABLE`}
      />

      <div className="bg-zinc-950 border-2 border-zinc-800 p-4">
        <StrategyInfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
        />

        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10 bg-[#0a0a0a] border-zinc-700 text-white"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInfoModal(true)}
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Info className="w-4 h-4 mr-2" />
              INFO
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeFilter === "all"
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                  : "border-zinc-800 bg-[#0a0a0a] text-zinc-400 hover:border-cyan-500/50"
              }`}
            >
              <span className="flex items-center">
                <Filter className="w-3 h-3 mr-1 align-middle" />
                ALL ({getFilterStats("all")})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("Conservative")}
              className={`px-3 py-1.5 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeFilter === "Conservative"
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                  : "border-zinc-800 bg-[#0a0a0a] text-zinc-400 hover:border-cyan-500/50"
              }`}
            >
              <span className="flex items-center">
                {getFilterIcon("Conservative")}
                <span className="ml-1">
                  SAFE ({getFilterStats("Conservative")})
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("Balanced")}
              className={`px-3 py-1.5 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeFilter === "Balanced"
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                  : "border-zinc-800 bg-[#0a0a0a] text-zinc-400 hover:border-cyan-500/50"
              }`}
            >
              <span className="flex items-center">
                {getFilterIcon("Balanced")}
                <span className="ml-1">
                  BALANCED ({getFilterStats("Balanced")})
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("Aggressive")}
              className={`px-3 py-1.5 border-2 text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeFilter === "Aggressive"
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                  : "border-zinc-800 bg-[#0a0a0a] text-zinc-400 hover:border-cyan-500/50"
              }`}
            >
              <span className="flex items-center">
                {getFilterIcon("Aggressive")}
                <span className="ml-1">
                  AGGRO ({getFilterStats("Aggressive")})
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            SHOWING {filteredTemplates.length} OF {allTemplates.length}{" "}
            TEMPLATES
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 uppercase"
            >
              CLEAR
            </button>
          )}
        </div>

        <TemplatesGallery templates={filteredTemplates} />
      </div>

      {/* Bottom padding for fixed bar */}
      <div className="h-40" />
    </div>
  );
}
