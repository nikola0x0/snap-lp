# SnapLP UI Design Guide
## Modern + Retro Aesthetic (Fallout-Inspired) - Dark Mode

---

## Overview
This guide defines the visual language for SnapLP, blending retro terminal/LCD aesthetics with modern Web3 design patterns in **dark mode with full color**. Think Fallout Pip-Boy meets vibrant DeFi dashboard with neon accents.

---

## Typography

### Primary Font: Share Tech Mono
- **Family**: "Share Tech Mono", monospace
- **Weight**: 400 (Regular only)
- **Usage**: Data displays, metrics, labels, technical information

```css
/* Import in layout.tsx or globals.css */
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

/* CSS class */
.share-tech-mono-regular {
  font-family: "Share Tech Mono", monospace;
  font-weight: 400;
  font-style: normal;
}
```

### Font Usage Strategy
```typescript
// Technical/Data: Share Tech Mono
- Metrics (APR, scores, numbers)
- Labels (uppercase data labels)
- Code-like elements
- LCD/Terminal displays

// Body/UI: System font stack (more readable)
- Descriptions
- Paragraphs
- Navigation
- Long-form content
```

### Font Hierarchy
```typescript
// Headings (readable font)
h1: text-4xl font-bold
h2: text-3xl font-semibold
h3: text-2xl font-semibold
h4: text-xl font-semibold

// Data (monospace)
metrics: text-3xl font-mono font-bold
labels: text-xs font-mono tracking-wider uppercase

// Body (readable)
body: text-base
small: text-sm
```

---

## Color Palette (Dark Mode with Color)

### Background Colors (Dark)
```typescript
background: {
  primary:   '#0a0a0a',  // near-black (main bg)
  secondary: '#1a1a1a',  // cards/surfaces
  tertiary:  '#2a2a2a',  // elevated surfaces
  hover:     '#333333',  // hover states
}
```

### Primary Colors (Vibrant Accents)
```typescript
// Cyan/Teal (Primary Brand - Futuristic)
primary: {
  400: '#22d3ee',  // cyan-400 - main accent
  500: '#06b6d4',  // cyan-500 - hover
  600: '#0891b2',  // cyan-600 - active
}

// Green (Success/Positive)
success: {
  400: '#4ade80',  // green-400 - gains, positive metrics
  500: '#22c55e',  // green-500 - success states
}

// Amber/Orange (Warning/Attention)
warning: {
  400: '#fbbf24',  // amber-400 - caution
  500: '#f59e0b',  // amber-500 - moderate risk
}

// Red (Error/Danger)
error: {
  400: '#f87171',  // red-400 - losses, negative metrics
  500: '#ef4444',  // red-500 - danger states
}

// Purple (Premium/Special)
premium: {
  400: '#c084fc',  // purple-400 - premium features
  500: '#a855f7',  // purple-500 - S-tier ratings
}

// Blue (Info/Cool)
info: {
  400: '#60a5fa',  // blue-400 - informational
  500: '#3b82f6',  // blue-500 - links, info states
}
```

### Text Colors
```typescript
text: {
  primary:   '#ffffff',    // white - main text
  secondary: '#a1a1aa',    // zinc-400 - secondary text
  muted:     '#71717a',    // zinc-500 - muted text
  disabled:  '#52525b',    // zinc-600 - disabled text
}
```

### Border Colors
```typescript
border: {
  default:   '#3f3f46',    // zinc-700 - default borders
  subtle:    '#27272a',    // zinc-800 - subtle dividers
  focus:     '#22d3ee',    // cyan-400 - focus rings
  hover:     '#52525b',    // zinc-600 - hover borders
}
```

### Data Visualization Colors (Full Spectrum)
```typescript
dataViz: {
  // Score/Quality ranges
  critical:  '#ef4444',    // red-500 (0-30%)
  poor:      '#f97316',    // orange-500 (30-50%)
  fair:      '#f59e0b',    // amber-500 (50-60%)
  good:      '#84cc16',    // lime-500 (60-75%)
  great:     '#22c55e',    // green-500 (75-85%)
  excellent: '#3b82f6',    // blue-500 (85-92%)
  perfect:   '#a855f7',    // purple-500 (92-100%)

  // Chart colors
  chart1:    '#22d3ee',    // cyan
  chart2:    '#a855f7',    // purple
  chart3:    '#f59e0b',    // amber
  chart4:    '#22c55e',    // green
  chart5:    '#3b82f6',    // blue
}
```

