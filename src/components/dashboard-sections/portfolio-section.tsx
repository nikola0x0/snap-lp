"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "../client-only";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export function PortfolioSection() {
  const { connected, publicKey } = useWallet();

  // Mock portfolio data - in real app, this would come from DLMM service
  const mockPositions = [
    {
      id: "1",
      strategyName: "Conservative Strategy",
      poolPair: "SOL/USDC",
      totalValue: 1250.5,
      initialDeposit: 1000,
      pnl: 250.5,
      pnlPercent: 25.05,
      apr: 12.5,
      feesEarned: 45.3,
      status: "active" as const,
      binUtilization: 85,
      riskLevel: "Conservative" as const,
    },
    {
      id: "2",
      strategyName: "Balanced Strategy",
      poolPair: "SAROS/SOL",
      totalValue: 875.25,
      initialDeposit: 800,
      pnl: 75.25,
      pnlPercent: 9.41,
      apr: 18.3,
      feesEarned: 23.15,
      status: "out-of-range" as const,
      binUtilization: 45,
      riskLevel: "Balanced" as const,
    },
  ];

  const totalValue = mockPositions.reduce(
    (sum, pos) => sum + pos.totalValue,
    0,
  );
  const totalPnL = mockPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalFeesEarned = mockPositions.reduce(
    (sum, pos) => sum + pos.feesEarned,
    0,
  );

  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            View and manage your active DLMM positions and track performance.
          </p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your wallet to view your DLMM positions and portfolio
                  performance.
                </p>
              </div>
              <ClientOnly
                fallback={
                  <div className="h-9 w-32 bg-muted animate-pulse rounded-md mx-auto" />
                }
              >
                <WalletMultiButton className="mx-auto" />
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            {publicKey?.toBase58().slice(0, 4)}...
            {publicKey?.toBase58().slice(-4)}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Value</span>
            </div>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Total P&L</span>
            </div>
            <div
              className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Fees Earned</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${totalFeesEarned.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-muted-foreground">
                Active Positions
              </span>
            </div>
            <div className="text-2xl font-bold">{mockPositions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Positions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Positions</h2>

        {mockPositions.map((position) => (
          <Card key={position.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {position.strategyName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {position.poolPair}
                    </p>
                  </div>
                  <Badge
                    variant={
                      position.status === "active" ? "default" : "destructive"
                    }
                  >
                    {position.status === "active" ? "In Range" : "Out of Range"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    ${position.totalValue.toLocaleString()}
                  </div>
                  <div
                    className={`text-sm ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {position.pnl >= 0 ? "+" : ""}
                    {position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Initial Deposit</div>
                  <div className="font-medium">${position.initialDeposit}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current APR</div>
                  <div className="font-medium text-green-600">
                    {position.apr}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Fees Earned</div>
                  <div className="font-medium">${position.feesEarned}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Bin Utilization</div>
                  <div className="font-medium">{position.binUtilization}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Risk Level</div>
                  <Badge variant="outline" className="text-xs">
                    {position.riskLevel}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Rebalance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Close Position
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
