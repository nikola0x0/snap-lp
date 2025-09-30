"use client";

import { useState } from "react";
import { WalletConnection } from "./wallet-connection";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Menu, ArrowUpDown } from "lucide-react";
import { SwapSectionSimple } from "./dashboard-sections/swap-section-simple";
import { Card } from "./ui/card";
import { X } from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            {onMobileMenuToggle && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={onMobileMenuToggle}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            <div>
              <h1 className="text-xl font-bold">SnapLP</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                DLMM Strategy Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="hidden md:flex items-center rounded-sm gap-2 px-3 h-12 bg-green-500/10 border-green-500/30 text-green-700"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Devnet
            </Badge>
            <Button
              variant="outline"
              onClick={() => setSwapModalOpen(true)}
              className="gap-2 h-12 rounded-sm"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">Swap</span>
            </Button>
            <WalletConnection />
          </div>
        </div>
      </header>

      {/* Swap Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSwapModalOpen(false)}
            aria-label="Close swap modal"
          />
          <Card className="relative w-full max-w-2xl max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold">Swap Tokens</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSwapModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-8">
              <SwapSectionSimple />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
