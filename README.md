# SnapLP - DLMM Strategy Templates Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://solana.com/)

> **Submission for:** [Saros DLMM Demo Challenge](https://earn.superteam.fun/listings/bounties/saros-dlmm-demo-challenge/)
> **Author:** [nikola0x0](https://github.com/nikola0x0)
> **Live Demo:** [https://snap-lp.vercel.app](https://snap-lp.vercel.app)

Transform complex DLMM liquidity provision into one-click deployments with pre-configured strategy templates, AI-powered scoring, and interactive simulation.

![SnapLP Banner](./public/og-image.png)

---

## 🎯 Overview

SnapLP revolutionizes DLMM (Dynamic Liquidity Market Making) by making it accessible to everyone—from DeFi newcomers to advanced liquidity providers. Instead of manually configuring bins, ranges, and distributions, users select pre-built strategy templates optimized for different risk profiles and market conditions.

### The Problem

Traditional DLMM interfaces overwhelm users with:
- Complex bin configuration decisions
- Manual price range calculations
- Distribution strategy choices
- Risk management parameters

Most users abandon the process or make suboptimal choices that lead to poor returns.

### The Solution

SnapLP provides:
- **Pre-configured Templates:** Conservative, Balanced, and Aggressive strategies ready to deploy
- **AI-Powered Scoring:** SNAP Score evaluates strategy-pool fit across 4 dimensions (Market Fit, Efficiency, Safety, Adaptability)
- **Interactive Simulation:** Test strategies across price scenarios before committing capital
- **One-Click Deployment:** Go from template selection to active position in seconds
- **Portfolio Management:** Track positions, claim fees, and manage liquidity

---

## ✨ Key Features

### 1. Strategy Template Library
Pre-built DLMM strategies with optimized parameters:
- **Conservative:** Tight ranges (±5%), minimal IL, steady fees
- **Balanced:** Medium ranges (±12.5%), balanced risk/reward
- **Aggressive:** Wide ranges (±25%), maximum fee capture

Each template includes:
- Bin configuration (count, distribution, concentration)
- Risk management parameters
- Expected APR and IL estimates
- Recommended use cases

### 2. AI-Powered SNAP Score
Real-time strategy evaluation using Google Gemini AI:
- **Market Fit (0-25):** Analyzes pool volatility and volume patterns
- **Efficiency (0-25):** Evaluates capital utilization and fee capture potential
- **Safety (0-25):** Assesses IL risk and range sustainability
- **Adaptability (0-25):** Measures strategy resilience to market changes

Grade scale: S (90+) • A (80+) • B (70+) • C (60+) • D (<60)

### 3. Interactive Strategy Simulator
Test positions before deployment:
- Price range sliders with real-time bin visualization
- Live IL, ROI, and fee estimates
- Investment amount scenarios
- Historical performance simulation
- Current pool price indicators

### 4. One-Click Deployment
Simplified deployment flow:
1. Select pool from curated list
2. Choose strategy template
3. Review SNAP Score and parameters
4. Simulate (optional)
5. Deploy with wallet confirmation

### 5. Portfolio Dashboard
Comprehensive position management:
- Real-time position tracking
- In-range/out-of-range status
- Accumulated fees display
- Token balance breakdown
- One-click fee claiming
- Liquidity removal

---

## 🛠️ Technology Stack

### Core Technologies
- **Framework:** Next.js 15.5.4 (App Router, React 19, TypeScript)
- **Blockchain:** Solana Devnet
- **DLMM SDK:** `@saros-finance/dlmm-sdk` v0.0.19
- **Wallet Integration:** `@solana/wallet-adapter-react` (Phantom, Solflare, Backpack)
- **AI Engine:** Google Gemini 1.5 Flash (SNAP Score analysis)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **UI Components:** Radix UI, Recharts

### Key Dependencies
```json
{
  "@saros-finance/dlmm-sdk": "^0.0.19",
  "@solana/wallet-adapter-react": "^0.15.35",
  "@solana/web3.js": "^1.96.0",
  "@google/generative-ai": "^0.21.0",
  "next": "15.5.4",
  "react": "19.0.0",
  "zustand": "^5.0.2"
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Solana wallet (Phantom, Solflare, or Backpack)
- Some SOL on Devnet ([Solana Faucet](https://faucet.solana.com/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nikola0x0/snap-lp.git
cd snap-lp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Solana RPC Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# DLMM Configuration
NEXT_PUBLIC_DLMM_PROGRAM_ID=LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo

# AI Configuration (Server-side only)
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

---

## 📖 Usage Guide

### 1. Connect Your Wallet
Click "Connect Wallet" in the top right corner and select your preferred wallet provider (Phantom, Solflare, or Backpack).

### 2. Select a Pool
Browse available DLMM pools on Devnet:
- SOL/USDC
- SOL/PYUSD
- C98/USDT

View pool metrics including current price, 24h volume, APR, and liquidity depth.

### 3. Choose a Strategy Template
Select from three risk profiles:
- **Conservative:** Best for stablecoins and low volatility
- **Balanced:** Ideal for SOL pairs and established tokens
- **Aggressive:** Maximum fees from volatile pairs

Each template shows:
- Estimated APR
- IL risk rating
- Price range width
- Bin count and distribution

### 4. Review SNAP Score
The AI-powered SNAP Score evaluates how well your chosen strategy fits the selected pool:
- Hover over the score for detailed breakdown
- Grade S/A indicates excellent fit
- Grade B/C suggests moderate compatibility
- Grade D warns of poor strategy-pool matching

### 5. Simulate (Optional)
Test your strategy with the interactive simulator:
- Adjust price scenarios with sliders
- See real-time bin distribution
- View estimated IL and returns
- Test different investment amounts

### 6. Deploy Position
Review final parameters and click "Deploy Strategy":
- Wallet approval required
- Transaction submitted to Solana
- Confirmation with position details
- Automatic redirect to Portfolio

### 7. Manage Portfolio
Track and manage your positions:
- View token balances and accumulated fees
- Check in-range/out-of-range status
- Claim fees with one click
- Remove liquidity when needed

---

## 🏗️ Architecture

### Project Structure
```
snap-lp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (SNAP Score, pool data)
│   │   ├── layout.tsx         # Root layout with fonts & metadata
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Tailwind CSS v4 + custom styles
│   ├── components/            # React components
│   │   ├── dashboard-sections/
│   │   │   ├── pools-section.tsx
│   │   │   ├── templates-section.tsx
│   │   │   ├── simulator-section.tsx
│   │   │   ├── deploy-section.tsx
│   │   │   └── portfolio-section.tsx
│   │   ├── ui/                # shadcn/ui components
│   │   ├── strategy-simulator.tsx
│   │   ├── template-card.tsx
│   │   ├── snap-score-gauge.tsx
│   │   └── swap-modal.tsx
│   ├── constants/             # Configuration
│   │   ├── supported-pools.ts
│   │   ├── strategy-templates.ts
│   │   └── token-images.ts
│   ├── store/                 # Zustand state management
│   │   └── app-store.ts
│   ├── types/                 # TypeScript definitions
│   │   └── strategy.ts
│   └── lib/                   # Utilities
│       └── dlmm-service.ts
├── public/                    # Static assets
│   ├── tokens/               # Token images
│   ├── fonts/                # Custom fonts
│   ├── og-image.png          # Social media preview
│   └── favicon.*             # Favicons
└── docs/                     # Documentation
```

### Key Design Patterns

**1. Server-Side AI Processing**
```typescript
// app/api/snap-score/route.ts
export async function POST(request: Request) {
  const { templateId, poolAddress, templateConfig } = await request.json();

  // Fetch pool data
  const poolData = await fetchPoolData(poolAddress);

  // Generate AI analysis with Gemini
  const analysis = await generateAnalysis(poolData, templateConfig);

  return Response.json({ success: true, score: analysis });
}
```

**2. DLMM SDK Integration**
```typescript
// Centralized service for DLMM operations
const dlmmService = new LiquidityBookServices({
  mode: MODE.DEVNET,
  options: {
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  },
});

// Get user positions
const positions = await dlmmService.getUserPositions({
  payer: publicKey,
  pair: pairAddress,
});

// Add liquidity
const { txs } = await dlmmService.addLiquidity({
  payer: publicKey,
  pair: pairAddress,
  tokenMintX: baseTokenMint,
  tokenMintY: quoteTokenMint,
  strategyParameters: template.binConfiguration,
});
```

**3. State Management with Zustand**
```typescript
// store/app-store.ts
export const useAppStore = create<AppStore>((set) => ({
  step: "pools",
  selectedPool: null,
  selectedTemplate: null,

  selectPool: (pool) => set({ selectedPool: pool, step: "templates" }),
  selectTemplate: (template) => set({ selectedTemplate: template }),
  setStep: (step) => set({ step }),
}));
```

**4. Responsive Console UI**
```tsx
// Consistent terminal aesthetic throughout
<div className="border-2 border-cyan-500/30 bg-zinc-950">
  <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
    <h2 className="text-cyan-400 font-mono uppercase tracking-wider">
      /// SECTION TITLE
    </h2>
  </div>
  {/* Content */}
</div>
```

---

## 🎨 UI/UX Design

### Console Aesthetic
Inspired by Fallout's Pip-Boy terminal interface:
- **Color Palette:** Cyan (`#22d3ee`), Green (`#4ade80`), Amber (`#fbbf24`), Red (`#ef4444`)
- **Typography:** Abel for UI, Share Tech Mono for terminals
- **Borders:** Sharp corners with `border-2` stroke
- **Backgrounds:** Deep blacks (`#0a0a0a`, `zinc-950`)
- **Animations:** Subtle transitions and hover effects

### Key Components

**TerminalHeader**
```tsx
<div className="border-2 border-cyan-500/30 bg-zinc-950">
  <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
    <h1 className="text-cyan-400 font-mono uppercase tracking-wider">
      /// {title}
    </h1>
    <p className="text-[10px] text-zinc-500 uppercase">
      {subtitle}
    </p>
  </div>
</div>
```

**LCD-Style Data Display**
```tsx
<div className="bg-[#0a0a0a] border-2 border-zinc-800 p-3">
  <div className="text-[9px] text-cyan-400 font-mono uppercase">
    LABEL
  </div>
  <div className="text-2xl font-mono font-bold text-white">
    VALUE
  </div>
</div>
```

**Console Loading**
```tsx
<div className="space-y-2">
  <div className="text-cyan-400 font-mono text-sm">
    [LOADING...]
  </div>
  <div className="flex gap-1">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="h-2 bg-cyan-500/50 animate-pulse" />
    ))}
  </div>
</div>
```

---

## 🧪 Testing

### Manual Testing Checklist

**Pool Selection**
- [ ] All pools load with correct data
- [ ] Pool cards display current price, volume, APR
- [ ] Pool selection updates global state
- [ ] Selected pool shows in equipment bar

**Template Selection**
- [ ] Template cards flip on selection
- [ ] SNAP Score loads for selected pool
- [ ] Score tooltip displays on hover
- [ ] Template parameters are accurate

**Simulation**
- [ ] Price sliders update bin visualization
- [ ] IL/ROI calculations update in real-time
- [ ] Investment amount affects return estimates
- [ ] Current price indicator is accurate

**Deployment**
- [ ] Wallet connection required check
- [ ] Token balance validation
- [ ] Swap modal for missing tokens
- [ ] Transaction submission succeeds
- [ ] Position appears in portfolio

**Portfolio**
- [ ] Positions load after wallet connect
- [ ] In-range/out-of-range status correct
- [ ] Fee balances display accurately
- [ ] Claim fees transaction succeeds
- [ ] Remove liquidity transaction succeeds

### Running Tests
```bash
# Lint check
npm run lint

# Type check
npx tsc --noEmit

# Build test
npm run build
```

---

## 🔧 Configuration

### Supported Pools
Add or modify pools in `src/constants/supported-pools.ts`:

```typescript
export const SUPPORTED_POOLS = [
  {
    name: "SOL/USDC",
    address: "DLP_POOL_ADDRESS",
    baseToken: { symbol: "SOL", mint: "So11..." },
    quoteToken: { symbol: "USDC", mint: "EPjF..." },
  },
  // Add more pools...
];
```

### Strategy Templates
Customize templates in `src/constants/strategy-templates.ts`:

```typescript
export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: "conservative-tight",
    name: "Conservative Strategy",
    riskLevel: "Conservative",
    estimatedAPR: 8.5,
    impermanentLossRisk: 1,
    binConfiguration: {
      binCount: 15,
      rangeWidth: 10,
      distribution: "concentrated",
      concentrationFactor: 0.8,
    },
    // ... more parameters
  },
];
```

### Token Images
Add token images to `public/tokens/` and update `src/constants/token-images.ts`:

```typescript
export const TOKEN_IMAGES: Record<string, string> = {
  SOL: "/tokens/sol.png",
  USDC: "/tokens/usdc.png",
  // Add more tokens...
};
```

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nikola0x0/snap-lp)

### Environment Variables
Ensure these are set in your deployment:
```
NEXT_PUBLIC_SOLANA_RPC_URL
NEXT_PUBLIC_SOLANA_NETWORK
NEXT_PUBLIC_DLMM_PROGRAM_ID
GEMINI_API_KEY
```

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

---

## 📊 Demo & Submission

### Live Demo
**URL:** [https://snap-lp.vercel.app](https://snap-lp.vercel.app)

### Video Walkthrough
Coming soon!

### Key Differentiators

1. **Multi-Feature Comprehensive Platform**
   - Pool selection, template library, AI scoring, simulation, deployment, portfolio management
   - Complete end-to-end user journey

2. **Meaningful DLMM SDK Integration**
   - Real position creation and management
   - Actual liquidity operations (add/remove/claim)
   - Live pool data integration

3. **Production-Ready Code Quality**
   - TypeScript strict mode
   - Comprehensive error handling
   - Responsive mobile-first design
   - Professional console UI aesthetic

4. **Real-World Applicability**
   - Solves actual user pain points
   - Reduces DLMM complexity barrier
   - Educational value for other builders

5. **Hackathon-Ready Foundation**
   - Scalable architecture
   - Extensible template system
   - API-ready for additional features
   - Clear documentation

---

## 🗺️ Roadmap

### Immediate Next Steps (Post-Bounty)
- [ ] Add mainnet support
- [ ] Expand to more DLMM pools
- [ ] Community template marketplace
- [ ] Advanced analytics dashboard
- [ ] Position performance tracking
- [ ] Multi-position management
- [ ] Mobile app (React Native)

### Future Enhancements
- [ ] Auto-rebalancing bot
- [ ] Telegram bot integration
- [ ] Advanced order types (limit, stop-loss)
- [ ] Portfolio yield optimization
- [ ] Social features (template sharing, leaderboards)
- [ ] Integration with other Saros products (AMM, Stake, Farm)

---

## 🤝 Contributing

Contributions welcome! This project is open-source and built for the community.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Saros Finance** for the powerful DLMM SDK and developer support
- **Solana** for the blazing-fast blockchain infrastructure
- **Superteam** for organizing the bounty challenge
- **Google** for Gemini AI API access
- **Vercel** for hosting and deployment
- **shadcn/ui** for beautiful UI components

---

## 📞 Contact & Support

**Developer:** nikola0x0
**GitHub:** [https://github.com/nikola0x0](https://github.com/nikola0x0)
**Project Repository:** [https://github.com/nikola0x0/snap-lp](https://github.com/nikola0x0/snap-lp)
**Live Demo:** [https://snap-lp.vercel.app](https://snap-lp.vercel.app)

For questions, feedback, or support:
- Open an issue on GitHub
- Join [Saros Dev Station](https://discord.gg/saros)
- Follow [@SarosFinance](https://twitter.com/SarosFinance) on Twitter

---

## 📚 Resources

### Saros Documentation
- [Saros Docs](https://docs.saros.finance)
- [@saros-finance/dlmm-sdk NPM](https://www.npmjs.com/package/@saros-finance/dlmm-sdk)
- [Saros Dev Station Discord](https://discord.gg/saros)

### Solana Resources
- [Solana Documentation](https://docs.solana.com)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

### Development Tools
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

<div align="center">

**Built with ❤️ for the Solana ecosystem**

⭐ **If you find this project helpful, please consider giving it a star!** ⭐

</div>
