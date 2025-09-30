"use client";

import type { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { ClientOnly } from "./client-only";

export const WalletConnection: FC = () => {
  return (
    <ClientOnly
      fallback={
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
      }
    >
      <WalletMultiButton />
    </ClientOnly>
  );
};
