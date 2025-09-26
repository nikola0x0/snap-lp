# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SnapLP** is a DLMM (Dynamic Liquidity Market Making) strategy templates platform built for the Saros Finance ecosystem. It's a Next.js 15 application that simplifies DLMM liquidity provision through pre-configured strategy templates, interactive simulation, and one-click deployment.

**Core Purpose**: Transform complex DLMM setup into accessible templates that newcomers can deploy instantly while providing advanced users with strategy building and marketplace capabilities.

## Development Commands

### Core Development
```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server (must run build first)
npm start
```

### Code Quality
```bash
# Run linter and formatter checks
npm run lint

# Auto-format code
npm run format
```

## Architecture & Tech Stack

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **Components**: shadcn/ui for rapid UI development
- **Code Quality**: Biome (replaces ESLint + Prettier)
- **Charts/Visualization**: shadcn/ui charts (built on Recharts)
- **State Management**: Zustand for wallet/app state
- **Blockchain**: @saros-finance/dlmm-sdk for Solana DLMM integration
- **Wallet**: @solana/wallet-adapter-react (Phantom, Solflare, Backpack)

### Project Structure
```
src/
  app/                    # Next.js App Router
    layout.tsx            # Root layout with fonts and global styles
    page.tsx              # Landing page
    globals.css           # Tailwind CSS v4 imports + custom properties
docs/                     # Project documentation
  idea.md                 # Core product vision
  TASK_BREAKDOWN.md       # 4-day development plan with detailed tasks
  uiux.md                 # Implementation details and feature specs
  dlmm_research_plan.md   # Sprint strategy and winning approach
```

### Key Architecture Concepts

**Strategy Templates System**: Pre-configured DLMM strategies (Conservative, Balanced, Aggressive) with optimized bin ranges and risk profiles that users can deploy in one click.

**Interactive Simulator**: Price slider connected to bin visualization showing real-time IL (Impermanent Loss), ROI, and fee estimates before deployment.

**DLMM SDK Integration**: Direct integration with Saros Finance DLMM SDK for position creation, liquidity management, and portfolio tracking.

## Core Features to Implement

### 1. Templates Gallery
- Template cards displaying strategy parameters and risk levels
- One-click deployment without manual bin configuration
- Strategy selection and preview functionality

### 2. Interactive Simulator
- Price range slider linked to DLMM bin visualization
- Real-time metric updates (IL%, ROI%, fee estimates)
- Strategy parameter preview before deployment

### 3. Deploy Flow
- Wallet connection integration
- Parameter confirmation interface
- DLMM position creation via SDK
- Transaction status tracking with clear success/error states

### 4. Portfolio Dashboard
- Active DLMM positions display
- Key performance metrics (ROI, IL, fees collected)
- Position status indicators (in-range/out-of-range)
- Basic position management capabilities

## Development Patterns

### Code Style (Biome Configuration)
- 2-space indentation
- Import organization enabled
- React/Next.js recommended rules
- TypeScript strict mode with `@/*` path mapping to `./src/*`

### Component Structure
- Use shadcn/ui components for consistent design system
- Co-locate components with pages or create `src/components/` directory
- Leverage TypeScript interfaces for strategy templates and DLMM data
- Implement proper error boundaries and loading states

### DLMM SDK Usage Patterns
- Wrap SDK functions in service utilities for error handling
- Use Zustand for wallet and app state management
- Implement proper transaction status tracking
- Handle devnet/mainnet RPC endpoint configuration

### Strategy Templates Data
Templates should be defined as JSON configurations with:
- Bin range parameters
- Risk/return profiles
- IL tolerance levels
- Recommended token allocations

## Important Implementation Notes

### MVP Focus
This is a 4-day bounty project ($1,500 USDC total) - prioritize working functionality over perfect polish. The goal is a production-ready demo that judges can actually use.

### Success Criteria
- Live deployed application with public URL
- Complete flow from template selection to position creation
- Actual DLMM SDK integration (not mocked)
- Mobile-responsive professional UI
- Real position data in portfolio dashboard

### Risk Mitigation
- Start DLMM SDK integration immediately
- Test multiple wallet types early
- Deploy to production by Day 3 for testing
- Have backup deployment options ready
- Keep fallback mock data in case of SDK issues

## Testing Strategy
- Test complete flow from template selection to deployment
- Verify DLMM SDK integrations work correctly
- Test wallet connections across different providers
- Ensure mobile responsiveness and error handling
- Performance optimization for chart rendering and API calls