### Glow Effects (Neon Accents)
```typescript
glow: {
  cyan:   'shadow-[0_0_20px_rgba(34,211,238,0.4)]',
  green:  'shadow-[0_0_20px_rgba(74,222,128,0.4)]',
  purple: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
  amber:  'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
  red:    'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
}
```

---

## Component Patterns

### 1. LCD/Terminal Displays
**Usage**: Metrics, scores, data readouts

```tsx
<div className="bg-[#0a0a0a] border-2 border-zinc-700 px-3 py-2">
  <div className="text-[10px] text-cyan-400 font-mono tracking-[0.2em] uppercase">
    SYSTEM STATUS
  </div>
  <div className="text-2xl text-cyan-400 font-mono font-bold">
    92.5%
  </div>
</div>
```

**Key Features**:
- Near-black background (`bg-[#0a0a0a]`)
- **Sharp corners** (no rounded corners for retro feel)
- Cyan accent text (`text-cyan-400`) - or color-coded by data type
- Monospace font for data
- Wide letter spacing for labels (`tracking-[0.2em]`)
- 2px borders (`border-2`)
- Small uppercase labels

**Color Coding Examples**:
```tsx
// Positive metric (APR, gains)
<div className="text-green-400">+15.2%</div>

// Negative metric (loss, IL)
<div className="text-red-400">-3.5%</div>

// Neutral metric (score)
<div className="text-cyan-400">92/100</div>

// Warning metric
<div className="text-amber-400">MEDIUM RISK</div>
```

### 2. Glowing Elements
**Usage**: Active states, important CTAs, selected items

```tsx
<button className="
  bg-cyan-500 text-black
  font-bold uppercase tracking-wider
  px-6 py-3
  shadow-[0_0_20px_rgba(34,211,238,0.4)]
  hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]
  hover:bg-cyan-400
  transition-all duration-300
  clip-path-[polygon(0_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%)]
">
  DEPLOY STRATEGY
</button>
```

**Key Features**:
- Cyan primary color (can use purple for premium, green for success)
- **Sharp, angular corners** (can use clip-path for angled corners)
- Box shadow glow effect (neon)
- Brighter on hover
- High contrast (cyan/black for buttons)
- Uppercase text for emphasis

**Button Variants**:
```tsx
// Primary Action (Cyan) - Sharp corners
bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]

// Success Action (Green) - Sharp corners
bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]

// Danger Action (Red) - Sharp corners
bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]

// Premium Action (Purple) - Sharp corners
bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]

// Secondary (Outline) - Sharp corners
border-2 border-cyan-500 text-cyan-400 bg-transparent
hover:bg-cyan-500/10

// Optional: Angled corner variant (more Fallout-like)
clip-path-[polygon(0_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%)]
```

### 3. Data Cards
**Usage**: Template cards, metric displays, info panels

```tsx
<div className="
  bg-[#1a1a1a]
  border-2 border-zinc-700
  p-4
  hover:border-cyan-400
  hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]
  transition-all duration-300
">
  {/* Card content */}
</div>
```

**Key Features**:
- Dark background (`#1a1a1a`)
- **Sharp rectangular corners** (no rounding)
- Visible borders (zinc-700)
- Cyan glow on hover (or color-coded by card type)
- Smooth transitions

**Card Variants by Type**:
```tsx
// Default Card - Sharp corners
border-zinc-700 hover:border-cyan-400

// Active/Selected Card - Sharp corners with glow
border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]

// Success/High Performance Card
border-green-700 hover:border-green-400

// Warning/Risky Card
border-amber-700 hover:border-amber-400

// Premium/Special Card
border-purple-700 hover:border-purple-400

// Optional: Beveled corner variant (Fallout-style)
// Use clip-path or pseudo-elements for cut corners
```

### 4. Segmented Displays (LCD Gauge)
**Usage**: Progress bars, gauges, visual metrics

```tsx
<div className="flex gap-[2px]">
  {Array.from({ length: 50 }).map((_, i) => (
    <div
      key={i}
      className={`
        w-[8px] h-[14px] rounded-[1px]
        ${isFilled ? 'bg-green-400' : 'bg-slate-800'}
      `}
    />
  ))}
</div>
```

