"use client";

import { useState } from "react";
import { WalletConnection } from "./wallet-connection";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
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

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Devnet
          </div>
          <WalletConnection />
        </div>
      </div>
    </header>
  );
}
