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
  customTemplates: StrategyTemplate[]; // User-created templates
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
  addCustomTemplate: (template: StrategyTemplate) => void;
  deleteCustomTemplate: (templateId: string) => void;
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

// Helper to load custom templates from localStorage
const loadCustomTemplates = (): StrategyTemplate[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("snaplp-custom-templates");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save custom templates to localStorage
const saveCustomTemplates = (templates: StrategyTemplate[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("snaplp-custom-templates", JSON.stringify(templates));
  } catch (error) {
    console.error("Failed to save custom templates:", error);
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  selectedPool: null,
  selectedTemplate: null,
  pools: [],
  customTemplates: loadCustomTemplates(),
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

  addCustomTemplate: (template: StrategyTemplate) => {
    const newTemplates = [...get().customTemplates, template];
    saveCustomTemplates(newTemplates);
    set({ customTemplates: newTemplates });
  },

  deleteCustomTemplate: (templateId: string) => {
    const newTemplates = get().customTemplates.filter(
      (t) => t.id !== templateId,
    );
    saveCustomTemplates(newTemplates);
    set({ customTemplates: newTemplates });
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