**Key Features**:
- Tiny gaps (`gap-[2px]`)
- Filled/unfilled states
- Color coding by value range
- Retro LCD aesthetic

### 5. Scanline Effect (Optional Enhancement)
**Usage**: Background overlay for authentic CRT feel

```css
.scanlines::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 0, 0, 0.1) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1;
}
```

---

## Layout Principles

### 1. Grid-Based Structure
- Use 4px base unit for spacing (gap-1, gap-2, gap-4, gap-6)
- Prefer `gap-4` for card grids
- Consistent padding: `p-4`, `px-6`, `py-4`

### 2. Terminal Window Aesthetic (Sharp Corners)
```tsx
<div className="bg-slate-900 border-2 border-slate-700 overflow-hidden">
  {/* Header Bar */}
  <div className="bg-slate-800 px-4 py-2 border-b-2 border-slate-700">
    <span className="text-xs text-cyan-400 font-mono tracking-wider uppercase">
      /// SYSTEM TERMINAL
    </span>
  </div>

  {/* Content */}
  <div className="p-4">
    {/* Main content */}
  </div>
</div>
```

### 3. Angular Design Language
```tsx
// No rounded corners - use sharp rectangles
className="border-2"  // ✅ Sharp corners

// Optional: Beveled/cut corners (advanced)
className="clip-path-[polygon(8px_0,100%_0,100%_100%,0_100%,0_8px)]"

// Angled dividers
<div className="h-px bg-cyan-400 transform -skew-x-12" />
```

### 4. Info Hierarchy
```
1. Critical data: Large, cyan/color-coded, bold
2. Primary data: Medium, white, normal weight
3. Labels: Small, uppercase, wide tracking, cyan/colored
4. Secondary info: Small, muted zinc
```

---

## Animation & Motion (Framer Motion)

### Installation
```bash
npm install framer-motion
```

### Basic Imports
```tsx
import { motion, AnimatePresence } from "framer-motion";
```

### Page/Section Transitions
```tsx
// Fade in from bottom
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>

// Stagger children (for lists/grids)
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Card Interactions
```tsx
// Card with hover and tap effects
<motion.div
  className="bg-[#1a1a1a] border-2 border-zinc-700 rounded-lg p-4"
  whileHover={{
    scale: 1.02,
    borderColor: "#22d3ee", // cyan-400
    boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)"
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  {content}
</motion.div>

// Card flip animation (for template cards)
<motion.div
  animate={{ rotateY: isFlipped ? 180 : 0 }}
  transition={{ duration: 0.6, ease: "easeInOut" }}
  style={{ transformStyle: "preserve-3d" }}
>
  {/* Front and back */}
</motion.div>
```

### Button Animations
```tsx
// Glowing button with hover
<motion.button
  className="bg-cyan-500 text-black px-6 py-3 rounded-lg"
  whileHover={{
    scale: 1.05,
    boxShadow: "0 0 30px rgba(34, 211, 238, 0.6)"
  }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  DEPLOY
</motion.button>

// Pulsing effect (for important CTAs)
<motion.button
  animate={{
    boxShadow: [
      "0 0 20px rgba(34, 211, 238, 0.4)",
      "0 0 30px rgba(34, 211, 238, 0.6)",
      "0 0 20px rgba(34, 211, 238, 0.4)",
    ]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  CLAIM REWARDS
</motion.button>
```

### LCD/Terminal Effects
```tsx
// Typing animation for terminal text
<motion.div
  initial={{ width: 0 }}
  animate={{ width: "100%" }}
  transition={{ duration: 1, ease: "steps(20)" }}
  style={{ overflow: "hidden", whiteSpace: "nowrap" }}
  className="font-mono text-cyan-400"
>
  {">>> SYSTEM INITIALIZED"}
</motion.div>

// Scanning line effect
<motion.div
  className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent h-8"
  animate={{ y: [0, "100%", 0] }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "linear"
  }}
/>

// Flickering text (retro CRT effect)
<motion.span
  animate={{
    opacity: [1, 0.8, 1, 0.9, 1]
  }}
  transition={{
    duration: 0.15,
    repeat: Infinity,
    repeatDelay: 5
  }}
  className="text-cyan-400 font-mono"
>
  SNAP SCORE
</motion.span>
```

### Number Counter Animation
```tsx
// Animated number counter
import { useMotionValue, useTransform, animate } from "framer-motion";

function Counter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5 });
    return controls.stop;
  }, [value]);

  return (
    <motion.span className="text-3xl font-mono font-bold text-cyan-400">
      {rounded}
    </motion.span>
  );
}
```

### Loading States
```tsx
// Pulsing dots
<div className="flex gap-1">
  {[0, 1, 2].map((i) => (
    <motion.div
      key={i}
      className="w-2 h-2 rounded-full bg-cyan-400"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        delay: i * 0.2
      }}
    />
  ))}
