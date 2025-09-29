import { NextRequest, NextResponse } from "next/server";
import { STRATEGY_TEMPLATES } from "@/constants/strategy-templates";

export async function GET(request: NextRequest) {
  console.log("📋 Strategy Templates API called");

  try {
    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get("riskLevel");
    const minLiquidity = searchParams.get("minLiquidity");
    const maxLiquidity = searchParams.get("maxLiquidity");

    let filteredTemplates = STRATEGY_TEMPLATES;

    // Apply filters
    if (riskLevel) {
      filteredTemplates = filteredTemplates.filter(
        template => template.riskLevel.toLowerCase() === riskLevel.toLowerCase()
      );
    }

    if (minLiquidity) {
      const min = parseFloat(minLiquidity);
      filteredTemplates = filteredTemplates.filter(
        template => template.minLiquidity >= min
      );
    }

    if (maxLiquidity) {
      const max = parseFloat(maxLiquidity);
      filteredTemplates = filteredTemplates.filter(
        template => template.maxLiquidity <= max
      );
    }

    console.log(`✅ Returning ${filteredTemplates.length} strategy templates`);

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      totalCount: filteredTemplates.length,
    });
  } catch (error) {
    console.error("❌ Strategy Templates API error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch strategy templates",
        templates: [],
        totalCount: 0,
      },
      { status: 500 }
    );
  }
}