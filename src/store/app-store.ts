import { create } from "zustand";
import type { StrategyTemplate } from "@/types/strategy";

interface PoolData {
  address: string;
  tokenX: string;
  tokenY: string;
  metadata: {
    poolAddress: string;
    baseMint: string;
    baseReserve: string;
    quoteMint: string;
    quoteReserve: string;
    tradeFee: number;
    extra: {
      tokenBaseDecimal: number;
      tokenQuoteDecimal: number;
      hook?: string;
    };
  } | null;
}

interface AppState {
  // Flow state
  selectedPool: PoolData | null;
  selectedTemplate: StrategyTemplate | null;
  pools: PoolData[]; // Available pools list
  currentStep:
    | "pools"
    | "templates"
    | "simulator"
    | "deploy"
    | "portfolio"
    | "create";

  // Actions
  selectPool: (pool: PoolData) => void;
  setPools: (pools: PoolData[]) => void;
  selectTemplate: (template: StrategyTemplate | null) => void;
  setStep: (
    step:
      | "pools"
      | "templates"
      | "simulator"
      | "deploy"
      | "portfolio"
      | "create",
  ) => void;
  clearSelection: () => void;

  // Helper getters
  getTokenPairSymbol: () => string;
  isPoolSelected: () => boolean;
  isTemplateSelected: () => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedPool: null,
  selectedTemplate: null,
  pools: [],
  currentStep: "pools",

  // Actions
  setPools: (pools: PoolData[]) => set({ pools }),
  selectPool: (pool: PoolData) => {
    set({
      selectedPool: pool,
      // Removed auto-advance to template selection
    });
  },

  selectTemplate: (template: StrategyTemplate | null) => {
    set({
      selectedTemplate: template,
      // Removed auto-advance to simulator
    });
  },

  setStep: (step) => set({ currentStep: step }),

  clearSelection: () =>
    set({
      selectedPool: null,
      selectedTemplate: null,
      currentStep: "pools",
    }),

  // Helper getters
  getTokenPairSymbol: () => {
    const pool = get().selectedPool;
    if (!pool?.metadata) return "Unknown/Unknown";

    // Complete token symbol mapping for AMM-supported tokens
    const tokenMap: { [key: string]: string } = {
      So11111111111111111111111111111111111111112: "SOL",
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
      mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z: "C98",
      mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9: "USDT", // Alternative USDT mint
    };

    const tokenX =
      tokenMap[pool.metadata.baseMint] ||
      `${pool.metadata.baseMint.slice(0, 4)}...`;
    const tokenY =
      tokenMap[pool.metadata.quoteMint] ||
      `${pool.metadata.quoteMint.slice(0, 4)}...`;

    return `${tokenX}/${tokenY}`;
  },

  isPoolSelected: () => get().selectedPool !== null,
  isTemplateSelected: () => get().selectedTemplate !== null,
}));