</div>

// Spinning loader
<motion.div
  className="w-8 h-8 border-4 border-zinc-700 border-t-cyan-400 rounded-full"
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }}
/>

// LCD segment loading (sequential)
{Array.from({ length: 20 }).map((_, i) => (
  <motion.div
    key={i}
    className="w-[6px] h-[8px] bg-cyan-400"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0] }}
    transition={{
      duration: 1,
      repeat: Infinity,
      delay: i * 0.05
    }}
  />
))}
```

### Modal/Overlay Animations
```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="bg-[#1a1a1a] border-2 border-cyan-400 rounded-lg p-6 max-w-lg w-full shadow-[0_0_40px_rgba(34,211,238,0.4)]">
          {content}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Scroll-Triggered Animations
```tsx
import { useInView } from "framer-motion";

function AnimatedSection({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
```

### Neon Glow Animation
```tsx
// Pulsing neon border
<motion.div
  className="border-2 border-cyan-400 rounded-lg p-4"
  animate={{
    boxShadow: [
      "0 0 10px rgba(34, 211, 238, 0.3)",
      "0 0 20px rgba(34, 211, 238, 0.5)",
      "0 0 10px rgba(34, 211, 238, 0.3)",
    ]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  {content}
</motion.div>
```

### Performance Tips
```typescript
// Use transform and opacity for 60fps animations
// ✅ Good
<motion.div animate={{ x: 100, opacity: 0.5 }} />

// ❌ Avoid (causes repaints)
<motion.div animate={{ left: 100, width: 200 }} />

// Use layout animations for size changes
<motion.div layout />

// Disable animations on low-power devices
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
```

### Tailwind Fallback Transitions (When Not Using Framer Motion)
```typescript
// Standard transitions
transition-all duration-300 ease-in-out

// Quick interactions
transition-colors duration-150

// Slow reveals
transition-opacity duration-500
```

---

## Iconography

### Icon Style
- Use Lucide React icons
- Size: `w-4 h-4` (16px) for inline, `w-6 h-6` (24px) for standalone
- Color: Match text color (`text-green-400`, `text-slate-500`)
- Always pair with labels in retro style

### Preferred Icons
```typescript
import {
  Shield,      // Security/Safety
  TrendingUp,  // Performance/Growth
  Zap,         // Speed/Power
  Info,        // Information
  AlertTriangle, // Warning
  CheckCircle,   // Success
  XCircle,       // Error
  User,          // Account/Profile
  Settings,      // Configuration
  BarChart3,     // Analytics
} from 'lucide-react';
```

---

## Specific Component Styles

### SNAP Score Badge (Sharp Corners)
```tsx
<div className="bg-[#0a0a0a] border-2 border-zinc-700 px-2 py-1.5">
  <div className="flex items-center justify-between mb-1">
    <span className="text-[9px] text-cyan-400 font-mono tracking-wider">
      SNAP SCORE
    </span>
    <span className="text-[9px] text-cyan-400 font-mono font-bold">
      {score}/100
    </span>
  </div>
  {/* Color-coded LCD segments - rectangular */}
  <div className="flex gap-[1px]">
    {segments.map((_, i) => (
      <div className={`
        h-[8px] flex-1
        ${getColorByScore(i)} // red → amber → green → blue → purple
      `} />
    ))}
  </div>
</div>
```

### Template Card (Sharp Corners)
```tsx
<Card className="
  bg-[#1a1a1a]
  border-2 border-zinc-700
  hover:border-cyan-400
  hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]
  transition-all duration-300
  gap-3
">
  {/* Sharp corners, compact spacing, cyan accents, color-coded badges */}
</Card>
```

