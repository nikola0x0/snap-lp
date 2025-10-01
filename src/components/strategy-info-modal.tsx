"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Zap, Info } from "lucide-react";

interface StrategyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StrategyInfoModal({ isOpen, onClose }: StrategyInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Info className="w-6 h-6" />
            How DLMM Strategy Templates Work
          </DialogTitle>
          <DialogDescription>
            Learn about the different strategy types and how they can help you
            earn fees from liquidity provision
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Conservative */}
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-green-900">
                      Conservative
                    </h3>
                    <Badge className="bg-green-700 text-white">
                      Lower Risk
                    </Badge>
                  </div>
                  <p className="text-green-800 leading-relaxed">
                    Tight price ranges (±5%) with concentrated liquidity. Lower
                    risk but steady returns from fees. Perfect for stable pairs
                    or risk-averse liquidity providers who prefer predictable
                    earnings.
                  </p>
                  <div className="mt-3 p-3 bg-white/60 rounded-lg">
                    <div className="text-sm font-medium text-green-900 mb-1">
                      Best For:
                    </div>
                    <div className="text-sm text-green-800">
                      Stablecoin pairs, low volatility assets, steady passive
                      income
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balanced */}
          <Card className="border-2 border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-yellow-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-yellow-900">
                      Balanced
                    </h3>
                    <Badge className="bg-yellow-700 text-white">
                      Medium Risk
                    </Badge>
                  </div>
                  <p className="text-yellow-800 leading-relaxed">
                    Medium price ranges (±12.5%) balancing yield potential with
                    manageable risk. Optimized for moderate volatility pairs,
                    offering a sweet spot between fee generation and capital
                    efficiency.
                  </p>
                  <div className="mt-3 p-3 bg-white/60 rounded-lg">
                    <div className="text-sm font-medium text-yellow-900 mb-1">
                      Best For:
                    </div>
                    <div className="text-sm text-yellow-800">
                      SOL pairs, established tokens, balanced risk-reward
                      profile
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aggressive */}
          <Card className="border-2 border-red-200 bg-red-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-red-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-red-900">
                      Aggressive
                    </h3>
                    <Badge className="bg-red-700 text-white">Higher Risk</Badge>
                  </div>
                  <p className="text-red-800 leading-relaxed">
                    Wide price ranges (±25%) targeting maximum yield but with
                    higher volatility risk. Designed for experienced traders who
                    understand impermanent loss and want to maximize fee
                    capture.
                  </p>
                  <div className="mt-3 p-3 bg-white/60 rounded-lg">
                    <div className="text-sm font-medium text-red-900 mb-1">
                      Best For:
                    </div>
                    <div className="text-sm text-red-800">
                      High volatility pairs, memcoins, maximum fee opportunities
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Concepts */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Key Concepts
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <strong className="text-blue-900">Price Range:</strong> The
                  window where your liquidity is active. Narrower ranges =
                  higher fees when price is in range, but more risk of going out
                  of range.
                </div>
                <div>
                  <strong className="text-blue-900">Bins:</strong> Individual
                  price points where liquidity is distributed. More bins =
                  smoother distribution across your range.
                </div>
                <div>
                  <strong className="text-blue-900">
                    Impermanent Loss (IL):
                  </strong>{" "}
                  Temporary loss compared to holding tokens. Wider ranges have
                  higher IL risk but capture more trading volume.
                </div>
                <div>
                  <strong className="text-blue-900">APR:</strong> Estimated
                  annual percentage return from trading fees. Actual returns
                  vary based on trading volume and price volatility.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
