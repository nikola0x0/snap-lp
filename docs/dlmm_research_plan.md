# Saros DLMM Demo Challenge - 4-Day Sprint Plan

## Strategy Templates Gallery MVP

**Bounty**: $1,500 USDC total prizes (1st: $500, 2nd: $400, 3rd: $300)  
**Deadline**: ~4 days remaining  
**Target**: Build production-ready MVP that stands out from 15+ submissions

---

## 🎯 Winning Strategy

**Core Advantage**: While others build basic dashboards or simple bots, we're creating a **template-based LP platform** that eliminates the complexity of DLMM setup - directly addressing the "difficult for newcomers" pain point. The name is "SnapLP".

**Differentiation**:

- One-click strategy deployment (no manual bin configuration)
- Pre-optimized templates with proven parameters
- Interactive simulator for strategy preview
- Production-ready UI/UX that judges can actually use

---

## 🚀 4-Day Sprint Breakdown

### Day 1 (Today): Setup & Core Integration

**Goal**: Get DLMM SDK working with basic UI

#### Morning (4 hours)

- [ ] **Project Setup**
  - [ ] Initialize Next.js project with TypeScript
  - [ ] Install Saros DLMM SDK: `@saros-finance/dlmm-sdk`
  - [ ] Set up Tailwind CSS for rapid UI development
  - [ ] Install and configure shadcn/ui components
  - [ ] Configure Solana wallet adapter

#### Afternoon (4 hours)

- [ ] **SDK Integration**
  - [ ] Connect to Solana devnet/mainnet
  - [ ] Test basic DLMM pool fetching
  - [ ] Implement wallet connection flow
  - [ ] Create basic pool selection interface

#### Evening (2 hours)

- [ ] **Strategy Templates Data**
  - [ ] Define 3 template strategies (Conservative, Balanced, Aggressive)
  - [ ] Create JSON configs with bin ranges and parameters
  - [ ] Research optimal parameters for each strategy type

---

### Day 2: Templates Gallery + Simulator Core

#### Morning (4 hours)

- [ ] **Templates Gallery**
  - [ ] Build template card components
  - [ ] Display strategy parameters and risk levels
  - [ ] Add template selection and preview functionality
  - [ ] Create responsive grid layout

#### Afternoon (4 hours)

- [ ] **Simulator Foundation**
  - [ ] Build price slider component
  - [ ] Create bin visualization using shadcn/ui charts
  - [ ] Implement basic IL calculation logic
  - [ ] Add real-time metric updates

#### Evening (2 hours)

- [ ] **Visual Polish**
  - [ ] Improve chart aesthetics and responsiveness
  - [ ] Add loading states and error handling
  - [ ] Test on mobile devices

---

### Day 3: Deploy Flow + Portfolio Dashboard

#### Morning (4 hours)

- [ ] **Deploy Flow**
  - [ ] Build parameter confirmation interface
  - [ ] Implement DLMM position creation via SDK
  - [ ] Add transaction status tracking
  - [ ] Handle success/error states with clear messaging

#### Afternoon (4 hours)

- [ ] **Portfolio Dashboard**
  - [ ] Fetch user's active DLMM positions
  - [ ] Display key metrics (ROI, IL, fees collected)
  - [ ] Add position status indicators
  - [ ] Implement basic position management

#### Evening (2 hours)

- [ ] **Integration Testing**
  - [ ] End-to-end testing of full flow
  - [ ] Fix critical bugs and edge cases
  - [ ] Performance optimization

---

### Day 4: Polish + Deployment

#### Morning (3 hours)

- [ ] **UI/UX Polish**
  - [ ] Improve visual design and animations
  - [ ] Add educational tooltips and explanations
  - [ ] Enhance error messages and user feedback
  - [ ] Mobile optimization

#### Afternoon (3 hours)

- [ ] **Documentation**
  - [ ] Write comprehensive README with setup instructions
  - [ ] Add inline code comments
  - [ ] Create demo walkthrough screenshots
  - [ ] Document all SDK usage patterns

#### Evening (3 hours)

- [ ] **Deployment & Submission**
  - [ ] Deploy to Vercel/Netlify with public URL
  - [ ] Final testing on live deployment
  - [ ] Create demo video (optional but recommended)
  - [ ] Submit to Superteam Earn with all requirements

---

## 💡 MVP Feature Set (Minimal but Impactful)

### Core Features

1. **Strategy Templates Gallery**

   - 3 pre-optimized strategies with proven parameters
   - Risk/return profiles clearly displayed
   - One-click deployment without manual configuration

2. **Interactive Simulator**

   - Preview how your chosen template performs
   - See potential returns and IL before deploying
   - Visual confirmation of strategy parameters

