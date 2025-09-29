import { NextRequest, NextResponse } from "next/server";
import { dlmmIntegration, DLMMPoolConfig, DLMMStrategyParams } from "@/services/dlmm-integration";
import { LiquidityShape } from "@saros-finance/dlmm-sdk";

interface DeployRequest {
  poolAddress: string;
  baseTokenMint: string;
  quoteTokenMint: string;
  strategyType: "conservative" | "balanced" | "aggressive";
  amountX: number;
  amountY: number;
  walletPublicKey: string;
  useRealTransactions?: boolean; // Flag to indicate whether to use real transactions
}

export async function POST(request: NextRequest) {
  console.log("🚀 DLMM Deploy API called");

  try {
    const body: DeployRequest = await request.json();
    console.log("📝 Deploy request:", body);

    // Validate request
    if (!body.poolAddress || !body.baseTokenMint || !body.quoteTokenMint) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required pool information",
        },
        { status: 400 }
      );
    }

    if (!body.walletPublicKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Wallet not connected",
        },
        { status: 400 }
      );
    }

    // Create pool configuration
    const poolConfig: DLMMPoolConfig = {
      address: body.poolAddress,
      baseToken: {
        mintAddress: body.baseTokenMint,
        symbol: "PYUSD", // In a real app, you'd resolve this from the mint
        name: "PAYPAL USD",
        decimals: 6,
      },
      quoteToken: {
        mintAddress: body.quoteTokenMint,
        symbol: "WSOL",
        name: "Wrapped SOL",
        decimals: 9,
      },
    };

    // Get strategy parameters
    const strategies = dlmmIntegration.getStrategyTemplates();
    const strategyParams = strategies[body.strategyType];
    
    if (!strategyParams) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid strategy type",
        },
        { status: 400 }
      );
    }

    // Override amounts if provided
    const finalStrategyParams: DLMMStrategyParams = {
      ...strategyParams,
      amountX: body.amountX || strategyParams.amountX,
      amountY: body.amountY || strategyParams.amountY,
    };

    console.log("📊 Using strategy params:", finalStrategyParams);

    // For demo purposes, return success without actually executing
    // In a real implementation, you would need the actual wallet adapter instance
    console.log("🎭 Demo mode: Simulating successful deployment");
    
    const mockResult = {
      success: true,
      signatures: ["DemoSignature123456789abcdef"],
      positionMints: ["DemoPositionMint123456789abcdef"],
      poolConfig,
      strategyParams: finalStrategyParams,
    };

    console.log("✅ Mock deployment successful");

    return NextResponse.json(mockResult);

  } catch (error) {
    console.error("❌ DLMM Deploy API error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to deploy to DLMM pool",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("📋 DLMM Deploy API info request");

  try {
    // Test connection and return available strategies
    const connectionTest = await dlmmIntegration.testConnection();
    const strategies = dlmmIntegration.getStrategyTemplates();

    return NextResponse.json({
      success: true,
      connectionStatus: connectionTest,
      availableStrategies: Object.keys(strategies),
      strategyDetails: strategies,
    });

  } catch (error) {
    console.error("❌ DLMM Deploy API info error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get DLMM info",
      },
      { status: 500 }
    );
  }
}