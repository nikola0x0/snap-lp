"use client";

import { useState } from "react";
import { StrategyTemplate } from "@/types/strategy";
import { useAppStore } from "@/store/app-store";
// Risk level styling utilities
const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "Conservative":
      return "text-green-700";
    case "Balanced":
      return "text-yellow-700";
    case "Aggressive":
      return "text-red-700";
    default:
      return "text-gray-700";
  }
};

const getRiskLevelBgColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "Conservative":
      return "bg-green-100";
    case "Balanced":
      return "bg-yellow-100";
    case "Aggressive":
      return "bg-red-100";
    default:
      return "bg-gray-100";
  }
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StrategySimulator } from "./strategy-simulator";
import { TemplateDetailModal } from "./template-detail-modal";
import { TrendingUp, Shield, Zap, Info } from "lucide-react";

interface TemplateCardProps {
  template: StrategyTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { selectTemplate, selectedTemplate, setStep } = useAppStore();

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "Conservative":
        return <Shield className="w-4 h-4" />;
      case "Balanced":
        return <TrendingUp className="w-4 h-4" />;
      case "Aggressive":
        return <Zap className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const handleSimulate = () => {
    selectTemplate(template);
    setShowSimulator(true); // Open simulator popup
  };

  const handleDeploy = () => {
    selectTemplate(template);
    setStep("deploy"); // Navigate directly to deploy
  };

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const isSelected = selectedTemplate?.id === template.id;

  return (
    <Card
      className={`hover:shadow-md transition-all border-2 ${
        isSelected ? "border-primary bg-primary/5" : "border-transparent"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`${getRiskLevelBgColor(
                  template.riskLevel,
                )} ${getRiskLevelColor(template.riskLevel)} border-0`}
              >
                {getRiskIcon(template.riskLevel)}
                <span className="ml-1">{template.riskLevel}</span>
              </Badge>
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={`risk-${template.id}-${i}`}
                    className={`w-2 h-2 rounded-full mr-1 ${
                      i < template.riskRating ? "bg-current" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{template.description}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Est. APR</div>
            <div className="font-semibold text-green-600">
              {template.estimatedAPR}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">IL Risk</div>
            <div className="font-semibold">
              {template.impermanentLossRisk}/5
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Range</div>
            <div className="font-semibold">
              ±{template.binConfiguration.rangeWidth / 2}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Bins</div>
            <div className="font-semibold">
              {template.binConfiguration.binCount}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {isSelected ? (
            // Show actions for selected template with enhanced UX
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Selected - Choose your next action:
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSimulate}
                  variant="outline"
                  className="flex-1 h-10"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Simulate First
                </Button>
                <Button
                  onClick={handleDeploy}
                  className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Deploy Now
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                💡 Simulate to test parameters, or deploy directly to start
                earning
              </div>
            </div>
          ) : (
            // Show select button for unselected template
            <Button
              onClick={() => selectTemplate(template)}
              className="w-full h-10"
            >
              <Shield className="w-4 h-4 mr-2" />
              Select This Strategy
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleViewDetails}
            size="sm"
            className="w-full"
          >
            <Info className="w-4 h-4 mr-2" />
            View Technical Details
          </Button>
        </div>
      </CardContent>

      {/* Simulator Modal */}
      {showSimulator && (
        <StrategySimulator
          template={template}
          onClose={() => setShowSimulator(false)}
        />
      )}

      {/* Detail Modal */}
      <TemplateDetailModal
        template={template}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </Card>
  );
}