3. **Deploy Flow**

   - Wallet connection (Phantom, Solflare)
   - Template parameter confirmation
   - DLMM position creation via SDK

4. **Basic Portfolio**
   - Show active positions
   - Key performance metrics
   - Position status (in-range, out-of-range)

### Convenience Elements

- No need to research optimal bin ranges
- Skip the complexity of manual DLMM configuration
- Pre-tested strategies with clear risk profiles
- Simple success/error feedback

---

## 🛠️ Tech Stack (Optimized for Speed)

**Frontend**: Next.js + TypeScript + Tailwind CSS  
**Components**: shadcn/ui (rapid component development with MCP)  
**Charts**: shadcn/ui charts (built on Recharts, themed components + full Recharts customization)  
**Wallet**: @solana/wallet-adapter-react  
**DLMM**: @saros-finance/dlmm-sdk  
**State Management**: Zustand (lightweight, for wallet/app state)  
**Animations**: Framer Motion (smooth interactions, optional for polish)  
**Deployment**: Vercel (zero-config deployment)  
**No Backend**: Use local storage for basic settings, SDK for all blockchain data

---

## 🎯 Evaluation Criteria Alignment

### Functionality & User Experience (High Priority)

- **Simulator**: Interactive, educational, visually appealing
- **Templates**: Solve real onboarding problem
- **Deploy Flow**: Actually works end-to-end
- **Mobile-friendly**: Works on all devices

### Code Quality & Documentation (High Priority)

- **Clean TypeScript**: Proper types, error handling
- **Comprehensive README**: Setup, features, SDK usage
- **Inline Comments**: Explain DLMM-specific logic
- **Professional Structure**: Clear component organization

### Creative Use of SDK Features (Medium Priority)

- **Position Creation**: Core DLMM functionality
- **Bin Analysis**: Creative visualization of bin mechanics
- **Strategy Templates**: Novel approach to DLMM adoption
- **Real-time Metrics**: Dynamic calculations using SDK data

### Real-world Applicability (High Priority)

- **Solves Real Problem**: DLMM onboarding difficulty
- **Production Ready**: Actually deployable and usable
- **Educational Value**: Helps others learn DLMM
- **Extensible**: Clear foundation for larger platform

---

## 📋 Daily Checkpoints

### Day 1 Success Criteria

- [ ] DLMM SDK successfully integrated
- [ ] Wallet connection working
- [ ] Basic UI structure in place
- [ ] Can fetch pool data

### Day 2 Success Criteria

- [ ] 3 templates displayed with proper data
- [ ] Basic simulator with price slider working
- [ ] Bin visualization showing movement
- [ ] IL calculation displaying

### Day 3 Success Criteria

- [ ] Complete deploy flow functional
- [ ] Can create actual DLMM positions
- [ ] Portfolio showing real position data
- [ ] Error handling for edge cases

### Day 4 Success Criteria

- [ ] Deployed live application accessible
- [ ] All features working on live site
- [ ] Complete documentation
- [ ] Submission uploaded to Superteam Earn

---

## ⚠️ Risk Mitigation

### Technical Risks

- **DLMM SDK Issues**: Start with SDK integration Day 1, have fallback mock data
- **Wallet Connection Problems**: Test multiple wallets, provide clear error messages
- **Deployment Issues**: Deploy early Day 3, have backup hosting option

### Scope Risks

- **Feature Creep**: Stick to core MVP, resist adding "nice-to-have" features
- **Over-Engineering**: Use pre-built components where possible, focus on working demo
- **Time Management**: Set hard cutoffs for each section, move to next if stuck

### Competitive Risks

- **Similar Ideas**: Focus on execution quality and educational angle
- **Late Submission**: Finish 6 hours early to handle unexpected issues
- **Demo Quality**: Ensure live site works perfectly, not just locally

---

## 🏆 Winning Elements Checklist

### Must-Haves for Top 3

- [ ] Live, working demo accessible via public URL
- [ ] Actual DLMM SDK integration (not mocked)
- [ ] Clean, professional UI that works on mobile
- [ ] Complete flow from template selection to position creation
- [ ] Templates that actually work with real parameters

### Nice-to-Haves for #1

- [ ] Demo video showing complete flow
- [ ] Smooth one-click deployment experience
- [ ] Professional animations and polished interactions
- [ ] Strategy performance preview in simulator
- [ ] Real position data in portfolio (not just mock data)

---

## 📞 Support Resources

- **Saros Dev Station**: Get help with SDK issues
- **Saros Docs**: Technical reference
- **Your Blockchain Experience**: Leverage your Sui/multiplayer game knowledge for complex state management
- **Community**: Jade's question about RPC endpoints suggests using Solana devnet

---

_Focus on execution over perfection. A working demo that solves real problems beats a complex app that doesn't work._