### Metric Display (Color-Coded)
```tsx
<div className="text-center">
  <div className="text-3xl font-bold text-green-400 font-mono">
    +{value}%
  </div>
  <div className="text-xs text-zinc-400 font-mono tracking-wider uppercase mt-1">
    EST. APR
  </div>
</div>

{/* Negative metric */}
<div className="text-3xl font-bold text-red-400 font-mono">
  -{lossValue}%
</div>

{/* Neutral metric */}
<div className="text-3xl font-bold text-cyan-400 font-mono">
  {score}
</div>
```

### Risk Badge (Color-Coded)
```tsx
// Conservative (Green)
<Badge className="bg-green-500/20 text-green-400 border-green-500">
  <Shield className="w-3 h-3" />
  Conservative
</Badge>

// Balanced (Amber)
<Badge className="bg-amber-500/20 text-amber-400 border-amber-500">
  <TrendingUp className="w-3 h-3" />
  Balanced
</Badge>

// Aggressive (Red)
<Badge className="bg-red-500/20 text-red-400 border-red-500">
  <Zap className="w-3 h-3" />
  Aggressive
</Badge>
```

---

## Accessibility

### Contrast Ratios
- Primary text (green-400 on slate-900): **7.5:1** ✓
- Secondary text (slate-500 on slate-900): **4.8:1** ✓
- All combinations meet WCAG AA standards

### Focus States
```tsx
focus:outline-none
focus:ring-2
focus:ring-green-400
focus:ring-offset-2
focus:ring-offset-slate-900
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use proper semantic HTML (`<button>`, `<a>`, etc.)
- Provide `aria-label` for icon-only buttons

---

## Do's and Don'ts

### ✅ Do
- Use **full color palette** (cyan, green, amber, red, purple, blue)
- Keep backgrounds **very dark** (#0a0a0a, #1a1a1a)
- Use monospace font for **data/metrics only**
- Use **readable fonts** for body text
- Apply **neon glow effects** to important elements
- Use uppercase for data labels with wide tracking
- **Color-code information** (green=positive, red=negative, cyan=neutral, etc.)
- Keep spacing compact but readable
- Add subtle scanlines for retro feel (optional)
- Use **high contrast** (white text on dark, colored accents)

### ❌ Don't
- Use monospace font for everything (only for data/metrics)
- Use light backgrounds (stay dark mode)
- Use only one color (embrace the full palette)
- Use rounded corners (prefer sharp, angular corners for retro feel)
- Use gradients on backgrounds (use solid dark colors)
- Use low contrast combinations
- Add excessive animations
- Use decorative borders (keep them functional)
- Make text hard to read with only colored text
- Use soft, organic shapes (prefer geometric, angular designs)

---

## Implementation Checklist

- [ ] Install Share Tech Mono font
- [ ] Install Framer Motion for animations
- [ ] Update Tailwind config with custom colors (cyan, green, red, amber, purple)
- [ ] Update `globals.css` with font import
- [ ] Apply `font-mono` class for data/metrics only
- [ ] **Remove all rounded corners** (`rounded`, `rounded-lg`, etc.)
- [ ] Refactor existing components to use new color palette
- [ ] Add glow effects to CTAs and interactive elements
- [ ] Update card borders to zinc-700 with sharp corners
- [ ] Convert all text to color-coded system (white, cyan, green, red, amber)
- [ ] Add hover states with neon glows
- [ ] Test contrast ratios (WCAG AA minimum)
- [ ] Verify keyboard navigation
- [ ] Add loading states with retro aesthetic
- [ ] Add Framer Motion animations where appropriate
- [ ] Test on dark backgrounds only

---

## Resources

### Font
- **Google Fonts**: https://fonts.google.com/specimen/Share+Tech+Mono
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');`

### Inspiration
- Fallout Pip-Boy UI
- Retro terminal interfaces
- 1980s LCD displays
- Military/tactical interfaces
- Cyberpunk aesthetics

### Tools
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **shadcn/ui**: https://ui.shadcn.com (customize with retro theme)

---

## Next Steps

1. **Implement font**: Add Share Tech Mono to layout
2. **Update colors**: Refactor to green/slate palette
3. **Enhance cards**: Add glow effects and borders
4. **Refine spacing**: Use compact gaps (gap-2, gap-3)
5. **Add animations**: Subtle glows and transitions
6. **Polish details**: Scanlines, uppercase labels, wide tracking

---

**Remember**: The goal is to make users feel like they're using a sophisticated terminal interface from the future, with the charm of retro displays and the polish of modern web design.
