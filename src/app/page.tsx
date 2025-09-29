"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SwapSection } from "@/components/dashboard-sections/swap-section";
import { PoolsSection } from "@/components/dashboard-sections/pools-section";
import { TemplatesSection } from "@/components/dashboard-sections/templates-section";
import { SimulatorSection } from "@/components/dashboard-sections/simulator-section";
import { PortfolioSection } from "@/components/dashboard-sections/portfolio-section";
import { DeploySection } from "@/components/dashboard-sections/deploy-section";
import { useAppStore } from "@/store/app-store";
import {
  LayoutDashboard,
  Search,
  TrendingUp,
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
  | "simulator"
  | "deploy"
  | "portfolio"
  | "create";

const navigationItems = [
  {
    id: "pools" as DashboardSection,
    label: "Select Pool",
    icon: Search,
    description: "Choose DLMM pool",
    step: 1,
  },
  {
    id: "templates" as DashboardSection,
    label: "Choose Strategy",
    icon: LayoutDashboard,
    description: "Browse strategies",
    step: 2,
  },
  {
    id: "simulator" as DashboardSection,
    label: "Simulate",
    icon: TrendingUp,
    description: "Test before deploy",
    step: 3,
  },
  {
    id: "deploy" as DashboardSection,
    label: "Deploy",
    icon: Plus,
    description: "Create position",
    step: 4,
  },
  {
    id: "portfolio" as DashboardSection,
    label: "Portfolio",
    icon: Wallet,
    description: "Your positions",
    step: 5,
  },
  {
    id: "create" as DashboardSection,
    label: "Create Strategy",
    icon: Plus,
    description: "Build & share",
    step: 6,
  },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const {
    currentStep,
    setStep,
    selectedPool,
    selectedTemplate,
    getTokenPairSymbol,
    isPoolSelected,
    isTemplateSelected,
  } = useAppStore();

  // Sync with app store
  useEffect(() => {
    // Auto-navigate based on app state
  }, [currentStep]);

  const renderSection = () => {
    switch (currentStep) {
      case "pools":
        return <PoolsSection />;
      case "templates":
        return <TemplatesSection />;
      case "simulator":
        return <SimulatorSection />;
      case "deploy":
        return <DeploySection />;
      case "portfolio":
        return <PortfolioSection />;
      case "create":
        return (
          <div className="p-8 text-center text-muted-foreground">
            <strong>Strategy Builder</strong> - Create and monetize your own
            strategies (Coming Soon)
          </div>
        );
      default:
        return <PoolsSection />;
    }
  };

  const getStepStatus = (step: number) => {
    if (step === 1 && isPoolSelected()) return "completed";
    if (step === 2 && isTemplateSelected()) return "completed";
    if (step <= getCurrentStepNumber()) return "current";
    return "upcoming";
  };

  const getCurrentStepNumber = () => {
    const stepMap = {
      pools: 1,
      templates: 2,
      simulator: 3,
      deploy: 4,
      portfolio: 5,
      create: 6,
    };
    return stepMap[currentStep] || 1;
  };

  const canAccessStep = (stepId: DashboardSection) => {
    if (stepId === "pools") return true;
    if (stepId === "templates") return isPoolSelected();
    if (stepId === "simulator") return isPoolSelected() && isTemplateSelected();
    if (stepId === "deploy") return isPoolSelected() && isTemplateSelected();
    if (stepId === "portfolio") return true; // Always accessible
    if (stepId === "create") return true; // Always accessible
    return false;
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-background">
        {/* Progress Header */}
        {(isPoolSelected() || isTemplateSelected()) && (
          <div className="p-4 border-b bg-muted/30">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Current Selection
              </div>
              {isPoolSelected() && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium">
                    {getTokenPairSymbol()}
                  </span>
                </div>
              )}
              {isTemplateSelected() && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium">
                    {selectedTemplate?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.id;
            const stepStatus = getStepStatus(item.step);
            const canAccess = canAccessStep(item.id);

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                disabled={!canAccess}
                className={`w-full justify-start h-auto p-3 relative ${
                  isActive ? "bg-primary/10 border-primary/20" : ""
                } ${!canAccess ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => canAccess && setStep(item.id)}
              >
                <div className="flex items-center w-full">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center justify-center w-6 h-6 mr-3">
                      {stepStatus === "completed" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : stepStatus === "current" ? (
                        <Icon className="w-4 h-4 text-primary" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {item.label}
                        <span className="text-xs text-muted-foreground">
                          ({item.step})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {stepStatus === "current" && canAccess && (
                    <ArrowRight className="w-3 h-3 text-primary/70" />
                  )}
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            Built with Saros DLMM SDK
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <Card className="fixed left-0 top-0 h-full w-64 bg-background z-10">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentStep === item.id;
                const stepStatus = getStepStatus(item.step);
                const canAccess = canAccessStep(item.id);

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    disabled={!canAccess}
                    className={`w-full justify-start h-auto p-3 ${
                      !canAccess ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => {
                      if (canAccess) {
                        setStep(item.id);
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 mr-3">
                      {stepStatus === "completed" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : stepStatus === "current" ? (
                        <Icon className="w-4 h-4 text-primary" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </nav>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="p-4 lg:p-8">{renderSection()}</div>

        {/* Floating Swap Button */}
        <Button
          onClick={() => setSwapModalOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
          size="icon"
        >
          <ArrowUpDown className="w-6 h-6" />
        </Button>
      </main>

      {/* Swap Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSwapModalOpen(false)}
          />
          <Card className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Swap Tokens</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSwapModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <SwapSection />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
