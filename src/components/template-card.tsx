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
import { TemplateDetailModal } from "./template-detail-modal";
import { Shield, TrendingUp, Zap, Info, User } from "lucide-react";

interface TemplateCardProps {
  template: StrategyTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { selectTemplate, selectedTemplate } = useAppStore();

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

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const isSelected = selectedTemplate?.id === template.id;

  const handleCardClick = () => {
    if (!isSelected) {
      selectTemplate(template);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-transparent hover:border-primary/30"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`${getRiskLevelBgColor(
                  template.riskLevel
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
            {/* Creator Badge */}
            <div className="flex items-center gap-1.5 mt-2">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                {template.creator}
              </span>
              {template.creator === "SnapLP" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1 bg-blue-50 text-blue-700 border-blue-200">
                  Official
                </Badge>
              )}
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
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="w-full"
          >
            <Info className="w-4 h-4 mr-2" />
            View Technical Details
          </Button>
        </div>
      </CardContent>

      {/* Detail Modal */}
      <TemplateDetailModal
        template={template}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </Card>
  );
}
