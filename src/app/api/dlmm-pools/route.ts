import { NextRequest, NextResponse } from "next/server";
import { realDlmmService } from "@/services/dlmm-real";

export async function GET(request: NextRequest) {
  console.log("🔍 DLMM Pools API called");

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const size = parseInt(searchParams.get("size") || "20");

    console.log(`📡 Fetching DLMM pools directly from SDK (page ${page}, size ${size})`);

    // Use DLMM service directly instead of failing GraphQL API
    const poolsResult = await realDlmmService.getPools();
    
    if (!poolsResult || !poolsResult.pools) {
      console.error("❌ No pools returned from DLMM service");
      return NextResponse.json(
        {
          success: false,
          error: "No DLMM pools found",
          pools: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalPools: 0,
            poolsPerPage: size,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
        { status: 200 }
      );
    }

    // Apply pagination to the results
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedPools = poolsResult.pools.slice(startIndex, endIndex);
    
    const totalPools = poolsResult.pools.length;
    const totalPages = Math.ceil(totalPools / size);

    // Transform the data to match expected format
    const transformedPools = paginatedPools.map(pool => ({
      address: pool.address,
      baseToken: {
        symbol: realDlmmService.getTokenSymbolFromAddress(pool.metadata.baseMint),
        mint: pool.metadata.baseMint,
        decimals: pool.metadata.extra.tokenBaseDecimal,
      },
      quoteToken: {
        symbol: realDlmmService.getTokenSymbolFromAddress(pool.metadata.quoteMint),
        mint: pool.metadata.quoteMint,
        decimals: pool.metadata.extra.tokenQuoteDecimal,
      },
      reserves: {
        base: pool.metadata.baseReserve,
        quote: pool.metadata.quoteReserve,
      },
      feeRate: pool.metadata.tradeFee,
      type: "DLMM",
    }));

    console.log(`✅ Successfully returned ${transformedPools.length} DLMM pools`);

    return NextResponse.json({
      success: true,
      pools: transformedPools,
      pagination: {
        currentPage: page,
        totalPages,
        totalPools,
        poolsPerPage: size,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ DLMM Pools API error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch DLMM pools",
        pools: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalPools: 0,
          poolsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      { status: 500 }
    );
  }
}