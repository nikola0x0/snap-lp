"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface SNAPScoreData {
  overall: number; // 0-100
  components: {
    marketFit: number; // 0-25
    efficiency: number; // 0-25
    safety: number; // 0-25
    adaptability: number; // 0-25
  };
  grade: "S" | "A" | "B" | "C" | "D";
  confidence: "high" | "medium" | "low";
  reasoning?: string;
}

interface SNAPScoreGaugeProps {
  score: SNAPScoreData;
  compact?: boolean;
  animated?: boolean;
}

export function SNAPScoreGauge({
  score,
  compact = false,
  animated = true,
}: SNAPScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score counting up
  useEffect(() => {
    if (!animated) {
      setDisplayScore(score.overall);
      return;
    }

    let current = 0;
    const increment = score.overall / 30; // 30 frames
    const timer = setInterval(() => {
      current += increment;
      if (current >= score.overall) {
        setDisplayScore(score.overall);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [score.overall, animated]);

  const getGradeColor = (grade: string) => {
    const colors = {
      S: "from-purple-500 via-pink-500 to-purple-600",
      A: "from-blue-500 via-cyan-500 to-blue-600",
      B: "from-green-500 via-emerald-500 to-green-600",
      C: "from-yellow-500 via-orange-500 to-yellow-600",
      D: "from-red-500 via-rose-500 to-red-600",
    };
    return colors[grade as keyof typeof colors] || colors.C;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-purple-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Retro LCD-style filled squares gauge
  const renderLCDGauge = () => {
    const totalBlocks = 50; // 50 blocks for 0-100 (each block = 2 points)
    const filledBlocks = Math.floor(displayScore / 2);

    return (
      <div className="flex gap-[2px] flex-wrap">
        {Array.from({ length: totalBlocks }).map((_, i) => {
          const isFilled = i < filledBlocks;
          const blockColor = (() => {
            if (i < 15) return isFilled ? "bg-red-500" : "bg-red-900/20"; // 0-30
            if (i < 30) return isFilled ? "bg-yellow-500" : "bg-yellow-900/20"; // 30-60
            if (i < 40) return isFilled ? "bg-green-500" : "bg-green-900/20"; // 60-80
            if (i < 45) return isFilled ? "bg-blue-500" : "bg-blue-900/20"; // 80-90
            return isFilled ? "bg-purple-500" : "bg-purple-900/20"; // 90-100
          })();

          return (
            <div
              key={i}
              className={`
                w-[8px] h-[14px] ${blockColor}
                transition-all duration-150
                ${isFilled ? "shadow-sm" : ""}
                rounded-[1px]
              `}
              style={{
                transitionDelay: animated ? `${i * 10}ms` : "0ms",
              }}
            />
          );
        })}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div
          className={`bg-gradient-to-r ${getGradeColor(score.grade)} text-white font-bold px-4 py-1.5 rounded-lg shadow-lg`}
        >
          {score.grade}
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium">
            SNAP Score
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(displayScore)}`}>
            {displayScore}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-xl">
      {/* Header with Grade Badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-slate-400 font-mono uppercase tracking-[0.2em] mb-1">
            SNAP SCORE
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-5xl font-bold font-mono ${getScoreColor(displayScore)} transition-colors`}
            >
              {String(displayScore).padStart(2, "0")}
            </span>
            <span className="text-lg text-slate-500 font-mono">/100</span>
          </div>
        </div>

        {/* Grade Badge - Retro Style */}
        <div className="relative">
          <div
            className={`
            bg-gradient-to-br ${getGradeColor(score.grade)}
            w-16 h-16 rounded-lg
            flex items-center justify-center
            shadow-lg
            border-2 border-white/20
          `}
          >
            <span className="text-3xl font-bold text-white drop-shadow-md">
              {score.grade}
            </span>
          </div>
          {score.grade === "S" && (
            <div className="absolute -top-1 -right-1">
              <span className="text-xl">⭐</span>
            </div>
          )}
        </div>
      </div>

      {/* LCD-Style Gauge */}
      <div className="mb-5 p-3 bg-slate-950 rounded-lg border border-slate-700">
        {renderLCDGauge()}
      </div>

      {/* Component Breakdown */}
      <div className="space-y-3 mb-4">
        {Object.entries(score.components).map(([key, value]) => {
          const percentage = (value / 25) * 100;
          const label = key.replace(/([A-Z])/g, " $1").trim();

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300 font-mono uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {value}/25
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    percentage >= 92
                      ? "bg-purple-500"
                      : percentage >= 80
                        ? "bg-blue-500"
                        : percentage >= 60
                          ? "bg-green-500"
                          : percentage >= 40
                            ? "bg-yellow-500"
                            : "bg-red-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
        <Badge
          variant={score.confidence === "high" ? "default" : "secondary"}
          className="text-xs font-mono"
        >
          {score.confidence === "high" ? "🎯" : "⚠️"}{" "}
          {score.confidence.toUpperCase()} CONFIDENCE
        </Badge>
        <span className="text-xs text-slate-500 font-mono">UPDATED 2M AGO</span>
      </div>

      {/* AI Reasoning (if provided) */}
      {score.reasoning && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 font-mono mb-2">
            💡 AI INSIGHTS
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {score.reasoning}
          </p>
        </div>
      )}
    </Card>
  );
}

// Compact LCD gauge for template cards
export function SNAPScoreBadge({ score }: { score: number }) {
  const segments = 50; // 50 segments for 0-100 (each segment = 2 points)
  const filledSegments = Math.floor(score / 2);

  const getSegmentColor = (index: number) => {
    if (!isFilled(index)) return "bg-slate-800";
    if (index < 15) return "bg-red-500"; // 0-30
    if (index < 30) return "bg-yellow-500"; // 30-60
    if (index < 40) return "bg-green-500"; // 60-80
    if (index < 45) return "bg-blue-500"; // 80-90
    return "bg-purple-500"; // 90-100
  };

  const isFilled = (index: number) => index < filledSegments;

  return (
    <div className="w-full flex flex-col gap-1 px-2 py-1.5 bg-black border-2 border-slate-700 rounded">
      {/* LCD Screen Label */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-green-400 font-mono tracking-wider">
          SNAP SCORE
        </span>
        <span className="text-[9px] text-green-400 font-mono font-bold">
          {score}/100
        </span>
      </div>

      {/* LCD Segments */}
      <div className="flex gap-[1px]">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-[8px] ${getSegmentColor(i)} transition-all duration-200`}
          />
        ))}
      </div>
    </div>
  );
}
