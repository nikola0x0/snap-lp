"use client";

import { useState } from "react";
import { SwapSectionSimple as SwapSection } from "@/components/dashboard-sections/swap-section-simple";
import { PoolsSection } from "@/components/dashboard-sections/pools-section";
import { TemplatesSection } from "@/components/dashboard-sections/templates-section";
import { PortfolioSection } from "@/components/dashboard-sections/portfolio-section";
import { DeploySection } from "@/components/dashboard-sections/deploy-section-simple";
import { CreateSection } from "@/components/dashboard-sections/create-section";
import { useAppStore } from "@/store/app-store";
import { UnifiedSelectionBar } from "@/components/unified-selection-bar";
import {
  LayoutDashboard,
  Search,
  Wallet,
  Plus,
  X,
  ArrowRight,
  CheckCircle,
  ArrowUpDown,
} from "lucide-react";

export type DashboardSection =
  | "pools"
  | "templates"
  | "deploy"
  | "portfolio"
  | "create";

const navigationItems = [
  {
    id: "pools" as DashboardSection,
    label: "Pools",
    icon: Search,
    description: "DLMM pools",
  },
  {
    id: "templates" as DashboardSection,
    label: "Strategy Library",
    icon: LayoutDashboard,
    description: "Browse strategies",
  },
  {
    id: "deploy" as DashboardSection,
    label: "Deploy",
    icon: Plus,
    description: "Create position",
  },
  {
    id: "portfolio" as DashboardSection,
    label: "Portfolio",
    icon: Wallet,
    description: "Your positions",
  },
  {
    id: "create" as DashboardSection,
    label: "Create Strategy",
    icon: Plus,
    description: "Build & share",
  },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    currentStep,
    setStep,
    selectedTemplate,
    getTokenPairSymbol,
    isPoolSelected,
    isTemplateSelected,
  } = useAppStore();

  const renderSection = () => {
    switch (currentStep) {
      case "pools":
        return <PoolsSection />;
      case "templates":
        return <TemplatesSection />;
      case "deploy":
        return <DeploySection />;
      case "portfolio":
        return <PortfolioSection />;
      case "create":
        return <CreateSection />;
      default:
        return <PoolsSection />;
    }
  };

  const canAccessStep = (stepId: DashboardSection) => {
    if (stepId === "pools") return true;
    if (stepId === "templates") return true;
    if (stepId === "deploy") return isPoolSelected() && isTemplateSelected();
    if (stepId === "portfolio") return true;
    if (stepId === "create") return true;
    return false;
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r-2 border-cyan-500/30 bg-zinc-950">
        {/* Console Header */}
        <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent">
          <div className="p-4">
            <div className="text-cyan-400 font-mono text-xs tracking-[0.3em] uppercase">
              /// THE CONSOLE
            </div>
            <div className="flex gap-1 mt-2">
              <div className="w-2 h-2 bg-cyan-400" />
              <div className="w-2 h-2 bg-cyan-400 opacity-80" />
              <div className="w-2 h-2 bg-cyan-400 opacity-60" />
              <div className="w-2 h-2 bg-cyan-400 opacity-40" />
              <div className="w-2 h-2 bg-cyan-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Progress Header */}
        {(isPoolSelected() || isTemplateSelected()) && (
          <div className="p-4 border-b-2 border-cyan-500/20 bg-[#0a0a0a]">
            <div className="space-y-2">
              <div className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase">
                SYSTEM STATUS
              </div>
              {isPoolSelected() && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-mono text-white">
                    {getTokenPairSymbol()}
                  </span>
                </div>
              )}
              {isTemplateSelected() && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-mono text-white">
                    {selectedTemplate?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.id;
            const canAccess = canAccessStep(item.id);

            return (
              <button
                type="button"
                key={item.id}
                disabled={!canAccess}
                className={`w-full p-3 border-2 transition-all duration-200 ${
                  isActive
                    ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                    : canAccess
                    ? "border-zinc-800 hover:border-cyan-500/50 bg-[#0a0a0a] hover:bg-cyan-500/5"
                    : "border-zinc-800 bg-zinc-900/50 opacity-40 cursor-not-allowed"
                }`}
                onClick={() => canAccess && setStep(item.id)}
              >
                <div className="flex items-center w-full gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-cyan-400" : "text-zinc-500"
                    }`}
                  />
                  <div className="text-left flex-1">
                    <div
                      className={`font-mono text-sm font-bold ${
                        isActive ? "text-cyan-400" : "text-white"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t-2 border-cyan-500/30 bg-[#0a0a0a]">
          <div className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase text-center space-y-1">
            <div>DLMM STRATEGY PLATFORM by nikola0x0</div>
            <div>POWERED BY SAROS DLMM</div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r-2 border-cyan-500/30 z-10">
            <div className="flex items-center justify-between p-4 border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent">
              <h2 className="font-mono text-xs tracking-[0.3em] uppercase text-cyan-400">
                /// THE CONSOLE
              </h2>
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentStep === item.id;
                const canAccess = canAccessStep(item.id);

                return (
                  <button
                    type="button"
                    key={item.id}
                    disabled={!canAccess}
                    className={`w-full p-3 border-2 transition-all duration-200 ${
                      isActive
                        ? "border-cyan-500 bg-cyan-500/10"
                        : canAccess
                        ? "border-zinc-800 hover:border-cyan-500/50 bg-[#0a0a0a]"
                        : "border-zinc-800 bg-zinc-900/50 opacity-40"
                    }`}
                    onClick={() => {
                      if (canAccess) {
                        setStep(item.id);
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-cyan-400" : "text-zinc-500"
                        }`}
                      />
                      <div className="text-left">
                        <div
                          className={`font-mono text-sm font-bold ${
                            isActive ? "text-cyan-400" : "text-white"
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="p-4 lg:p-8">{renderSection()}</div>
      </main>

      {/* Unified Selection Bar - Fixed at bottom across all tabs */}
      <UnifiedSelectionBar />
    </div>
  );
}
