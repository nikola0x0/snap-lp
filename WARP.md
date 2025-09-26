# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

`snap-lp` is a Next.js 15 application using the App Router architecture, built with TypeScript and styled with Tailwind CSS v4. The project uses Biome for code linting and formatting instead of ESLint/Prettier.

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

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Code Quality**: Biome (replaces ESLint + Prettier)
- **Package Manager**: npm

### Directory Structure
```
src/
  app/                    # App Router directory (Next.js 13+ pattern)
    layout.tsx            # Root layout with fonts and global styles
    page.tsx              # Home page component
    globals.css           # Global styles with Tailwind CSS v4 imports
    favicon.ico           # Site favicon
public/                   # Static assets
  *.svg                   # Icon assets (next.svg, vercel.svg, etc.)
```

### Key Configuration Files
- `biome.json` - Biome configuration with Next.js and React recommended rules
- `next.config.ts` - Next.js configuration (currently minimal)
- `tsconfig.json` - TypeScript config with `@/*` path mapping to `./src/*`
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS v4
- `package.json` - Dependencies and scripts

## Architecture Notes

### Next.js App Router Usage
This project uses the modern App Router (not Pages Router). All routing is file-based within the `src/app/` directory:
- `layout.tsx` defines the root layout with font variables and global styling
- `page.tsx` files define route components
- Global CSS is imported in the root layout

### Styling Approach  
- Uses Tailwind CSS v4 (latest version) with inline theme configuration
- Custom CSS properties defined in `globals.css` for background/foreground colors
- Dark mode support via `prefers-color-scheme: dark` media query
- Font variables are passed down from the root layout

### TypeScript Configuration
- Strict mode enabled for better type safety
- Path aliases configured: `@/*` maps to `./src/*`
- Next.js TypeScript plugin enabled for enhanced DX

### Code Quality Setup
- Biome handles both linting and formatting (no ESLint/Prettier)
- Configured for React and Next.js best practices
- Import organization enabled
- Git integration with VCS hooks
- Unknown file types ignored by default

## Development Workflow

### File Changes
- Hot reload enabled by default in development
- Edit `src/app/page.tsx` to modify the home page
- Global styles in `src/app/globals.css`
- TypeScript strict mode will catch type errors immediately

### Adding New Routes
Create new `page.tsx` files in subdirectories of `src/app/`:
```bash
# Creates a new route at /about
mkdir src/app/about
touch src/app/about/page.tsx
```

### Adding Components
While there's no dedicated components directory yet, components can be:
- Co-located with pages that use them
- Placed in a `src/components/` directory (create as needed)
- Imported using the `@/` alias (e.g., `import Button from '@/components/Button'`)

## Biome Configuration

The project uses Biome with specific configurations:
- 2-space indentation
- Recommended rules for React/Next.js
- Import organization enabled
- CSS unknown at-rules disabled (for Tailwind compatibility)
- Git integration enabled