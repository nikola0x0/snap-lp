"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
import { TrendingUp, Zap, CheckCircle } from "lucide-react";
import { StrategySimulator } from "./strategy-simulator";
import { useState } from "react";

export function StickyActionBar() {
  const { selectedTemplate, setStep } = useAppStore();
  const [showSimulator, setShowSimulator] = useState(false);

  if (!selectedTemplate) return null;

  return (
    <>
      <Card className="sticky bottom-4 mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg z-10">
        <div className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Strategy Selected</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">
                    {selectedTemplate.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.riskLevel} Risk
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Est. APR: {selectedTemplate.estimatedAPR}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowSimulator(true)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Simulate Strategy
              </Button>
              <Button
                onClick={() => setStep("deploy")}
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Zap className="w-5 h-5" />
                Deploy Now
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {showSimulator && selectedTemplate && (
        <StrategySimulator
          template={selectedTemplate}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </>
  );
}