"use client";

import { useEffect, useState } from "react";
import { Info, Shield, TrendingUp, User, Zap } from "lucide-react";
import type { StrategyTemplate } from "@/types/strategy";
import { SNAPScoreBadge } from "@/components/snap-score-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { TemplateDetailModal } from "./template-detail-modal";
import { ConsoleLoading } from "./console-loading";

// Risk level styling utilities for console aesthetic
const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "Conservative":
      return "text-green-400";
    case "Balanced":
      return "text-amber-400";
    case "Aggressive":
      return "text-red-400";
    default:
      return "text-zinc-400";
  }
};

const getRiskLevelBorder = (riskLevel: string) => {
  switch (riskLevel) {
    case "Conservative":
      return "border-green-500";
    case "Balanced":
      return "border-amber-500";
    case "Aggressive":
      return "border-red-500";
    default:
      return "border-zinc-700";
  }
};

interface TemplateCardProps {
  template: StrategyTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { selectTemplate, selectedTemplate, selectedPool } = useAppStore();
  const [snapScore, setSnapScore] = useState<number | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  // Fetch SNAP Score when pool is selected
  useEffect(() => {
    const fetchScore = async () => {
      if (!selectedPool?.address) return;

      setLoadingScore(true);
      try {
        const response = await fetch("/api/snap-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: template.id,
            poolAddress: selectedPool.address,
            templateConfig: {
              name: template.name,
              binRange: {
                min: -Math.floor(template.binConfiguration.rangeWidth / 2),
                max: Math.floor(template.binConfiguration.rangeWidth / 2),
              },
              riskLevel: template.riskLevel,
            },
          }),
        });

        const data = await response.json();
        if (data.success && data.score) {
          setSnapScore(data.score.overall);
        }
      } catch (error) {
        console.error("Failed to fetch SNAP Score:", error);
      } finally {
        setLoadingScore(false);
      }
    };

    fetchScore();
  }, [
    selectedPool?.address,
    template.id,
    template.name,
    template.binConfiguration.rangeWidth,
    template.riskLevel,
  ]);

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
    if (isSelected) {
      selectTemplate(null); // Unselect if already selected
    } else {
      selectTemplate(template);
    }
  };

  // Rotation angle for front and back
  const frontRotation = isSelected ? 180 : 0;
  const backRotation = isSelected ? 360 : 180;

  return (
    <div
      className="cursor-pointer relative min-h-[420px]"
      style={{ perspective: "1000px" }}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Select ${template.name} template`}
    >
      {/* FRONT CARD */}
      <Card
        className={`absolute top-0 left-0 right-0 min-h-[420px] border-2 transition-all duration-500 gap-3 bg-zinc-950 ${
          isSelected
            ? `border-cyan-500 shadow-[0_0_40px_rgba(34,211,238,0.4)]`
            : "border-zinc-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
        }`}
        style={{
          backfaceVisibility: "hidden",
          transform: `rotateY(${frontRotation}deg)`,
          zIndex: isSelected ? 1 : 2,
        }}
      >
        <CardHeader className="pb-2 border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-bold font-mono text-cyan-400 uppercase tracking-wider">
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 border-2 font-mono uppercase tracking-wider ${getRiskLevelBorder(template.riskLevel)} ${getRiskLevelColor(template.riskLevel)} bg-[#0a0a0a] flex items-center gap-1`}>
                  {getRiskIcon(template.riskLevel)}
                  {template.riskLevel}
                </span>
              </div>
              {/* Creator Badge */}
              <div className="flex items-center gap-1.5 mt-2">
                <User className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                  {template.creator}
                </span>
                {template.creator === "SnapLP" && (
                  <span className="text-[9px] px-1.5 py-0.5 border border-cyan-600 bg-cyan-600/20 text-cyan-400 font-mono uppercase">
                    OFFICIAL
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          <p className="text-xs text-zinc-400 font-mono line-clamp-2">
            {template.description}
          </p>

          {/* Highlight Metrics on Front - LCD style */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
              <div className="text-[9px] text-green-400 font-mono tracking-wider uppercase mb-1">
                EST. APR
              </div>
              <div className="text-2xl font-bold font-mono text-green-400">
                {template.estimatedAPR}%
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
              <div className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase mb-1">
                RANGE
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                ±{template.binConfiguration.rangeWidth / 2}%
              </div>
            </div>
          </div>

          {/* SNAP Score on Front */}
          {selectedPool && (
            <div>
              {snapScore !== null && !loadingScore ? (
                <div className="w-full">
                  <SNAPScoreBadge score={snapScore} />
                </div>
              ) : loadingScore ? (
                <ConsoleLoading
                  message="LOADING SNAP SCORE..."
                  bars={20}
                  inline
                  barColor="bg-green-400/50"
                />
              ) : null}
            </div>
          )}

          <div className="text-center text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
            {isSelected ? "← CLICK TO DESELECT" : "CLICK FOR DETAILS →"}
          </div>
        </CardContent>
      </Card>

      {/* BACK CARD */}
      <Card
        className="absolute top-0 left-0 right-0 min-h-[420px] border-2 border-cyan-500 bg-zinc-950 shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all duration-500 gap-3"
        style={{
          backfaceVisibility: "hidden",
          transform: `rotateY(${backRotation}deg)`,
          zIndex: isSelected ? 2 : 1,
        }}
      >
        <CardHeader className="pb-2 border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-bold font-mono text-cyan-400 uppercase tracking-wider">
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 border-2 font-mono uppercase tracking-wider ${getRiskLevelBorder(template.riskLevel)} ${getRiskLevelColor(template.riskLevel)} bg-[#0a0a0a] flex items-center gap-1`}>
                  {getRiskIcon(template.riskLevel)}
                  {template.riskLevel}
                </span>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={`risk-back-${template.id}-${i}`}
                      className={`w-2 h-2 mr-1 ${
                        i < template.riskRating ? getRiskLevelColor(template.riskLevel).replace('text-', 'bg-') : "bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-sm pt-4">
          <p className="text-xs text-zinc-400 font-mono line-clamp-2">
            {template.description}
          </p>

          {/* Key Metrics - LCD style */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-2">
              <div className="text-[9px] text-green-400 font-mono tracking-wider uppercase">EST. APR</div>
              <div className="font-bold font-mono text-green-400">
                {template.estimatedAPR}%
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-2">
              <div className="text-[9px] text-amber-400 font-mono tracking-wider uppercase">IL RISK</div>
              <div className="font-bold font-mono text-amber-400">
                {template.impermanentLossRisk}/5
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-2">
              <div className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase">RANGE</div>
              <div className="font-bold font-mono text-white">
                ±{template.binConfiguration.rangeWidth / 2}%
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-2 border-zinc-800 p-2">
              <div className="text-[9px] text-cyan-400 font-mono tracking-wider uppercase">BINS</div>
              <div className="font-bold font-mono text-white">
                {template.binConfiguration.binCount}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <span key={tag} className="text-[9px] px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-400 font-mono uppercase">
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="w-full px-3 py-2 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Info className="w-3 h-3" />
              VIEW TECHNICAL DETAILS
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <TemplateDetailModal
        template={template}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}
