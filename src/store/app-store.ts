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
    if (!pool) return "Unknown/Unknown";

    // Use tokenX and tokenY directly as they already contain the symbols
    return `${pool.tokenX}/${pool.tokenY}`;
  },

  isPoolSelected: () => get().selectedPool !== null,
  isTemplateSelected: () => get().selectedTemplate !== null,
}));
