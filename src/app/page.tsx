"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SwapSectionSimple as SwapSection } from "@/components/dashboard-sections/swap-section-simple";
import { PoolsSection } from "@/components/dashboard-sections/pools-section";
import { TemplatesSection } from "@/components/dashboard-sections/templates-section";
import { PortfolioSection } from "@/components/dashboard-sections/portfolio-section";
import { DeploySection } from "@/components/dashboard-sections/deploy-section-simple";
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
            const canAccess = canAccessStep(item.id);

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                disabled={!canAccess}
                className={`w-full justify-start h-auto p-3 relative ${
                  isActive ? "bg-primary/10" : ""
                } ${!canAccess ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => canAccess && setStep(item.id)}
              >
                <div className="flex items-center w-full">
                  <Icon className="w-5 h-5 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
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
                    <Icon className="w-5 h-5 mr-3" />
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
      </main>

      {/* Unified Selection Bar - Fixed at bottom across all tabs */}
      <UnifiedSelectionBar />
    </div>
  );
}
