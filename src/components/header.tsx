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
      <header className="border-b-2 border-cyan-500/30 bg-zinc-950 sticky top-0 z-40 overflow-hidden">
        <div className="flex h-16 items-center justify-between px-4 relative">
          <div className="flex items-center gap-3">
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

            {/* Mascot with gradient fade */}
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 -mt-7 -mb-9 sm:-mt-13 sm:-mb-11 lg:-mt-18 lg:-mb-22 -ml-5 sm:-ml-9 lg:-ml-[3.25rem] flex-shrink-0 z-0">
              <div
                className="absolute inset-0"
                style={{
                  maskImage:
                    "radial-gradient(ellipse at center, black 60%, transparent 90%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 60%, transparent 90%)",
                }}
              >
                <img
                  src="/assets/mascot.png"
                  alt="SnapLP Mascot"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 -ml-4 relative z-10">
              <img
                src="/assets/logo.svg"
                alt="SnapLP"
                className="h-14 w-auto"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 h-10 bg-green-500/10 border-2 border-green-500/50 font-mono text-xs uppercase tracking-wider text-green-400">
              <div className="w-2 h-2 bg-green-400 animate-pulse" />
              DEVNET
            </div>
            <button
              type="button"
              onClick={() => setSwapModalOpen(true)}
              className="px-3 h-10 border-2 border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all font-mono text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">SWAP</span>
            </button>
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
