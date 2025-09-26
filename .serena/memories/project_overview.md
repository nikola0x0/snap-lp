# Project Overview: snap-lp

## Purpose
`snap-lp` is a Next.js 15 application bootstrapped with `create-next-app`. It's a modern web application using the App Router architecture pattern. The project appears to be in its initial state and can serve as a foundation for building web applications.

## Tech Stack
- **Framework**: Next.js 15 with App Router (not Pages Router)
- **Language**: TypeScript with strict mode enabled
- **React Version**: 19.1.0 (latest)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (optimized by next/font)
- **Code Quality**: Biome (replaces ESLint + Prettier)
- **Package Manager**: npm
- **Node Version**: Uses Node 20+ types

## Project Architecture

### Directory Structure
```
snap-lp/
├── src/
│   └── app/              # App Router directory (Next.js 13+ pattern)
│       ├── layout.tsx    # Root layout with fonts and global styles
│       ├── page.tsx      # Home page component
│       ├── globals.css   # Global styles with Tailwind CSS v4 imports
│       └── favicon.ico   # Site favicon
├── public/               # Static assets
├── docs/                 # Documentation (including WARP.md)
├── .serena/             # Serena configuration
├── .claude/             # Claude Code configuration
└── [config files]       # Various configuration files
```

### Key Features
- **App Router**: Uses the modern Next.js App Router (not Pages Router)
- **TypeScript**: Fully typed with strict mode and path aliases (`@/*` → `./src/*`)
- **Tailwind CSS v4**: Latest version with inline configuration and dark mode support
- **Font Optimization**: Geist font family with automatic optimization
- **Code Quality**: Biome for linting and formatting with React/Next.js rules

## Development Environment
- **Development Server**: Runs on http://localhost:3000
- **Hot Reload**: Enabled by default
- **Type Checking**: Real-time with TypeScript strict mode
- **Build System**: Next.js with production optimization
- **Version Control**: Git repository with clean status